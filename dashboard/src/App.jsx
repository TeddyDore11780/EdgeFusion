import { BrowserRouter, Routes, Route } from "react-router-dom";

import Layout from "./components/layout/Layout";
import Dashboard from "./pages/Dashboard";
import Sensors from "./pages/Sensors";
import Alerts from "./pages/Alerts";
import Analytics from "./pages/Analytics";
import System from "./pages/System";

import "./styles/global.css";

export default function App() {
    return (
        <BrowserRouter>
            <Layout>
                <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/sensors" element={<Sensors />} />
                    <Route path="/alerts" element={<Alerts />} />
                    <Route path="/analytics" element={<Analytics />} />
                    <Route path="/system" element={<System />} />
                </Routes>
            </Layout>
        </BrowserRouter>
    );
}