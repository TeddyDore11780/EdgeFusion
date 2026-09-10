const express = require("express");
const {
    getSensors,
    getLatestSensor,
    getHighTemperatureSensors
} = require("../controllers/sensorController");

const router = express.Router();

router.get("/", getSensors);
router.get("/latest", getLatestSensor);
router.get("/high", getHighTemperatureSensors);

module.exports = router;
