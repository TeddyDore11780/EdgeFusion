function AlertHistory({ alerts }) {
    return (
        <div className="alert-card">
            <h3>Alert History</h3>

            {alerts && alerts.length > 0 ? (
                alerts.map((alert) => (
                    <div className="alert-item" key={alert.id || alert.createdAt}>
                        <strong>{alert.deviceId}</strong>

                        <span>{alert.severity || alert.status}</span>

                        <p>
                            {alert.message ||
                                `${alert.temperature}°C at ${
                                    alert.processedAt || alert.createdAt
                                }`}
                        </p>

                        <small>
                            {alert.createdAt
                                ? new Date(alert.createdAt).toLocaleString()
                                : alert.processedAt}
                        </small>
                    </div>
                ))
            ) : (
                <p className="muted">No alerts recorded.</p>
            )}
        </div>
    );
}

export default AlertHistory;