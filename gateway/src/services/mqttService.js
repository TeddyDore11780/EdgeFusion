/**
 * EdgeFusion MQTT Service
 *
 * ESP32-01:
 *   DHT22 -> Temperature / Humidity
 *   LDR   -> Light
 *   PIR   -> Motion
 *
 * Physical LED feedback:
 *   DHT22 LED
 *   LDR LED
 *   PIR LED
 *
 * Existing GPIO2 LED control is preserved for
 * Settings -> Hardware Test.
 */

const mqtt = require("mqtt");
const axios = require("axios");

const mqttConfig = require("../config/mqtt");
const logger = require("./loggerService");

const {
    insertSensorData,
    insertAlert
} = require("../database/sqliteService");

const {
    emitSensorProcessed,
    emitAlertCreated,
    emitLedState
} = require("./socketService");

const OPENFAAS_FUNCTION_URL =
    process.env.OPENFAAS_FUNCTION_URL ||
    "http://127.0.0.1:8081/function/process-sensor-data";

let mqttClient = null;

let mqttStatus = "Offline";
let mqttMessagesReceived = 0;
let lastMqttMessageAt = null;

// =====================================================
// PHYSICAL ESP32 STATE
// =====================================================

const physicalEdgeDevice = {
    deviceId: "esp32-01",

    status: "Offline",

    lastSeen: null,

    sensors: {
        temperature: null,
        humidity: null,
        light: null,
        motion: false
    },

    leds: {
        dht22: {
            state: "UNKNOWN",
            gpio: null,
            lastUpdatedAt: null
        },

        ldr: {
            state: "UNKNOWN",
            gpio: null,
            lastUpdatedAt: null
        },

        pir: {
            state: "UNKNOWN",
            gpio: null,
            lastUpdatedAt: null
        }
    }
};

// =====================================================
// MQTT TOPICS
// =====================================================

const LED_STATE_TOPIC =
    "edgefusion/esp32/esp32-01/led/state";

const SENSOR_LED_STATE_TOPIC =
    "edgefusion/esp32/esp32-01/sensors/led/state";

const LED_COMMAND_TOPIC =
    "edgefusion/esp32/esp32-01/led";

// =====================================================
// UPDATE SENSOR LED STATE
// =====================================================

function updateSensorLedState(sensor, state, topic) {
    const normalizedSensor =
        String(sensor || "").trim().toLowerCase();

    const normalizedState =
        String(state || "").trim().toUpperCase();

    if (!["ON", "OFF", "BLINKING", "UNKNOWN"].includes(normalizedState)) {
        logger.error(
            "Invalid sensor LED state received",
            {
                sensor: normalizedSensor,
                state: normalizedState
            }
        );

        return;
    }

    if (
        !physicalEdgeDevice.leds[
            normalizedSensor
        ]
    ) {
        logger.error(
            "Unknown sensor LED received",
            {
                sensor: normalizedSensor
            }
        );

        return;
    }

    const timestamp =
        new Date().toISOString();

    physicalEdgeDevice.leds[
        normalizedSensor
    ].state = normalizedState;

    physicalEdgeDevice.leds[
        normalizedSensor
    ].lastUpdatedAt = timestamp;

    const ledData = {
        deviceId: physicalEdgeDevice.deviceId,

        sensor: normalizedSensor,

        state: normalizedState,

        topic,

        timestamp
    };

    logger.info(
        "Physical sensor LED state received",
        ledData
    );

    emitLedState(ledData);
}

// =====================================================
// UPDATE SENSOR DATA
// =====================================================

function updatePhysicalSensorData(payload) {
    if (!payload) {
        return;
    }

    physicalEdgeDevice.status = "Online";

    physicalEdgeDevice.lastSeen =
        new Date().toISOString();

    if (
        payload.temperature !== undefined &&
        payload.temperature !== null
    ) {
        physicalEdgeDevice.sensors.temperature =
            Number(payload.temperature);
    }

    if (
        payload.humidity !== undefined &&
        payload.humidity !== null
    ) {
        physicalEdgeDevice.sensors.humidity =
            Number(payload.humidity);
    }

    if (
        payload.light !== undefined &&
        payload.light !== null
    ) {
        physicalEdgeDevice.sensors.light =
            Number(payload.light);
    }

    if (
        payload.motion !== undefined &&
        payload.motion !== null
    ) {
        physicalEdgeDevice.sensors.motion =
            Boolean(payload.motion);
    }
}

// =====================================================
// START MQTT CLIENT
// =====================================================

function startMqttClient() {
    logger.info(
        "Connecting to MQTT Broker..."
    );

    mqttClient =
        mqtt.connect(
            mqttConfig.brokerUrl
        );

    mqttClient.on("connect", () => {
        mqttStatus = "Connected";

        logger.info(
            "MQTT connected successfully",
            {
                broker:
                    mqttConfig.brokerUrl
            }
        );

        // =============================================
        // SENSOR DATA
        // =============================================

        mqttClient.subscribe(
            mqttConfig.sensorTopic,
            (error) => {
                if (error) {
                    logger.error(
                        "MQTT subscription failed",
                        error.message
                    );

                    return;
                }

                logger.info(
                    `Subscribed to topic: ${mqttConfig.sensorTopic}`
                );
            }
        );

        // =============================================
        // EXISTING GPIO2 LED FEEDBACK
        // =============================================

        mqttClient.subscribe(
            LED_STATE_TOPIC,
            (error) => {
                if (error) {
                    logger.error(
                        "LED state subscription failed",
                        error.message
                    );

                    return;
                }

                logger.info(
                    `Subscribed to LED state topic: ${LED_STATE_TOPIC}`
                );
            }
        );

        // =============================================
        // SENSOR LED FEEDBACK
        // =============================================

        mqttClient.subscribe(
            SENSOR_LED_STATE_TOPIC,
            (error) => {
                if (error) {
                    logger.error(
                        "Sensor LED subscription failed",
                        error.message
                    );

                    return;
                }

                logger.info(
                    `Subscribed to sensor LED state topic: ${SENSOR_LED_STATE_TOPIC}`
                );
            }
        );
    });

    // =================================================
    // MQTT MESSAGE
    // =================================================

    mqttClient.on(
        "message",
        async (topic, message) => {
            try {
                const messageText =
                    message.toString().trim();

                // =====================================
                // EXISTING GPIO2 LED FEEDBACK
                // =====================================

                if (
                    topic ===
                    LED_STATE_TOPIC
                ) {
                    const state =
                        messageText
                            .toUpperCase();

                    if (
                        !["ON", "OFF"].includes(
                            state
                        )
                    ) {
                        logger.error(
                            "Invalid physical LED state received",
                            {
                                state
                            }
                        );

                        return;
                    }

                    const timestamp =
                        new Date().toISOString();

                    const ledData = {
                        deviceId:
                            physicalEdgeDevice.deviceId,

                        sensor: "gpio2",

                        state,

                        topic,

                        timestamp
                    };

                    logger.info(
                        "Physical LED state received",
                        ledData
                    );

                    emitLedState(
                        ledData
                    );

                    return;
                }

                // =====================================
                // SENSOR LED FEEDBACK
                // =====================================

                if (
                    topic ===
                    SENSOR_LED_STATE_TOPIC
                ) {
                    let ledPayload;

                    try {
                        ledPayload =
                            JSON.parse(
                                messageText
                            );
                    } catch {
                        logger.error(
                            "Invalid sensor LED JSON payload",
                            {
                                message:
                                    messageText
                            }
                        );

                        return;
                    }

                    /*
                     Expected payload:

                     {
                       "deviceId": "esp32-01",
                       "sensor": "dht22",
                       "state": "ON"
                     }

                     or:

                     {
                       "deviceId": "esp32-01",
                       "sensor": "pir",
                       "state": "ON"
                     }
                    */

                    updateSensorLedState(
                        ledPayload.sensor,
                        ledPayload.state,
                        topic
                    );

                    return;
                }

                // =====================================
                // SENSOR DATA
                // =====================================

                mqttMessagesReceived += 1;

                lastMqttMessageAt =
                    new Date().toISOString();

                const payload =
                    JSON.parse(
                        messageText
                    );

                logger.info(
                    "MQTT Message Received",
                    {
                        topic,
                        payload,
                        timestamp:
                            lastMqttMessageAt
                    }
                );

                // =====================================
                // UPDATE PHYSICAL DEVICE
                // =====================================

                updatePhysicalSensorData(
                    payload
                );

                // =====================================
                // OPENFAAS
                // =====================================

                const response =
                    await axios.post(
                        OPENFAAS_FUNCTION_URL,
                        payload,
                        {
                            headers: {
                                "Content-Type":
                                    "application/json"
                            }
                        }
                    );

                logger.info(
                    "OpenFaaS Response",
                    response.data
                );

                const processedData =
                    response.data;

                // =====================================
                // SQLITE
                // =====================================

                insertSensorData(
                    processedData
                );

                logger.info(
                    "Sensor data saved to SQLite",
                    {
                        deviceId:
                            processedData.deviceId,

                        status:
                            processedData.status
                    }
                );

                // =====================================
                // SOCKET.IO
                // =====================================

                emitSensorProcessed(
                    processedData
                );

                // =====================================
                // HIGH TEMPERATURE ALERT
                // =====================================

                if (
                    processedData.status ===
                    "HIGH_TEMPERATURE"
                ) {
                    const alert = {
                        deviceId:
                            processedData.deviceId,

                        alertType:
                            "HIGH_TEMPERATURE",

                        message:
                            `High temperature detected: ${processedData.temperature}°C`,

                        severity:
                            "critical",

                        temperature:
                            processedData.temperature,

                        humidity:
                            processedData.humidity,

                        createdAt:
                            processedData.processedAt ||
                            new Date().toISOString()
                    };

                    insertAlert(
                        alert
                    );

                    emitAlertCreated(
                        alert
                    );

                    logger.info(
                        "Alert created",
                        alert
                    );
                }

                logger.info(
                    "Live dashboard event emitted",
                    {
                        event:
                            "sensor:processed",

                        deviceId:
                            processedData.deviceId
                    }
                );

            } catch (error) {
                logger.error(
                    "MQTT/OpenFaaS processing error",
                    {
                        message:
                            error.message,

                        code:
                            error.code,

                        status:
                            error.response?.status,

                        response:
                            error.response?.data
                    }
                );
            }
        }
    );

    // =================================================
    // MQTT ERROR
    // =================================================

    mqttClient.on(
        "error",
        (error) => {
            mqttStatus = "Error";

            physicalEdgeDevice.status =
                "Offline";

            logger.error(
                "MQTT connection error",
                error.message
            );
        }
    );

    // =================================================
    // MQTT CLOSE
    // =================================================

    mqttClient.on(
        "close",
        () => {
            mqttStatus =
                "Disconnected";

            physicalEdgeDevice.status =
                "Offline";

            logger.info(
                "MQTT connection closed"
            );
        }
    );

    return mqttClient;
}

// =====================================================
// EXISTING GPIO2 LED COMMAND
// =====================================================

function publishLedCommand(command) {
    const normalizedCommand =
        String(command)
            .trim()
            .toUpperCase();

    if (
        !["ON", "OFF"].includes(
            normalizedCommand
        )
    ) {
        throw new Error(
            "LED command must be ON or OFF"
        );
    }

    if (!mqttClient) {
        throw new Error(
            "MQTT client is not initialized"
        );
    }

    if (!mqttClient.connected) {
        throw new Error(
            "MQTT client is not connected"
        );
    }

    mqttClient.publish(
        LED_COMMAND_TOPIC,
        normalizedCommand,
        (error) => {
            if (error) {
                logger.error(
                    "LED command publish failed",
                    {
                        topic:
                            LED_COMMAND_TOPIC,

                        command:
                            normalizedCommand,

                        error:
                            error.message
                    }
                );

                return;
            }

            logger.info(
                "LED command published",
                {
                    topic:
                        LED_COMMAND_TOPIC,

                    command:
                        normalizedCommand
                }
            );
        }
    );

    return {
        topic:
            LED_COMMAND_TOPIC,

        command:
            normalizedCommand,

        published: true
    };
}

// =====================================================
// MQTT STATS
// =====================================================

function getMqttStats() {
    return {
        status:
            mqttStatus,

        topic:
            mqttConfig.sensorTopic,

        messagesReceived:
            mqttMessagesReceived,

        lastMessageAt:
            lastMqttMessageAt,

        physicalEdgeDevice:
            physicalEdgeDevice,

        physicalLed: {
            state:
                physicalEdgeDevice
                    .leds
                    .dht22
                    .state,

            lastUpdatedAt:
                physicalEdgeDevice
                    .leds
                    .dht22
                    .lastUpdatedAt,

            deviceId:
                physicalEdgeDevice.deviceId,

            gpio: 2,

            commandTopic:
                LED_COMMAND_TOPIC,

            stateTopic:
                LED_STATE_TOPIC
        }
    };
}

// =====================================================
// EXPORTS
// =====================================================

module.exports = {
    startMqttClient,
    getMqttStats,
    publishLedCommand
};
