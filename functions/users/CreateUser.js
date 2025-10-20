import { onRequest } from "firebase-functions/v2/https"
import { auth, getDatabase } from "../helpers/Firebase.js";
import { cloudFunctionDB } from "../helpers/Firebase.js";


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

        username = username + "@placeholder.com";

        //if unsuccessful would throw error
        newUser = await auth.createUser({email: username, password: userPassword,});

        await auth.setCustomUserClaims(newUser.uid, { role: userRole });

        await liveDB.collection('Users').doc(newUser.uid).set({"role": userRole, "username": username,});
        await devDB.collection('Users').doc(newUser.uid).set({"role": userRole, "username": username,});

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