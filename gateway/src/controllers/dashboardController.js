const { getDashboardSummary } = require("../services/dashboardService");

function getDashboard(req, res) {
    getDashboardSummary((error, summary) => {
        if (error) {
            return res.status(500).json({
                success: false,
                error: error.message
            });
        }

        res.json({
            success: true,
            data: summary
        });
    });
}

module.exports = {
    getDashboard
};