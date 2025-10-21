import dotenv from 'dotenv';
dotenv.config();


import { integrationTestDB, deleteUserUrl, getDatabase} from "../../helpers/Firebase.js"; 
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { initializeApp } from 'firebase/app'; 
import { collection, query, where, getDocs, getFirestore } from "firebase/firestore";



const firebaseConfig = {
    apiKey: "AIzaSyBHkjHITuk2opFgiG2wG36WJE6CDmb4tK4",
    authDomain: "highflyersukcouriers-a9c17.firebaseapp.com",
    projectId: "highflyersukcouriers-a9c17",
    storageBucket: "highflyersukcouriers-a9c17.firebasestorage.app",
    messagingSenderId: "970355130070",
    appId: "1:970355130070:web:b2ff0ee62b6b9ac2339377",
    measurementId: "G-93M1E0Q9FJ",
}


const url = deleteUserUrl;

const clientApp = initializeApp(firebaseConfig); // separate from admin app
const auth = getAuth(clientApp);

const db = getFirestore(clientApp);


async function getIdToken(email, password) {

  const cred = await signInWithEmailAndPassword(auth, email, password);
  return cred.user.getIdToken(true);

}


describe('Deleting users', () => {

    let integrationTestUserCustomerID;
    let integrationTestUserDriverID;

    beforeAll(async () => {

        adminIDToken = await getIdToken(process.env.ADMIN_EMAIL, process.env.ADMIN_PASSWORD);
        customerIDToken = await getIdToken(process.env.CUSTOMER_EMAIL, process.env.CUSTOMER_PASSWORD);

        const integrationTestUserCustomerSnapshot = await getDocs(query(collection(db, "Users"), where("username", "==", "integrationTestUserCustomer")));
        const integrationTestUserDriverSnapshot = await getDocs(query(collection(db, "Users"), where("username", "==", "integrationTestUserDriver")));
        
        if(!integrationTestUserCustomerSnapshot.empty){
            integrationTestUserCustomerID = integrationTestUserCustomerSnapshot.docs[0].id;
            console.log(integrationTestUserCustomerID);
        }

        if(!integrationTestUserDriverSnapshot.empty){
            integrationTestUserDriverID = integrationTestUserDriverSnapshot.docs[0].id;
            console.log(integrationTestUserDriverID);
        }


    });

    //will throw 500 if user doesnt exist so run tests after create user tests
    test('Delete Customer Successful', async () => {

        const res = await fetch(url, {
            method: 'POST',
            body: JSON.stringify({uid: integrationTestUserCustomerID, role: "customer"}),
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': "Bearer " + adminIDToken,  
            },
        });

        expect(res.status).toBe(200);
        
    });

    test('Delete Driver Successful', async () => {

        const res = await fetch(url, {
            method: 'POST',
            body: JSON.stringify({uid: integrationTestUserDriverID, role: "driver"}),
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': "Bearer " + adminIDToken,  
            },
        });

        expect(res.status).toBe(200);
        
    });

    test('Delete User No Authentication - Customer', async () => {

        const res = await fetch(url, {
            method: 'POST',
            body: JSON.stringify({uid: "esoijoi[jsefi", role: "admin"}),
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': "Bearer " + customerIDToken,  
            },
        });

        expect(res.status).toBe(403);
        
    });

});