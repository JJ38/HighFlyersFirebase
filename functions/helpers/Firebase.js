import { getFirestore } from "firebase-admin/firestore";
import { initializeApp, cert, getApps } from "firebase-admin/app";
import serviceAccount from "../../highflyersukcouriers-a9c17-firebase-adminsdk-fbsvc-9bf9b914eb.json" with { type: "json" };

export const environment = "TESTING";
export const middlewareStatus = "TESTING";


if (!getApps().length) {

    initializeApp({
        credential: cert(serviceAccount),
        projectId: "highflyersukcouriers-a9c17",
    });

}

delete process.env.FIRESTORE_EMULATOR_HOST;

export let integrationTestDB;
export let cloudFunctionDB;
export let db;

if (environment == "TESTING") {

    integrationTestDB = getFirestore(undefined, "development");
    cloudFunctionDB = integrationTestDB;

} else if(environment == "LIVE") {

    cloudFunctionDB = getFirestore(undefined, "development");

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