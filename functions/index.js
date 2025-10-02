import { storeorder } from "./orders/StoreOrder.js";
import { onRequest } from "firebase-functions/v2/https";
import { validateFirebaseIdToken } from "./helpers/Middleware.js";

import express from "express";
import { middlewareStatus } from "./helpers/Firebase.js";

const app = express();

if(!middlewareStatus == "TESTING"){

    app.use(express.json()); 
    app.use(validateFirebaseIdToken);

}

app.post("/storeorder", storeorder);

export const api = onRequest(app);