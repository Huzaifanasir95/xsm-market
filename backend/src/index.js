"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var cors_1 = require("cors");
var mongoose_1 = require("mongoose");
var dotenv_1 = require("dotenv");
var auth_1 = require("./routes/auth");
var errorHandler_1 = require("./middleware/errorHandler");
dotenv_1.default.config();
var app = (0, express_1.default)();
var port = process.env.PORT || 5000;
// Middleware
app.use((0, cors_1.default)({
    origin: ['http://localhost:5173', 'http://localhost:8080', 'http://127.0.0.1:8080'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express_1.default.json());
// Health check endpoint
app.get('/api/health', function (req, res) {
    res.status(200).json({ status: 'ok' });
});
// Routes
app.use('/api/auth', auth_1.default);
// Error handling
app.use(errorHandler_1.errorHandler);
// MongoDB Connection Options
var mongoOptions = {
    retryWrites: true,
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 10000, // Increase timeout for initial connection
    socketTimeoutMS: 45000,
    connectTimeoutMS: 10000,
    retryReads: true,
    w: 'majority',
    wtimeoutMS: 2500
};
// Connect to MongoDB
var connectToMongoDB = function () { return __awaiter(void 0, void 0, void 0, function () {
    var error_1, mongoError;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                console.log('Attempting to connect to MongoDB...');
                if (!process.env.MONGODB_URI) {
                    throw new Error('MONGODB_URI environment variable is not defined');
                }
                return [4 /*yield*/, mongoose_1.default.connect(process.env.MONGODB_URI, mongoOptions)];
            case 1:
                _a.sent();
                console.log('Successfully connected to MongoDB Atlas');
                // Start server only after successful DB connection
                app.listen(port, function () {
                    console.log("Server is running on port ".concat(port));
                });
                return [3 /*break*/, 3];
            case 2:
                error_1 = _a.sent();
                console.error('MongoDB connection error details:');
                console.error('Error name:', error_1 instanceof Error ? error_1.name : 'Unknown error');
                console.error('Error message:', error_1 instanceof Error ? error_1.message : String(error_1));
                if (error_1 instanceof Error) {
                    mongoError = error_1;
                    if (mongoError.code)
                        console.error('Error code:', mongoError.code);
                    if (mongoError.codeName)
                        console.error('Error codeName:', mongoError.codeName);
                }
                // Instead of exiting, wait and retry
                console.log('Will retry connection in 5 seconds...');
                setTimeout(connectToMongoDB, 5000);
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
// Initial connection attempt
connectToMongoDB();
