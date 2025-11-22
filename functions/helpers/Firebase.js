import { getFirestore } from "firebase-admin/firestore";
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
// import serviceAccount from "../../highflyersukcouriers-a9c17-firebase-adminsdk-fbsvc-9bf9b914eb.json" with { type: "json" };

export const environment = "LIVE";
export const ordersCollectionName = "Orders";
let app;
export let cloudFunctionDB;
export let integrationTestDB; 
export let storeOrderUrl;
export let editOrderUrl;
export let createUserUrl;
export let deleteUserUrl;
export let auth;

delete process.env.FIRESTORE_EMULATOR_HOST;

if (!getApps().length) {

    
    if (environment == "TESTING" || environment == "INTEGRATION_TESTING") {

        app = initializeApp({
            // credential: cert(serviceAccount),
            projectId: "highflyersukcouriers-a9c17",
        });


    }else if(environment == "LIVE"){

        app = initializeApp({
            projectId: "highflyersukcouriers-a9c17",
        });

    }

    auth = getAuth(app);

}


if (environment == "TESTING") {

    delete process.env.FIRESTORE_EMULATOR_HOST;
    integrationTestDB = getFirestore(undefined, "development");
    cloudFunctionDB = integrationTestDB;
    storeOrderUrl = 'http://127.0.0.1:5001/highflyersukcouriers-a9c17/us-central1/api/storeorder';
    editOrderUrl = 'http://127.0.0.1:5001/highflyersukcouriers-a9c17/us-central1/api/editorder';
    createUserUrl = 'http://127.0.0.1:5001/highflyersukcouriers-a9c17/us-central1/api/createuser';
    deleteUserUrl = 'http://127.0.0.1:5001/highflyersukcouriers-a9c17/us-central1/api/deleteuser';

    

} else if(environment == "LIVE"){

    //urls are for the integration tests
    cloudFunctionDB = getFirestore(undefined, "(default)");
    storeOrderUrl = "https://api-qjydin7gka-uc.a.run.app/storeorder";
    editOrderUrl = "https://api-qjydin7gka-uc.a.run.app/editorder";
    // deleteOrderUrl = "https://api-qjydin7gka-uc.a.run.app/deleteorder"
    createUserUrl = "https://api-qjydin7gka-uc.a.run.app/createuser";
    deleteUserUrl = "https://api-qjydin7gka-uc.a.run.app/deleteuser";


}


export function getDatabase(environment){

    if(environment == "DEV"){

        return getFirestore(undefined, "development");

    }else if(environment == "PROD"){

        return getFirestore(undefined, "(default)");

    }else{
        return false;
    }

}



export async function getDocuments(q){

    try{

        return await getDocs(q); 

    }catch(e){

        console.log(e);
        return false
    }
}

export async function getDocument(q){

    try{

        return await getDoc(q); 

    }catch(e){

        console.log(e);
        return false
    }
}