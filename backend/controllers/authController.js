const User = require("../models/User");
const jwt = require("jsonwebtoken");
const { EVENT_CATEGORIES } = require("../constants/categories");

// JWT generate karne ka function
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

// ================= REGISTER =================
const registerUser = async (req, res) => {
  try {
    const { name, email, password, role, department, year, interests } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const allowedInterests = Array.isArray(interests)
      ? interests.filter((i) => EVENT_CATEGORIES.includes(String(i).trim()))
      : [];

    const user = new User({
      name,
      email,
      password,
      role,
      department,
      year,
      interests: allowedInterests,
    });

    await user.save();

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
};

// ================= LOGIN =================
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
};

// ================= PROFILE (NEW – FIX) =================
const getProfile = async (req, res) => {
  // req.user authMiddleware se aata hai
  res.json(req.user);
};

// ✅ EXPORT ALL FUNCTIONS
module.exports = {
  registerUser,
  loginUser,
  getProfile,
};
