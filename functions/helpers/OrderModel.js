
const { DateTime } = require('luxon');

export function getDeliveryWeek(currentData){

    return 0;

    const londonTime = DateTime.now().setZone('Europe/London');

    const orderTypeIsPublic = order_type === "PUBLIC";
      
    // Customer order
    // After 12pm on Monday
    if (currentDate.weekday === 1 && currentDate.hour >= 12) {

        // Delivery next Tuesday
        deliveryDate = deliveryDate.endOf('week').plus({ days: 1 });

    } else{
        deliveryDate = deliveryDate.endOf('week').plus({ days: 1 });
    }
  
    const deliveryWeek = deliveryDate.weekNumber;

    return deliveryWeek;

}