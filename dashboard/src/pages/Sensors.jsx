import { useEffect, useState } from "react";
import PageHeader from "../components/layout/PageHeader";
import MetricCard from "../components/cards/MetricCard";
import SensorTable from "../components/tables/SensorTable";
import { getAllSensors } from "../services/api";
import socket from "../services/socket";

export default function Sensors() {
    const [sensors, setSensors] = useState([]);
    const [loading, setLoading] = useState(true);

    async function loadSensors() {
        try {
            const response = await getAllSensors();
            setSensors(response.data || []);
        } catch (error) {
            console.error("Sensors load error:", error.message);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        // Initial database load
        loadSensors();

        // Receive live sensor updates from EdgeFusion Gateway
        socket.on("sensor:processed", (data) => {
            console.log("Live sensor update on Sensors page:", data);

            // Reload the latest records from SQLite through the API
            loadSensors();
        });

        return () => {
            socket.off("sensor:processed");
        };
    }, []);

    if (loading) {
        return (
            <section className="page">
                <h2>Loading Sensors...</h2>
            </section>
        );
    }

    const latestSensor = sensors.length > 0 ? sensors[0] : null;

    return (
        <section className="page">
            <PageHeader
                title="Sensor Management"
                subtitle="Detailed list of all processed sensor readings stored in SQLite."
            />

            <div className="metric-grid">
                <MetricCard
                    title="Temperature"
                    value={
                        latestSensor
                            ? `${latestSensor.temperature}°C`
                            : "N/A"
                    }
                    subtitle={
                        latestSensor
                            ? `${latestSensor.deviceId} • Live reading`
                            : "No sensor data"
                    }
                    type="orange"
                />

                <MetricCard
                    title="Humidity"
                    value={
                        latestSensor
                            ? `${latestSensor.humidity}%`
                            : "N/A"
                    }
                    subtitle={
                        latestSensor
                            ? `${latestSensor.deviceId} • Live reading`
                            : "No sensor data"
                    }
                    type="green"
                />

                <MetricCard
                    title="Light Level"
                    value={
                        latestSensor
                            ? latestSensor.light ?? 0
                            : "N/A"
                    }
                    subtitle={
                        latestSensor
                            ? `${latestSensor.deviceId} • LDR reading`
                            : "No sensor data"
                    }
                    type="blue"
                />

                <MetricCard
                    title="Motion"
                    value={
                        latestSensor
                            ? latestSensor.motion === 1 ||
                              latestSensor.motion === true
                                ? "Detected"
                                : "No Motion"
                            : "N/A"
                    }
                    subtitle={
                        latestSensor
                            ? `${latestSensor.deviceId} • PIR reading`
                            : "No sensor data"
                    }
                    type={
                        latestSensor &&
                        (latestSensor.motion === 1 ||
                            latestSensor.motion === true)
                            ? "red"
                            : "blue"
                    }
                />
            </div>

            <SensorTable sensors={sensors} />
        </section>
    );
}