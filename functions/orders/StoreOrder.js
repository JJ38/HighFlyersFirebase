import { onRequest } from "firebase-functions/v2/https"
import { DateTime } from "luxon";
import { logger } from "firebase-functions";

import { validateForm } from "../helpers/Validator.js";
import { getDeliveryWeek, calculateOrderPrice, getOrderID, fetchBirdSpecies, fetchPricePostcodeDefinitions } from "../helpers/OrderModel.js";
import { getDatabase, ordersCollectionName } from "../helpers/Firebase.js";
import { sendMailCustomer, sendMailInternal, getAttachmentHTML } from "../helpers/Mailer.js";


export const storeorder = onRequest(async (req, res) => {

    let birdSpeciesSet = new Set();

    try{

        //this is converted to a json object automatically within the express.js framework
        const formJSON = req.body;
        console.log(formJSON);

        const role = req.user.role;

        if(role != "customer" && role != "admin"){
            return res.status(403).send("Unauthorized: Insufficient permissions");
        }

        const environment = req.body['environment'];
        const orderJSON = formJSON['orderDetails'];
        const profileEmail = formJSON['profileEmail'];

        if(!orderJSON || !environment){
            return res.status(400).json({error: true, message: "Invalid json structure. environment and orderDetails must be defined"});
        }

        const db = getDatabase(environment);

        const birdSpecies = await fetchBirdSpecies(db);

        if(birdSpecies == false){
            return res.status(500).json({error: true, message: "Internal Server Error", errorLog: "bird species is false"});
        }

        for(let i = 0; i < birdSpecies.species.length; i++){

            birdSpeciesSet.add(birdSpecies.species[i].name);

        }   

        //validate each order
        for(let i = 0; i < orderJSON.length; i++){
            
            const validationError = validateForm(orderJSON[i], Array.from(birdSpeciesSet));
            if(validationError != null) {
                return res.status(400).json({error: true, message: validationError + " - order at index: " + i});
            }

        }

        //get delivery week
        const londonTime = DateTime.now().setZone('Europe/London');
        const deliveryWeek = getDeliveryWeek(londonTime);


        //add delivery week to each order
        for(let i = 0; i < orderJSON.length; i++){

            if(!orderJSON[i]['deliveryWeek']){

                orderJSON[i]['deliveryWeek'] = deliveryWeek;

            }

            orderJSON[i]['timestamp'] = londonTime.toFormat("yyyy-MM-dd HH:mm:ss");

        }

        //get order price
        const pricePostcodeDefinitions = await fetchPricePostcodeDefinitions(db);
        if(pricePostcodeDefinitions == false){
            return res.status(500).json({error: true, message: "Internal Server Error", errorLog: "postcodeDefinitions is false"});
        }


        for(let i = 0; i < orderJSON.length; i++){

            if(!orderJSON[i]['price']){
                const orderPrice = calculateOrderPrice(orderJSON[i]['collectionPostcode'], orderJSON[i]['collectionPostcode'], orderJSON[i]['quantity'], orderJSON[i]['boxes'], orderJSON[i]['animalType'], birdSpecies, pricePostcodeDefinitions);
                orderJSON[i]['price'] = orderPrice ? orderPrice : "N/A";
            }

        }

        let username;

        if(role === "customer"){
            username = req.user.email.replaceAll("@placeholder.com", "");
            const uid = req.user.uid;
            
            if(username === null){
                return res.status(500).json({error: true, message: "Internal Server Error", errorLog: "username is null"});
            }

            for(let i = 0; i < orderJSON.length; i++){

                orderJSON[i]['account'] = uid;

            }
        }
    

        //return a list of ids
        const newHighID = await getOrderID(db, orderJSON.length);

        for(let i = 0; i < orderJSON.length; i++){

            orderJSON[i]['ID'] = newHighID - orderJSON.length + i + 1;

        }


        try {

            const documentIDs = [];

            const batch = db.batch();
            
            for(let i = 0; i < orderJSON.length; i++){

                const orderDocRef = db.collection(ordersCollectionName).doc();
                documentIDs.push(orderDocRef.id);
                batch.set(orderDocRef, orderJSON[i]);

            }

            

            await batch.commit();
            
            if(process.env.GMAIL_EMAIL === null){
                return res.status(200).json({error: true, ordersSubmitted: orderJSON.length, message: "Successfully stored order(s) but error sending email - No email to send from found", documentIDs: documentIDs.toString()});
            }



            if(role === "customer"){

                const attachmentHTML = getAttachmentHTML(orderJSON);
                
                const mailResultCustomer = await sendMailCustomer(attachmentHTML, profileEmail);

                if(mailResultCustomer === false){
                    console.log("Error sending customer email");
                    return res.status(200).json({error: true, ordersSubmitted: orderJSON.length, message: "Successfully stored order(s) but error sending email", documentIDs: documentIDs.toString()});
                }

                const mailResultInternal = await sendMailInternal(attachmentHTML, username);

                if(mailResultInternal === false){
                    console.log("Error sending internal email");
                }

            }

            return res.status(200).json({error: false, ordersSubmitted: orderJSON.length, message: "Successfully stored order(s)", documentIDs: documentIDs.toString()});

        } catch (error) {

            console.error('Batch write failed: ', error);
            return res.status(502).json({error: true, message: "failed to store valid order",});

        }
    
    }catch(error){
        console.log(error);
        return res.status(503).json({error: true, message: "Internal Server Error", errorLog: error});
    }

});