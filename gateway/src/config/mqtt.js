/**
 * EdgeFusion MQTT Configuration
 */

module.exports = {
    brokerUrl: process.env.MQTT_BROKER_URL || "mqtt://localhost:1883",
    sensorTopic: process.env.SENSOR_TOPIC || "sensor/data"
};
