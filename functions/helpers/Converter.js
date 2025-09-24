import { logger } from "firebase-functions";


export function convertFromJSON(formJSONString){

    try{

        return JSON.decode(formJSONString);

    }catch(error){

        return null

    }

}