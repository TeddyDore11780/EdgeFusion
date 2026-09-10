import SensorStatusBadge from "./SensorStatusBadge";
import SensorHealthBadge from "./SensorHealthBadge";

function formatTime(value) {
    if (!value) return "Unknown";

    return new Date(value).toLocaleString();
}

function formatMotion(value) {
    return value === 1 || value === true ? "Detected" : "No Motion";
}

export default function SensorRow({ sensor }) {
    return (
        <tr>
            <td>
                <strong>{sensor.deviceId}</strong>
            </td>

            <td>
                <SensorStatusBadge status={sensor.status} />
            </td>

            <td>{sensor.temperature}°C</td>

            <td>{sensor.humidity}%</td>

            <td>{sensor.light ?? 0}</td>

            <td>{formatMotion(sensor.motion)}</td>

            <td>{formatTime(sensor.processedAt)}</td>

            <td>
                <SensorHealthBadge status={sensor.status} />
            </td>
        </tr>
    );
}