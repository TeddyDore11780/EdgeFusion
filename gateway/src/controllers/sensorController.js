/**
 * EdgeFusion Sensor Controller
 */

const sensorReadings = [];

function getSensors(req, res) {
    res.json({
        count: sensorReadings.length,
        data: sensorReadings
    });
}

function createSensorReading(req, res) {
    const { temperature, humidity, deviceId } = req.body;

    if (temperature === undefined || humidity === undefined) {
        return res.status(400).json({
            error: "temperature and humidity are required"
        });
    }

    const reading = {
        id: sensorReadings.length + 1,
        deviceId: deviceId || "unknown-device",
        temperature,
        humidity,
        timestamp: new Date().toISOString()
    };

    sensorReadings.push(reading);

    res.status(201).json({
        message: "Sensor reading received",
        data: reading
    });
}

module.exports = {
    getSensors,
    createSensorReading
};
