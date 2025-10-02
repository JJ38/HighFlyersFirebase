import { onRequest } from "firebase-functions/v2/https"
import { DateTime } from "luxon";
import { logger } from "firebase-functions";

import { validateForm } from "../helpers/Validator.js";
import { getDeliveryWeek, calculateOrderPrice, getOrderID, fetchBirdSpecies, fetchPricePostcodeDefinitions } from "../helpers/OrderModel.js";
import { integrationTestDB } from "../helpers/Firebase.js";


export const storeorder = onRequest(async (req, res) => {

    let birdSpeciesSet = new Set();
    const db = integrationTestDB;


    try{

        //this is converted to a json object automatically within the express.js framework
        const formJSON = req.body;

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


        //get order price
        const pricePostcodeDefinitions = await fetchPricePostcodeDefinitions(db);
        if(pricePostcodeDefinitions == false){
            return res.status(500).json({error: true, message: "Internal Server Error", errorLog: "postcodeDefinitions is false"});
        }

        const orderPrice = calculateOrderPrice(formJSON['collectionPostcode'], formJSON['collectionPostcode'], formJSON['quantity'], formJSON['boxes'], formJSON['animalType'], birdSpecies, pricePostcodeDefinitions);
        formJSON['price'] = orderPrice ? orderPrice : "N/A";

        const ID = await getOrderID(db);
        formJSON['ID'] = ID;

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