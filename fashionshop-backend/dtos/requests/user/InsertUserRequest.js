import Joi from 'joi'

class InsertUserRequest {
    constructor(data) {
        this.email=data.email;
        // this.password=this.encrytPassword(data.password);
        this.password = data.password;
        this.name=data.name;
        this.role=data.role;
        this.avatar=data.avatar;
        this.phone=data.phone;
    }

    encrytPassword(password) {
        return "faked hashed password";
    }

    static validate(data) {
        const schema = Joi.object({
            email: Joi.string().email().required(),
            password: Joi.string().min(6).required(),
            name: Joi.string().required(),
            role: Joi.number().integer().min(1).required(),
            avatar: Joi.string().uri().optional().allow(""),
            phone: Joi.string().optional(),
        });

        return schema.validate(data); // {error, value}
    }
}


export default InsertUserRequest;;