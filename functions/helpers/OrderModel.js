
//https://en.wikipedia.org/wiki/ISO_8601
//As a consequence, if 1 January is on a Monday, Tuesday, Wednesday or Thursday, it is in week 01. 
//If 1 January is on a Friday, Saturday or Sunday, it is in week 52 or 53 of the previous year (there is no week 00). 28 December is always in the last week of its year.

//Years where Jan 1 falls on a Thursday or Dec 31 falls on a Thursday (in a leap year: Wednesday or Thursday) will have a week 53.


export function getDeliveryWeek(currentDate){

    // Customer order
    // After 12pm on Monday
    let deliveryWeek = 0;

    //is it monday and before 12
    if (currentDate.weekday === 1 && currentDate.hour < 12) {
        deliveryWeek = currentDate.weekNumber;

    } else{

        deliveryWeek = currentDate.plus({ weeks: 1}).weekNumber;
    }

    return deliveryWeek;

}