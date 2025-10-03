import { DateTime } from "luxon";
import { getDeliveryWeek } from "../../helpers/OrderModel.js";
import { integrationTestDB, storeOrderUrl, storeCollectionNameOrders } from "../../helpers/Firebase.js"; 

const db = integrationTestDB;
const url = storeOrderUrl;


describe('validateOrder on emulator', () => {

    let validOrder = {

        ID: 1234,
        animalType: "Pigeons - Young Birds",
        email: "jamesbrass@ymail.com",
        quantity: 2,
        boxes: 2,
        username: "customer",
        deliveryWeek: 0,

        collectionName: "James Brass",
        collectionAddress1: "10 Kenilworth road",  
        collectionAddress2: "",
        collectionAddress3: "",
        collectionPostcode: "DE5 3GY",
        collectionPhoneNumber: "07123456789",

        deliveryName: "Katherine Brass",
        deliveryAddress1: "8 Marston Close",
        deliveryAddress2: "",
        deliveryAddress3: "",
        deliveryPostcode: "",
        deliveryPhoneNumber: "07123456789",

        payment: "Collection",
        price: 0,
        message: "",
        code: "",
        addedBy: "",
        printed: "Not Printed",
        timestamp: "2025-08-27 20:21:38",

    }


    beforeEach(() => {
        validOrder = {

            ID: 1234,
            animalType: "Pigeons - Young Birds",
            email: "jamesbrass@ymail.com",
            quantity: 2,
            boxes: 2,
            username: "customer",
            deliveryWeek: 10,

            collectionName: "James Brass",
            collectionAddress1: "10 Kenilworth road",  
            collectionAddress2: "",
            collectionAddress3: "",
            collectionPostcode: "DE5 3GY",
            collectionPhoneNumber: "07123456789",

            deliveryName: "Katherine Brass",
            deliveryAddress1: "8 Marston Close",
            deliveryAddress2: "",
            deliveryAddress3: "",
            deliveryPostcode: "",
            deliveryPhoneNumber: "07123456789",

            payment: "Collection",
            price: 60,
            message: "",
            code: "",
            addedBy: "",
            printed: "Not Printed",
            timestamp: "2025-08-27 20:21:38",

        };
    });

    test('Invalid Json', async () => {

        const res = await fetch(url, {
            method: 'POST',
            body: 'this is not valid json',
            headers: { 'Content-Type': 'application/json' }
        });

        expect(res.status).toBe(400);
        
    });

    test('Invalid Json with missing header', async () => {

        const res = await fetch(url, {
            method: 'POST',
            body: 'this is not valid json',
        });

        expect(res.status).toBe(400);
     
    });

    test('Invalid Collection Phone Number', async () => {

        const order = validOrder;
        order['collectionPhoneNumber'] = "0712345678";

        const res = await fetch(url, {
            method: 'POST',
            body: JSON.stringify(order),
            headers: { 'Content-Type': 'application/json' }
        });

        const json = await res.json();

        expect(res.status).toBe(400);
        expect(json.error).toBe(true);

    });

    test('Invalid Delivery Phone Number (non-numeric)', async () => {
        const order = { ...validOrder, deliveryPhoneNumber: 'abc12345678' };

        const res = await fetch(url, {
            method: 'POST',
            body: JSON.stringify(order),
            headers: { 'Content-Type': 'application/json' },
        });

        const json = await res.json();
        expect(res.status).toBe(400);
        expect(json.error).toBe(true);
        expect(json.message).toBe("Delivery Telephone is not a valid phone number. Please enter an 11 digit phone number");
    });

    test('Invalid Delivery Phone Number (incorrect length)', async () => {
        const order = { ...validOrder, deliveryPhoneNumber: '071234567' };

        const res = await fetch(url, {
            method: 'POST',
            body: JSON.stringify(order),
            headers: { 'Content-Type': 'application/json' },
        });

        const json = await res.json();
        expect(res.status).toBe(400);
        expect(json.error).toBe(true);
        expect(json.message).toBe("Delivery Telephone is not a valid phone number. Please enter an 11 digit phone number");
    });

    test('Invalid Collection Phone Number (non-numeric)', async () => {
        const order = { ...validOrder, collectionPhoneNumber: 'abc12345678' };

        const res = await fetch(url, {
            method: 'POST',
            body: JSON.stringify(order),
            headers: { 'Content-Type': 'application/json' }
        });

        const json = await res.json();
        expect(res.status).toBe(400);
        expect(json.error).toBe(true);
        expect(json.message).toBe("Collection Telephone is not a valid phone number. Please enter an 11 digit phone number");
    });
    
    test('Invalid Collection Phone Number (incorrect length)', async () => {
        const order = { ...validOrder, collectionPhoneNumber: '0712345678' };

        const res = await fetch(url, {
            method: 'POST',
            body: JSON.stringify(order),
            headers: { 'Content-Type': 'application/json' }
        });

        const json = await res.json();
        expect(res.status).toBe(400);
        expect(json.error).toBe(true);
        expect(json.message).toBe("Collection Telephone is not a valid phone number. Please enter an 11 digit phone number");
    });

    test('Invalid Email', async () => {
        const order = { ...validOrder, email: 'invalid-email' };

        const res = await fetch(url, {
            method: 'POST',
            body: JSON.stringify(order),
            headers: { 'Content-Type': 'application/json' }
        });

        const json = await res.json();
        expect(res.status).toBe(400);
        expect(json.error).toBe(true);
        expect(json.message).toBe("Email is not valid");
    });

    test('Invalid Payment Option', async () => {
        const order = { ...validOrder, payment: 'bitcoin' };

        const res = await fetch(url, {
            method: 'POST',
            body: JSON.stringify(order),
            headers: { 'Content-Type': 'application/json' }
        });

        const json = await res.json();
        expect(res.status).toBe(400);
        expect(json.error).toBe(true);
        expect(json.message).toBe("Please select a valid payment option");
    });

    test('Invalid Animal Type', async () => {
        const order = { ...validOrder, animalType: 'lion' };

        const res = await fetch(url, {
            method: 'POST',
            body: JSON.stringify(order),
            headers: { 'Content-Type': 'application/json' }
        });

        const json = await res.json();
        expect(res.status).toBe(400);
        expect(json.error).toBe(true);
        expect(json.message).toBe("Please select a valid animal type");
    });

    test('Invalid Quantity (non-numeric)', async () => {
        const order = { ...validOrder, quantity: 'five' };

        const res = await fetch(url, {
            method: 'POST',
            body: JSON.stringify(order),
            headers: { 'Content-Type': 'application/json' }
        });

        const json = await res.json();
        expect(res.status).toBe(400);
        expect(json.error).toBe(true);
        expect(json.message).toBe("Quantity is not a valid number. Please enter a number greater than 0");
    });

    test('Invalid Quantity (zero)', async () => {
        const order = { ...validOrder, quantity: '0' };

        const res = await fetch(url, {
            method: 'POST',
            body: JSON.stringify(order),
            headers: { 'Content-Type': 'application/json' }
        });

        const json = await res.json();
        expect(res.status).toBe(400);
        expect(json.error).toBe(true);
        expect(json.message).toBe("Quantity is not a valid number. Please enter a number greater than 0");
    });

    test('Invalid Boxes (non-numeric)', async () => {
        const order = { ...validOrder, boxes: 'two' };

        const res = await fetch(url, {
            method: 'POST',
            body: JSON.stringify(order),
            headers: { 'Content-Type': 'application/json' }
        });

        const json = await res.json();
        expect(res.status).toBe(400);
        expect(json.error).toBe(true);
        expect(json.message).toBe("Boxes is not a valid number. Please enter a number greater than 0");
    });

    test('Invalid Boxes (zero)', async () => {
        const order = { ...validOrder, boxes: '0' };

        const res = await fetch(url, {
            method: 'POST',
            body: JSON.stringify(order),
            headers: { 'Content-Type': 'application/json' }
        });

        const json = await res.json();
        expect(res.status).toBe(400);
        expect(json.error).toBe(true);
        expect(json.message).toBe("Boxes is not a valid number. Please enter a number greater than 0");
    });

    test('Null Delivery Phone Number', async () => {
        const order = { ...validOrder, deliveryPhoneNumber: null };
        const res = await fetch(url, {
            method: 'POST',
            body: JSON.stringify(order),
            headers: { 'Content-Type': 'application/json' },
        });

        const json = await res.json();
        expect(res.status).toBe(400);
        expect(json.error).toBe(true);
        expect(json.message).toBe("Validation Error - make sure all required fields are in the json and non values are null");
    });

    test('Null Collection Phone Number', async () => {
        const order = { ...validOrder, collectionPhoneNumber: null };
        const res = await fetch(url, {
            method: 'POST',
            body: JSON.stringify(order),
            headers: { 'Content-Type': 'application/json' },
        });

        const json = await res.json();
        expect(res.status).toBe(400);
        expect(json.error).toBe(true);
        expect(json.message).toBe("Validation Error - make sure all required fields are in the json and non values are null");
    });

    test('Empty String for Delivery Phone Number', async () => {
        const order = { ...validOrder, deliveryPhoneNumber: "" };
        const res = await fetch(url, {
            method: 'POST',
            body: JSON.stringify(order),
            headers: { 'Content-Type': 'application/json' },
        });

        const json = await res.json();
        expect(res.status).toBe(400);
        expect(json.error).toBe(true);
        expect(json.message).toBe("Delivery Telephone is not a valid phone number. Please enter an 11 digit phone number");
    });
    
    test('Empty String for Collection Phone Number', async () => {
        const order = { ...validOrder, collectionPhoneNumber: "" };
        const res = await fetch(url, {
            method: 'POST',
            body: JSON.stringify(order),
            headers: { 'Content-Type': 'application/json' },
        });

        const json = await res.json();
        expect(res.status).toBe(400);
        expect(json.error).toBe(true);
        expect(json.message).toBe("Collection Telephone is not a valid phone number. Please enter an 11 digit phone number");
    });

    test('Empty String for Email', async () => {
        const order = { ...validOrder, email: "" };
        const res = await fetch(url, {
            method: 'POST',
            body: JSON.stringify(order),
            headers: { 'Content-Type': 'application/json' },
        });

        const json = await res.json();
        expect(res.status).toBe(400);
        expect(json.error).toBe(true);
        expect(json.message).toBe("Email is not valid");
    });

    test('Empty String for Payment Option', async () => {
        const order = { ...validOrder, payment: "" };
        const res = await fetch(url, {
            method: 'POST',
            body: JSON.stringify(order),
            headers: { 'Content-Type': 'application/json' },
        });

        const json = await res.json();
        expect(res.status).toBe(400);
        expect(json.error).toBe(true);
        expect(json.message).toBe("Please select a valid payment option");
    });

    test('Empty String for Animal Type', async () => {
        const order = { ...validOrder, animalType: "" };
        const res = await fetch(url, {
            method: 'POST',
            body: JSON.stringify(order),
            headers: { 'Content-Type': 'application/json' },
        });

        const json = await res.json();
        expect(res.status).toBe(400);
        expect(json.error).toBe(true);
        expect(json.message).toBe("Please select a valid animal type");
    });

    test('Empty String for Quantity', async () => {
        const order = { ...validOrder, quantity: "" };
        const res = await fetch(url, {
            method: 'POST',
            body: JSON.stringify(order),
            headers: { 'Content-Type': 'application/json' },
        });

        const json = await res.json();
        expect(res.status).toBe(400);
        expect(json.error).toBe(true);
        expect(json.message).toBe("Quantity is not a valid number. Please enter a number greater than 0");
    });

    test('Empty String for Boxes', async () => {
        const order = { ...validOrder, boxes: "" };
        const res = await fetch(url, {
            method: 'POST',
            body: JSON.stringify(order),
            headers: { 'Content-Type': 'application/json' },
        });

        const json = await res.json();
        expect(res.status).toBe(400);
        expect(json.error).toBe(true);
        expect(json.message).toBe("Boxes is not a valid number. Please enter a number greater than 0");
    });

    test('Completely empty body', async () => {
        const res = await fetch(url, {
            method: 'POST',
            body: JSON.stringify({}),
            headers: { 'Content-Type': 'application/json' },
        });

        const json = await res.json();
        expect(res.status).toBe(400);
        expect(json.error).toBe(true);
        expect(json.message).toBe("Validation Error - make sure all required fields are in the json and non values are null");
    });

});


describe('Storing orders', () => {

    
    let deliveryWeek;
    let time;


    let validOrder = {

        ID: 0,
        animalType: "Pigeons - Young Birds",
        email: "jamesbrass@ymail.com",
        quantity: 2,
        boxes: 2,
        username: "customer",
        deliveryWeek: deliveryWeek,

        collectionName: "James Brass",
        collectionAddress1: "10 Kenilworth road",  
        collectionAddress2: "",
        collectionAddress3: "",
        collectionPostcode: "DE5 3GY",
        collectionPhoneNumber: "07123456789",

        deliveryName: "Katherine Brass",
        deliveryAddress1: "8 Marston Close",
        deliveryAddress2: "",
        deliveryAddress3: "",
        deliveryPostcode: "",
        deliveryPhoneNumber: "07123456789",

        payment: "Collection",
        price: 60,
        message: "",
        code: "",
        addedBy: "",
        printed: "Not Printed",
        timestamp: time,

    }

    beforeAll(() => {

        const londonTime = DateTime.now().setZone('Europe/London');
        deliveryWeek = getDeliveryWeek(londonTime);
        time = londonTime.toFormat("yyyy-MM-dd HH:mm:ss");

    });

    beforeEach(() => {

        validOrder = {
            
            ID: 0,
            animalType: "Pigeons - Young Birds",
            email: "jamesbrass@ymail.com",
            quantity: 13,
            boxes: 2,
            username: "customer",
            deliveryWeek: deliveryWeek,

            collectionName: "James Brass",
            collectionAddress1: "10 Kenilworth road",  
            collectionAddress2: "",
            collectionAddress3: "",
            collectionPostcode: "DE5 3GY",
            collectionPhoneNumber: "07123456789",

            deliveryName: "Katherine Brass",
            deliveryAddress1: "8 Marston Close",
            deliveryAddress2: "",
            deliveryAddress3: "",
            deliveryPostcode: "",
            deliveryPhoneNumber: "07123456789",

            payment: "Collection",
            price: 0,
            message: "",
            code: "",
            addedBy: "",
            printed: "Not Printed",
            timestamp: time,

        };

    });

    test.only('Valid order', async () => {

        const res = await fetch(url, {
            method: 'POST',
            body: JSON.stringify({profileEmail: "jamesbrass@ymail.com", orderDetails: [validOrder]}),
            headers: { 'Content-Type': 'application/json' },
        });

        const json = await res.json();

        const docID = json.documentIDs;

        console.log(docID)
        console.log(json.documentIDs);
        console.log(json.message);

        expect(res.status).toBe(200);
        expect(json.error).toBe(false);

        const docRef = db.collection(storeCollectionNameOrders).doc(docID);

        const docSnap = await docRef.get();

        expect(docSnap.exists).toBe(true);
        
        const storedData = docSnap.data();

        const londonTime = DateTime.now().setZone('Europe/London');
        const deliveryWeek = getDeliveryWeek(londonTime);

        expect(storedData.deliveryWeek).toBe(deliveryWeek);
        expect(storedData.price).toBe(57);
        expect(storedData.ID).toBeGreaterThan(0);

    }, 10000);

    test('Multiple Valid orders', async () => {

        const res = await fetch(url, {
            method: 'POST',
            body: JSON.stringify({profileEmail: "jamesbrass@ymail.com", orderDetails: [validOrder, validOrder, validOrder]}),
            headers: { 'Content-Type': 'application/json' },
        });

        const json = await res.json();

        console.log(json);

        expect(res.status).toBe(200);
        expect(json.error).toBe(false);

        // const docRef = db.collection(storeCollectionNameOrders).doc(docID);

        // const docSnap = await docRef.get();

        // expect(docSnap.exists).toBe(true);
        
        // const storedData = docSnap.data();

        // const londonTime = DateTime.now().setZone('Europe/London');
        // const deliveryWeek = getDeliveryWeek(londonTime);

        // expect(storedData.deliveryWeek).toBe(deliveryWeek);
        // expect(storedData.price).toBe(57);
        // expect(storedData.ID).toBeGreaterThan(0);

    }, 15000);


});