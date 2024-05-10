const express = require("express");
const router = express.Router();
const User = require("./api_controller");

module.exports = (router) => {
    // User API
    router.post("/start-Minesweeper", User.StartSignal);
    router.post("/game-result", User.GameResult);
};
// PLATFORM_SERVER = http://31.220.56.166/
