
const isNumber = new RegExp('^[0-9]*$');
const isEmail = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
const validPaymentOptions = ['Pickup', 'Delivery', 'Account'];

export function validateForm(formJSON, validAnimalTypes){

    try{

        //parse to ints
        formJSON.quantity = parseInt(formJSON.quantity);
        formJSON.boxes = parseInt(formJSON.boxes);


        const deliveryTelephoneNumber = formJSON.deliveryPhoneNumber.replace(" ", "");
        const collectionTelephoneNumber = formJSON.collectionPhoneNumber.replace(" ", "");

        //validate phone numbers
        
        if(!isNumber.test(deliveryTelephoneNumber) || deliveryTelephoneNumber.length != 11){
            return "Delivery Telephone is not a valid phone number. Please enter an 11 digit phone number";
        }

        if(!isNumber.test(collectionTelephoneNumber) || collectionTelephoneNumber.length != 11){
            return "Collection Telephone is not a valid phone number. Please enter an 11 digit phone number";
        }

        if(!formJSON.email.match(isEmail)){
            return "Email is not valid";
        }

        if(!validPaymentOptions.includes(formJSON.payment)){
            return "Please select a valid payment option";
        }

        if(!validAnimalTypes.includes(formJSON.animalType)){
            return "Please select a valid animal type";
        }

        if(!isNumber.test(formJSON.quantity) || parseInt(formJSON.quantity) < 1 || formJSON.quantity == ""){
            return "Quantity is not a valid number. Please enter a number greater than 0";
        }

        if(!isNumber.test(formJSON.boxes) || parseInt(formJSON.boxes) < 1 || formJSON.boxes == ""){
            return "Boxes is not a valid number. Please enter a number greater than 0";
        }

    }catch(e){

        return "Validation Error - make sure all required fields are in the json and non values are null";
    }

    return null;
}


