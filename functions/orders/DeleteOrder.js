import { onRequest } from "firebase-functions/v2/https"
import { getDatabase, ordersCollectionName } from "../helpers/Firebase.js";


export const deleteorder = onRequest(async (req, res) => {

    const role = req.user.role;
    const formJSON = req.body;
    console.log(formJSON);

    if(role != "admin"){
        return res.status(403).send("Unauthorized: Insufficient permissions");
    }

    const uuid = formJSON['uuid'];
    if(uuid == "" || uuid == null || uuid == undefined){
        return res.status(400).json({error: true, message: "UUID id invalid", errorLog: "invalid uuid format - " + uuid});
    }

    const environment = req.body['environment'];
    const db = getDatabase(environment);

    if(!environment){
        return res.status(400).send("Environment: Not Allowed - " + environment);
    }

    const orderRef = db.collection(ordersCollectionName).doc(uuid);

    try{
       
        const orderDoc = await orderRef.get();
        if(!orderDoc.exists){
            return res.status(404).json({error: true, message: "UUID id invalid", errorLog: "document doesnt exist"});
        }

        console.log(orderDoc.data());

    }catch(e){
        return res.status(500).json({error: true, message: "Error checking if document exists", errorLog: "error fetching document"});
    }

    try{

        await orderRef.delete();

    }catch(e){
        console.log(e);
        return res.status(500).json({error: true, message: "Error deleting order", errorLog: "Error deleting order - " + e});
        
    }

    return res.status(200).json({error: false, message: "Successfully deleted order"});

});