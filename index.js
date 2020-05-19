require('dotenv').config();
const nodemailer = require('nodemailer');
const csv=require('csvtojson')
const fs= require('fs');

const smtpUsername= process.env.SMTP_USERNAME;
const smtpPassword= process.env.SMTP_PASSWORD;
const smtpEndpoint= process.env.SMTP_SERVER;
const senderAddress= process.env.SENDER_ADDRESS;
const toAddressesFile= process.env.TOADDRESS_FILE+".csv";
const email_contentFile= process.env.HTML_CONTENT_FILE+".html";
const subject= process.env.EMAIL_SUBJECT;
let emailHtmlContent="";
const port = process.env.PORT;

let success=0,failure=0;
let totalUsers=0;

let transporter=null;

const readAddressFile = ()=>{
    csv()
    .fromFile(toAddressesFile)
    .then((json)=>{
        createMessageChunks(json);
    })
}

const createMessageChunks= (json)=>{
    let length= json.length;
    totalUsers= length;
    let packets= Math.floor(length/50);
    packets+= (length%50)!=0 ? 1 : 0;
    console.log(length, packets); 

    let index=0;
    let timerId= setInterval(()=>{
        if(index>=packets-1){
            clearInterval(timerId);
        }
        let offset= index*50;
        let end= length<(offset+50) ? length : (offset+50);
        let writeStream= fs.createWriteStream("./logs/log"+offset+".txt");
        for(let itr=offset;itr<end;itr++){
            createMailOption(json[itr], writeStream);
        }
        index++;
    }, 5000);
}

const createMailOption = (identity, stream) =>{
    let mailOptions = {
        from: senderAddress,
        to: identity.email,
        subject: subject,
        text: ``,
        html: emailHtmlContent
      };
      sendEmail(mailOptions, stream);
}

const createConnection = () =>{
    transporter = nodemailer.createTransport({
        host: smtpEndpoint,
        port: port,
        secureConnection: true,
        auth: {
          user: smtpUsername,
          pass: smtpPassword
        },
		tls:{
			secureProtocol: "TLSv1_method"
		}
    });
}

const sendEmail = (mailOptions, stream) =>{
    transporter.sendMail(mailOptions, function(error, info){
        if (error) {
            failure++;
            stream.write("Error while sending mail to: "+mailOptions.to +"\n");
        } else {
            success++;
            stream.write('Email sent: '+ mailOptions.to+"\n");
        }
        if(failure+success==totalUsers){
            console.log("Total Successful mails: "+success, "Total failures: "+failure);
        }
    });
}

fs.readFile(email_contentFile, "utf-8",function(err, data) {
    if(err){
        console.log("Error while reading html file: ", err);
    }else{
        emailHtmlContent= data;
        createConnection();
        readAddressFile();
    }
});