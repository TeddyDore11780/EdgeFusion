/**
 * EdgeFusion Logger Service
 */

function info(message, data = null) {
    console.log(`[INFO] ${new Date().toISOString()} - ${message}`);

    if (data) {
        console.log(data);
    }
}

function error(message, error = null) {
    console.error(`[ERROR] ${new Date().toISOString()} - ${message}`);

    if (error) {
        console.error(error);
    }
}

module.exports = {
    info,
    error
};
