const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const dbPath = path.join(__dirname, "../../database/edgefusion.db");

const db = new sqlite3.Database(dbPath, (error) => {
    if (error) {
        console.error("SQLite connection error:", error.message);
    } else {
        console.log("SQLite database connected:", dbPath);
    }
});

function initializeDatabase() {
    const sensorSql = `
        CREATE TABLE IF NOT EXISTS sensor_data (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            deviceId TEXT,
            temperature REAL,
            humidity REAL,
            light REAL,
            motion INTEGER,
            status TEXT,
            processed INTEGER,
            processedAt TEXT
        )
    `;

    const alertSql = `
        CREATE TABLE IF NOT EXISTS alerts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            deviceId TEXT,
            alertType TEXT,
            message TEXT,
            severity TEXT,
            temperature REAL,
            humidity REAL,
            createdAt TEXT
        )
    `;

    db.run(sensorSql);
    db.run(alertSql);
}

function insertSensorData(data) {
    const sql = `
        INSERT INTO sensor_data
        (deviceId, temperature, humidity, light, motion, status, processed, processedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.run(sql, [
        data.deviceId,
        data.temperature,
        data.humidity,
        data.light ?? 0,
        data.motion ? 1 : 0,
        data.status,
        data.processed ? 1 : 0,
        data.processedAt
    ]);
}

function insertAlert(alert) {
    const sql = `
        INSERT INTO alerts
        (deviceId, alertType, message, severity, temperature, humidity, createdAt)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    db.run(sql, [
        alert.deviceId,
        alert.alertType,
        alert.message,
        alert.severity,
        alert.temperature,
        alert.humidity,
        alert.createdAt
    ]);
}

function getAllSensorData(callback) {
    db.all(
        "SELECT * FROM sensor_data ORDER BY id DESC",
        [],
        callback
    );
}

function getLatestSensorData(callback) {
    db.get(
        "SELECT * FROM sensor_data ORDER BY id DESC LIMIT 1",
        [],
        callback
    );
}

function getHighTemperatureData(callback) {
    db.all(
        "SELECT * FROM sensor_data WHERE status = 'HIGH_TEMPERATURE' ORDER BY id DESC",
        [],
        callback
    );
}

function getRecentAlerts(callback) {
    db.all(
        "SELECT * FROM alerts ORDER BY id DESC LIMIT 30",
        [],
        callback
    );
}

module.exports = {
    db,
    initializeDatabase,
    insertSensorData,
    insertAlert,
    getAllSensorData,
    getLatestSensorData,
    getHighTemperatureData,
    getRecentAlerts
};
