import { onRequest } from "firebase-functions/v2/https"
import { getDeliveryWeek, calculateOrderPrice, fetchBirdSpecies, fetchPricePostcodeDefinitions } from "../helpers/OrderModel.js";
import { validateForm } from "../helpers/Validator.js";
import { DateTime } from "luxon";
import { getDatabase, ordersCollectionName } from "../helpers/Firebase.js";



export const editorder = onRequest(async (req, res) => {

    const role = req.user.role;
    const formJSON = req.body;
    console.log(formJSON);

    if(role != "admin"){
        return res.status(403).send("Unauthorized: Insufficient permissions");
    }

    const environment = req.body['environment'];
    const db = getDatabase(environment);
    
    if(!environment){
        return res.status(400).send("Environment: Not Allowed - " + environment);
    }
    

    let birdSpeciesSet = new Set();

    const uuid = formJSON['uuid'];
    if(uuid == "" || uuid == null || uuid == undefined){
        return res.status(400).json({error: true, message: "UUID id invalid", errorLog: "invalid uuid format - " + uuid});
    }

    const orderRef = db.collection(ordersCollectionName).doc(uuid);

    try{

        const orderDoc = await orderRef.get();
        if(!orderDoc.exists){
            return res.status(404).json({error: true, message: "UUID id invalid", errorLog: "document doesnt exist"});
        }

    }catch(e){
        return res.status(500).json({error: true, message: "Error checking if document exists", errorLog: "error fetching document"});
    }


    try{

        const orderJSON = formJSON['orderDetails'];
        console.log(formJSON);

        //fetch current allowed birdSpecies
        const birdSpecies = await fetchBirdSpecies(db);

          if(birdSpecies == false){
            return res.status(500).json({error: true, message: "Internal Server Error", errorLog: "bird species is false"});
        }

        for(let i = 0; i < birdSpecies.species.length; i++){

            birdSpeciesSet.add(birdSpecies.species[i].name);

        }   

        
        //validate order
        const validationError = validateForm(orderJSON, Array.from(birdSpeciesSet));

        if(validationError != null) {
            return res.status(400).json({error: true, message: validationError + " - order at index: "});
        }


        //check deliveryWeek
        if(orderJSON['deliveryWeek'] == null || orderJSON['deliveryWeek'] == ""){

            const londonTime = DateTime.now().setZone('Europe/London');
            orderJSON['deliveryWeek'] = getDeliveryWeek(londonTime);

        }


        //check price
        if(orderJSON['price'] == null || orderJSON['price'] == ""){

            const pricePostcodeDefinitions = await fetchPricePostcodeDefinitions(db);

            if(pricePostcodeDefinitions == false){
                return res.status(500).json({error: true, message: "Internal Server Error", errorLog: "postcodeDefinitions is false"});
            }

            const orderPrice = calculateOrderPrice(orderJSON['collectionPostcode'], orderJSON['collectionPostcode'], orderJSON['quantity'], orderJSON['boxes'], orderJSON['animalType'], birdSpecies, pricePostcodeDefinitions);
            orderJSON['price'] = orderPrice ? orderPrice : "N/A";

        }

        try{

            await orderRef.update(orderJSON);

        }catch(e){

            return res.status(502).json({error: true, message: "Error storing updated order - " + e});

        }
        

    }catch(e){
        console.log(e);
        return res.status(500).json({error: true, message: "Error updating order - " + e});
        
    }

    return res.status(200).json({error: false, message: "Successfully updated order"});

});