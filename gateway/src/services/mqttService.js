/**
 * EdgeFusion MQTT Service
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
    emitAlertCreated
} = require("./socketService");

const OPENFAAS_FUNCTION_URL =
    process.env.OPENFAAS_FUNCTION_URL ||
    "http://127.0.0.1:8081/function/process-sensor-data";

let mqttClient = null;
let mqttStatus = "Offline";
let mqttMessagesReceived = 0;
let lastMqttMessageAt = null;

// =====================================================
// LED STATE
// =====================================================

const ledStateTopic =
    "edgefusion/esp32/esp32-01/led/state";

let ledState = "OFF";
let lastLedStateAt = null;

// =====================================================
// START MQTT CLIENT
// =====================================================

function startMqttClient() {
    logger.info("Connecting to MQTT Broker...");

    mqttClient = mqtt.connect(mqttConfig.brokerUrl);

    mqttClient.on("connect", () => {
        mqttStatus = "Connected";

        logger.info("MQTT connected successfully", {
            broker: mqttConfig.brokerUrl
        });

        // -------------------------------------------------
        // Subscribe to sensor topic
        // -------------------------------------------------

        mqttClient.subscribe(mqttConfig.sensorTopic, (error) => {
            if (error) {
                logger.error(
                    "MQTT sensor subscription failed",
                    error.message
                );
                return;
            }

            logger.info(
                `Subscribed to topic: ${mqttConfig.sensorTopic}`
            );
        });

        // -------------------------------------------------
        // Subscribe to physical LED state feedback
        // -------------------------------------------------

        mqttClient.subscribe(ledStateTopic, (error) => {
            if (error) {
                logger.error(
                    "MQTT LED state subscription failed",
                    error.message
                );
                return;
            }

            logger.info(
                `Subscribed to LED state topic: ${ledStateTopic}`
            );
        });
    });

    // =====================================================
    // MQTT MESSAGE HANDLER
    // =====================================================

    mqttClient.on("message", async (topic, message) => {

        // =================================================
        // LED STATE FEEDBACK
        // =================================================

        if (topic === ledStateTopic) {

            const state = message
                .toString()
                .trim()
                .toUpperCase();

            if (!["ON", "OFF"].includes(state)) {
                logger.warn("Invalid LED state received", {
                    topic,
                    state
                });

                return;
            }

            ledState = state;
            lastLedStateAt = new Date().toISOString();

            logger.info("Physical LED state received", {
                deviceId: "esp32-01",
                state: ledState,
                topic,
                timestamp: lastLedStateAt
            });

            // Send actual physical LED state to dashboard
            try {
                const {
                    emitLedState
                } = require("./socketService");

                emitLedState({
                    deviceId: "esp32-01",
                    state: ledState,
                    topic,
                    timestamp: lastLedStateAt
                });

            } catch (error) {
                logger.error(
                    "Failed to emit LED state",
                    error.message
                );
            }

            return;
        }

        // =================================================
        // SENSOR DATA
        // =================================================

        if (topic !== mqttConfig.sensorTopic) {
            return;
        }

        try {
            mqttMessagesReceived += 1;
            lastMqttMessageAt = new Date().toISOString();

            const payload = JSON.parse(message.toString());

            logger.info("MQTT Message Received", {
                topic,
                payload,
                timestamp: lastMqttMessageAt
            });

            const response = await axios.post(
                OPENFAAS_FUNCTION_URL,
                payload,
                {
                    headers: {
                        "Content-Type": "application/json"
                    }
                }
            );

            logger.info(
                "OpenFaaS Response",
                response.data
            );

            const processedData = response.data;

            insertSensorData(processedData);

            logger.info("Sensor data saved to SQLite", {
                deviceId: processedData.deviceId,
                status: processedData.status
            });

            emitSensorProcessed(processedData);

            if (processedData.status === "HIGH_TEMPERATURE") {

                const alert = {
                    deviceId: processedData.deviceId,
                    alertType: "HIGH_TEMPERATURE",
                    message:
                        `High temperature detected: ${processedData.temperature}°C`,
                    severity: "critical",
                    temperature: processedData.temperature,
                    humidity: processedData.humidity,
                    createdAt:
                        processedData.processedAt ||
                        new Date().toISOString()
                };

                insertAlert(alert);

                emitAlertCreated(alert);

                logger.info(
                    "Alert created",
                    alert
                );
            }

            logger.info(
                "Live dashboard event emitted",
                {
                    event: "sensor:processed",
                    deviceId: processedData.deviceId
                }
            );

        } catch (error) {

            logger.error(
                "MQTT/OpenFaaS processing error",
                {
                    message: error.message,
                    code: error.code,
                    status: error.response?.status,
                    response: error.response?.data
                }
            );
        }
    });

    // =====================================================
    // MQTT ERROR
    // =====================================================

    mqttClient.on("error", (error) => {
        mqttStatus = "Error";

        logger.error(
            "MQTT connection error",
            error.message
        );
    });

    // =====================================================
    // MQTT CLOSE
    // =====================================================

    mqttClient.on("close", () => {
        mqttStatus = "Disconnected";

        logger.info(
            "MQTT connection closed"
        );
    });

    return mqttClient;
}

// =====================================================
// PUBLISH LED COMMAND
// =====================================================

function publishLedCommand(command) {

    const normalizedCommand =
        String(command)
            .trim()
            .toUpperCase();

    if (!["ON", "OFF"].includes(normalizedCommand)) {
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

    const topic =
        "edgefusion/esp32/esp32-01/led";

    mqttClient.publish(
        topic,
        normalizedCommand,
        (error) => {

            if (error) {

                logger.error(
                    "LED command publish failed",
                    {
                        topic,
                        command: normalizedCommand,
                        error: error.message
                    }
                );

                return;
            }

            logger.info(
                "LED command published",
                {
                    topic,
                    command: normalizedCommand
                }
            );
        }
    );

    return {
        topic,
        command: normalizedCommand,
        published: true
    };
}

// =====================================================
// GET ACTUAL LED STATE
// =====================================================

function getLedState() {
    return {
        deviceId: "esp32-01",
        state: ledState,
        topic: ledStateTopic,
        lastUpdatedAt: lastLedStateAt
    };
}

// =====================================================
// MQTT STATS
// =====================================================

function getMqttStats() {
    return {
        status: mqttStatus,
        topic: mqttConfig.sensorTopic,
        messagesReceived: mqttMessagesReceived,
        lastMessageAt: lastMqttMessageAt
    };
}

// =====================================================
// EXPORTS
// =====================================================

module.exports = {
    startMqttClient,
    getMqttStats,
    publishLedCommand,
    getLedState
};