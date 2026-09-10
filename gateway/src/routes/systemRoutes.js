const express = require("express");

const {
    getSystemStatus,
    controlLed
} = require("../controllers/systemController");

const router = express.Router();

// System status
router.get("/", getSystemStatus);

// ESP32 LED control
router.post("/led", controlLed);

module.exports = router;