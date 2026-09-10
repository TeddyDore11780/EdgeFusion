const {
    getAllSensorData,
    getLatestSensorData,
    getHighTemperatureData
} = require("../database/sqliteService");

function getSensors(req, res) {
    getAllSensorData((error, rows) => {
        if (error) {
            return res.status(500).json({
                success: false,
                error: error.message
            });
        }

        res.json({
            success: true,
            count: rows.length,
            data: rows
        });
    });
}

function getLatestSensor(req, res) {
    getLatestSensorData((error, row) => {
        if (error) {
            return res.status(500).json({
                success: false,
                error: error.message
            });
        }

        res.json({
            success: true,
            data: row || null
        });
    });
}

function getHighTemperatureSensors(req, res) {
    getHighTemperatureData((error, rows) => {
        if (error) {
            return res.status(500).json({
                success: false,
                error: error.message
            });
        }

        res.json({
            success: true,
            count: rows.length,
            data: rows
        });
    });
}

module.exports = {
    getSensors,
    getLatestSensor,
    getHighTemperatureSensors
};
