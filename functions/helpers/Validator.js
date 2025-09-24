
const isNumber = new RegExp('^[0-9]*$');
const isEmail = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;


export function validateForm(formJSON){

    const form = JSON.decode(formJSON);
    
    console.log(formJSON)

    // const deliveryTelephoneNumber = deliveryPhoneNumber.value.replace(" ", "");
    // const collectionTelephoneNumber = collectionPhoneNumber.value.replace(" ", "");

    // //validate phone numbers
    
    // if(!isNumber.test(deliveryTelephoneNumber) || deliveryTelephoneNumber.length != 11){
    //     return "Delivery Telephone is not a valid phone number. Please enter an 11 digit phone number";
    // }

    // if(!isNumber.test(collectionTelephoneNumber) || collectionTelephoneNumber.length != 11){
    //     return "Collection Telephone is not a valid phone number. Please enter an 11 digit phone number";
    // }

    // //validate email

    // if(!email.value.match(isEmail)){
    //     return "Email is not valid";
    // }

    // if(!validPaymentOptions.includes(payment.value)){
    //     return "Please select a valid payment option";
    // }

    // if(!validAnimalTypes.includes(animalTypeSelect.value)){
    //     return "Please select a valid animal type";
    // }

    // if(!isNumber.test(quantity.value) || parseInt(quantity.value) < 1 || quantity.value == ""){
    //     return "Quantity is not a valid number. Please enter a number greater than 0";
    // }

    // if(!isNumber.test(boxes.value) || parseInt(boxes.value) < 1 || boxes.value == ""){
    //     return "Boxes is not a valid number. Please enter a number greater than 0";
    // }


    return null;
}