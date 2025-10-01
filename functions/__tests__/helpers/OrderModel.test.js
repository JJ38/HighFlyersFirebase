import { db } from "../../helpers/Firebase.js";

import { DateTime } from "luxon";
import { getDeliveryWeek, fetchBirdSpecies, fetchPricePostcodeDefinitions } from "../../helpers/OrderModel";

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