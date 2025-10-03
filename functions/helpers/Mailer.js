import nodemailer from "nodemailer";


export async function sendMailCustomer(mail, address){

    const mailResult = await sendMail("Testing app email", address);
    return mailResult;

}

export async function sendMailInternal(){

    if(process.env.GMAIL_EMAIL === null){
        return false;
    }

    const mailResult = await sendMail("Internal email", process.env.GMAIL_EMAIL);
    return mailResult;

}


//gmail smtp has limit of 500 free emails a day
export async function sendMail(mail, address){


    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.GMAIL_EMAIL,
            pass: process.env.GMAIL_PASS,
        },
    });


    const mailOptions = {
        from: `HighFlyersUkCouriers`,
        to: address, // recipient
        subject: "Test",
        text: mail,
        // html: data.html, // optional
    };

    try {

        await transporter.sendMail(mailOptions);
        return true


    } catch (error) {

        console.error("Error sending email:", error);
        return false;
        
    }

}