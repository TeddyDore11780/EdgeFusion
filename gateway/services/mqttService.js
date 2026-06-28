/**
 * ==========================================================
 * EdgeFusion MQTT Service
 * ----------------------------------------------------------
 * Connects the Node.js Edge Gateway to the Mosquitto broker.
 * Subscribes to MQTT topics and processes incoming messages.
 * ==========================================================
 */

const mqtt = require("mqtt");

const MQTT_BROKER_URL = process.env.MQTT_BROKER_URL || "mqtt://localhost:1883";
const SENSOR_TOPIC = process.env.SENSOR_TOPIC || "sensor/data";

function startMqttClient() {
    console.log("====================================");
    console.log(" Connecting to MQTT Broker...");
    console.log("====================================");

    const client = mqtt.connect(MQTT_BROKER_URL);

    client.on("connect", () => {
        console.log("MQTT connected successfully");
        console.log(`Broker: ${MQTT_BROKER_URL}`);

        client.subscribe(SENSOR_TOPIC, (error) => {
            if (error) {
                console.error("MQTT subscription failed:", error.message);
                return;
            }

            console.log(`Subscribed to topic: ${SENSOR_TOPIC}`);
        });
    });

    client.on("message", (topic, message) => {
        const payload = message.toString();

        console.log("====================================");
        console.log("MQTT Message Received");
        console.log("Topic:", topic);
        console.log("Payload:", payload);
        console.log("Timestamp:", new Date().toISOString());
        console.log("====================================");
    });

    client.on("error", (error) => {
        console.error("MQTT connection error:", error.message);
    });

    client.on("close", () => {
        console.log("MQTT connection closed");
    });

    return client;
}

module.exports = {
    startMqttClient
};
