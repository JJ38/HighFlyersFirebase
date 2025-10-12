import dotenv from 'dotenv';
dotenv.config();

import { DateTime } from "luxon";
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { initializeApp } from 'firebase/app'; 
import { integrationTestDB, editOrderUrl, ordersCollectionName } from "../../helpers/Firebase.js"; 
import { getDeliveryWeek } from '../../helpers/OrderModel.js';



const firebaseConfig = {
    apiKey: "AIzaSyBHkjHITuk2opFgiG2wG36WJE6CDmb4tK4",
    authDomain: "highflyersukcouriers-a9c17.firebaseapp.com",
    projectId: "highflyersukcouriers-a9c17",
    storageBucket: "highflyersukcouriers-a9c17.firebasestorage.app",
    messagingSenderId: "970355130070",
    appId: "1:970355130070:web:b2ff0ee62b6b9ac2339377",
    measurementId: "G-93M1E0Q9FJ",
}

const clientApp = initializeApp(firebaseConfig); // separate from admin app
const auth = getAuth(clientApp);

const db = integrationTestDB;
const url = editOrderUrl;

async function getIdToken(email, password) {

  const cred = await signInWithEmailAndPassword(auth, email, password);
  return cred.user.getIdToken(true);

}




describe('Edit order tests', () => {

    let validOrder;
    let adminIDToken;
    let deliveryWeek;
    const documentUUID = "03GFJbLEchNfrQwURFTX";

     beforeAll(async () => {

        //create document to edit here. Get uuid in return and use for tests
    
        adminIDToken = await getIdToken(process.env.ADMIN_EMAIL, process.env.ADMIN_PASSWORD);
        const londonTime = DateTime.now().setZone('Europe/London');
        deliveryWeek = getDeliveryWeek(londonTime);

    });
    

    beforeEach(() => {
        validOrder = {

            ID: 1234567,
            animalType: "Pigeons - Young Birds",
            email: "jamesbrass@ymail.com",
            quantity: 2,
            boxes: 2,
            username: "customer",
            deliveryWeek: 10,
            //creates a base 36 string ([1-9] + [a-z]) like so 0.7y21hjasd....  Then splice get rid of the 0. 
            collectionName: Math.random().toString(36).slice(2, 20),
            collectionAddress1: "10 Kenilworth road",  
            collectionAddress2: "",
            collectionAddress3: "",
            collectionPostcode: "DE5 3GY",
            collectionPhoneNumber: "07123456789",

            deliveryName: "Katherine Brass",
            deliveryAddress1: "8 Marston Close",
            deliveryAddress2: "",
            deliveryAddress3: "",
            deliveryPostcode: "DE56 1TP",
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

    test('Edit order valid uuid', async () => {

        const res = await fetch(url, {
            method: 'POST',
            body: JSON.stringify({
                "orderDetails": validOrder,
                "uuid": documentUUID
            }),
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': "Bearer " + adminIDToken,  
            }
        });

        const json = await res.json();

        console.log(json);
        
        expect(res.status).toBe(200);
        
    });


    test('Edit order invalid uuid', async () => {

        const res = await fetch(url, {
            method: 'POST',
            body: JSON.stringify({
                "orderDetails": validOrder,
                "uuid": ""
            }),
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': "Bearer " + adminIDToken,  
            }
        });

        const json = await res.json();

        console.log(json);
        
        expect(res.status).toBe(400);
        
    });


    test('Edit order invalid uuid', async () => {

        const res = await fetch(url, {
            method: 'POST',
            body: JSON.stringify({
                "orderDetails": validOrder,
                "uuid": "dawgdraarg"
            }),
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': "Bearer " + adminIDToken,  
            }
        });

        const json = await res.json();

        console.log(json);
        
        expect(res.status).toBe(400);
        
    });

      
    test.only('Edit order empty deliveryWeek', async () => {

        const res = await fetch(url, {
            method: 'POST',
            body: JSON.stringify({
                "orderDetails": { ...validOrder, deliveryWeek: ""},
                "uuid": documentUUID
            }),
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': "Bearer " + adminIDToken,  
            }
        });

        const json = await res.json();

        console.log(json);
        expect(res.status).toBe(200);

        const docRef = db.collection(ordersCollectionName).doc(documentUUID);
        
        const docSnap = await docRef.get();

        expect(docSnap.exists).toBe(true);
        
        const storedData = docSnap.data();

        expect(storedData.deliveryWeek).toBe(deliveryWeek);
        
    });

    test('Edit order empty price', async () => {

        const res = await fetch(url, {
            method: 'POST',
            body: JSON.stringify({
                "orderDetails": { ...validOrder, price: "", animalType: "Birds Of Prey", quantity: 5, boxes: 5},
                "uuid": documentUUID
            }),
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': "Bearer " + adminIDToken,  
            }
        });

        const json = await res.json();

        console.log(json);
        
        expect(res.status).toBe(200);

        const docRef = db.collection(ordersCollectionName).doc(documentUUID);
        
        const docSnap = await docRef.get();

        expect(docSnap.exists).toBe(true);
        
        const storedData = docSnap.data();

        expect(storedData.price).toBe(199);
        
    });


});