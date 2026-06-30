import { NavLink } from "react-router-dom";
import {
    LayoutDashboard,
    RadioReceiver,
    TriangleAlert,
    ChartLine,
    ServerCog
} from "lucide-react";

import logo from "../../assets/edgefusion-logo.png";

const navItems = [
    { path: "/", label: "Dashboard", icon: LayoutDashboard },
    { path: "/sensors", label: "Sensors", icon: RadioReceiver },
    { path: "/alerts", label: "Alerts", icon: TriangleAlert },
    { path: "/analytics", label: "Analytics", icon: ChartLine },
    { path: "/system", label: "System", icon: ServerCog },
];

export default function Sidebar() {
    return (
        <aside className="sidebar">

            <div className="sidebar-brand">

                <img
                    src={logo}
                    alt="EdgeFusion"
                    className="sidebar-logo"
                />

            </div>

            <nav className="sidebar-nav">

                {navItems.map((item) => {

                    const Icon = item.icon;

                    return (

                        <NavLink
                            key={item.path}
                            to={item.path}
                            end={item.path === "/"}
                            className={({ isActive }) =>
                                isActive ? "nav-link active" : "nav-link"
                            }
                        >

                            <Icon size={20} />

                            <span>{item.label}</span>

                        </NavLink>

                    );

                })}

            </nav>

        </aside>
    );
}