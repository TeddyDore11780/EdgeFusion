/**
 * EdgeFusion Express Application
 */

const express = require("express");

const healthRoutes = require("./routes/healthRoutes");
const statusRoutes = require("./routes/statusRoutes");

const app = express();

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
app.use("/api/v1/health", healthRoutes);
app.use("/api/v1/status", statusRoutes);

module.exports = app;
