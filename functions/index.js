import { storeorder } from "./orders/StoreOrder.js";
import { onRequest } from "firebase-functions/v2/https";
import { validateFirebaseIdToken } from "./helpers/Middleware.js";

import express from "express";


const app = express();

app.use(express.json()); 
app.use(validateFirebaseIdToken);

app.post("/storeorder", storeorder);

export const api = onRequest(app);