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
var GetWeatherData_1 = require("./Apis/GetWeatherData");
var GetSelectOptions_1 = require("./Apis/GetSelectOptions");
var app = (0, express_1.default)();
var port = process.env.PORT || 5000;
// Middleware to parse JSON request bodies
app.use(express_1.default.json()); // Add this line to parse JSON bodies
var corsOptions = {
    origin: true, // Allow all origins
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true,
};
app.use((0, cors_1.default)(corsOptions));
// Start the HTTP server
var server = app.listen(port, function () {
    console.log("[server]: Server is running at http://localhost:".concat(port));
});
app.post("/nui-event", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var clientData, apiData, apiData;
    var _a, _b, _c, _d, _e, _f;
    return __generator(this, function (_g) {
        switch (_g.label) {
            case 0:
                if (!(req === null || req === void 0 ? void 0 : req.body)) return [3 /*break*/, 6];
                clientData = req.body;
                console.log("Received Client Data:", clientData);
                if (!clientData) {
                    res.json({
                        success: false,
                        message: "ERROR 402 NO DATA RECIEVED",
                    });
                }
                ;
                if (!((clientData === null || clientData === void 0 ? void 0 : clientData.event) === "GetSelectOptions")) return [3 /*break*/, 2];
                return [4 /*yield*/, (0, GetSelectOptions_1.GetSelectOptions)(clientData === null || clientData === void 0 ? void 0 : clientData.data)];
            case 1:
                apiData = _g.sent();
                res.json({
                    success: true,
                    message: apiData
                });
                return [3 /*break*/, 5];
            case 2:
                if (!((clientData === null || clientData === void 0 ? void 0 : clientData.event) === "GetWeatherData")) return [3 /*break*/, 4];
                return [4 /*yield*/, (0, GetWeatherData_1.GetWeatherData)((_b = (_a = clientData === null || clientData === void 0 ? void 0 : clientData.data) === null || _a === void 0 ? void 0 : _a.location) === null || _b === void 0 ? void 0 : _b.lat, (_d = (_c = clientData === null || clientData === void 0 ? void 0 : clientData.data) === null || _c === void 0 ? void 0 : _c.location) === null || _d === void 0 ? void 0 : _d.lon, (_e = clientData === null || clientData === void 0 ? void 0 : clientData.data) === null || _e === void 0 ? void 0 : _e.keyMap, ((_f = clientData === null || clientData === void 0 ? void 0 : clientData.data) === null || _f === void 0 ? void 0 : _f.temp) || "c")];
            case 3:
                apiData = _g.sent();
                res.json({
                    success: true,
                    message: apiData
                });
                return [3 /*break*/, 5];
            case 4:
                res.json({
                    success: false,
                    message: "ERROR 403 NO EVENT",
                });
                _g.label = 5;
            case 5: return [3 /*break*/, 7];
            case 6:
                console.error("ERROR, NO BODY");
                _g.label = 7;
            case 7: return [2 /*return*/];
        }
    });
}); });
