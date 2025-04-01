const express = require("express");
const { register, login, getUserProfile } = require("../controllers/userController.js");
const {protect} = require("../middleware/authMiddleware.js");

const router = express.Router();



// User Authentication Routes
router.post('/register', register);
router.post('/login', login);
router.get('/profile', protect, getUserProfile);



module.exports = router;