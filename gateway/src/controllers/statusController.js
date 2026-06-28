/**
 * EdgeFusion Status Controller
 */

function getStatus(req, res) {
    res.json({
        gateway: "Running",
        mqtt: "Configured",
        database: "Not Connected",
        openfaas: "Not Connected",
        dashboard: "Not Connected",
        timestamp: new Date().toISOString()
    });
}

module.exports = {
    getStatus
};
