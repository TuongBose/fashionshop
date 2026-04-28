import Joi from 'joi'

class InsertCartItemRequest {
    constructor(data) {
        this.cart_id=data.cart_id;
        this.product_variant_id=data.product_variant_id;
        this.quantity=data.quantity;
    }

    static validate(data) {
        const schema = Joi.object({
            cart_id: Joi.number().integer().required(),
            product_variant_id: Joi.number().integer().required(),
            quantity: Joi.number().integer().min(0).required()
        });

        return schema.validate(data); // {error, value}
    }
}


export default InsertCartItemRequest;;