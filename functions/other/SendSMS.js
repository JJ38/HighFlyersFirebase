import { onRequest } from "firebase-functions/v2/https";
import twilio from "twilio";


export const sendSMS = onRequest(async (req, res) => {

  try {

    console.log(req.body);

    let message = req.body['message'];

    if(message == null || message == undefined){
        message = "A deferred payment has been created - server default message";
    }

    let environment = req.body['environment'];

    let phoneNumber = process.env.DEV_ADMIN_PHONE_NUMBER;

    if(environment == "PROD"){
      phoneNumber = process.env.PROD_ADMIN_PHONE_NUMBER;
    }

    console.log("Sending sms to " + phoneNumber);
   

    if (message.length > 160) {
      res.status(400).send("Message too long");
      return;
    }

    const twilioClient = twilio(
      process.env.TWILIO_SID,
      process.env.TWILIO_AUTH_TOKEN
    );


    // Send SMS via Twilio
    await twilioClient.messages.create({
      to: phoneNumber,
      from: process.env.TWILIO_PHONE_NUMBER,
      body: message,
    });

    res.status(200).json({ success: true });

  } catch (error) {

    console.error("sendSms error:", error);
    res.status(500).json({"message": "Failed to send SMS"});

  }
});
