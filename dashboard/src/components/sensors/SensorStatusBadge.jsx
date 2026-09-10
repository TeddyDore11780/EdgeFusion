export default function SensorStatusBadge({ status }) {
    const isAlert = status === "HIGH_TEMPERATURE";

    return (
        <span className={isAlert ? "sensor-status alert" : "sensor-status online"}>
            {isAlert ? "Alert" : "Online"}
        </span>
    );
}