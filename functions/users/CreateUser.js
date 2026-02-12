import { onRequest } from "firebase-functions/v2/https"
import { auth, getDatabase } from "../helpers/Firebase.js";


export const createuser = onRequest(async (req, res) => {

    let newUser;

    const liveDB = getDatabase("PROD");
    const devDB = getDatabase("DEV");

    try{

        const role = req.user.role;
        const formJSON = req.body;
        console.log(formJSON);

        if(role != "admin"){
            return res.status(403).send("Unauthorized: Insufficient permissions");
        }

        let username = req.body['username'];

        const userRole = req.body['role'];
        const userPassword = req.body['password'];

        if (!userRole || !userPassword || !username) {
            return res.status(400).send("Missing role or password");
        }

        const email = username + "@placeholder.com";

        //if unsuccessful would throw error
        newUser = await auth.createUser({email: email, password: userPassword,});

        await auth.setCustomUserClaims(newUser.uid, { role: userRole });


        const liveDBBatch = liveDB.batch();
        const devDBBatch = devDB.batch();


        const usersDocRefLive = liveDB.collection('Users').doc(newUser.uid);
        liveDBBatch.set(usersDocRefLive, {"role": userRole, "username": username,});

        const usersDocRefDev = devDB.collection('Users').doc(newUser.uid);
        devDBBatch.set(usersDocRefDev, {"role": userRole, "username": username,});

        if(userRole == "customer"){
            
            const customerDocTemplate = {
                "collectionAddress1": "",
                "collectionAddress2": "",
                "collectionAddress3": "",
                "collectionPostcode": "",
                "collectionName": "",
                "collectionPhoneNumber": "",
                "email": ""
            }

            const customerDocRefLive = liveDB.collection('Customers').doc(newUser.uid);
            liveDBBatch.set(customerDocRefLive, customerDocTemplate);

            const customerDocRefDev= devDB.collection('Customers').doc(newUser.uid);
            devDBBatch.set(customerDocRefDev, customerDocTemplate);
            
        }
            
        if(userRole == "driver"){

            const driverDocTemplate = {
                "assignedRuns": [],
                "driverName": username,
                "driverStatus": "Offline"
            }

            const driverDocRefLive = liveDB.collection('Drivers').doc(newUser.uid);
            liveDBBatch.set(driverDocRefLive, driverDocTemplate);

            const driverDocRefDev= devDB.collection('Drivers').doc(newUser.uid);
            devDBBatch.set(driverDocRefDev, driverDocTemplate);

        }

        if(userRole == "staff" || userRole == "restricted_staff"){

            const staffDocTemplate = {
                "assignedRuns": [],
                "staffName": username,
                "role": userRole
            }

            const staffDocRefLive = liveDB.collection('Staff').doc(newUser.uid);
            liveDBBatch.set(staffDocRefLive, staffDocTemplate);

            const staffDocRefDev= devDB.collection('Staff').doc(newUser.uid);
            devDBBatch.set(staffDocRefDev, staffDocTemplate);

        }

        await liveDBBatch.commit();
        await devDBBatch.commit();

        return res.status(200).send("User created successfully");

    } catch (error) {

        if (newUser?.uid) {

            try {

                await auth.deleteUser(user.uid);
                console.log('Rolled back user creation');

            } catch (e) {
                console.error('Failed to rollback user:', e);
            }
        }

        console.error("Error creating user:", error);
        return res.status(500).send("Error creating user");
    }

});