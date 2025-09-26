import { DateTime } from "luxon";
import { getDeliveryWeek } from "../../helpers/OrderModel";

describe('Testing delivery week', () => {

    test('Invalid Json', async () => {
        
        const currentDate = DateTime.now().setZone('Europe/London');
        console.log(currentDate);

        const deliveryWeek = getDeliveryWeek();

        expect(deliveryWeek).toBe(40);
        
    });

})