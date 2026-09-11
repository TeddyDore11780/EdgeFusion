const { Server } = require("socket.io");

let io = null;
let connectedClients = 0;
let totalEventsEmitted = 0;

// =====================================================
// INITIALIZE SOCKET.IO
// =====================================================

function initializeSocket(server) {
    io = new Server(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"]
        }
    });

    io.on("connection", (socket) => {
        connectedClients += 1;

        console.log("Dashboard connected:", socket.id);

        socket.emit("gateway:connected", {
            message: "Connected to EdgeFusion Gateway",
            timestamp: new Date().toISOString()
        });

        socket.on("disconnect", () => {
            connectedClients = Math.max(
                connectedClients - 1,
                0
            );

            console.log(
                "Dashboard disconnected:",
                socket.id
            );
        });
    });
}

// =====================================================
// SENSOR PROCESSED EVENT
// =====================================================

function emitSensorProcessed(data) {
    if (!io) return;

    totalEventsEmitted += 1;

    io.emit("sensor:processed", data);
}

// =====================================================
// ALERT CREATED EVENT
// =====================================================

function emitAlertCreated(data) {
    if (!io) return;

    totalEventsEmitted += 1;

    io.emit("alert:created", data);
}

// =====================================================
// LED STATE FEEDBACK
// =====================================================

function emitLedState(data) {
    if (!io) return;

    totalEventsEmitted += 1;

    io.emit("led:state", data);

    console.log("LED state emitted:", data);
}

// =====================================================
// SENSOR LED STATE
// =====================================================

function emitSensorLedState(data) {
    if (!io) return;

    totalEventsEmitted += 1;

    io.emit("sensor:led:state", data);

    console.log(
        "Sensor LED state emitted:",
        data
    );
}

// =====================================================
// HARDWARE STATE
// =====================================================

function emitHardwareState(data) {
    if (!io) return;

    totalEventsEmitted += 1;

    io.emit("hardware:state", data);

    console.log(
        "Hardware state emitted:",
        data
    );
}

// =====================================================
// SOCKET STATISTICS
// =====================================================

function getSocketStats() {
    return {
        status: io ? "Online" : "Offline",
        connectedClients,
        totalEventsEmitted
    };
}

// =====================================================
// EXPORTS
// =====================================================

module.exports = {
    initializeSocket,
    emitSensorProcessed,
    emitAlertCreated,
    emitLedState,
    emitSensorLedState,
    emitHardwareState,
    getSocketStats
};