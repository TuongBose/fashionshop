import Joi from 'joi'

class InsertProductImageRequest {
    constructor(data) {
        this.image_url = data.image_url;
        this.product_id=data.product_id;
    }

    static validate(data) {
        const schema = Joi.object({
            image_url: Joi.string().required(),
            product_id: Joi.number().integer().required()
        });

        return schema.validate(data); // {error, value}
    }
}

export default InsertProductImageRequest;