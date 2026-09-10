/**
 * EdgeFusion Express Application
 */

const express = require("express");
const cors = require("cors");

const healthRoutes = require("./routes/healthRoutes");
const statusRoutes = require("./routes/statusRoutes");
const sensorRoutes = require("./routes/sensorRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const alertRoutes = require("./routes/alertRoutes");
const systemRoutes = require("./routes/systemRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.json({
        project: "EdgeFusion",
        description: "Serverless Edge Computing Framework",
        status: "Running"
    });
});

app.use("/health", healthRoutes);
app.use("/status", statusRoutes);
app.use("/system", systemRoutes);
app.use("/api/v1/health", healthRoutes);
app.use("/api/v1/status", statusRoutes);
app.use("/api/v1/sensors", sensorRoutes);
app.use("/api/v1/dashboard", dashboardRoutes);
app.use("/api/v1/alerts", alertRoutes);
app.use("/api/v1/system", systemRoutes);

module.exports = app;