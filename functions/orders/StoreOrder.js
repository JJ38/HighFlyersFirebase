import { onRequest } from "firebase-functions/v2/https"
import { getFirestore } from "firebase-admin/firestore";
import { logger } from "firebase-functions";

import { validateForm } from "../helpers/Validator.js";



export const storeorder = onRequest(async (req, res) => {

    try{

        //this is converted to a json object automatically within the express.js framework
        const formJSON = req.body;

        if(formJSON == null){
            return res.status(400).json({error: true, message: "The request body cannot be null and must be a of type application/json"});
        }

        if (req.get('Content-Type') !== 'application/json') {
            return res.status(400).json({error: true, message: "Request must be of content type application/json"});
        }

        const validationError = validateForm(formJSON);

        if(validationError != null) {
            return res.status(400).json({error: true, message: validationError});
        }

        //get delivery week

        // const deliveryWeek = getDeliveryWeek();


        //get price


        try {

            const db = getFirestore();
            const ordersCollection = db.collection('test');

            const docRef = await ordersCollection.add(formJSON);

            return res.status(200).json({error: false, docID: docRef.id});

        } catch (error) {

            console.error('Error saving order to Firestore:', error);
            return res.status(500).json({error: true, message: "failed to store valid order",});

        }
    
    }catch(error){
        return res.status(500).json({error: true, message: "Internal Server Error", errorLog: error.toString()});
    }

});