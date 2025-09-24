import { onRequest } from "firebase-functions/v2/https"
import { getFirestore } from "firebase-admin/firestore";
import { logger } from "firebase-functions";

import { validateForm } from "../helpers/Validator.js";
import { convertFromJSON } from "../helpers/Converter.js";



export const validateorder = onRequest(async (req, res) => {
    
    const formJSONString = req.body;

    if(formJSONString == null){
        res.json({error: true, message: "Form parameter formjson cannot be null"});
        return;
    }

    const formJSON = convertFromJSON(formJSONString);

    if(formJSON == null){
        res.json({error: true, message: "Parameter formjson is invalid json"});
        return;    
    }

    const validationError = validateForm(formJSON);

    if(validationError != null) {
        res.json({error: true, message: errorMessage});
        return;
    }

    try {

        // Get a reference to the 'orders' collection.
        const db = getFirestore("development");
        const ordersCollection = db.collection('test');

        // Add the order data to Firestore. The .add() method creates a new document with an auto-generated ID.
        const docID = await ordersCollection.add({
            field: 123456789,
            // createdAt: db.FieldValue.serverTimestamp() // Add a timestamps
        });

        res.status(200).json({error: false, docID: docID});
        return

    } catch (error) {

        console.error('Error saving order to Firestore:', error);
        res.status(500).json({error: true, message: "failed to store valid order",});

    }

});