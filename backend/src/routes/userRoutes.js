import { Router } from "express";
import {
  login,
  register,
  addActivityToHistory,
  getUserActivity,
} from "../controllers/userController.js";
import { authenticateUser } from "../middlewares/authMiddleware.js"; // Import middleware

const router = Router();

// Public Routes
router.post("/login", login);
router.post("/register", register);

// Protected Routes
router.post("/add_to_activity", authenticateUser, addActivityToHistory);
router.get("/get_all_activity", authenticateUser, getUserActivity);

export default router;
