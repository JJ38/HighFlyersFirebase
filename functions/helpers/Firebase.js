import { getFirestore } from "firebase-admin/firestore";
import { initializeApp, cert, getApps } from "firebase-admin/app";
import serviceAccount from "../../highflyersukcouriers-a9c17-firebase-adminsdk-fbsvc-9bf9b914eb.json" with { type: "json" };

export const environment = "TESTING";
export const middlewareStatus = "TESTING";
export const storeCollectionNameOrders = "Orders";


delete process.env.FIRESTORE_EMULATOR_HOST;

if (!getApps().length) {

    
    if (environment == "TESTING") {

        initializeApp({
            credential: cert(serviceAccount),
            projectId: "highflyersukcouriers-a9c17",
        });

    }else if(environment == "LIVE"){

        initializeApp({
            // credential: cert(serviceAccount),
            projectId: "highflyersukcouriers-a9c17",
        });

    }

    

}

// remove emulator var if set


export let cloudFunctionDB;
export let integrationTestDB; 
export let storeOrderUrl;


if (environment == "TESTING") {

    delete process.env.FIRESTORE_EMULATOR_HOST;
    integrationTestDB = getFirestore(undefined, "development");
    cloudFunctionDB = integrationTestDB;
    storeOrderUrl = 'http://127.0.0.1:5001/highflyersukcouriers-a9c17/us-central1/api/storeorder';

} else if(environment == "LIVE"){

    cloudFunctionDB = getFirestore(undefined, "(default)");
    storeOrderUrl = 'https://storeorder-qjydin7gka-uc.a.run.app';

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

export async function validateJWT(req, res, next) {

  const authorization = req.headers.authorization;
  if (!authorization || !authorization.startsWith("Bearer ")) {

    res.status(403).send("Unauthorized: No Bearer token");
    return ;

  }

  const idToken = authorization.split("Bearer ")[1];

  try {

    const decodedToken = await admin.auth().verifyIdToken(idToken);
    req.user = decodedToken; // Attach user info for later use
    next();

  } catch (err) {

    console.error("Error while verifying Firebase ID token:", err);
    res.status(403).send("Unauthorized: Invalid token");

  }
}