import { storeorder } from "./orders/StoreOrder.js";
import { editorder } from "./orders/EditOrder.js";
import { deleteorder } from "./orders/DeleteOrder.js";
import { changepassword } from "./users/ChangePassword.js";
import { createuser } from "./users/CreateUser.js";
import { onRequest } from "firebase-functions/v2/https";
import { validateFirebaseIdToken } from "./helpers/Middleware.js";

import express from "express";

const app = express();

app.use(express.json()); 
app.use(validateFirebaseIdToken);

app.post("/storeorder", storeorder);
app.post("/editorder", editorder);
app.post("/deleteorder", deleteorder);
app.post("/changepassword", changepassword);
app.post("/createuser", createuser);


export const api = onRequest(app);