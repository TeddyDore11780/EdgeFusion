import logo from "../../assets/edgefusion-logo.png";

const bootSteps = [
    "Loading Configuration",
    "Starting Gateway",
    "Connecting MQTT Broker",
    "Connecting OpenFaaS",
    "Loading SQLite Storage",
    "Starting Socket.IO",
    "Preparing Dashboard",
];

export default function SplashScreen() {
    return (
        <div className="splash-screen">
            <div className="splash-orb orb-one"></div>
            <div className="splash-orb orb-two"></div>
            <div className="splash-grid-bg"></div>

            <div className="splash-card">
                <div className="splash-logo-ring">
                    <img src={logo} alt="EdgeFusion" className="splash-logo" />
                </div>

                <h1>EdgeFusion</h1>
                <p className="splash-subtitle">Enterprise Edge Computing Platform</p>

                <div className="progress-ring">
                    <span>98%</span>
                </div>

                <div className="splash-loader"></div>

                <div className="splash-steps">
                    {bootSteps.map((step) => (
                        <span key={step}>✓ {step}</span>
                    ))}
                </div>

                <p className="splash-footer">Connecting the Edge...</p>
            </div>
        </div>
    );
}