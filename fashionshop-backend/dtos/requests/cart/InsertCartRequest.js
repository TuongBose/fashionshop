import Joi from 'joi'

class InsertCartRequest {
    constructor(data) {
        this.user_id = data.user_id;
        this.session_id = data.session_id;
    }

    static validate(data) {
        const schema = Joi.object({
            user_id: Joi.number().integer(),
            session_id: Joi.string()
        }).xor('user_id', 'session_id');

        return schema.validate(data); // {error, value}
    }
}


export default InsertCartRequest;;