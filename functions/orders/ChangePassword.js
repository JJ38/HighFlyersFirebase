import { onRequest } from "firebase-functions/v2/https"
import { auth } from "../helpers/Firebase.js";



export const changepassword = onRequest(async (req, res) => {

    try{

        const role = req.user.role;
        const formJSON = req.body;
        console.log(formJSON);

        if(role != "admin"){
            return res.status(403).send("Unauthorized: Insufficient permissions");
        }

        const uid = req.body['uid'];
        const newPassword = req.body['newPassword'];


        if (!uid || !newPassword) {
            return res.status(400).send("Missing uid or newPassword");
        }

        await auth.updateUser(uid, { password: newPassword });

        return res.status(200).send("Password updated successfully");

    } catch (error) {
        console.error("Error updating password:", error);
        return res.status(500).send("Error updating password");
    }

});