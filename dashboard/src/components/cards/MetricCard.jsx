import {
    Database,
    TriangleAlert,
    Thermometer,
    Droplets
} from "lucide-react";

const icons = {
    blue: Database,
    red: TriangleAlert,
    orange: Thermometer,
    green: Droplets
};

export default function MetricCard({
    title,
    value,
    subtitle,
    type = "blue"
}) {
    const Icon = icons[type] || Database;

    return (
        <div className={`metric-card ${type}`}>

            <div className="metric-icon">
                <Icon size={24} />
            </div>

            <div className="metric-title">
                {title}
            </div>

            <div className="metric-value">
                {value}
            </div>

            <div className="metric-subtitle">
                {subtitle}
            </div>

            <div className="metric-status">
                ● Live
            </div>

        </div>
    );
}