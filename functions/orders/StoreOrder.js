import { onRequest } from "firebase-functions/v2/https"
import { DateTime } from "luxon";
import { logger } from "firebase-functions";

import { validateForm } from "../helpers/Validator.js";
import { getDeliveryWeek, fetchBirdSpecies } from "../helpers/OrderModel.js";

import { db } from "../helpers/Firebase.js";



export const storeorder = onRequest(async (req, res) => {

    let birdSpeciesSet = new Set();

    try{

        //this is converted to a json object automatically within the express.js framework
        const formJSON = req.body;

        if(formJSON == null){
            return res.status(400).json({error: true, message: "The request body cannot be null and must be a of type application/json"});
        } 

        if (req.get('Content-Type') !== 'application/json') {
            return res.status(400).json({error: true, message: "Request must be of content type application/json"});
        }

        const birdSpecies = await fetchBirdSpecies(db);

        if(birdSpecies == false){
            return res.status(500).json({error: true, message: "Internal Server Error", errorLog: "bird species is false"});
        }

        for(let i = 0; i < birdSpecies.species.length; i++){

            birdSpeciesSet.add(birdSpecies.species[i].name);

        }   

        const validationError = validateForm(formJSON, Array.from(birdSpeciesSet));


        if(validationError != null) {
            return res.status(400).json({error: true, message: validationError});
        }


        //get delivery week

        const londonTime = DateTime.now().setZone('Europe/London');
        const deliveryWeek = getDeliveryWeek(londonTime);

        formJSON['deliveryWeek'] = deliveryWeek;


        try {

            const ordersCollection = db.collection('test');

            const docRef = await ordersCollection.add(formJSON);

            return res.status(200).json({error: false, docID: docRef.id});

        } catch (error) {

            console.error('Error saving order to Firestore:', error);
            return res.status(502).json({error: true, message: "failed to store valid order",});

        }
    
    }catch(error){
        console.log(error);
        return res.status(503).json({error: true, message: "Internal Server Error", errorLog: error.toString()});
    }

});