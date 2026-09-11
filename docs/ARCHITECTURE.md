# EdgeFusion Architecture

## 1. Overview

EdgeFusion is a serverless edge-computing framework prototype for collecting,
processing, storing, and visualising IoT sensor data close to the edge.

## 2. Current Architecture

```text
ESP32-01
   │
   │ Wi-Fi / MQTT
   ▼
Mosquitto MQTT Broker
   │
   ▼
EdgeFusion Node.js Gateway
   │
   ├── OpenFaaS
   │      │
   │      ▼
   │   Process Sensor Data
   │
   ├── SQLite
   │
   └── Socket.IO
          │
          ▼
     React Dashboard
          │
      ┌───┴───┐
      ▼       ▼
     PC     Mobile
