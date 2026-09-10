import {
    ResponsiveContainer,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip
} from "recharts";

export default function HumidityChart({ data }) {

    const chartData = data.map((sensor, index) => ({
        name: `#${index + 1}`,
        humidity: sensor.humidity
    }));

    return (
        <div className="chart-card">

            <h3>💧 Humidity Trend</h3>

            <ResponsiveContainer
                width="100%"
                height={170}
            >

                <AreaChart data={chartData}>

                    <defs>

                        <linearGradient
                            id="humidityGradient"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                        >

                            <stop
                                offset="0%"
                                stopColor="#22c55e"
                                stopOpacity={0.45}
                            />

                            <stop
                                offset="100%"
                                stopColor="#22c55e"
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
                        dataKey="humidity"
                        stroke="#22c55e"
                        strokeWidth={4}
                        fill="url(#humidityGradient)"
                    />

                </AreaChart>

            </ResponsiveContainer>

        </div>
    );

}