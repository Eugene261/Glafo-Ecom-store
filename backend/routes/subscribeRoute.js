const express = require('express');
const subscribeController = require('../controllers/subscribeController.js');


const router = express.Router();

router.post("/subscribe", subscribeController.handleSubscribe);








module.exports = router;