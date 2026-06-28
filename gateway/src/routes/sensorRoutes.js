/**
 * EdgeFusion Sensor Routes
 */

const express = require("express");
const {
    getSensors,
    createSensorReading
} = require("../controllers/sensorController");

const router = express.Router();

router.get("/", getSensors);
router.post("/", createSensorReading);

module.exports = router;
