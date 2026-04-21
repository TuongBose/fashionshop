import e from "express";
import { getUserFromToken } from "../helpers/tokenHelper";

const requireRoles = (rolesRequired) => async (req, res, next) => {
    try {
        const user = await getUserFromToken(req, res);
        if (!user) return;

        if (user.is_active === false) {
            return res.status(403).json({
                message: 'Account is deactivated'
            })
        }

        if (!rolesRequired.includes(user.role)) {
            return res.status(403).json({
                message: 'Forbidden'
            })
        }
        req.user = user;
        next();
    } catch (error) {
        return res.status(401).json({
            message: 'Unauthorized',
            error: error.message
        })
    }
};

export { requireRoles };