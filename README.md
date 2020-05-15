# MailSender
Tool to send email using smtp server

1) Take clone of this project.
2) Run npm install
3) create .env file and enter below fields with there value
    SMTP_SERVER, PORT ,SENDER_ADDRESS, SMTP_USERNAME, SMTP_PASSWORD, TOADDRESS_FILE, HTML_CONTENT_FILE, EMAIL_SUBJECT
4) create csv files which contains "email" as column which have email id's and enter it's        location in .env file in "TOADDRESS_FILE".
5) create html content file for email and enter it's value in .env file in "HTML_CONTENT_FILE".
