"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const courier_routes_1 = __importDefault(require("./routes/courier.routes"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const order_routes_1 = __importDefault(require("./routes/order.routes"));
const admin_routes_1 = __importDefault(require("./routes/admin.routes"));
const user_routes_1 = __importDefault(require("./routes/user.routes"));
const payment_routes_1 = __importDefault(require("./routes/payment.routes"));
const escrow_routes_1 = __importDefault(require("./routes/escrow.routes"));
const report_routes_1 = __importDefault(require("./routes/report.routes"));
const courierDoc_routes_1 = __importDefault(require("./routes/courierDoc.routes"));
const cron_service_1 = require("./services/cron.service");
const passwordReset_routes_1 = __importDefault(require("./routes/passwordReset.routes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 4000;
const allowedOrigins = new Set([
    'http://localhost:3000',
    process.env.CLIENT_URL,
    ...(process.env.CLIENT_URLS?.split(',') ?? []),
]
    .map((origin) => origin?.trim())
    .filter(Boolean));
const isAllowedOrigin = (origin) => {
    if (!origin) {
        return true;
    }
    if (allowedOrigins.has(origin)) {
        return true;
    }
    return /^https:\/\/prime-kurye(?:-[a-z0-9-]+)?\.vercel\.app$/i.test(origin);
};
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        if (isAllowedOrigin(origin)) {
            callback(null, true);
            return;
        }
        callback(new Error('CORS origin not allowed'));
    },
    credentials: true,
}));
app.use((0, morgan_1.default)('dev'));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, cookie_parser_1.default)());
app.use('/api/courier', courier_routes_1.default);
app.use('/api/admin', admin_routes_1.default);
app.use('/api/auth', auth_routes_1.default);
app.use('/api/orders', order_routes_1.default);
app.use('/api/users', user_routes_1.default);
app.use('/api/payments', payment_routes_1.default);
app.use('/api/escrow', escrow_routes_1.default);
app.use('/api/reports', report_routes_1.default);
app.use('/api/courier-docs', courierDoc_routes_1.default);
app.use('/uploads', express_1.default.static(path_1.default.join(process.cwd(), 'uploads')));
app.use('/api/courier-docs', courierDoc_routes_1.default);
app.use('/api/auth', passwordReset_routes_1.default);
app.get('/health', (_, res) => {
    res.json({ status: 'ok', message: 'Prime Kurye API calisiyor', timestamp: new Date() });
});
app.use((_, res) => {
    res.status(404).json({ success: false, message: 'Endpoint bulunamadi' });
});
app.listen(PORT, () => {
    (0, cron_service_1.startCronJobs)();
    console.log(`
  Prime Kurye API
  ---------------------
  Port    : ${PORT}
  Ortam   : ${process.env.NODE_ENV || 'development'}
  URL     : http://localhost:${PORT}
  Health  : http://localhost:${PORT}/health
  `);
});
exports.default = app;
