const {
    getAllSensorData,
    getLatestSensorData,
    getHighTemperatureData
} = require("../database/sqliteService");

function calculateAverage(rows, field) {
    if (!rows || rows.length === 0) return 0;

    const total = rows.reduce((sum, row) => {
        return sum + Number(row[field] || 0);
    }, 0);

    return Number((total / rows.length).toFixed(2));
}

function getDashboardSummary(callback) {
    getAllSensorData((sensorError, sensors) => {
        if (sensorError) return callback(sensorError);

        getLatestSensorData((latestError, latestSensor) => {
            if (latestError) return callback(latestError);

            getHighTemperatureData((alertError, alerts) => {
                if (alertError) return callback(alertError);

                const summary = {
                    totalRecords: sensors.length,
                    highAlerts: alerts.length,
                    averageTemperature: calculateAverage(sensors, "temperature"),
                    averageHumidity: calculateAverage(sensors, "humidity"),
                    latestSensor: latestSensor || null,
                    latestAlerts: alerts.slice(0, 5),
                    recentSensors: sensors.slice(0, 10)
                };

                callback(null, summary);
            });
        });
    });
}

module.exports = {
    getDashboardSummary
};