const express = require("express");
const { check } = require("express-validator");
const auth = require("../middleware/auth");
const {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
  logout,
} = require("../controllers/authController");

const router = express.Router();

// Register user
router.post(
  "/register",
  [
    check("username", "Username is required").not().isEmpty(),
    check("email", "Please include a valid email").isEmail(),
    check("password", "Password must be 6 or more characters").isLength({ min: 6 }),
    check("firstName", "First name is required").not().isEmpty(),
    check("lastName", "Last name is required").not().isEmpty(),
  ],
  register
);

// Login user
router.post(
  "/login",
  [
    check("identifier", "Username or Email is required").not().isEmpty(),
    check("password", "Password is required").exists(),
  ],
  login
);

// Get current logged-in user
router.get("/me", auth, getMe);

// Update profile
router.put(
  "/profile",
  auth,
  [
    check("firstName", "First name is required").not().isEmpty(),
    check("lastName", "Last name is required").not().isEmpty(),
    check("email", "Please include a valid email").isEmail(),
  ],
  updateProfile
);

// Change password
router.put(
  "/change-password",
  auth,
  [
    check("currentPassword", "Current password is required").exists(),
    check("newPassword", "New password must be 6 or more characters").isLength({ min: 6 }),
  ],
  changePassword
);

// Logout
router.post("/logout", auth, logout);

module.exports = router;
