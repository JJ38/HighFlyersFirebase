import { initializeApp } from "firebase-admin/app";
import { validateorder } from "./orders/ValidateOrder.js";

initializeApp();

export{ validateorder };
