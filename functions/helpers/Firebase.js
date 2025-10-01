import { getFirestore } from "firebase-admin/firestore";
import { initializeApp, cert, getApps } from "firebase-admin/app";
import serviceAccount from "../../highflyersukcouriers-a9c17-firebase-adminsdk-fbsvc-9bf9b914eb.json" with { type: "json" };

const useEmulator = false;

if (!getApps().length) {

    initializeApp({
        credential: cert(serviceAccount),
        projectId: "highflyersukcouriers-a9c17",
    });

}

export let db;

if (useEmulator) {

    db = getFirestore(); // will respect FIRESTORE_EMULATOR_HOST
    console.log("Using Firestore emulator:", process.env.FIRESTORE_EMULATOR_HOST);  

} else {

    // remove emulator var if set
    delete process.env.FIRESTORE_EMULATOR_HOST;
    db = getFirestore(undefined, "development");
    console.log("Using Firestore project:", db.projectId, "database:", db._settings.databaseId);

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