# EdgeFusion

## Serverless Edge Computing Framework for Edge Devices

EdgeFusion is a prototype edge-computing framework designed to demonstrate
local data processing, serverless execution, IoT communication, persistent
storage, and real-time monitoring at the edge.

The system is designed for environments where sensor data should be processed
close to the physical device rather than relying entirely on a remote cloud
service.

---

## 1. Project Overview

EdgeFusion connects physical IoT sensors to a local edge gateway through MQTT.

Sensor data follows this processing pipeline:

ESP32
  ↓
MQTT
  ↓
Mosquitto Broker
  ↓
EdgeFusion Gateway
  ↓
OpenFaaS Function
  ↓
SQLite
  ↓
REST API / Socket.IO
  ↓
React Dashboard

The architecture demonstrates how serverless functions can be integrated
into an edge-computing environment.

---

## 2. Current Prototype

The current prototype supports:

- ESP32 sensor integration
- DHT22 temperature and humidity monitoring
- LDR light-level monitoring
- PIR motion detection
- MQTT communication
- Mosquitto MQTT broker
- Node.js edge gateway
- OpenFaaS serverless processing
- SQLite local data storage
- REST API
- Socket.IO real-time communication
- React monitoring dashboard
- Physical ESP32 LED control
- Live sensor updates
- High-temperature alert processing
- Local-network mobile dashboard access

---

## 3. Technology Stack

### Edge Device

- ESP32
- DHT22
- LDR
- PIR
- LED indicators
- Wi-Fi

### Communication

- MQTT
- Mosquitto

### Edge Gateway

- Node.js
- Express
- Axios
- Socket.IO

### Serverless Processing

- OpenFaaS
- Kubernetes / k3d

### Storage

- SQLite

### Dashboard

- React
- Vite
- Recharts
- Socket.IO Client
- Axios

### Infrastructure

- Docker
- Docker Compose
- WSL2 Ubuntu
- Windows 11

---

## 4. Repository Structure

```text
EdgeFusion/
├── dashboard/
├── gateway/
├── functions/
├── mqtt/
├── database/
├── performance-tests/
├── docs/
├── docker-compose.yml
├── .gitignore
└── README.md
