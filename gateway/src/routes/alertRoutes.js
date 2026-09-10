const express = require("express");
const router = express.Router();

const { getRecentAlerts } = require("../database/sqliteService");

router.get("/", (req, res) => {
    getRecentAlerts((error, rows) => {
        if (error) {
            return res.status(500).json({
                error: "Failed to fetch alerts"
            });
        }

        res.json(rows);
    });
});

module.exports = router;