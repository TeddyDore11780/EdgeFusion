const {
    getMqttStats,
    publishLedCommand
} = require("../services/mqttService");

const { getSocketStats } = require("../services/socketService");

function getSystemStatus(req, res) {
    try {
        const memory = process.memoryUsage();
        const uptimeSeconds = process.uptime();

        const mqtt = getMqttStats();
        const socket = getSocketStats();

        // Physical ESP32 LED state is already maintained by mqttService.
        const led = mqtt.physicalLed || {
            deviceId: "esp32-01",
            state: "UNKNOWN",
            gpio: 2,
            commandTopic: "edgefusion/esp32/esp32-01/led",
            stateTopic: "edgefusion/esp32/esp32-01/led/state",
            lastUpdatedAt: null
        };

        res.json({
            success: true,
            data: {
                gateway: "Online",

                nodeVersion: process.version,

                environment:
                    process.env.NODE_ENV || "development",

                uptimeSeconds,

                uptimeMinutes: Number(
                    (uptimeSeconds / 60).toFixed(2)
                ),

                memory: {
                    rssMb: Number(
                        (memory.rss / 1024 / 1024).toFixed(2)
                    ),

                    heapUsedMb: Number(
                        (memory.heapUsed / 1024 / 1024).toFixed(2)
                    ),

                    heapTotalMb: Number(
                        (memory.heapTotal / 1024 / 1024).toFixed(2)
                    )
                },

                mqtt,

                socketio: socket,

                database: {
                    status: "Online",
                    type: "SQLite"
                },

                openfaas: {
                    status: "Online",
                    function: "process-sensor-data"
                },

                physicalEdgeDevice: {
                    deviceId: led.deviceId || "esp32-01",

                    status: "Online",

                    led: {
                        state: led.state || "UNKNOWN",

                        gpio: led.gpio || 2,

                        commandTopic:
                            led.commandTopic ||
                            "edgefusion/esp32/esp32-01/led",

                        stateTopic:
                            led.stateTopic ||
                            "edgefusion/esp32/esp32-01/led/state",

                        lastUpdatedAt:
                            led.lastUpdatedAt || null
                    }
                },

                timestamp:
                    new Date().toISOString()
            }
        });

    } catch (error) {
        console.error(
            "System status error:",
            error.message
        );

        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
}


// =====================================================
// LED CONTROL
// =====================================================

function controlLed(req, res) {
    try {
        const { state } = req.body;

        if (!state) {
            return res.status(400).json({
                success: false,
                error:
                    "LED state is required. Use ON or OFF."
            });
        }

        const command =
            String(state)
                .trim()
                .toUpperCase();

        if (!["ON", "OFF"].includes(command)) {
            return res.status(400).json({
                success: false,
                error:
                    "Invalid LED state. Use ON or OFF."
            });
        }

        const result =
            publishLedCommand(command);

        return res.json({
            success: true,

            message:
                `LED command ${command} sent successfully.`,

            data: {
                deviceId: "esp32-01",

                state: command,

                topic: result.topic,

                published: result.published,

                timestamp:
                    new Date().toISOString()
            }
        });

    } catch (error) {

        console.error(
            "LED control error:",
            error.message
        );

        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
}


module.exports = {
    getSystemStatus,
    controlLed
};