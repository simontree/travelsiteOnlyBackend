"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const TripService_1 = __importDefault(require("./api/TripService"));
const OpenApiValidator = __importStar(require("express-openapi-validator"));
const knex_1 = require("knex");
const cors_1 = __importDefault(require("cors"));
const knexfile_1 = __importDefault(require("./knexfile"));
const app = (0, express_1.default)();
const port = process.env.PORT || 5000;
const knex = (0, knex_1.knex)(knexfile_1.default);
const tripService = new TripService_1.default(knex);
app.use((0, cors_1.default)({
    origin: true,
    credentials: true,
}));
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(OpenApiValidator.middleware({
    apiSpec: "./openapi.yaml",
    validateRequests: true,
    validateResponses: false, // false by default
}));
app.use((err, req, res, next) => {
    // format error
    res.status(err.status || 500).json({
        message: err.message,
        errors: err.errors,
    });
});
app.post("/trips", (req, res) => {
    const payload = req.body;
    tripService.add(payload).then((newEntry) => res.json(newEntry));
});
app.get("/trips", (req, res) => {
    tripService.getAll().then((savedTrips) => res.json(savedTrips));
});
app.delete("/trips/:tripId", (req, res) => {
    const tripId = req.params.tripId;
    tripService.delete(tripId).then(() => {
        res.status(204);
        res.send();
    });
});
app.put("/trips/:tripId", (req, res) => {
    const tripId = req.params.tripId;
    const changes = req.body;
    tripService.update(tripId, changes).then(() => {
        res.status(200);
        res.send();
    });
});
app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});
