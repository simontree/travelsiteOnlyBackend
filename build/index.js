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
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const TripService_1 = __importDefault(require("./api/TripService"));
const AuthService_1 = __importDefault(require("./api/AuthService"));
const OpenApiValidator = __importStar(require("express-openapi-validator"));
const knex_1 = require("knex");
const cors_1 = __importDefault(require("cors"));
const knexfile_1 = __importDefault(require("./knexfile"));
const redis_1 = require("redis");
const util_1 = require("util");
const app = (0, express_1.default)();
const port = process.env.PORT || 5000;
const knex = (0, knex_1.knex)(knexfile_1.default);
const tripService = new TripService_1.default(knex);
const authService = new AuthService_1.default();
const redisPass = "hlzu8VsbpKUSe9GysuZDJQN73rDhipVy";
const client = (0, redis_1.createClient)({
    url: process.env.REDIS_URL,
    no_ready_check: true,
    auth_pass: redisPass,
});
//const client = createClient();
client.on("error", (err) => console.log("Redis client error", err));
client.on("connect", () => console.log("Successfully connected to redis"));
// (async () => {
//   await client.connect();
// })();
const getAsync = (0, util_1.promisify)(client.get).bind(client);
const setExAsync = (0, util_1.promisify)(client.setex).bind(client);
app.use((0, cors_1.default)({
    origin: true,
    credentials: true,
}));
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
app.use(OpenApiValidator.middleware({
    apiSpec: "./openapi.yaml",
    validateRequests: true,
    validateResponses: false, // false by default
}));
const checkLogin = async (req, res, next) => {
    // const session = await client.get("cookie");
    const session = await getAsync("cookie");
    // const session = req.cookies.session;
    if (!session) {
        res.status(401);
        return res.json({
            message: "You need to be logged in to see this page. Err1",
        });
    }
    let email;
    if (session != null) {
        // email = await client.get(session.toString());
        email = await getAsync(session);
    }
    else
        email = null;
    if (req.params.tripID) {
        var mailToCheck = await authService.getUserOfTrip(req.params.tripId);
        if (mailToCheck !== email) {
            return res.json({
                message: "You need to be logged in to see this page. Err2",
            });
        }
    }
    if (!email) {
        res.status(401);
        return res.json({
            message: "You need to be logged in to see this page. Err3",
        });
    }
    console.log("check session: " + session);
    console.log("check email: " + email);
    next();
};
app.use((err, req, res, next) => {
    // format error
    res.status(err.status || 500).json({
        message: err.message,
        errors: err.errors,
    });
});
///////////////////////////////////////////// TRIPS //////////////////////////////
app.post("/trips", checkLogin, (req, res) => {
    const payload = req.body;
    getUserID().then(async (result) => {
        const user = result;
        tripService.add(payload, user).then((newEntry) => res.json(newEntry));
    });
});
async function getUserID() {
    // const session = await client.get("cookie");
    const session = await getAsync("cookie");
    if (session) {
        // const userID = await client.get(session);
        const userID = await getAsync(session.toString());
        return userID;
    }
    return undefined;
}
app.get("/trips", checkLogin, (req, res) => {
    getUserID().then((result) => {
        tripService
            .getTripsOfOneUser(result)
            .then((savedTrips) => res.json(savedTrips));
    });
});
app.delete("/trips/:tripId", checkLogin, (req, res) => {
    const tripId = req.params.tripId;
    tripService.delete(tripId).then(() => {
        res.status(204);
        res.send();
    });
});
app.patch("/trips/:tripId", checkLogin, (req, res) => {
    const tripId = req.params.tripId;
    const changes = req.body;
    tripService.update(tripId, changes).then(() => {
        res.status(200);
        res.send();
    });
});
///////////////////////////////////////////// USERS //////////////////////////////
app.post("/user", (req, res) => {
    const payload = req.body;
    authService.create(payload).then((newEntry) => res.json(newEntry));
});
app.get("/user", (req, res) => {
    authService.getUsers().then((savedUsers) => res.json(savedUsers));
});
app.delete("/user/:email", (req, res) => {
    const email = req.params.email;
    authService.delete(email).then(() => {
        res.status(204);
        res.send();
    });
});
app.post("/login", async (req, res) => {
    const payload = req.body;
    const sessionId = await authService.login(payload.email, payload.password);
    console.log("sessionID: " + sessionId);
    if (!sessionId) {
        res.status(401);
        return res.json({ message: "Bad email or password" });
    }
    // res.cookie("session", sessionId, {
    //   maxAge: 60 * 60 * 1000,
    //   httpOnly: true,
    //   sameSite: "none",
    //   secure: process.env.NODE_ENV === "development",
    // });
    res.status(200);
    // client.set("cookie", sessionId, { EX: 600 });
    await setExAsync("cookie", 60 * 60, sessionId);
    return res.json({ status: "200", sessionID: sessionId });
});
app.post("/logout", async (req, res) => {
    // client.set("cookie", "0");
    await setExAsync("cookie", 60 * 60, "0");
    console.log("logout");
    res.status(200);
    return res.json({ message: "Logout successful" });
});
///////////////////////////////////////////// END USERS //////////////////////////
////////////////////////////////////////// FOR DEBUG /////////////////////////////
// app.get("/get", (req, res) => {
//   /*return res.json({
//     chicken: "hi"
//   })*/
//   authService.getUsers().then((dbUsers) => res.json(dbUsers));
// });
//////////////////////////////////////////// END DEBUG ///////////////////////////
app.listen(port, () => {
    console.log(`Test app listening at http://localhost:${port}`);
});
