import Joi from 'joi'
import { UserRole } from '../../../constants';

class LoginUserRequest {
    constructor(data) {
        this.email=data.email;
        // this.password=this.encrytPassword(data.password);
        this.password = data.password;
        this.phone=data.phone;
    }

    encrytPassword(password) {
        return "faked hashed password";
    }

    static validate(data) {
        const schema = Joi.object({
            email: Joi.string().email().optional(),
            password: Joi.string().min(6).required(),
            phone: Joi.string().optional(),
        });

        return schema.validate(data); // {error, value}
    }
}


export default LoginUserRequest;