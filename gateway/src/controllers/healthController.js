/**
 * EdgeFusion Health Controller
 */

function getHealth(req, res) {
    res.json({
        status: "Healthy",
        service: "EdgeFusion Gateway",
        timestamp: new Date().toISOString()
    });
}

module.exports = {
    getHealth
};
