import { onRequest } from "firebase-functions/v2/https"
import { DateTime } from "luxon";
import { logger } from "firebase-functions";

import { validateForm } from "../helpers/Validator.js";
import { getDeliveryWeek, calculateOrderPrice, getOrderID, fetchBirdSpecies, fetchPricePostcodeDefinitions } from "../helpers/OrderModel.js";
import { integrationTestDB, storeCollectionNameOrders } from "../helpers/Firebase.js";


export const storeorder = onRequest(async (req, res) => {

    let birdSpeciesSet = new Set();
    const db = integrationTestDB;


    try{

        //this is converted to a json object automatically within the express.js framework
        const formJSON = req.body;

        console.log(formJSON);

        const birdSpecies = await fetchBirdSpecies(db);

        if(birdSpecies == false){
            return res.status(500).json({error: true, message: "Internal Server Error", errorLog: "bird species is false"});
        }

        for(let i = 0; i < birdSpecies.species.length; i++){

            birdSpeciesSet.add(birdSpecies.species[i].name);

        }   


        //validate each order
        for(let i = 0; i < formJSON.length; i++){
            
            const validationError = validateForm(formJSON[i], Array.from(birdSpeciesSet));
            if(validationError != null) {
                return res.status(400).json({error: true, message: validationError + " - order at index: " + i});
            }

        }

        //get delivery week
        const londonTime = DateTime.now().setZone('Europe/London');
        const deliveryWeek = getDeliveryWeek(londonTime);

        formJSON['deliveryWeek'] = deliveryWeek;

        //add delivery week to each order
        for(let i = 0; i < formJSON.length; i++){

            formJSON[i]['deliveryWeek'] = deliveryWeek;
            formJSON[i]['timestamp'] = londonTime.toFormat("yyyy-MM-dd HH:mm:ss");

        }

        //get order price
        const pricePostcodeDefinitions = await fetchPricePostcodeDefinitions(db);
        if(pricePostcodeDefinitions == false){
            return res.status(500).json({error: true, message: "Internal Server Error", errorLog: "postcodeDefinitions is false"});
        }


        for(let i = 0; i < formJSON.length; i++){

            const orderPrice = calculateOrderPrice(formJSON[i]['collectionPostcode'], formJSON[i]['collectionPostcode'], formJSON[i]['quantity'], formJSON[i]['boxes'], formJSON[i]['animalType'], birdSpecies, pricePostcodeDefinitions);
            formJSON[i]['price'] = orderPrice ? orderPrice : "N/A";

        }

        for(let i = 0; i < formJSON.length; i++){

            formJSON[i]['account'] = req.user.email.replaceAll("@placeholder.com", "");

        }

        //return a list of ids
        const newHighID = await getOrderID(db, formJSON.length);

        for(let i = 0; i < formJSON.length; i++){

            formJSON[i]['ID'] = newHighID - formJSON.length + i + 1;

        }


        try {

            const documentIDs = [];

            const batch = db.batch();

            for(let i = 0; i < formJSON.length; i++){

                const orderDocRef = db.collection(storeCollectionNameOrders).doc();
                documentIDs.push(orderDocRef.id);
                batch.set(orderDocRef, formJSON[i]);

            }

            await batch.commit();

            return res.status(200).json({error: false, ordersSubmitted: formJSON.length, message: "Successfully stored order(s)", documentIDs: documentIDs.toString()});

        } catch (error) {

            console.error('Batch write failed: ', error);
            return res.status(502).json({error: true, message: "failed to store valid order",});

        }
    
    }catch(error){
        console.log(error);
        return res.status(503).json({error: true, message: "Internal Server Error", errorLog: error});
    }

});