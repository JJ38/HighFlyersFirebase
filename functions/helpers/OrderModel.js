
//https://en.wikipedia.org/wiki/ISO_8601
//As a consequence, if 1 January is on a Monday, Tuesday, Wednesday or Thursday, it is in week 01. 
//If 1 January is on a Friday, Saturday or Sunday, it is in week 52 or 53 of the previous year (there is no week 00). 28 December is always in the last week of its year.

//Years where Jan 1 falls on a Thursday or Dec 31 falls on a Thursday (in a leap year: Wednesday or Thursday) will have a week 53.


export function getDeliveryWeek(currentDate){

    // Customer order
    // After 12pm on Monday
    let deliveryWeek = 0;

    //is it monday and before 12
    if (currentDate.weekday === 1 && currentDate.hour < 12) {
        deliveryWeek = currentDate.weekNumber;

    } else{

        deliveryWeek = currentDate.plus({ weeks: 1}).weekNumber;
    }

    return deliveryWeek;

}

// export function getOrderPrice(order, birdSpecies, postcodeDefinitions){

//     fetchBirdSpecies();
//     fetchPricePostcodeDefinitions();



//     return "N/A";

// }


export async function fetchBirdSpecies(db){

    try {

        
        const docRef = db.collection("Settings").doc("birdSpecies");
        console.log("Doc path:", docRef.path);

        const birdSpeciesDocument = await docRef.get();
        console.log("Exists?", birdSpeciesDocument.exists);
        console.log("Data:", birdSpeciesDocument.data());

        if(birdSpeciesDocument == false){
            return false;
        }

        const birdSpecies = birdSpeciesDocument.data();
        
        if(birdSpecies == null){
            return false;
        }

        return birdSpecies;


    } catch (e) {

        console.error("Firestore get() error:", e);
        return false;
    }

   

}

export async function fetchPricePostcodeDefinitions(db){

    const priceDefinitionsDocument = await db.collection("Settings").doc("priceDefinitions").get();

    if(priceDefinitionsDocument == false){
        return false;
    }

    const priceDefinitions = priceDefinitionsDocument.data();
    
    if(priceDefinitions == null){
        return false;
    }

    return priceDefinitions;

}

export function calculateOrderPrice(collectionPostcodeInput, deliveryPostcodeInput, quantityInput, boxesInput, animalTypeInput, birdSpecies, pricePostcodeDefinitions, birdSpeciesSet){
    
    const animalType = validateAnimalType(animalTypeInput, birdSpeciesSet);
    if(animalType == false){
        return false;
    }

    const quantity = validatePositiveInteger(quantityInput);
    if(quantity == false){
        return false;
    }

    const boxes = validatePositiveInteger(boxesInput);
    if(boxes == false){
        return false;
    }

    const collectionPostcode = validatePostcode(collectionPostcodeInput, pricePostcodeDefinitions);
    if(collectionPostcode == false){
        return false;
    }

    const deliveryPostcode = validatePostcode(deliveryPostcodeInput, pricePostcodeDefinitions);
    if(deliveryPostcode == false){
        return false;
    }

    const pricingForOrder = getPricingForOrder(collectionPostcode, deliveryPostcode, animalType, birdSpecies, pricePostcodeDefinitions);

    let tally = pricingForOrder.pricing.standardPrice;

    let excess = 0;
    
    if(pricingForOrder.surchargeType == "Bird"){
        excess = quantity - pricingForOrder.includedQuantity ;
    }

    if(pricingForOrder.surchargeType == "Box"){
        excess = boxes - pricingForOrder.includedQuantity ;
    }

    if(excess > 0){
        tally += (excess * pricingForOrder.pricing.additionalPrice);
    }

    return tally;

}

function validatePositiveInteger(quantity){

    const quantityInt = parseInt(quantity);
    if(quantityInt > 0){
        return quantityInt;
    }

    return false;
}

function validateAnimalType(animalType, validAnimalTypes){
    
    if(validAnimalTypes.has(animalType)){
        return animalType;
    }

    return false;

}

function validatePostcode(postcode, pricePostcodeDefinitions){

    const outwardPostcode = getOutwardPostcode(postcode);

    if(outwardPostcode == false){
        return false;
    }

    //check if valid postcode in system
    if(pricePostcodeDefinitions[outwardPostcode]){
        return outwardPostcode;
    }

    return false;
    
}

function getOutwardPostcode(postcode){

    const trimmedPostcode = postcode.toString().replaceAll(" ", "").toUpperCase();

    if(trimmedPostcode.length == 7){
        return trimmedPostcode.substring(0, 4);
    }

    if(trimmedPostcode.length == 6){
        return trimmedPostcode.substring(0, 3);
    }

    if(trimmedPostcode.length == 5){
        return trimmedPostcode.substring(0, 2);
    }

    if(trimmedPostcode.length <= 4 && trimmedPostcode.length >= 2){
        return trimmedPostcode;
    }

    return false;

}

function getPricingForOrder(collectionPostcode, deliveryPostcode, animalType, birdSpecies, pricePostcodeDefinitions){

    const pricingForAnimal = getPricingForAnimal(animalType, birdSpecies);

    const collectionAreaName = getAreaName(collectionPostcode, pricePostcodeDefinitions);
    const deliveryAreaName = getAreaName(deliveryPostcode, pricePostcodeDefinitions);

    const collectionPricing = getAreaPricing(collectionAreaName, pricingForAnimal);
    const deliveryPricing = getAreaPricing(deliveryAreaName, pricingForAnimal);

    if(collectionPricing.pricing.standardPrice > deliveryPricing.pricing.standardPrice){
        return collectionPricing;
    }

    return deliveryPricing;
}

function getPricingForAnimal(animalType, birdSpecies){

    for(let i = 0; i < birdSpecies.species.length; i++){
        if(birdSpecies.species[i].name == animalType){
            return birdSpecies.species[i].prices;
        }
    }

}

function getAreaName(postcode, pricePostcodeDefinitions){

    return pricePostcodeDefinitions[postcode];

}

function getAreaPricing(areaName, pricingForAnimal){
    
    for(let i = 0; i < pricingForAnimal.areaPrices.length; i++){

        if(pricingForAnimal.areaPrices[i].area == areaName){

            return {pricing: pricingForAnimal.areaPrices[i], includedQuantity: pricingForAnimal.includedQuantity, surchargeType: pricingForAnimal.surchargeType};

        }

    }

}
