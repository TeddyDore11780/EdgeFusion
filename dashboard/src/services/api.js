import axios from "axios";

const API_BASE_URL = "http://10.196.164.205:3000/api/v1";

const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 5000,
});

export async function getDashboardSummary() {
    const response = await api.get("/dashboard");
    return response.data;
}

export async function getAllSensors() {
    const response = await api.get("/sensors");
    return response.data;
}

export async function getLatestSensor() {
    const response = await api.get("/sensors/latest");
    return response.data;
}

export async function getHighTemperatureSensors() {
    const response = await api.get("/sensors/high");
    return response.data;
}

/*
|--------------------------------------------------------------------------
| Alerts
|--------------------------------------------------------------------------
*/

export async function getAlerts() {
    const response = await api.get("/alerts");
    return response.data;
}

/*
|--------------------------------------------------------------------------
| Gateway
|--------------------------------------------------------------------------
*/

export async function getGatewayHealth() {
    const response = await api.get("/health");
    return response.data;
}

export async function getGatewayStatus() {
    const response = await api.get("/status");
    return response.data;
}

/*
|--------------------------------------------------------------------------
| System
|--------------------------------------------------------------------------
*/

export async function getSystemStatus() {
    const response = await api.get("/system");
    return response.data;
}

export default api;