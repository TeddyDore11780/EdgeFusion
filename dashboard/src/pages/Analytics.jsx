import { useEffect, useState } from "react";

import PageHeader from "../components/layout/PageHeader";
import MetricCard from "../components/cards/MetricCard";
import TemperatureChart from "../components/charts/TemperatureChart";
import HumidityChart from "../components/charts/HumidityChart";
import DeviceStatistics from "../components/analytics/DeviceStatistics";
import InsightPanel from "../components/analytics/InsightPanel";
import { getDashboardSummary } from "../services/api";

export default function Analytics() {
    const [dashboard, setDashboard] = useState(null);
    const [loading, setLoading] = useState(true);

    async function loadAnalytics() {
        try {
            const response = await getDashboardSummary();
            setDashboard(response.data);
        } catch (error) {
            console.error("Analytics load error:", error.message);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadAnalytics();
    }, []);

    if (loading) {
        return (
            <section className="page">
                <h2>Loading Analytics...</h2>
            </section>
        );
    }

    const sensors = dashboard?.allSensors || [];
    const deviceStats = dashboard?.deviceStatistics || [];

    return (
        <section className="page">
            <PageHeader
                title="Analytics"
                subtitle="Operational insights and sensor statistics generated from processed EdgeFusion data."
            />

            <div className="metric-grid">
                <MetricCard
                    title="Total Readings"
                    value={dashboard?.totalRecords || 0}
                    subtitle="Processed sensor records"
                    type="blue"
                />

                <MetricCard
                    title="Active Devices"
                    value={dashboard?.activeDevices || 0}
                    subtitle="Unique device IDs"
                    type="green"
                />

                <MetricCard
                    title="Highest Temp"
                    value={`${dashboard?.highestTemperature || 0}°C`}
                    subtitle="Maximum recorded value"
                    type="orange"
                />

                <MetricCard
                    title="Alert Rate"
                    value={`${dashboard?.alertRate || 0}%`}
                    subtitle="High temperature events"
                    type="red"
                />
            </div>

            <div className="metric-grid">
                <MetricCard
                    title="Average Temp"
                    value={`${dashboard?.averageTemperature || 0}°C`}
                    subtitle="Across all readings"
                    type="orange"
                />

                <MetricCard
                    title="Average Humidity"
                    value={`${dashboard?.averageHumidity || 0}%`}
                    subtitle="Across all readings"
                    type="green"
                />

                <MetricCard
                    title="Lowest Temp"
                    value={`${dashboard?.lowestTemperature || 0}°C`}
                    subtitle="Minimum recorded value"
                    type="blue"
                />

                <MetricCard
                    title="Critical Alerts"
                    value={dashboard?.highAlerts || 0}
                    subtitle="Detected by OpenFaaS"
                    type="red"
                />
            </div>

            <div className="dashboard-grid">
                <TemperatureChart data={sensors} />
                <HumidityChart data={sensors} />
            </div>

            <div className="dashboard-grid">
                <DeviceStatistics devices={deviceStats} />
                <InsightPanel dashboard={dashboard} />
            </div>
        </section>
    );
}