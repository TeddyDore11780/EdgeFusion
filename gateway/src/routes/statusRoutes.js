/**
 * EdgeFusion Status Routes
 */

const express = require("express");
const { getStatus } = require("../controllers/statusController");

const router = express.Router();

router.get("/", getStatus);

module.exports = router;
