/**
 * ==========================================================
 * EdgeFusion Node.js Edge Gateway
 * ==========================================================
 */

require("dotenv").config();

const http = require("http");

const app = require("./src/app");
const { startMqttClient } = require("./src/services/mqttService");
const { initializeDatabase } = require("./src/database/sqliteService");
const { initializeSocket } = require("./src/services/socketService");
const logger = require("./src/services/loggerService");

const PORT = process.env.PORT || 3000;

initializeDatabase();

const server = http.createServer(app);

initializeSocket(server);

startMqttClient();

server.listen(PORT, () => {
    logger.info("EdgeFusion Gateway Started", {
        port: PORT,
        url: `http://localhost:${PORT}`
    });
});