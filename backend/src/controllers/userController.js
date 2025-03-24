import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/userModel.js";

// **Register User**
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error("Register Error:", error);
    res
      .status(500)
      .json({ error: "Registration failed", details: error.message });
  }
};

// **Login User**
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    // Generate JWT token
    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is not defined in the .env file");
    }
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.status(200).json({ message: "Login successful", token });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ error: "Login failed", details: error.message });
  }
};

// **Get User Activity History**
export const getUserActivity = async (req, res) => {
  try {
    const userId = req.user ? req.user.id : null;
    if (!userId) {
      return res
        .status(401)
        .json({ error: "Unauthorized: User not authenticated" });
    }

    // Find user and retrieve activities
    const user = await User.findById(userId).select("activities");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json(user.activities || []);
  } catch (error) {
    console.error("Get User Activity Error:", error);
    res
      .status(500)
      .json({ error: "Failed to fetch activities", details: error.message });
  }
};

// **Add Activity to User's History**
export const addActivityToHistory = async (req, res) => {
  try {
    const userId = req.user ? req.user.id : null;
    if (!userId) {
      return res
        .status(401)
        .json({ error: "Unauthorized: User not authenticated" });
    }

    const { meeting_code } = req.body;

    // Validate input
    if (!meeting_code) {
      return res.status(400).json({ error: "Meeting code is required" });
    }

    // Find user and update activities
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Initialize activities array if undefined
    if (!user.activities) {
      user.activities = [];
    }

    user.activities.push({ meeting_code, timestamp: new Date() }); // Push new activity
    await user.save();

    res.status(200).json({ message: "Activity added successfully" });
  } catch (error) {
    console.error("Add Activity Error:", error);
    res
      .status(500)
      .json({ error: "Failed to add activity", details: error.message });
  }
};
