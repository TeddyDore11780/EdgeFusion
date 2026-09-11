# EdgeFusion API Reference

## 1. Overview

The EdgeFusion Edge Gateway exposes a REST API for system monitoring,
sensor data retrieval, alert management, dashboard data, and physical
edge-device control.

Base URL:

`http://<edgefusion-host>:3000/api/v1`

For the local prototype:

`http://localhost:3000/api/v1`

---

## 2. Health Check

### GET `/health`

Checks whether the EdgeFusion Gateway is operational.

Example:

`curl http://localhost:3000/api/v1/health`

---

## 3. System Status

### GET `/system`

Returns the operational status of the EdgeFusion platform.

The response includes information relating to:

- Gateway
- Node.js runtime
- MQTT
- Socket.IO
- SQLite database
- OpenFaaS
- Physical edge device
- Physical LED

Example:

`curl http://localhost:3000/api/v1/system`

---

## 4. Sensor Data

### GET `/sensors`

Returns the most recent sensor records stored by EdgeFusion.

The current implementation returns the latest 500 records to maintain
responsive dashboard performance.

Example:

`curl http://localhost:3000/api/v1/sensors`

---

## 5. Dashboard Data

### GET `/dashboard`

Returns dashboard-oriented information used by the React frontend.

The response includes:

- Total records
- High-temperature alerts
- Total alerts
- Average temperature
- Average humidity
- Highest temperature
- Lowest temperature
- Active devices
- Alert rate
- Device statistics
- Latest sensor reading
- Latest alerts
- Recent sensor readings

Example:

`curl http://localhost:3000/api/v1/dashboard`

---

## 6. Alerts

### GET `/alerts`

Returns recorded system and sensor alerts.

Example:

`curl http://localhost:3000/api/v1/alerts`

---

## 7. Physical LED Control

### POST `/system/led`

Controls the GPIO2 LED on the physical ESP32 edge device.

Request body:

```json
{
  "state": "ON"
}
