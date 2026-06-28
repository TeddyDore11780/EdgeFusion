/**
 * EdgeFusion MQTT Service
 */

const mqtt = require("mqtt");
const mqttConfig = require("../config/mqtt");
const logger = require("./loggerService");

function startMqttClient() {
    logger.info("Connecting to MQTT Broker...");

    const client = mqtt.connect(mqttConfig.brokerUrl);

    client.on("connect", () => {
        logger.info("MQTT connected successfully", {
            broker: mqttConfig.brokerUrl
        });

        client.subscribe(mqttConfig.sensorTopic, (error) => {
            if (error) {
                logger.error("MQTT subscription failed", error.message);
                return;
            }

            logger.info(`Subscribed to topic: ${mqttConfig.sensorTopic}`);
        });
    });

    client.on("message", (topic, message) => {
        const payload = message.toString();

        logger.info("MQTT Message Received", {
            topic,
            payload,
            timestamp: new Date().toISOString()
        });
    });

    client.on("error", (error) => {
        logger.error("MQTT connection error", error.message);
    });

    client.on("close", () => {
        logger.info("MQTT connection closed");
    });

    return client;
}

module.exports = {
    startMqttClient
};
