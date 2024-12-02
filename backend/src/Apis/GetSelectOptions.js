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
exports.GetSelectOptions = GetSelectOptions;
exports.GetLocationOptions = GetLocationOptions;
var node_fetch_1 = require("node-fetch");
function GetSelectOptions() {
    return __awaiter(this, arguments, void 0, function (value) {
        var locationOptions, error_1;
        if (value === void 0) { value = 'Ashland'; }
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, GetLocationOptions(value)];
                case 1:
                    locationOptions = _a.sent();
                    //console.log(locationOptions);
                    return [2 /*return*/, locationOptions];
                case 2:
                    error_1 = _a.sent();
                    console.error('Error in GetSelectOptions:', error_1);
                    return [2 /*return*/, null];
                case 3: return [2 /*return*/];
            }
        });
    });
}
var API_KEY = '';
var API_URL = 'https://api.opencagedata.com/geocode/v1/json?q=';
var currentTime = Date.now();
function GetLocationOptions() {
    return __awaiter(this, arguments, void 0, function (value) {
        var response, data, locationSuggestions, error_2;
        if (value === void 0) { value = 'Ashland'; }
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, (0, node_fetch_1.default)("".concat(API_URL, "?q=").concat(value, "&key=").concat(API_KEY))];
                case 1:
                    response = _a.sent();
                    return [4 /*yield*/, response.json()];
                case 2:
                    data = _a.sent();
                    //console.log(data);
                    if (!response.ok) {
                        console.error('Error fetching location suggestions:', data.status);
                        return [2 /*return*/, null];
                    }
                    if (data.results.length > 0) {
                        locationSuggestions = data.results.map(function (result) {
                            var _a, _b, _c, _d, _e, _f, _g;
                            return ({
                                name: "".concat(result.formatted).trim(),
                                lat: result.geometry.lat,
                                lon: result.geometry.lng,
                                sunRise: ((_c = (_b = (_a = result.annotations) === null || _a === void 0 ? void 0 : _a.sun) === null || _b === void 0 ? void 0 : _b.rise) === null || _c === void 0 ? void 0 : _c.civil) || {},
                                sunSet: ((_f = (_e = (_d = result.annotations) === null || _d === void 0 ? void 0 : _d.sun) === null || _e === void 0 ? void 0 : _e.set) === null || _f === void 0 ? void 0 : _f.civil) || {},
                                timezone: ((_g = result.annotations) === null || _g === void 0 ? void 0 : _g.timezone) || {},
                            });
                        });
                        //console.log(locationSuggestions, "LOCATIONS");
                        return [2 /*return*/, locationSuggestions];
                    }
                    else {
                        console.error('No results found.');
                        return [2 /*return*/, null];
                    }
                    return [3 /*break*/, 4];
                case 3:
                    error_2 = _a.sent();
                    console.error('Error fetching location suggestions:', error_2);
                    return [2 /*return*/, null];
                case 4: return [2 /*return*/];
            }
        });
    });
}
