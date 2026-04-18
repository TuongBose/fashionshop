import Joi from 'joi'
import { OrderStatus } from '../../../constants';

class UpdateOrderRequest {
    constructor(data) {
        this.status=data.status;
        this.note=data.note;
        this.total=data.total;
    }

    static validate(data) {
        const schema = Joi.object({
            status: Joi.number().integer().valid(...Object.values(OrderStatus)).optional(),
            note: Joi.string().optional().allow("",null),
            total: Joi.number().integer().min(0).optional()
        });

        return schema.validate(data); // {error, value}
    }
}


export default UpdateOrderRequest;;