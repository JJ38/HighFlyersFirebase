import dotenv from 'dotenv';
dotenv.config();


import { integrationTestDB, createUserUrl, getDatabase} from "../../helpers/Firebase.js"; 
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { initializeApp } from 'firebase/app'; 


const firebaseConfig = {
    apiKey: "AIzaSyBHkjHITuk2opFgiG2wG36WJE6CDmb4tK4",
    authDomain: "highflyersukcouriers-a9c17.firebaseapp.com",
    projectId: "highflyersukcouriers-a9c17",
    storageBucket: "highflyersukcouriers-a9c17.firebasestorage.app",
    messagingSenderId: "970355130070",
    appId: "1:970355130070:web:b2ff0ee62b6b9ac2339377",
    measurementId: "G-93M1E0Q9FJ",
}

const db = getDatabase("DEV");
const url = createUserUrl;

const clientApp = initializeApp(firebaseConfig); // separate from admin app
const auth = getAuth(clientApp);


async function getIdToken(email, password) {

  const cred = await signInWithEmailAndPassword(auth, email, password);
  return cred.user.getIdToken(true);

}


describe('Creating users', () => {

    beforeAll(async () => {

        adminIDToken = await getIdToken(process.env.ADMIN_EMAIL, process.env.ADMIN_PASSWORD);
        customerIDToken = await getIdToken(process.env.CUSTOMER_EMAIL, process.env.CUSTOMER_PASSWORD);

    });

    //will throw 500 is user already exists so delete manually before tests.
    test('Create User Successful', async () => {

        const res = await fetch(url, {
            method: 'POST',
            body: JSON.stringify({username: "integrationTestUser", role: "admin", password: "password"}),
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': "Bearer " + adminIDToken,  
            },
        });

        expect(res.status).toBe(200);
        
    });

    test('Create User No Authentication - Customer', async () => {

        const res = await fetch(url, {
            method: 'POST',
            body: JSON.stringify({username: "integrationTestUser", role: "admin", password: "password"}),
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': "Bearer " + customerIDToken,  
            },
        });

        expect(res.status).toBe(403);
        
    });

});