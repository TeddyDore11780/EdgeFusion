import SensorRow from "../sensors/SensorRow";

export default function SensorTable({ sensors }) {
    return (
        <div className="table-card">
            <div className="table-header">
                <div>
                    <h3>Live Sensor Monitoring</h3>
                    <p>Latest processed readings from the edge gateway.</p>
                </div>
            </div>

            <table>
                <thead>
                    <tr>
                        <th>Device</th>
                        <th>Status</th>
                        <th>Temperature</th>
                        <th>Humidity</th>
                        <th>Light</th>
                        <th>Motion</th>
                        <th>Last Update</th>
                        <th>Health</th>
                    </tr>
                </thead>

                <tbody>
                    {sensors.length > 0 ? (
                        sensors.map((sensor) => (
                            <SensorRow key={sensor.id} sensor={sensor} />
                        ))
                    ) : (
                        <tr>
                            <td colSpan="8" className="empty-table">
                                No sensor data available.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}