const express = require('express');
const adminController = require('../controllers/adminController.js');
const {protect, admin} = require('../middleware/authMiddleware.js');




const router = express.Router();


router.get("/users", protect, admin, adminController.adminGetUser);
router.post("/users", protect, admin, adminController.adminAddUser);
router.put("/users/:id", protect, admin, adminController.adminUpdateUserInfo);
router.delete("/users/:id", protect, admin, adminController.adminDeleteUser);













module.exports = router;