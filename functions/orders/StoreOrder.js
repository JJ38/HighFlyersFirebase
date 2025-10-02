import { onRequest } from "firebase-functions/v2/https"
import { DateTime } from "luxon";
import { logger } from "firebase-functions";

import { validateForm } from "../helpers/Validator.js";
import { getDeliveryWeek, getOrderID, fetchBirdSpecies, fetchPricePostcodeDefinitions, calculateOrderPrice } from "../helpers/OrderModel.js";

import { cloudFunctionDB } from "../helpers/Firebase.js";



export const storeorder = onRequest(async (req, res) => {

    const db = cloudFunctionDB;

    let birdSpeciesSet = new Set();

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

        const pricePostcodeDefinitions = await fetchPricePostcodeDefinitions(db);

        //get price
        let price = calculateOrderPrice(formJSON['collectionPostcode'], formJSON['deliveryPostcode'], formJSON['quantity'], formJSON['boxes'], formJSON['animalType'], birdSpecies, pricePostcodeDefinitions);

        if(price == false){
            price = "N/A";
        }

        formJSON['price'] = price;


        //id

        const orderID = getOrderID(db);

        if(orderID == false){
            return res.status(400).json({error: true, message: "Error storing order. Couldnt get ID"});
        }

        formJSON['ID'] = orderID;

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