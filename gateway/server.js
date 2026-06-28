/**
 * ==========================================================
 * EdgeFusion Node.js Edge Gateway
 * ==========================================================
 */

require("dotenv").config();

const app = require("./src/app");
const { startMqttClient } = require("./src/services/mqttService");
const logger = require("./src/services/loggerService");

const PORT = process.env.PORT || 3000;

startMqttClient();

app.listen(PORT, () => {
    logger.info("EdgeFusion Gateway Started", {
        port: PORT,
        url: `http://localhost:${PORT}`
    });
});
