import { onRequest } from "firebase-functions/v2/https"
import { auth, getDatabase } from "../helpers/Firebase.js";


export const deleteuser = onRequest(async (req, res) => {

    const liveDB = getDatabase("PROD");
    const devDB = getDatabase("DEV");

    try{

        const role = req.user.role;
        const formJSON = req.body;
        console.log(formJSON);

        if(role != "admin"){
            return res.status(403).send("Unauthorized: Insufficient permissions");
        }


        const userUID = req.body['uid'];
        const userRole = req.body['role'];

        if (!userRole || !userUID) {
            return res.status(400).send("Missing role or uid - invalid json structure");
        }


        //create doc refs for both databases
        const liveDBDocRefs = [];
        const devDBDocRefs = [];
      

        liveDBDocRefs.push(liveDB.collection('Users').doc(userUID));
        devDBDocRefs.push(devDB.collection('Users').doc(userUID));

        if(userRole == "customer"){
            
            liveDBDocRefs.push(liveDB.collection('Customers').doc(userUID));
            devDBDocRefs.push(devDB.collection('Customers').doc(userUID));
            
        }
            
        if(userRole == "driver"){

            liveDBDocRefs.push(liveDB.collection('Drivers').doc(userUID));
            devDBDocRefs.push(devDB.collection('Drivers').doc(userUID));
            
        }

        //do live db first as should take priority
        await liveDB.runTransaction(async (transaction) => {
            for (const ref of liveDBDocRefs) {
                transaction.delete(ref);
            }
        });
        
        //best effort if fails still try to delete user
        try{
            await devDB.runTransaction(async (transaction) => {
                for (const ref of devDBDocRefs) {
                    transaction.delete(ref);
                }
            });
        }
        catch(e){
            console.log("Error deleting test user documents for " + userUID + " " + userRole  + " error: " + e);
        }

        //will throw error if userUID doesnt exist but the documents deletion above will still succeed
        await auth.deleteUser(userUID);

        return res.status(200).send("User created successfully");

    } catch (error) {

        console.error("Error deleting user:", error);
        return res.status(500).send("Error deleting user");
    }

});