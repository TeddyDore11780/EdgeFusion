export default function InsightPanel({ dashboard }) {
    const insights = [
        `Highest temperature recorded: ${dashboard.highestTemperature}°C`,
        `Lowest temperature recorded: ${dashboard.lowestTemperature}°C`,
        `Average temperature: ${dashboard.averageTemperature}°C`,
        `Average humidity: ${dashboard.averageHumidity}%`,
        `Active devices detected: ${dashboard.activeDevices}`,
        `Alert rate: ${dashboard.alertRate}%`
    ];

    return (
        <div className="alert-card">
            <h3>Live Insights</h3>

            {insights.map((insight, index) => (
                <div className="insight-item" key={index}>
                    <span>✓</span>
                    <p>{insight}</p>
                </div>
            ))}
        </div>
    );
}