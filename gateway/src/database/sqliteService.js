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

// =====================================================
// DATABASE INITIALIZATION
// =====================================================

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

    db.run(sensorSql, (error) => {
        if (error) {
            console.error(
                "sensor_data table initialization error:",
                error.message
            );
        }
    });

    db.run(alertSql, (error) => {
        if (error) {
            console.error(
                "alerts table initialization error:",
                error.message
            );
        }
    });

    // =================================================
    // PERFORMANCE INDEXES
    // =================================================

    db.run(
        `
        CREATE INDEX IF NOT EXISTS idx_sensor_data_id
        ON sensor_data(id DESC)
        `,
        (error) => {
            if (error) {
                console.error(
                    "sensor_data id index error:",
                    error.message
                );
            }
        }
    );

    db.run(
        `
        CREATE INDEX IF NOT EXISTS idx_sensor_data_status
        ON sensor_data(status)
        `,
        (error) => {
            if (error) {
                console.error(
                    "sensor_data status index error:",
                    error.message
                );
            }
        }
    );

    db.run(
        `
        CREATE INDEX IF NOT EXISTS idx_sensor_data_device
        ON sensor_data(deviceId)
        `,
        (error) => {
            if (error) {
                console.error(
                    "sensor_data device index error:",
                    error.message
                );
            }
        }
    );

    db.run(
        `
        CREATE INDEX IF NOT EXISTS idx_alerts_id
        ON alerts(id DESC)
        `,
        (error) => {
            if (error) {
                console.error(
                    "alerts id index error:",
                    error.message
                );
            }
        }
    );
}

// =====================================================
// INSERT SENSOR DATA
// =====================================================

function insertSensorData(data) {
    const sql = `
        INSERT INTO sensor_data
        (
            deviceId,
            temperature,
            humidity,
            light,
            motion,
            status,
            processed,
            processedAt
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.run(
        sql,
        [
            data.deviceId,
            data.temperature,
            data.humidity,
            data.light ?? 0,
            data.motion ? 1 : 0,
            data.status,
            data.processed ? 1 : 0,
            data.processedAt
        ],
        (error) => {
            if (error) {
                console.error(
                    "Sensor data insert error:",
                    error.message
                );
            }
        }
    );
}

// =====================================================
// INSERT ALERT
// =====================================================

function insertAlert(alert) {
    const sql = `
        INSERT INTO alerts
        (
            deviceId,
            alertType,
            message,
            severity,
            temperature,
            humidity,
            createdAt
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    db.run(
        sql,
        [
            alert.deviceId,
            alert.alertType,
            alert.message,
            alert.severity,
            alert.temperature,
            alert.humidity,
            alert.createdAt
        ],
        (error) => {
            if (error) {
                console.error(
                    "Alert insert error:",
                    error.message
                );
            }
        }
    );
}

// =====================================================
// GET ALL SENSOR DATA
// =====================================================
//
// IMPORTANT:
// The dashboard does not need 60,000+ records every
// time the Sensors page loads.
//
// We retain the same function name and callback API,
// but return the most recent 500 records.
//
// Live Socket.IO updates continue to provide the
// real-time sensor stream.
// =====================================================

function getAllSensorData(callback) {
    db.all(
        `
        SELECT *
        FROM sensor_data
        ORDER BY id DESC
        LIMIT 500
        `,
        [],
        callback
    );
}

// =====================================================
// GET LATEST SENSOR DATA
// =====================================================

function getLatestSensorData(callback) {
    db.get(
        `
        SELECT *
        FROM sensor_data
        ORDER BY id DESC
        LIMIT 1
        `,
        [],
        callback
    );
}

// =====================================================
// GET HIGH TEMPERATURE DATA
// =====================================================

function getHighTemperatureData(callback) {
    db.all(
        `
        SELECT *
        FROM sensor_data
        WHERE status = 'HIGH_TEMPERATURE'
        ORDER BY id DESC
        LIMIT 500
        `,
        [],
        callback
    );
}

// =====================================================
// GET RECENT ALERTS
// =====================================================

function getRecentAlerts(callback) {
    db.all(
        `
        SELECT *
        FROM alerts
        ORDER BY id DESC
        LIMIT 30
        `,
        [],
        callback
    );
}

// =====================================================
// EXPORTS
// =====================================================

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