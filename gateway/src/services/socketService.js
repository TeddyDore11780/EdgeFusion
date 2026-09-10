const { Server } = require("socket.io");

let io = null;
let connectedClients = 0;
let totalEventsEmitted = 0;

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
            connectedClients = Math.max(connectedClients - 1, 0);
            console.log("Dashboard disconnected:", socket.id);
        });
    });
}

function emitSensorProcessed(data) {
    if (io) {
        totalEventsEmitted += 1;
        io.emit("sensor:processed", data);
    }
}

function emitAlertCreated(data) {
    if (io) {
        totalEventsEmitted += 1;
        io.emit("alert:created", data);
    }
}

// =====================================================
// LED STATE FEEDBACK
// =====================================================

function emitLedState(data) {
    if (io) {
        totalEventsEmitted += 1;

        io.emit("led:state", data);

        console.log("LED state emitted:", data);
    }
}

function getSocketStats() {
    return {
        status: io ? "Online" : "Offline",
        connectedClients,
        totalEventsEmitted
    };
}

module.exports = {
    initializeSocket,
    emitSensorProcessed,
    emitAlertCreated,
    emitLedState,
    getSocketStats
};