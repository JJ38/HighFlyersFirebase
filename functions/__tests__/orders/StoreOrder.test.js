process.env.FIRESTORE_EMULATOR_HOST = "127.0.0.1:8080";

const admin = require("firebase-admin");
const app = admin.initializeApp({projectId: "highflyersukcouriers-a9c17"});
const db = admin.firestore(app);

const emulatorUrl = 'http://127.0.0.1:5001/highflyersukcouriers-a9c17/us-central1/storeorder';

describe('validateOrder on emulator', () => {

    let validOrder = {

        ID: 123456,
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

            ID: 123456,
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


    // test('should return 200 and create a document for a valid order', async () => {

    //     const req = {
    //         method: 'POST',
    //         body: JSON.stringify(validOrder)
    //     };

    //     // Call your Cloud Function
    //     await validateorder(req, res);

    //     const responseData = res.json.mock.calls[0][0];

    //     console.log(responseData.message);
    //     console.log(responseData.json);


    //     // Assert the HTTP response
    //     expect(res.status).toHaveBeenCalledWith(200);
    //     expect(res.json).toHaveBeenCalledWith(
    //         expect.objectContaining({ error: false })
    //     );

    //     // Verify the document was written to the Firestore emulator
    //     // const db = admin.firestore();
    //     // const docs = await db.collection('test').get();
    //     // expect(docs.size).toBe(1); // One document should have been created

    // });

    test('Invalid Json', async () => {

        const res = await fetch(emulatorUrl, {
            method: 'POST',
            body: 'this is not valid json',
            headers: { 'Content-Type': 'application/json' }
        });

        expect(res.status).toBe(400);
        
    });

    test('Invalid Json with missing header', async () => {

        const res = await fetch(emulatorUrl, {
            method: 'POST',
            body: 'this is not valid json',
        });

        expect(res.status).toBe(400);
     
    });

    test('Invalid Collection Phone Number', async () => {

        const order = validOrder;
        order['collectionPhoneNumber'] = "0712345678";

        const res = await fetch(emulatorUrl, {
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

        const res = await fetch(emulatorUrl, {
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

        const res = await fetch(emulatorUrl, {
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

        const res = await fetch(emulatorUrl, {
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

        const res = await fetch(emulatorUrl, {
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

        const res = await fetch(emulatorUrl, {
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

        const res = await fetch(emulatorUrl, {
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

        const res = await fetch(emulatorUrl, {
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

        const res = await fetch(emulatorUrl, {
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

        const res = await fetch(emulatorUrl, {
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

        const res = await fetch(emulatorUrl, {
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

        const res = await fetch(emulatorUrl, {
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
        const res = await fetch(emulatorUrl, {
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
        const res = await fetch(emulatorUrl, {
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
        const res = await fetch(emulatorUrl, {
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
        const res = await fetch(emulatorUrl, {
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
        const res = await fetch(emulatorUrl, {
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
        const res = await fetch(emulatorUrl, {
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
        const res = await fetch(emulatorUrl, {
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
        const res = await fetch(emulatorUrl, {
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
        const res = await fetch(emulatorUrl, {
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
        const res = await fetch(emulatorUrl, {
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

    let validOrder = {

        ID: 123456,
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

    }

    beforeEach(() => {

        validOrder = {

            ID: 123456,
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

    test('Valid order', async () => {

        const res = await fetch(emulatorUrl, {
            method: 'POST',
            body: JSON.stringify(validOrder),
            headers: { 'Content-Type': 'application/json' },
        });

        const json = await res.json();

        const docID = json.docID;

        expect(res.status).toBe(200);
        expect(json.error).toBe(false);

        const docRef = db.collection("test").doc(docID);

        const docSnap = await docRef.get();

        expect(docSnap.exists).toBe(true);
        expect(docSnap.data()).toEqual(validOrder);

    });

    test('Valid order', async () => {

        const res = await fetch(emulatorUrl, {
            method: 'POST',
            body: JSON.stringify(validOrder),
            headers: { 'Content-Type': 'application/json' },
        });

        const json = await res.json();

        const docID = json.docID;

        expect(res.status).toBe(200);
        expect(json.error).toBe(false);

        const docRef = db.collection("test").doc(docID);

        const docSnap = await docRef.get();

        expect(docSnap.exists).toBe(true);
        
        const storedData = docSnap.data();
        expect(storedData.price).toBe(validOrder.deliveryPhoneNumber);

    });

});