import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import socket from "../services/socket";
import PageHeader from "../components/layout/PageHeader";
import MetricCard from "../components/cards/MetricCard";
import TemperatureChart from "../components/charts/TemperatureChart";
import HumidityChart from "../components/charts/HumidityChart";
import SensorTable from "../components/tables/SensorTable";
import { getDashboardSummary } from "../services/api";

export default function Dashboard() {
    const [dashboard, setDashboard] = useState(null);
    const [loading, setLoading] = useState(true);

    async function loadDashboard() {
        try {
            const response = await getDashboardSummary();
            setDashboard(response.data);
        } catch (error) {
            console.error("Dashboard load error:", error.message);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadDashboard();

        socket.on("gateway:connected", (message) => {
            console.log("Socket connected:", message);
        });

        socket.on("sensor:processed", (data) => {
            console.log("Live sensor update:", data);

            toast.success(
                `${data.deviceId} • ${data.temperature}°C • ${data.humidity}%`,
                {
                    duration: 4000,
                }
            );

            loadDashboard();
        });

        return () => {
            socket.off("gateway:connected");
            socket.off("sensor:processed");
        };
    }, []);

    if (loading) {
        return (
            <section className="page">
                <h2>Loading EdgeFusion Dashboard...</h2>
            </section>
        );
    }

    const sensors = dashboard?.recentSensors || [];
    const latest = dashboard?.latestSensor;

    return (
        <section className="page">
            <PageHeader
                title="Dashboard Overview"
                subtitle="Live summary of MQTT, OpenFaaS, SQLite and Gateway activity."
            />

            <div className="metric-grid">
                <MetricCard
                    title="Total Records"
                    value={dashboard?.totalRecords || 0}
                    subtitle="Stored sensor events"
                    type="blue"
                />

                <MetricCard
                    title="High Alerts"
                    value={dashboard?.highAlerts || 0}
                    subtitle="Temperature warnings"
                    type="red"
                />

                <MetricCard
                    title="Average Temp"
                    value={`${dashboard?.averageTemperature || 0}°C`}
                    subtitle="Across stored records"
                    type="orange"
                />

                <MetricCard
                    title="Average Humidity"
                    value={`${dashboard?.averageHumidity || 0}%`}
                    subtitle="Across stored records"
                    type="green"
                />

                <MetricCard
    title="Light Level"
    value={latest?.light ?? 0}
    subtitle="Current LDR reading"
    type="blue"
/>
            </div>

            <div className="dashboard-grid">
                <TemperatureChart data={sensors} />
                <HumidityChart data={sensors} />
            </div>

            <div className="dashboard-grid">
                <SensorTable sensors={sensors} />

                <div className="alert-card">
                    <h3>Live Alerts</h3>

                    {dashboard?.latestAlerts?.length > 0 ? (
                        dashboard.latestAlerts.map((alert) => (
                            <div className="alert-item" key={alert.id}>
                                <strong>{alert.deviceId}</strong>
                                <span>{alert.status}</span>
                                <p>{alert.temperature}°C at {alert.processedAt}</p>
                            </div>
                        ))
                    ) : (
                        <p className="muted">No active alerts.</p>
                    )}
                </div>
            </div>

            <div className="system-health-card">
                <h3>System Health</h3>
                <div className="health-grid">
                    <span>MQTT Broker: Online</span>
                    <span>Gateway API: Online</span>
                    <span>OpenFaaS: Online</span>
                    <span>SQLite: Online</span>
                </div>
            </div>

            {latest && (
                <p className="muted">
                    Latest update received from <strong>{latest.deviceId}</strong> at {latest.processedAt}
                </p>
            )}
        </section>
    );
}