# EdgeFusion Master Architecture Document

## Project Title

EdgeFusion: A Lightweight Serverless Edge Computing Platform for Intelligent IoT Applications

## 1. Project Overview

EdgeFusion is a serverless edge computing platform designed to process real-time event data close to where it is generated. The system uses MQTT for lightweight communication, a Node.js Edge Gateway for event handling, OpenFaaS for serverless function execution, SQLite for local storage, Docker for containerization, and Python for performance testing.

The platform is designed to support multiple event sources including IoT sensors, sports feeds, news feeds, technology feeds, and vehicle telemetry.

## 2. High-Level Architecture

```text
Event Sources
│
├── IoT Sensors
├── Sports Feed
├── News Feed
├── Technology Feed
└── Vehicle Telemetry
        │
        ▼
Mosquitto MQTT Broker
        │
        ▼
Node.js Edge Gateway
        │
        ├── Data Validation
        ├── Event Routing
        ├── Timestamping
        ├── Logging
        ├── API Services
        └── Function Triggering
        │
        ▼
OpenFaaS Serverless Functions
        │
        ▼
SQLite Local Storage
        │
        ▼
React Dashboard
        │
        ▼
Python Performance Analysis
