const {
    getAllSensorData,
    getLatestSensorData,
    getHighTemperatureData,
    getRecentAlerts
} = require("../database/sqliteService");

const { getMqttStats } = require("./mqttService");

function calculateAverage(rows, field) {
    if (!rows || rows.length === 0) return 0;

    const total = rows.reduce((sum, row) => {
        return sum + Number(row[field] || 0);
    }, 0);

    return Number((total / rows.length).toFixed(2));
}

function getMaxValue(rows, field) {
    if (!rows || rows.length === 0) return 0;

    return Math.max(
        ...rows.map((row) => Number(row[field] || 0))
    );
}

function getMinValue(rows, field) {
    if (!rows || rows.length === 0) return 0;

    return Math.min(
        ...rows.map((row) => Number(row[field] || 0))
    );
}

function getActiveDeviceCount(rows) {
    if (!rows || rows.length === 0) return 0;

    return new Set(
        rows.map((row) => row.deviceId)
    ).size;
}

function calculateAlertRate(totalRecords, highAlerts) {
    if (!totalRecords || totalRecords === 0) return 0;

    return Number(
        ((highAlerts / totalRecords) * 100).toFixed(1)
    );
}

function getDeviceStatistics(rows) {
    if (!rows || rows.length === 0) return [];

    const devices = {};

    rows.forEach((row) => {
        if (!devices[row.deviceId]) {
            devices[row.deviceId] = {
                deviceId: row.deviceId,
                readings: 0,
                highestTemperature: Number(row.temperature || 0),
                averageTemperatureTotal: 0
            };
        }

        devices[row.deviceId].readings += 1;

        devices[row.deviceId].averageTemperatureTotal +=
            Number(row.temperature || 0);

        devices[row.deviceId].highestTemperature = Math.max(
            devices[row.deviceId].highestTemperature,
            Number(row.temperature || 0)
        );
    });

    return Object.values(devices)
        .map((device) => ({
            deviceId: device.deviceId,
            readings: device.readings,
            highestTemperature: device.highestTemperature,
            averageTemperature: Number(
                (
                    device.averageTemperatureTotal /
                    device.readings
                ).toFixed(2)
            )
        }))
        .sort((a, b) => b.readings - a.readings)
        .slice(0, 5);
}

// =====================================================
// PHYSICAL EDGE DEVICE
// =====================================================

function getPhysicalEdgeDevice(latestSensor, mqtt) {
    const deviceId = latestSensor?.deviceId || "esp32-01";

    const lastSeen =
        latestSensor?.processedAt ||
        mqtt?.lastMessageAt ||
        null;

    let status = "Offline";

    if (lastSeen) {
        const lastSeenTime = new Date(lastSeen).getTime();
        const now = Date.now();

        if (!Number.isNaN(lastSeenTime)) {
            const ageSeconds = (now - lastSeenTime) / 1000;

            // Consider the physical node online when telemetry
            // has been received within the last 60 seconds.
            if (ageSeconds <= 60) {
                status = "Online";
            }
        }
    }

    return {
        deviceId,
        status,

        lastSeen,

        sensors: {
            temperature: latestSensor
                ? Number(latestSensor.temperature ?? 0)
                : null,

            humidity: latestSensor
                ? Number(latestSensor.humidity ?? 0)
                : null,

            light: latestSensor
                ? Number(latestSensor.light ?? 0)
                : null,

            motion: latestSensor
                ? Boolean(latestSensor.motion)
                : null
        },

        mqtt: {
            status: mqtt?.status || "Offline",
            messagesReceived: mqtt?.messagesReceived || 0,
            lastMessageAt: mqtt?.lastMessageAt || null
        },

        led: {
            state: mqtt?.physicalLed?.state || "UNKNOWN",
            gpio: mqtt?.physicalLed?.gpio || 2,
            commandTopic:
                mqtt?.physicalLed?.commandTopic ||
                "edgefusion/esp32/esp32-01/led",
            stateTopic:
                mqtt?.physicalLed?.stateTopic ||
                "edgefusion/esp32/esp32-01/led/state",
            lastUpdatedAt:
                mqtt?.physicalLed?.lastUpdatedAt || null
        }
    };
}

// =====================================================
// DASHBOARD SUMMARY
// =====================================================

function getDashboardSummary(callback) {
    getAllSensorData((sensorError, sensors) => {
        if (sensorError) {
            return callback(sensorError);
        }

        getLatestSensorData((latestError, latestSensor) => {
            if (latestError) {
                return callback(latestError);
            }

            getHighTemperatureData(
                (highTempError, highTempAlerts) => {
                    if (highTempError) {
                        return callback(highTempError);
                    }

                    getRecentAlerts(
                        (recentAlertError, recentAlerts) => {
                            if (recentAlertError) {
                                return callback(recentAlertError);
                            }

                            const totalRecords = sensors.length;
                            const highAlerts =
                                highTempAlerts.length;

                            const mqtt = getMqttStats();

                            const physicalEdgeDevice =
                                getPhysicalEdgeDevice(
                                    latestSensor,
                                    mqtt
                                );

                            const summary = {
                                totalRecords,

                                highAlerts,

                                totalAlerts:
                                    recentAlerts.length,

                                averageTemperature:
                                    calculateAverage(
                                        sensors,
                                        "temperature"
                                    ),

                                averageHumidity:
                                    calculateAverage(
                                        sensors,
                                        "humidity"
                                    ),

                                highestTemperature:
                                    getMaxValue(
                                        sensors,
                                        "temperature"
                                    ),

                                lowestTemperature:
                                    getMinValue(
                                        sensors,
                                        "temperature"
                                    ),

                                activeDevices:
                                    getActiveDeviceCount(
                                        sensors
                                    ),

                                alertRate:
                                    calculateAlertRate(
                                        totalRecords,
                                        highAlerts
                                    ),

                                deviceStatistics:
                                    getDeviceStatistics(
                                        sensors
                                    ),

                                latestSensor:
                                    latestSensor || null,

                                latestAlerts:
                                    recentAlerts.slice(0, 5),

                                recentSensors:
                                    sensors.slice(0, 10),

                                allSensors: sensors,

                                physicalEdgeDevice
                            };

                            callback(null, summary);
                        }
                    );
                }
            );
        });
    });
}

module.exports = {
    getDashboardSummary
};
