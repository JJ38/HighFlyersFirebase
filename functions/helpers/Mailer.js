import nodemailer from "nodemailer";
import { promises as fs } from "fs";
import path from "path";
import os from "os";


export async function sendMailCustomer(attachmentHTML, address){

    const subject = "Order confirmation";

    const mailResult = await sendMail(attachmentHTML, address, subject);
    return mailResult;

}

export async function sendMailInternal(attachmentHTML, customerName){

    const subject = "Order from " + customerName;

    const mailResult = await sendMail(attachmentHTML, process.env.GMAIL_EMAIL, subject);
    return mailResult;

}


//gmail smtp has limit of 500 free emails a day
export async function sendMail(attachmentHTML, address, subject){


    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.GMAIL_EMAIL,
            pass: process.env.GMAIL_PASS,
        },
    });

    let tmpFilePath;

    try{

        tmpFilePath = path.join(os.tmpdir(), "YourOrder.html");
        await fs.writeFile(tmpFilePath, attachmentHTML, "utf-8");

    }catch(e){

        console.log("failed to create attachment: " + e);
        return false;
    }


    const mailOptions = {
        from: `HighFlyersUkCouriers`,
        to: address, // recipient
        subject: subject,
        attachments: 
        [
            {
                filename: "YourOrder.html",
                path: tmpFilePath,
                contentType: "text/html",
            }
        ],
        html: 
            '<!DOCTYPE html>' + 
            '' + 
            '<html>' + 
            '<head>' + 
            '<link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Raleway" id="Raleway">' + 
            '' + 
            '<style>' + 
            '' + 
            '@import url(\'https://fonts.googleapis.com/css2?family=Roboto+Slab:wght@800&display=swap\');' + 
            '@import url(\'https://fonts.googleapis.com/css2?family=Raleway:wght@300&display=swap\');' + 
            '' + 
            'body{' + 
            'font-family: \'Raleway\';' + 
            'font-style: normal;' + 
            'font-weight: 400;' + 
            'font-size: 1.1em;' + 
            '}' + 
            '' + 
            '</style>' + 
            '</head>' + 
            '<body>' + 
            '' + 
            '<p>Thank you for booking with Highflyers. Your order has been received and being processed.</p>' + 
            '' + 
            '<p>We will contact you and the other party included on your booking the days before your collection or delivery takes place.</p>' + 
            '' + 
            '<p>This is to confirm when to expect the driver within an estimated 2 hour time slot.</p>' + 
            '' + 
            '<p>Collections are Wednesdays and deliveries are Thursdays each week for all areas.</p>' + 
            '' + 
            '<p>To check for prices, please follow the link <a href="https://www.highflyersukcouriers.com/prices">here</a></p>' + 
            '' + 
            '<p>If you have any queries, you can call us on 07887781089 or 07760242729</p>' + 
            '<p>Email: <a href= "mailto: highflyerscouriers@gmail.com">highflyerscouriers@gmail.com</a> or use the contact page <a href="https://www.highflyersukcouriers.com/contact-us">here</a></p>' + 
            '' + 
            '<p>Opening hours 10am - 4pm 7 days a week.</p>' + 
            '' + 
            '<p>To contact for anything urgent out of hours please call 07707889868 (no bookings are taken on this number)</p>' + 
            '' + 
            '<p>Please note that last bookings need to be sent in by each Sunday 4pm for collections the following week, if you have sent this after Sunday 4pm, your order will be automatically booked into the week after. However, if we can fit your booking in sooner, we will contact you.</p>' + 
            '' + 
            '<p>Many thanks for your custom</p>' + 
            '' + 
            '</body>' // optional
    };

    try {

        await transporter.sendMail(mailOptions);
        return true


    } catch (error) {

        console.error("Error sending email:", error);
        return false;
        
    }

}


export function getAttachmentHTML(orders){

    let attachment = 
        '<html>'+
        '<head>'+
        '<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">'+
        '<meta name="viewport" content="width=device-width, initial-scale=1.0">'+
        '<style>'+
        '@import url(\'https://fonts.googleapis.com/css2?family=Raleway:wght@600&display=swap\');'+
        '@import url(\'https://fonts.googleapis.com/css2?family=Raleway:wght@500&display=swap\');'+
        '@import url(\'https://fonts.googleapis.com/css2?family=Raleway:wght@400&display=swap\');'+
        'html,body{'+
        'margin:0;'+
        '}'+
        'body{'+
        'background: #f9f9f9;'+
        'padding-bottom: 250px;'+
        '}'+
        '+flex{'+
        'display: flex;'+
        '}'+
        'div.columns{'+
        'display: grid;'+
        'grid-template-columns: 4fr 1fr 4fr 12fr 6fr 2fr;'+
        'gap: 20px;'+
        'height: auto;'+
        'margin-top: 25px;'+
        'margin-bottom: 20px;'+
        'transition: max-height 0.5s ease-in-out;'+
        '}'+
        'div.tablerow{'+
        'position: relative;'+
        'font-family: \'Raleway\';'+
        'font-style: 500;'+
        'font-size: 18px;'+
        'padding-top: 1px;'+
        'padding-bottom: 26px;'+
        'background-color: white;'+
        'border-bottom: 1px solid grey;'+
        'margin-bottom: 10px;'+
        'padding-left: 30px !important;'+
        '}'+
        'div.headerrow{'+
        'padding-top: 26px;'+
        '}'+
        'p{'+
        'font-weight: 500;'+
        'font-size: 18px;'+
        'margin:0;'+
        'padding: 0;'+
        'overflow-wrap: anywhere;'+
        '}'+
        'div.collectioninfomargin{'+
        'margin-top: 25px !important;'+
        '}'+
        'div.deliveryinfomargin{'+
        'margin-top: -25px;'+
        'margin-bottom: 0px;'+
        'transition: margin-top 0.5s ease-in-out, margin-bottom 0.5s ease-in-out;'+
        '}'+
        'i{'+
        'width: 20px;'+
        'height: 20px;'+
        'font-size: 20px;'+
        'margin: 1px 0px;'+
        'margin-right: 10px;'+
        '}'+
        '+extrainfo{'+
        'display: flex;'+
        'flex-wrap: wrap;'+
        'gap: 35px;'+
        'row-gap: 15px;'+
        ''+
        '}'+
        'div.extrainfo > div{'+
        'display: flex;'+
        '}'+
        'div.onelineaddress{'+
        'display: flex;'+
        'flex-wrap: wrap;'+
        'gap: 5px;'+
        ''+
        '}'+
        '@media(max-width: 1250px){'+
        'div.tablerow{'+
        'padding-left: 30px !important;'+
        ''+
        '}'+
        '}'+
        ''+
        '@media(max-width: 1200px){'+
        'div.columns{'+
        'gap: 10px;'+
        '}'+
        '}'+
        ''+
        '@media (max-width: 1150px) {'+
        ''+
        'div.extrainfo{'+
        'display: flex;'+
        'flex-wrap: wrap;'+
        'gap: 35px;'+
        'row-gap: 15px;'+
        '}'+
        'p{'+
        'font-size: 17px !important;'+
        '}'+
        '}'+
        '@media (max-width: 1000px){'+
        'div.headerrow{'+
        'font-size: 17px !important;'+
        ''+
        '}'+
        '}'+
        '@media (max-width: 740px){'+
        'p{'+
        'font-size: 15px !important;'+
        '}'+
        'input, #payment{'+
        'height: 25px;'+
        'font-size: 16px;'+
        '}'+
        '}'+
        '@media (max-width: 600px){'+
        'div.tablerow{'+
        'padding-bottom: 13px !important;'+
        '}'+
        'div.headerrow{'+
        'padding-top: 13px !important;'+
        '}'+
        '}'+
        '@media (max-width: 510px){'+
        'div.info{'+
        'grid-template-columns: 1fr !important;'+
        '}'+
        '}'+
        '@media(max-width: 1250px){'+
        '+tablerow{'+
        'padding-left: 30px !important;'+
        ''+
        '}'+
        '}'+
        ''+
        '@media(max-width: 1200px){'+
        '+columns{'+
        'gap: 10px;'+
        '}'+
        '}'+
        ''+
        '@media (max-width: 1150px) {'+
        '+info{'+
        'grid-template-columns: 1fr 1fr;'+
        '}'+
        '+quickcollectionaddresswrapper > p{'+
        'font-size: 15px !important;'+
        '}'+
        '+flex > p{'+
        'font-size: 13px ;'+
        '}'+
        '+forminput{'+
        'margin: 10px 0px !important;'+
        '}'+
        '+extrainfo{'+
        'display: flex;'+
        'flex-wrap: wrap;'+
        'gap: 35px;'+
        'row-gap: 15px;'+
        ''+
        '}'+
        'p{'+
        'font-size: 17px !important;'+
        '}'+
        '}'+
        '@media (max-width: 1000px){'+
        '+headerrow{'+
        'font-size: 17px !important;'+
        ''+
        '}'+
        '}'+
        '@media (max-width: 740px){'+
        'p{'+
        'font-size: 15px !important;'+
        '}'+
        'input, #payment{'+
        'height: 25px;'+
        'font-size: 16px;'+
        '}'+
        '+info{'+
        'column-gap: 20px !important;'+
        '}'+
        '}'+
        '@media (max-width: 600px){'+
        '+tablerow{'+
        'padding-bottom: 13px !important;'+
        '}'+
        '+headerrow{'+
        'padding-top: 13px !important;'+
        '}'+
        '}'+
        '@media (max-width: 510px){'+
        '+info{'+
        'grid-template-columns: 1fr !important;'+
        '}'+
        '+paymentinfo{'+
        'grid-template-columns: 1fr !important;'+
        '}'+
        '}'+
        '</style>'+
        ''+
        '</head>'+
        '<body>'+
        ''+
        '<div id="table">';

    for(let i = 0; i < orders.length; i++){

        // echo orders[i]['animal_type'];

        attachment = attachment + '<div class="tablerow">'+
        '<div class="flex collectioninfomargin">'+
        '<i class="fa-solid fa-hashtag" title="ID"></i>'+
        '<p>'+ orders[i]['ID'] +'</p>'+
        '</div>'+
        '<div class="transportinfowrapper">'+
        '<div class="columns collectioninfomargin">'+
        '<p>' + orders[i]['animalType'] + '</p>'+
        '<p>' + orders[i]['quantity'] + '</p>'+
        '<p>' + orders[i]['collectionName'] + '</p>'+
        '<div class="onelineaddress">'+
        '<p>' + orders[i]['collectionAddress1'] + '</p>'+
        '<p>' + orders[i]['collectionAddress2'] + '</p>'+
        '<p>' + orders[i]['collectionAddress3'] + '</p>'+
        '<p>' + orders[i]['collectionPostcode'] + '</p>'+
        '</div>'+
        '<p>' + orders[i]['collectionPhoneNumber'] + '</p>'+
        '<i class="fa-solid fa-box-open" title="collection"></i>'+
        '</div>'+
        '<div class="columns ">'+
        '<p class="">' + orders[i]['animalType'] + '</p>'+
        '<p>' + orders[i]['quantity'] + '</p>'+
        '<p>' + orders[i]['deliveryName'] + '</p>'+
        '<div class="onelineaddress">'+
        '<p>' + orders[i]['deliveryAddress1'] + '</p>'+
        '<p>' + orders[i]['deliveryAddress2'] + '</p>'+
        '<p>' + orders[i]['deliveryAddress3'] + '</p>'+
        '<p>' + orders[i]['deliveryPostcode'] + '</p>'+
        '</div>'+
        '<p>' + orders[i]['deliveryPhoneNumber'] + '</p>'+
        '<i class="fa-solid fa-truck" title="delivery"></i>'+
        '</div>'+
        '</div>'+
        '<div class="extrainfo ">'+
        '<div>'+
        '<i class="fa-solid fa-at" title="email"></i>'+
        '<p>' + orders[i]['email'] + '</p>'+
        '</div>'+
        '<div>'+
        '<i class="fa-solid fa-credit-card" title="payment on pick up or delivery"></i>'+
        '<p>' + orders[i]['payment'] + '</p>'+
        '</div>'+
        '<div>'+
        '<i class="fa-solid fa-ticket-simple" title="code"></i>'+
        '<p>' + orders[i]['code'] + '</p>'+
        '</div>'+
        '<div>'+
        '<i class="fa-solid fa-boxes-stacked" title="boxes"></i>'+
        '<p>' + orders[i]['boxes'] + '</p>'+
        '</div>'+
        '<div>'+
        '<i class="fa-solid fa-message" title="message"></i>'+
        '<p>' + orders[i]['message'] + '</p>'+
        '</div>'+
        '</div>'+
        '</div>';
 
    }

    attachment = attachment + 
    '</tbody>'+
    '</table>'+
    '</div>'+
    '<script src="https://kit.fontawesome.com/dce6efa4ea.js" crossorigin="anonymous"></script>'+
    '</body>'+
    '</html>';

    return attachment;

}