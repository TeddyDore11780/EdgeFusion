export default function SensorHealthBadge({ status }) {
    const isAlert = status === "HIGH_TEMPERATURE";

    return (
        <span className={isAlert ? "sensor-health warning" : "sensor-health healthy"}>
            {isAlert ? "High Temp" : "Healthy"}
        </span>
    );
}