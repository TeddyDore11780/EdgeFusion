export default function SensorTable({ sensors }) {
    return (
        <div className="table-card">
            <h3>Latest Sensor Readings</h3>

            <table>
                <thead>
                    <tr>
                        <th>Device</th>
                        <th>Temperature</th>
                        <th>Humidity</th>
                        <th>Status</th>
                        <th>Processed At</th>
                    </tr>
                </thead>

                <tbody>
                    {sensors.map((sensor) => (
                        <tr key={sensor.id}>
                            <td>{sensor.deviceId}</td>
                            <td>{sensor.temperature}°C</td>
                            <td>{sensor.humidity}%</td>
                            <td>
                                <span className={`badge ${sensor.status === "HIGH_TEMPERATURE" ? "danger" : "success"}`}>
                                    {sensor.status}
                                </span>
                            </td>
                            <td>{sensor.processedAt}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}