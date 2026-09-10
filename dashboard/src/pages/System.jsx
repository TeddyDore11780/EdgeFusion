import { useEffect, useState } from "react";

import PageHeader from "../components/layout/PageHeader";
import { getSystemStatus } from "../services/api";
import { socket } from "../services/socket";

function formatUptime(seconds) {
    if (!seconds) return "0s";

    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    return `${hrs}h ${mins}m ${secs}s`;
}

function formatDate(value) {
    if (!value) return "No messages yet";
    return new Date(value).toLocaleString();
}

export default function System() {
    const [system, setSystem] = useState(null);
    const [loading, setLoading] = useState(true);

    // =====================================================
    // LED CONTROL / ACTUAL DEVICE STATE
    // =====================================================

    const [ledState, setLedState] = useState("OFF");
    const [ledLoading, setLedLoading] = useState(false);
    const [ledMessage, setLedMessage] = useState("");
    const [ledLastUpdated, setLedLastUpdated] = useState(null);

    // =====================================================
    // LOAD SYSTEM STATUS
    // =====================================================

    async function loadSystem() {
        try {
            const response = await getSystemStatus();

            setSystem(response.data);

            // Get the ACTUAL physical LED state from the Gateway
            if (response.data?.physicalEdgeDevice?.led?.state) {
                setLedState(
                    response.data.physicalEdgeDevice.led.state
                );
            }

            if (response.data?.physicalEdgeDevice?.led?.lastUpdatedAt) {
                setLedLastUpdated(
                    response.data.physicalEdgeDevice.led.lastUpdatedAt
                );
            }

        } catch (error) {
            console.error(
                "System load error:",
                error.message
            );
        } finally {
            setLoading(false);
        }
    }

    // =====================================================
    // SEND LED COMMAND
    // =====================================================

    async function controlLed(state) {
        try {
            setLedLoading(true);
            setLedMessage("");

            const response = await fetch(
                "http://localhost:3000/api/v1/system/led",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        state
                    })
                }
            );

            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(
                    result.error || "LED command failed"
                );
            }

            // Do NOT treat the command as the actual physical state.
            // The ESP32 will confirm the real state through MQTT
            // and Socket.IO.

            setLedMessage(
                `LED command ${state} sent. Waiting for ESP32 confirmation...`
            );

        } catch (error) {

            console.error(
                "LED control error:",
                error.message
            );

            setLedMessage(
                `LED control failed: ${error.message}`
            );

        } finally {
            setLedLoading(false);
        }
    }

    // =====================================================
    // INITIAL SYSTEM LOAD + REFRESH
    // =====================================================

    useEffect(() => {
        loadSystem();

        const interval = setInterval(
            loadSystem,
            5000
        );

        return () => clearInterval(interval);
    }, []);

    // =====================================================
    // SOCKET.IO LED STATE FEEDBACK
    // =====================================================

    useEffect(() => {

        function handleLedState(data) {

            console.log(
                "Physical LED state received:",
                data
            );

            if (
                data?.deviceId === "esp32-01" &&
                ["ON", "OFF"].includes(data?.state)
            ) {

                // This is the ACTUAL physical state reported
                // by the ESP32.
                setLedState(data.state);

                if (data.timestamp) {
                    setLedLastUpdated(
                        data.timestamp
                    );
                }

                setLedMessage(
                    `Physical LED confirmed ${data.state}.`
                );
            }
        }

        socket.on(
            "led:state",
            handleLedState
        );

        return () => {
            socket.off(
                "led:state",
                handleLedState
            );
        };

    }, []);

    // =====================================================
    // LOADING STATE
    // =====================================================

    if (loading) {
        return (
            <section className="page">
                <h2>
                    Loading System Status...
                </h2>
            </section>
        );
    }

    return (
        <section className="page">

            <PageHeader
                title="System Monitoring"
                subtitle="Live runtime status of the EdgeFusion platform infrastructure."
            />

            {/* =================================================
                PHYSICAL EDGE DEVICE CONTROL
            ================================================= */}

            <div className="system-health-card">

                <h3>
                    Physical Edge Device Control
                </h3>

                <p>
                    Control the physical ESP32 actuator through
                    the EdgeFusion MQTT communication layer.
                </p>

                <div className="system-info-list">

                    <div>
                        <span>
                            Device
                        </span>

                        <strong>
                            ESP32-01
                        </strong>
                    </div>

                    <div>
                        <span>
                            Device Status
                        </span>

                        <strong className="sensor-status online">
                            {system?.physicalEdgeDevice?.status ||
                                "Online"}
                        </strong>
                    </div>

                    <div>
                        <span>
                            LED GPIO
                        </span>

                        <strong>
                            GPIO 2
                        </strong>
                    </div>

                    <div>
                        <span>
                            MQTT Command Topic
                        </span>

                        <strong>
                            edgefusion/esp32/esp32-01/led
                        </strong>
                    </div>

                    <div>
                        <span>
                            LED State
                        </span>

                        <strong>
                            {ledState}
                        </strong>
                    </div>

                    <div>
                        <span>
                            LED State Topic
                        </span>

                        <strong>
                            edgefusion/esp32/esp32-01/led/state
                        </strong>
                    </div>

                    <div>
                        <span>
                            Last Physical State Update
                        </span>

                        <strong>
                            {formatDate(
                                ledLastUpdated
                            )}
                        </strong>
                    </div>

                </div>

                {/* =================================================
                    LED STATUS INDICATOR
                ================================================= */}

                <div
                    style={{
                        marginTop: "20px",
                        padding: "16px",
                        borderRadius: "10px",
                        border: "1px solid rgba(255,255,255,0.1)"
                    }}
                >

                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "12px"
                        }}
                    >

                        <span
                            style={{
                                width: "14px",
                                height: "14px",
                                borderRadius: "50%",
                                display: "inline-block",
                                background:
                                    ledState === "ON"
                                        ? "#22c55e"
                                        : "#555"
                            }}
                        ></span>

                        <strong>
                            Physical LED:{" "}
                            {ledState}
                        </strong>

                    </div>

                    <p
                        style={{
                            marginTop: "8px",
                            marginBottom: 0
                        }}
                    >
                        State is confirmed by the ESP32 through
                        MQTT feedback.
                    </p>

                </div>

                {/* =================================================
                    LED CONTROL BUTTONS
                ================================================= */}

                <div
                    style={{
                        display: "flex",
                        gap: "12px",
                        marginTop: "20px",
                        flexWrap: "wrap"
                    }}
                >

                    <button
                        type="button"
                        onClick={() =>
                            controlLed("ON")
                        }
                        disabled={ledLoading}
                        style={{
                            padding: "12px 22px",
                            borderRadius: "8px",
                            border: "none",
                            cursor: ledLoading
                                ? "not-allowed"
                                : "pointer",
                            fontWeight: "600"
                        }}
                    >
                        {ledLoading
                            ? "Sending..."
                            : "TURN LED ON"}
                    </button>

                    <button
                        type="button"
                        onClick={() =>
                            controlLed("OFF")
                        }
                        disabled={ledLoading}
                        style={{
                            padding: "12px 22px",
                            borderRadius: "8px",
                            border: "none",
                            cursor: ledLoading
                                ? "not-allowed"
                                : "pointer",
                            fontWeight: "600"
                        }}
                    >
                        {ledLoading
                            ? "Sending..."
                            : "TURN LED OFF"}
                    </button>

                </div>

                {ledMessage && (
                    <p
                        style={{
                            marginTop: "15px"
                        }}
                    >
                        {ledMessage}
                    </p>
                )}

            </div>

            {/* =================================================
                SYSTEM COMPONENTS
            ================================================= */}

            <div className="system-grid">

                <div className="system-card">

                    <div className="system-card-header">
                        <span className="system-dot"></span>

                        <strong>
                            Gateway API
                        </strong>
                    </div>

                    <p>
                        Node.js Express gateway runtime.
                    </p>

                    <span className="sensor-status online">
                        {system.gateway}
                    </span>

                </div>

                <div className="system-card">

                    <div className="system-card-header">
                        <span className="system-dot"></span>

                        <strong>
                            MQTT Broker
                        </strong>
                    </div>

                    <p>
                        Topic: {system.mqtt.topic}
                    </p>

                    <span className="sensor-status online">
                        {system.mqtt.status}
                    </span>

                </div>

                <div className="system-card">

                    <div className="system-card-header">
                        <span className="system-dot"></span>

                        <strong>
                            OpenFaaS
                        </strong>
                    </div>

                    <p>
                        Function: {system.openfaas.function}
                    </p>

                    <span className="sensor-status online">
                        {system.openfaas.status}
                    </span>

                </div>

                <div className="system-card">

                    <div className="system-card-header">
                        <span className="system-dot"></span>

                        <strong>
                            SQLite
                        </strong>
                    </div>

                    <p>
                        Database type: {system.database.type}
                    </p>

                    <span className="sensor-status online">
                        {system.database.status}
                    </span>

                </div>

                <div className="system-card">

                    <div className="system-card-header">
                        <span className="system-dot"></span>

                        <strong>
                            Socket.IO
                        </strong>
                    </div>

                    <p>
                        {system.socketio.connectedClients}
                        {" "}
                        dashboard client(s) connected.
                    </p>

                    <span className="sensor-status online">
                        {system.socketio.status}
                    </span>

                </div>

                <div className="system-card">

                    <div className="system-card-header">
                        <span className="system-dot"></span>

                        <strong>
                            Environment
                        </strong>
                    </div>

                    <p>
                        Current runtime environment.
                    </p>

                    <span className="sensor-status online">
                        {system.environment}
                    </span>

                </div>

            </div>

            {/* =================================================
                SYSTEM METRICS
            ================================================= */}

            <div className="metric-grid">

                <div className="metric-card blue">

                    <div className="metric-title">
                        MQTT Messages
                    </div>

                    <div className="metric-value">
                        {system.mqtt.messagesReceived}
                    </div>

                    <div className="metric-subtitle">
                        Received since gateway restart
                    </div>

                    <div className="metric-status">
                        ● Live
                    </div>

                </div>

                <div className="metric-card green">

                    <div className="metric-title">
                        Socket Clients
                    </div>

                    <div className="metric-value">
                        {system.socketio.connectedClients}
                    </div>

                    <div className="metric-subtitle">
                        Connected dashboards
                    </div>

                    <div className="metric-status">
                        ● Live
                    </div>

                </div>

                <div className="metric-card orange">

                    <div className="metric-title">
                        Socket Events
                    </div>

                    <div className="metric-value">
                        {system.socketio.totalEventsEmitted}
                    </div>

                    <div className="metric-subtitle">
                        Events emitted to dashboard
                    </div>

                    <div className="metric-status">
                        ● Live
                    </div>

                </div>

                <div className="metric-card red">

                    <div className="metric-title">
                        Gateway Uptime
                    </div>

                    <div className="metric-value">
                        {formatUptime(
                            Math.round(
                                system.uptimeSeconds
                            )
                        )}
                    </div>

                    <div className="metric-subtitle">
                        Since last restart
                    </div>

                    <div className="metric-status">
                        ● Live
                    </div>

                </div>

            </div>

            <div className="metric-grid">

                <div className="metric-card blue">

                    <div className="metric-title">
                        Node Version
                    </div>

                    <div className="metric-value">
                        {system.nodeVersion}
                    </div>

                    <div className="metric-subtitle">
                        Gateway runtime
                    </div>

                    <div className="metric-status">
                        ● Live
                    </div>

                </div>

                <div className="metric-card green">

                    <div className="metric-title">
                        Heap Used
                    </div>

                    <div className="metric-value">
                        {system.memory.heapUsedMb} MB
                    </div>

                    <div className="metric-subtitle">
                        Node.js heap memory
                    </div>

                    <div className="metric-status">
                        ● Live
                    </div>

                </div>

                <div className="metric-card orange">

                    <div className="metric-title">
                        Heap Total
                    </div>

                    <div className="metric-value">
                        {system.memory.heapTotalMb} MB
                    </div>

                    <div className="metric-subtitle">
                        Allocated heap memory
                    </div>

                    <div className="metric-status">
                        ● Live
                    </div>

                </div>

                <div className="metric-card red">

                    <div className="metric-title">
                        RSS Memory
                    </div>

                    <div className="metric-value">
                        {system.memory.rssMb} MB
                    </div>

                    <div className="metric-subtitle">
                        Resident memory size
                    </div>

                    <div className="metric-status">
                        ● Live
                    </div>

                </div>

            </div>

            {/* =================================================
                RUNTIME CONFIGURATION / ARCHITECTURE
            ================================================= */}

            <div className="dashboard-grid">

                <div className="system-health-card">

                    <h3>
                        Runtime Configuration
                    </h3>

                    <div className="system-info-list">

                        <div>
                            <span>
                                Gateway URL
                            </span>

                            <strong>
                                http://localhost:3000
                            </strong>
                        </div>

                        <div>
                            <span>
                                Dashboard URL
                            </span>

                            <strong>
                                http://localhost:5173 / 5174
                            </strong>
                        </div>

                        <div>
                            <span>
                                MQTT Topic
                            </span>

                            <strong>
                                {system.mqtt.topic}
                            </strong>
                        </div>

                        <div>
                            <span>
                                MQTT Last Message
                            </span>

                            <strong>
                                {formatDate(
                                    system.mqtt.lastMessageAt
                                )}
                            </strong>
                        </div>

                        <div>
                            <span>
                                OpenFaaS Function
                            </span>

                            <strong>
                                {system.openfaas.function}
                            </strong>
                        </div>

                        <div>
                            <span>
                                Database
                            </span>

                            <strong>
                                {system.database.type}
                            </strong>
                        </div>

                        <div>
                            <span>
                                Last System Refresh
                            </span>

                            <strong>
                                {new Date(
                                    system.timestamp
                                ).toLocaleString()}
                            </strong>
                        </div>

                    </div>

                </div>

                <div className="system-health-card">

                    <h3>
                        Live Architecture
                    </h3>

                    <div className="architecture-flow">

                        <span>
                            🟢 IoT Sensor
                        </span>

                        <small>
                            ↓
                        </small>

                        <span>
                            🟢 MQTT Broker
                        </span>

                        <small>
                            ↓
                        </small>

                        <span>
                            🟢 Node.js Gateway
                        </span>

                        <small>
                            ↓
                        </small>

                        <span>
                            🟢 OpenFaaS Function
                        </span>

                        <small>
                            ↓
                        </small>

                        <span>
                            🟢 SQLite + Socket.IO
                        </span>

                        <small>
                            ↓
                        </small>

                        <span>
                            🟢 React Dashboard
                        </span>

                    </div>

                </div>

            </div>

        </section>
    );
}