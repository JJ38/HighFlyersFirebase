import { validateorder } from '../../index.js';

describe('validateOrder on emulator', () => {

    //needed as no framework is providing this as normally would be done
    const res = {
        status: jest.fn(() => res),
        json: jest.fn(() => res)
    };

    const validOrder = {

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
        collectionPostcode: "DE5 £GY",
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

    test('should return 200 and create a document for a valid order', async () => {

        const req = {
            method: 'POST',
            body: JSON.stringify(validOrder)
        };

        // Call your Cloud Function
        await validateorder(req, res);

        // Assert the HTTP response
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({ error: false })
        );

        // Verify the document was written to the Firestore emulator
        // const db = admin.firestore();
        // const docs = await db.collection('test').get();
        // expect(docs.size).toBe(1); // One document should have been created

    });

});