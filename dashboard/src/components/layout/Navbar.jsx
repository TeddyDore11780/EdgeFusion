import { useEffect, useState } from "react";
import { Cpu, Database, Radio, Server, Boxes } from "lucide-react";

export default function Navbar() {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const interval = setInterval(() => {
            setTime(new Date());
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    return (
        <header className="navbar">
            <div>
                <h1>EdgeFusion Dashboard</h1>
                <p>Serverless edge computing monitoring platform</p>
            </div>

            <div className="navbar-right">
                <div className="service-status-list">
                    <span><Radio size={15} /> MQTT</span>
                    <span><Cpu size={15} /> Gateway</span>
                    <span><Server size={15} /> OpenFaaS</span>
                    <span><Database size={15} /> SQLite</span>
                    <span><Boxes size={15} /> Kubernetes</span>
                </div>

                <div className="live-clock">
                    <strong>{time.toLocaleTimeString()}</strong>
                    <small>{time.toLocaleDateString()}</small>
                </div>
            </div>
        </header>
    );
}