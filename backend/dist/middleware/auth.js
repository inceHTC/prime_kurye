"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = authenticate;
exports.authorize = authorize;
const jwt_1 = require("../lib/jwt");
function authenticate(req, res, next) {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader?.startsWith('Bearer ')) {
            return res.status(401).json({ success: false, message: 'Token bulunamadı' });
        }
        const token = authHeader.split(' ')[1] ?? '';
        const payload = (0, jwt_1.verifyAccessToken)(token);
        req.user = {
            userId: payload.userId,
            email: payload.email,
            role: payload.role,
        };
        next();
    }
    catch {
        return res.status(401).json({ success: false, message: 'Geçersiz token' });
    }
}
function authorize(...roles) {
    return (req, res, next) => {
        const user = req.user;
        if (!user) {
            return res.status(401).json({ success: false, message: 'Giriş yapmanız gerekiyor' });
        }
        if (!roles.includes(user.role)) {
            return res.status(403).json({ success: false, message: 'Yetkiniz yok' });
        }
        next();
    };
}
