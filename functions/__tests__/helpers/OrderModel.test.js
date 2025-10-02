import { integrationTestDB } from "../../helpers/Firebase.js";
import { DateTime } from "luxon";
import { getDeliveryWeek, calculateOrderPrice, fetchBirdSpecies, fetchPricePostcodeDefinitions } from "../../helpers/OrderModel";

const db = integrationTestDB;

describe('Testing delivery week', () => {

    //https://en.wikipedia.org/wiki/ISO_8601
    //As a consequence, if 1 January is on a Monday, Tuesday, Wednesday or Thursday, it is in week 01. 
    //If 1 January is on a Friday, Saturday or Sunday, it is in week 52 or 53 of the previous year (there is no week 00). 28 December is always in the last week of its year.

    //Years where Jan 1 falls on a Thursday or Dec 31 falls on a Thursday (in a leap year: Wednesday or Thursday) will have a week 53.

    test('Monday 11:59', async () => {
        
        const fixedDate = DateTime.fromISO("2024-12-30T11:00:00"); // monday

        const deliveryWeek = getDeliveryWeek(fixedDate);

        expect(deliveryWeek).toBe(1);
        
    });

    test('Monday 12:00', async () => {

        const fixedDate = DateTime.fromISO("2024-12-30T13:00:00");

        const deliveryWeek = getDeliveryWeek(fixedDate);

        expect(deliveryWeek).toBe(2);
        
    });

    test('Monday 11:59 before year cutoff', async () => {
        
        const fixedDate = DateTime.fromISO("2024-12-23T11:00:00"); // monday

        const deliveryWeek = getDeliveryWeek(fixedDate);

        expect(deliveryWeek).toBe(52);
        
    });

    test('Monday 11:59 after year cutoff', async () => {
        
        const fixedDate = DateTime.fromISO("2024-12-23T13:00:00"); // monday

        const deliveryWeek = getDeliveryWeek(fixedDate);

        expect(deliveryWeek).toBe(1);
        
    });


    test('Monday 11:59 after year cutoff week 53 year', async () => {
        
        const fixedDate = DateTime.fromISO("2020-12-28T13:00:00"); // monday

        const deliveryWeek = getDeliveryWeek(fixedDate);

        expect(deliveryWeek).toBe(1);
        
    });

     test('Monday 11:59 before year cutoff week 53 year', async () => {
        
        const fixedDate = DateTime.fromISO("2020-12-28T11:00:00"); // monday

        const deliveryWeek = getDeliveryWeek(fixedDate);

        expect(deliveryWeek).toBe(53);
        
    });

});

describe('Testing fetching documents', () => {

    test('Fetching birdSpecies document', async () => {

        const birdSpeciesDocument = await fetchBirdSpecies(db);
        console.log(birdSpeciesDocument.species[0].prices);
        
        const docRef = db.collection("Settings").doc('birdSpecies');

        const docSnap = await docRef.get();

        expect(docSnap.exists).toBe(true);
        expect(docSnap.data()).toEqual(birdSpeciesDocument);
        
    });

    test('Fetching priceDefinitions document', async () => {

        const priceDefinitionsDocument = await fetchPricePostcodeDefinitions(db);
        
        const docRef = db.collection("Settings").doc('priceDefinitions');

        const docSnap = await docRef.get();

        expect(docSnap.exists).toBe(true);
        expect(docSnap.data()).toEqual(priceDefinitionsDocument);
        
    });

});


describe('Order Price Calculation', () => {

    let birdSpecies;
    let pricePostcodeDefinitions;
    let birdSpeciesSet = new Set();

    beforeAll(async () => {

        const birdSpeciesDocRef = db.collection("Settings").doc('birdSpecies');
        const birdSpeciesDoc = await birdSpeciesDocRef.get();

        birdSpecies = birdSpeciesDoc.data();
        console.log(birdSpeciesDoc.data());

        const pricePostcodeDefinitionsDocRef = db.collection("Settings").doc('priceDefinitions');
        const pricePostcodeDefinitionsDoc = await pricePostcodeDefinitionsDocRef.get();

        pricePostcodeDefinitions = pricePostcodeDefinitionsDoc.data();

        for(let i = 0; i < birdSpecies.species.length; i++){

            birdSpeciesSet.add(birdSpecies.species[i].name);

        }   

    });

    describe('Young Pigeons', () => {

        test('should calculate correct price for 12 young pigeons', () => {
            expect(calculateOrderPrice("DE56 1TP", "S17 3AL", 12, 1, "Pigeons - Young Birds", birdSpecies, pricePostcodeDefinitions, birdSpeciesSet)).toBe(55);
        });

        test('should calculate correct price for 13 young pigeons', () => {
            expect(calculateOrderPrice("DE56 1TP", "S17 3AL", 13, 1, "Pigeons - Young Birds", birdSpecies, pricePostcodeDefinitions, birdSpeciesSet)).toBe(57);
        });
        
        test('should calculate correct price for 1 young pigeon', () => {
            expect(calculateOrderPrice("DE56 1TP", "S17 3AL", 1, 1, "Pigeons - Young Birds", birdSpecies, pricePostcodeDefinitions, birdSpeciesSet)).toBe(55);
        });
        
        test('should calculate correct price for 22 young pigeons', () => {
            expect(calculateOrderPrice("DE56 1TP", "S17 3AL", 22, 1, "Pigeons - Young Birds", birdSpecies, pricePostcodeDefinitions, birdSpeciesSet)).toBe(75);
        });
    });

    describe('Old Pigeons', () => {
        test('should calculate correct price for 12 young pigeons', () => {
            expect(calculateOrderPrice("DE56 1TP", "S17 3AL", 12, 1, "Pigeons - Old Birds", birdSpecies, pricePostcodeDefinitions, birdSpeciesSet)).toBe(55);
        });

        test('should calculate correct price for 13 young pigeons', () => {
            expect(calculateOrderPrice("DE56 1TP", "S17 3AL", 13, 1, "Pigeons - Old Birds", birdSpecies, pricePostcodeDefinitions, birdSpeciesSet)).toBe(57);
        });
        
        test('should calculate correct price for 1 young pigeon', () => {
            expect(calculateOrderPrice("DE56 1TP", "S17 3AL", 1, 1, "Pigeons - Old Birds", birdSpecies, pricePostcodeDefinitions, birdSpeciesSet)).toBe(55);
        });
        
        test('should calculate correct price for 22 young pigeons', () => {
            expect(calculateOrderPrice("DE56 1TP", "S17 3AL", 22, 1, "Pigeons - Old Birds", birdSpecies, pricePostcodeDefinitions, birdSpeciesSet)).toBe(75);
        });
    });

    describe('Postcode Surcharges', () => {
        test('should calculate correct price for a London collection postcode (Old Birds)', () => {
            expect(calculateOrderPrice("TW7 6NY", "S17 3AL", 12, 1, "Pigeons - Old Birds", birdSpecies, pricePostcodeDefinitions, birdSpeciesSet)).toBe(60); // 55 + 5
        });

        test('should calculate correct price for a Scotland collection postcode (Old Birds)', () => {
            expect(calculateOrderPrice("ML3 9AD", "S17 3AL", 12, 1, "Pigeons - Old Birds", birdSpecies, pricePostcodeDefinitions, birdSpeciesSet)).toBe(65); // 55 + 10
        });

        test('should calculate correct price for an Aberdeen collection postcode (Old Birds)', () => {
            expect(calculateOrderPrice("AB10 1AB", "S17 3AL", 12, 1, "Pigeons - Old Birds", birdSpecies, pricePostcodeDefinitions, birdSpeciesSet)).toBe(75); // 55 + 20
        });

        test('should calculate correct price for an Inverness collection postcode (Old Birds)', () => {
            expect(calculateOrderPrice("IV1 1AD", "S17 3AL", 12, 1, "Pigeons - Old Birds", birdSpecies, pricePostcodeDefinitions, birdSpeciesSet)).toBe(85); // 55 + 30
        });

        test('should calculate correct price for a Swansea collection postcode (Old Birds)', () => {
            expect(calculateOrderPrice("SA41 3PL", "S17 3AL", 12, 1, "Pigeons - Old Birds", birdSpecies, pricePostcodeDefinitions, birdSpeciesSet)).toBe(60); // 55 + 5
        });

        test('should calculate correct price for a London delivery postcode (Old Birds)', () => {
            expect(calculateOrderPrice("S17 3AL", "TW7 6NY", 12, 1, "Pigeons - Old Birds", birdSpecies, pricePostcodeDefinitions, birdSpeciesSet)).toBe(60); // 55 + 5
        });

        test('should calculate correct price for a Scotland delivery postcode (Old Birds)', () => {
            expect(calculateOrderPrice("S17 3AL", "ML3 9AD", 12, 1, "Pigeons - Old Birds", birdSpecies, pricePostcodeDefinitions, birdSpeciesSet)).toBe(65); // 55 + 10
        });

        test('should calculate correct price for an Aberdeen delivery postcode (Old Birds)', () => {
            expect(calculateOrderPrice("S17 3AL", "AB10 1AB", 12, 1, "Pigeons - Old Birds", birdSpecies, pricePostcodeDefinitions, birdSpeciesSet)).toBe(75); // 55 + 20
        });

        test('should calculate correct price for an Inverness delivery postcode (Old Birds)', () => {
            expect(calculateOrderPrice("S17 3AL", "IV1 1AD", 12, 1, "Pigeons - Old Birds", birdSpecies, pricePostcodeDefinitions, birdSpeciesSet)).toBe(85); // 55 + 30
        });

        test('should calculate correct price for a Swansea delivery postcode (Old Birds)', () => {
            expect(calculateOrderPrice("S17 3AL", "SA41 3PL", 12, 1, "Pigeons - Old Birds", birdSpecies, pricePostcodeDefinitions, birdSpeciesSet)).toBe(60); // 55 + 5
        });
    });
    
    describe('Other Animal Types', () => {
        test('should calculate correct price for 1 Aviary & Cage Bird', () => {
            expect(calculateOrderPrice("DE56 1TP", "S17 3AL", 1, 1, "Aviary & Cage Birds", birdSpecies, pricePostcodeDefinitions, birdSpeciesSet)).toBe(60);
        });

        test('should calculate correct price for 2 Aviary & Cage Birds', () => {
            expect(calculateOrderPrice("DE56 1TP", "S17 3AL", 2, 1, "Aviary & Cage Birds", birdSpecies, pricePostcodeDefinitions, birdSpeciesSet)).toBe(60);
        });

        test('should calculate correct price for 10 Aviary & Cage Birds', () => {
            expect(calculateOrderPrice("DE56 1TP", "S17 3AL", 10, 1, "Aviary & Cage Birds", birdSpecies, pricePostcodeDefinitions, birdSpeciesSet)).toBe(60);
        });

        test('should calculate correct price for 1 Poultry & Gamebird', () => {
            expect(calculateOrderPrice("DE56 1TP", "S17 3AL", 1, 1, "Poultry & Gamebirds", birdSpecies, pricePostcodeDefinitions, birdSpeciesSet)).toBe(99);
        });

        test('should calculate correct price for 2 Poultry & Gamebirds', () => {
            expect(calculateOrderPrice("DE56 1TP", "S17 3AL", 2, 1, "Poultry & Gamebirds", birdSpecies, pricePostcodeDefinitions, birdSpeciesSet)).toBe(99);
        });

        test('should calculate correct price for 10 Poultry & Gamebirds', () => {
            expect(calculateOrderPrice("DE56 1TP", "S17 3AL", 10, 1, "Poultry & Gamebirds", birdSpecies, pricePostcodeDefinitions, birdSpeciesSet)).toBe(99);
        });

        test('should calculate correct price for 1 Small Mammal', () => {
            expect(calculateOrderPrice("DE56 1TP", "S17 3AL", 1, 1, "Small Mammals", birdSpecies, pricePostcodeDefinitions, birdSpeciesSet)).toBe(99);
        });

        test('should calculate correct price for 2 Small Mammals', () => {
            expect(calculateOrderPrice("DE56 1TP", "S17 3AL", 2, 1, "Small Mammals", birdSpecies, pricePostcodeDefinitions, birdSpeciesSet)).toBe(99);
        });

        test('should calculate correct price for 10 Small Mammals', () => {
            expect(calculateOrderPrice("DE56 1TP", "S17 3AL", 10, 1, "Small Mammals", birdSpecies, pricePostcodeDefinitions, birdSpeciesSet)).toBe(99);
        });

        test('should calculate correct price for 1 Reptile', () => {
            expect(calculateOrderPrice("DE56 1TP", "S17 3AL", 1, 1, "Reptiles", birdSpecies, pricePostcodeDefinitions, birdSpeciesSet)).toBe(65);
        });

        test('should calculate correct price for 2 Reptiles', () => {
            expect(calculateOrderPrice("DE56 1TP", "S17 3AL", 2, 1, "Reptiles", birdSpecies, pricePostcodeDefinitions, birdSpeciesSet)).toBe(65);
        });

        test('should calculate correct price for 10 Reptiles', () => {
            expect(calculateOrderPrice("DE56 1TP", "S17 3AL", 10, 1, "Reptiles", birdSpecies, pricePostcodeDefinitions, birdSpeciesSet)).toBe(65);
        });
        
        test('should calculate correct price for 1 Bird of Prey', () => {
            expect(calculateOrderPrice("DE56 1TP", "S17 3AL", 1, 1, "Birds Of Prey", birdSpecies, pricePostcodeDefinitions, birdSpeciesSet)).toBe(99);
        });

        test('should calculate correct price for 2 Birds of Prey', () => {
            expect(calculateOrderPrice("DE56 1TP", "S17 3AL", 2, 1, "Birds Of Prey", birdSpecies, pricePostcodeDefinitions, birdSpeciesSet)).toBe(99);
        });

        test('should calculate correct price for 10 Birds of Prey', () => {
            expect(calculateOrderPrice("DE56 1TP", "S17 3AL", 10, 1, "Birds Of Prey", birdSpecies, pricePostcodeDefinitions, birdSpeciesSet)).toBe(99);
        });
        
        test('should calculate correct price for 1 Small Rodent', () => {
            expect(calculateOrderPrice("DE56 1TP", "S17 3AL", 1, 1, "Small Rodents", birdSpecies, pricePostcodeDefinitions, birdSpeciesSet)).toBe(65);
        });

        test('should calculate correct price for 2 Small Rodents', () => {
            expect(calculateOrderPrice("DE56 1TP", "S17 3AL", 2, 1, "Small Rodents", birdSpecies, pricePostcodeDefinitions, birdSpeciesSet)).toBe(65);
        });

        test('should calculate correct price for 10 Small Rodents', () => {
            expect(calculateOrderPrice("DE56 1TP", "S17 3AL", 10, 1, "Small Rodents", birdSpecies, pricePostcodeDefinitions, birdSpeciesSet)).toBe(65);
        });
    });



    describe('Other Animal Types - Calculating by Boxes', () => {
        // Aviary & Cage Birds
        test('should calculate correct price for 1 Aviary & Cage Bird in 1 box', () => {
            expect(calculateOrderPrice("DE56 1TP", "S17 3AL", 1, 1, "Aviary & Cage Birds", birdSpecies, pricePostcodeDefinitions, birdSpeciesSet)).toBe(60);
        });

        test('should calculate correct price for 1 Aviary & Cage Bird in 2 boxes', () => {
            expect(calculateOrderPrice("DE56 1TP", "S17 3AL", 1, 2, "Aviary & Cage Birds", birdSpecies, pricePostcodeDefinitions, birdSpeciesSet)).toBe(70);
        });

        test('should calculate correct price for 1 Aviary & Cage Bird in 10 boxes', () => {
            expect(calculateOrderPrice("DE56 1TP", "S17 3AL", 1, 10, "Aviary & Cage Birds", birdSpecies, pricePostcodeDefinitions, birdSpeciesSet)).toBe(150);
        });

        // Poultry & Gamebirds
        test('should calculate correct price for 1 Poultry & Gamebird in 1 box', () => {
            expect(calculateOrderPrice("DE56 1TP", "S17 3AL", 1, 1, "Poultry & Gamebirds", birdSpecies, pricePostcodeDefinitions, birdSpeciesSet)).toBe(99);
        });

        test('should calculate correct price for 1 Poultry & Gamebird in 2 boxes', () => {
            expect(calculateOrderPrice("DE56 1TP", "S17 3AL", 1, 2, "Poultry & Gamebirds", birdSpecies, pricePostcodeDefinitions, birdSpeciesSet)).toBe(109);
        });

        test('should calculate correct price for 1 Poultry & Gamebird in 10 boxes', () => {
            expect(calculateOrderPrice("DE56 1TP", "S17 3AL", 1, 10, "Poultry & Gamebirds", birdSpecies, pricePostcodeDefinitions, birdSpeciesSet)).toBe(189);
        });

        // Small Mammals
        test('should calculate correct price for 1 Small Mammal in 1 box', () => {
            expect(calculateOrderPrice("DE56 1TP", "S17 3AL", 1, 1, "Small Mammals", birdSpecies, pricePostcodeDefinitions, birdSpeciesSet)).toBe(99);
        });

        test('should calculate correct price for 1 Small Mammal in 2 boxes', () => {
            expect(calculateOrderPrice("DE56 1TP", "S17 3AL", 1, 2, "Small Mammals", birdSpecies, pricePostcodeDefinitions, birdSpeciesSet)).toBe(124);
        });

        test('should calculate correct price for 1 Small Mammal in 10 boxes', () => {
            expect(calculateOrderPrice("DE56 1TP", "S17 3AL", 1, 10, "Small Mammals", birdSpecies, pricePostcodeDefinitions, birdSpeciesSet)).toBe(324);
        });

        // Reptiles
        test('should calculate correct price for 1 Reptile in 1 box', () => {
            expect(calculateOrderPrice("DE56 1TP", "S17 3AL", 1, 1, "Reptiles", birdSpecies, pricePostcodeDefinitions, birdSpeciesSet)).toBe(65);
        });

        test('should calculate correct price for 1 Reptile in 2 boxes', () => {
            expect(calculateOrderPrice("DE56 1TP", "S17 3AL", 1, 2, "Reptiles", birdSpecies, pricePostcodeDefinitions, birdSpeciesSet)).toBe(75);
        });

        test('should calculate correct price for 1 Reptile in 10 boxes', () => {
            expect(calculateOrderPrice("DE56 1TP", "S17 3AL", 1, 10, "Reptiles", birdSpecies, pricePostcodeDefinitions, birdSpeciesSet)).toBe(155);
        });

        // Birds of Prey
        test('should calculate correct price for 1 Bird of Prey in 1 box', () => {
            expect(calculateOrderPrice("DE56 1TP", "S17 3AL", 1, 1, "Birds Of Prey", birdSpecies, pricePostcodeDefinitions, birdSpeciesSet)).toBe(99);
        });

        test('should calculate correct price for 1 Bird of Prey in 2 boxes', () => {
            expect(calculateOrderPrice("DE56 1TP", "S17 3AL", 1, 2, "Birds Of Prey", birdSpecies, pricePostcodeDefinitions, birdSpeciesSet)).toBe(124);
        });

        test('should calculate correct price for 1 Bird of Prey in 10 boxes', () => {
            expect(calculateOrderPrice("DE56 1TP", "S17 3AL", 1, 10, "Birds Of Prey", birdSpecies, pricePostcodeDefinitions, birdSpeciesSet)).toBe(324);
        });

        // Small Rodents
        test('should calculate correct price for 1 Small Rodent in 1 box', () => {
            expect(calculateOrderPrice("DE56 1TP", "S17 3AL", 1, 1, "Small Rodents", birdSpecies, pricePostcodeDefinitions, birdSpeciesSet)).toBe(65);
        });

        test('should calculate correct price for 1 Small Rodent in 2 boxes', () => {
            expect(calculateOrderPrice("DE56 1TP", "S17 3AL", 1, 2, "Small Rodents", birdSpecies, pricePostcodeDefinitions, birdSpeciesSet)).toBe(75);
        });

        test('should calculate correct price for 1 Small Rodent in 10 boxes', () => {
            expect(calculateOrderPrice("DE56 1TP", "S17 3AL", 1, 10, "Small Rodents", birdSpecies, pricePostcodeDefinitions, birdSpeciesSet)).toBe(155);
        });
    });



    describe('Postcode Formatting', () => {

        test('should handle a postcode with length 7', () => {
            expect(calculateOrderPrice("DE56 1TP", "S17 3AL", 1, 1, "Pigeons - Young Birds", birdSpecies, pricePostcodeDefinitions, birdSpeciesSet)).toBe(55);
        });

        test('should handle a postcode with length 6', () => {
            expect(calculateOrderPrice("DE5 3GY", "S17 3AL", 1, 1, "Pigeons - Young Birds", birdSpecies, pricePostcodeDefinitions, birdSpeciesSet)).toBe(55);
        });

        test('should handle a postcode with length 5', () => {
            expect(calculateOrderPrice("L1 0AA", "S17 3AL", 1, 1, "Pigeons - Young Birds", birdSpecies, pricePostcodeDefinitions, birdSpeciesSet)).toBe(55);
        });
        
        test('should handle an outward postcode with length 4', () => {
            expect(calculateOrderPrice("DE56", "S17 3AL", 1, 1, "Pigeons - Young Birds", birdSpecies, pricePostcodeDefinitions, birdSpeciesSet)).toBe(55);
        });

        test('should handle an outward postcode with length 3', () => {
            expect(calculateOrderPrice("IV1", "S17 3AL", 1, 1, "Pigeons - Young Birds", birdSpecies, pricePostcodeDefinitions, birdSpeciesSet)).toBe(85); // 55 + 30
        });

        test('should handle an outward postcode with length 2', () => {
            expect(calculateOrderPrice("L1", "S17 3AL", 1, 1, "Pigeons - Young Birds", birdSpecies, pricePostcodeDefinitions, birdSpeciesSet)).toBe(55);
        });
    });

    describe('Invalid postcodes', () => {

        test('should return false for an invalid collection postcode', () => {
            expect(calculateOrderPrice("XYZ 123", "S17 3AL", 1, 1, "Pigeons - Young Birds", birdSpecies, pricePostcodeDefinitions, birdSpeciesSet)).toBe(false);
        });

        test('should return false for an invalid delivery postcode', () => {
            expect(calculateOrderPrice("DE56 1TP", "XYZ 123", 1, 1, "Pigeons - Young Birds", birdSpecies, pricePostcodeDefinitions, birdSpeciesSet)).toBe(false);
        });

        test('should return false for an empty collection postcode', () => {
            expect(calculateOrderPrice("", "S17 3AL", 1, 1, "Pigeons - Young Birds", birdSpecies, pricePostcodeDefinitions, birdSpeciesSet)).toBe(false);
        });

        test('should return false for an empty delivery postcode', () => {
            expect(calculateOrderPrice("DE56 1TP", "", 1, 1, "Pigeons - Young Birds", birdSpecies, pricePostcodeDefinitions, birdSpeciesSet)).toBe(false);
        });
        
        test('should return false for a non-string collection postcode', () => {
            expect(calculateOrderPrice(12345, "S17 3AL", 1, 1, "Pigeons - Young Birds", birdSpecies, pricePostcodeDefinitions, birdSpeciesSet)).toBe(false);
        });

        test('should return false for a non-string delivery postcode', () => {
            expect(calculateOrderPrice("DE56 1TP", 12345, 1, 1, "Pigeons - Young Birds", birdSpecies, pricePostcodeDefinitions, birdSpeciesSet)).toBe(false);
        });

    });

});