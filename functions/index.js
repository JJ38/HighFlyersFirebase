import { storeorder } from "./orders/StoreOrder.js";
import { onRequest } from "firebase-functions/v2/https";
import { validateFirebaseIdToken } from "./helpers/Middleware.js";

import express from "express";
import { middlewareStatus } from "./helpers/Firebase.js";

const app = express();

if(middlewareStatus !== "TESTING"){

    console.log("Running middleware");
    app.use(express.json()); 
    app.use(validateFirebaseIdToken);

}

console.log("middlewareStatus: " + middlewareStatus);

app.post("/storeorder", storeorder);

export const api = onRequest(app);