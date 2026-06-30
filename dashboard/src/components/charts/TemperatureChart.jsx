import {
    ResponsiveContainer,
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
    Area,
    AreaChart
} from "recharts";

export default function TemperatureChart({ data }) {

    const chartData = data.map((sensor, index) => ({
        name: `#${index + 1}`,
        temperature: sensor.temperature
    }));

    return (
        <div className="chart-card">

            <h3>🌡 Temperature Trend</h3>

            <ResponsiveContainer
                width="100%"
                height={320}
            >

                <AreaChart data={chartData}>

                    <defs>

                        <linearGradient
                            id="tempGradient"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                        >

                            <stop
                                offset="0%"
                                stopColor="#f59e0b"
                                stopOpacity={0.45}
                            />

                            <stop
                                offset="100%"
                                stopColor="#f59e0b"
                                stopOpacity={0}
                            />

                        </linearGradient>

                    </defs>

                    <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="#334155"
                    />

                    <XAxis
                        dataKey="name"
                        stroke="#94a3b8"
                    />

                    <YAxis
                        stroke="#94a3b8"
                    />

                    <Tooltip />

                    <Area
                        type="monotone"
                        dataKey="temperature"
                        stroke="#f59e0b"
                        strokeWidth={4}
                        fill="url(#tempGradient)"
                    />

                </AreaChart>

            </ResponsiveContainer>

        </div>
    );

}