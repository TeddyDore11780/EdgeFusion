export default function DeviceStatistics({ devices }) {
    return (
        <div className="table-card">
            <div className="table-header">
                <div>
                    <h3>Top Devices</h3>
                    <p>Most active devices by number of processed readings.</p>
                </div>
            </div>

            <table>
                <thead>
                    <tr>
                        <th>Device</th>
                        <th>Readings</th>
                        <th>Highest Temp</th>
                        <th>Avg Temp</th>
                    </tr>
                </thead>

                <tbody>
                    {devices.length > 0 ? (
                        devices.map((device) => (
                            <tr key={device.deviceId}>
                                <td>
                                    <strong>{device.deviceId}</strong>
                                </td>
                                <td>{device.readings}</td>
                                <td>{device.highestTemperature}°C</td>
                                <td>{device.averageTemperature}°C</td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="4" className="empty-table">
                                No device statistics available.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}