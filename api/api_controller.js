const axios = require("axios");
const rand = require("random-seed").create();
require("dotenv").config();

function getArray(num) {
    var array = [];
    for (var i = 0; i < 10; i++) {
        for (var j = 0; j < num;) {
            var random = getRandomInt((5 * i) + 1, (5 * (i + 1) + 1));
            if (array.indexOf(random) == -1) {
                array.push(random);
                j++;
            }
        }
    }
    return array;
}
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
}
module.exports = {
    StartSignal: async (req, res) => {
        const { userName, betAmount, token, amount, pitNum } = req.body;
        var betValue = parseFloat(betAmount);
        var amountValue = parseFloat(amount);
        var pitValue = parseInt(pitNum);
        let user = [];
        user[token] = {
            userName: userName,
            betAmount: betValue,
            userToken: token,
            amount: amountValue,
            pitNum: pitValue
        }
        try {
            var pit = getArray(user[token].pitNum);
            var total = user[token].amount - user[token].betAmount;
            console.log(pit);
            try {
                res.json({
                    pitArray: pit,
                    total: total,
                    serverMsg: "Success"
                })
            } catch (err) {
                throw new Error("Can't find Server!");
            }
        } catch (err) {
            res.json({
                serverMsg: err.message
            })
        }
        delete user[token];
    },
    GameResult: async (req, res) => {
        const { userName, betAmount, token, amount, pitNum, loop } = req.body;
        var ScoreArray = [
            [1.21, 1.52, 1.89, 2.37, 2.96, 3.7, 4.62, 5.78, 7.23, 9.03],
            [1.62, 2.69, 4.49, 7.48, 12.47, 20.79, 34.65, 57.75, 96.25, 160.42],
            [2.42, 6.06, 15.15, 37.89, 94.73, 236.82, 592.04, 1480.1, 3700.26, 9250.64],
            [4.85, 24.25, 121.25, 606.25, 3031.25, 15156.25, 75781.25, 378906, 1894531, 9472656]
        ];
        var betValue = parseFloat(betAmount);
        var amountValue = parseFloat(amount);
        var n = parseInt(loop);
        var num = parseInt(pitNum);
        let user = [];
        user[token] = {
            userName: userName,
            betAmount: betValue,
            userToken: token,
            amount: amountValue,
            pitNum: num,
            loop: n
        }
        try {
            try {
                await axios.post(
                    process.env.PLATFORM_SERVER + "api/games/bet",
                    {
                        token: user[token].userToken,
                        amount: user[token].betAmount,
                    }
                );
            } catch (err) {
                throw new Error("Bet Error!");
            }
            var raisePrice = user[token].betAmount * ScoreArray[user[token].pitNum - 1][user[token].loop - 2];
            try {
                await axios.post(
                    process.env.PLATFORM_SERVER + "api/games/winlose",
                    {
                        token: user[token].userToken,
                        amount: raisePrice,
                        winState: raisePrice != 0 ? true : false,
                    }
                )
            } catch (err) {
                throw new Error("WinLose Error!");
            }
            var total = user[token].amount + raisePrice;
            var msg = "You win! : +" + raisePrice.toFixed(3);
            try {
                res.json({
                    total: total,
                    raisePrice: raisePrice,
                    msg: msg,
                    serverMsg: "Success"
                })
            } catch (err) {
                throw new Error("Can't find Server!");
            }
        } catch (err) {
            res.json({
                serverMsg: err.message
            })
        }
        delete user[token];
    },
};