/**
 * ==========================================================
 * EdgeFusion
 * Node.js Edge Gateway
 * ----------------------------------------------------------
 * Author : Sonwabile Theodore Mbelebele
 * Project: EdgeFusion
 * ==========================================================
 */

require("dotenv").config();

const express = require("express");

const app = express();

const PORT = process.env.PORT || 3000;

// ----------------------------------------------------------
// Middleware
// ----------------------------------------------------------

app.use(express.json());

// ----------------------------------------------------------
// Routes
// ----------------------------------------------------------

app.get("/", (req, res) => {

    res.json({

        project: "EdgeFusion",

        description: "Serverless Edge Computing Framework",

        status: "Running"

    });

});

// ----------------------------------------------------------

app.get("/health", (req, res) => {

    res.json({

        status: "Healthy",

        timestamp: new Date()

    });

});

// ----------------------------------------------------------

app.get("/status", (req, res) => {

    res.json({

        mqtt: "Not Connected",

        database: "Not Connected",

        openfaas: "Not Connected",

        dashboard: "Not Connected"

    });

});

// ----------------------------------------------------------
// Start Server
// ----------------------------------------------------------

app.listen(PORT, () => {

    console.log("====================================");

    console.log(" EdgeFusion Gateway Started");

    console.log("====================================");

    console.log(`Server running on port ${PORT}`);

    console.log(`http://localhost:${PORT}`);

});
