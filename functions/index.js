import { storeorder } from "./orders/StoreOrder.js";
import { editorder } from "./orders/EditOrder.js";
import { onRequest } from "firebase-functions/v2/https";
import { validateFirebaseIdToken } from "./helpers/Middleware.js";

import express from "express";


const app = express();

app.use(express.json()); 
app.use(validateFirebaseIdToken);

app.post("/storeorder", storeorder);
app.post("/editorder", editorder);


export const api = onRequest(app);