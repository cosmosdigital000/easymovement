import User from "../models/user.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { ObjectId } from "mongodb";

// Environment variable for admin password (fallback for development)
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "prem";

// Admin firewall verification
export const verifyAdminPassword = async (req, res) => {
  try {
    const { adminPassword } = req.body;

    // Simple comparison with the environment variable
    if (adminPassword === ADMIN_PASSWORD) {
      return res.status(200).json({ success: true });
    }

    return res
      .status(401)
      .json({ success: false, message: "Invalid admin password" });
  } catch (error) {
    console.error("Error in verifyAdminPassword:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Doctor login only
export const doctorLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Please provide email and password" });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Check if user is a doctor
    if (user.role !== "doctor") {
      return res.status(403).json({ message: "Only doctors can login here" });
    }

    // Check if user has a password
    if (!user.password) {
      return res
        .status(400)
        .json({ message: "This account doesn't use password authentication" });
    }

    // Validate password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(200).json({
      token,
      user: {
        id: user._id,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Register doctor (only accessible after admin firewall)
export const registerDoctor = async (req, res) => {
  try {
    const { email, password, full_name, phoneNumber } = req.body;

    // Validate required fields
    if (!email || !password || !full_name) {
      return res
        .status(400)
        .json({ message: "Please provide all required fields" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "User with this email already exists" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user (always as doctor)
    const newUser = new User({
      email,
      password: hashedPassword,
      full_name,
      phoneNumber,
      role: "doctor", // Force role to be doctor
    });

    await newUser.save();

    // Generate JWT token
    const token = jwt.sign(
      { id: newUser._id, email: newUser.email, role: newUser.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      token,
      user: {
        id: newUser._id,
        email: newUser.email,
        full_name: newUser.full_name,
        role: newUser.role,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const authFunction = async (req, res) => {
  try {
    const { email_addresses, full_name } = req.body.data;

    const email = email_addresses[0].email_address;

    const existingUser = await User.findOne({ email: email });

    if (existingUser) {
      return res.status(200).json(existingUser);
    }

    const newUser = new User({
      email: email,
      full_name: full_name,
    });

    const savedUser = await newUser.save();
    res.status(201).json(savedUser);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getBasicUserInfo = async (req, res) => {
  const { email, phoneNumber, full_name, age, address } = req.body;
  try {
    const user = await User.findOne({
      email,
    });

    if (!user) {
      const newUser = new User({
        email,
        phoneNumber,
        role: "user",
        full_name,
        age,
        address,
      });

      await newUser
        .save()
        .then((savedUser) => {
          res.status(201).json(savedUser);
        })
        .catch((error) => {
          console.log(error);
          res.status(500).json({ message: "Internal server error" });
        });
    }

    res.status(200).json(user);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getUserDetails = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: "No user found" });
    }

    res.status(200).json(user);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const register = async (req, res) => {
  try {
    const { email, password, full_name, phoneNumber, role, age, address } =
      req.body;

    // Validate required fields
    if (!email || !password || !full_name) {
      return res
        .status(400)
        .json({ message: "Please provide all required fields" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "User with this email already exists" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const newUser = new User({
      email,
      password: hashedPassword,
      full_name,
      phoneNumber,
      role: role || "user",
      age,
      address,
    });

    await newUser.save();

    // Generate JWT token
    const token = jwt.sign(
      { id: newUser._id, email: newUser.email, role: newUser.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      token,
      user: {
        id: newUser._id,
        email: newUser.email,
        full_name: newUser.full_name,
        role: newUser.role,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Please provide email and password" });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Check if user has a password (might be using Clerk)
    if (!user.password) {
      return res
        .status(400)
        .json({ message: "This account doesn't use password authentication" });
    }

    // Validate password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(200).json({
      token,
      user: {
        id: user._id,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};
