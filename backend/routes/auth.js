const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const User = require("../models/user");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Create JWT token
function generateToken(user) {
    return jwt.sign(
        {
            id: user._id.toString(),
            role: user.role || "student"
        },
        process.env.JWT_SECRET,
        {
            expiresIn: "1d"
        }
    );
}

// ================= REGISTER =================
router.post("/register", async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "Name, email and password are required"
            });
        }

        const cleanName = String(name).trim();
        const cleanEmail = String(email).trim().toLowerCase();

        if (cleanName.length < 2 || cleanName.length > 80) {
            return res.status(400).json({
                success: false,
                message: "Name must be between 2 and 80 characters"
            });
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
            return res.status(400).json({
                success: false,
                message: "Please enter a valid email address"
            });
        }

        if (typeof password !== "string" || password.length < 8 || password.length > 72) {
            return res.status(400).json({
                success: false,
                message: "Password must be between 8 and 72 characters"
            });
        }

        if (!process.env.JWT_SECRET) {
            return res.status(500).json({
                success: false,
                message: "Authentication is not configured"
            });
        }

        if (mongoose.connection.readyState !== 1) {
            return res.status(503).json({
                success: false,
                message: "Database service is temporarily unavailable. Please try again shortly."
            });
        }

        const existingUser = await User.findOne({
            email: cleanEmail
        });

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "An account with this email already exists"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        const user = await User.create({
            name: cleanName,
            email: cleanEmail,
            password: hashedPassword,
            role: "student"
        });

        const token = generateToken(user);

        return res.status(201).json({
            success: true,
            message: "Registration successful",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: "An account with this email already exists"
            });
        }

        if (error.name === "ValidationError") {
            const firstErr = Object.values(error.errors || {})[0];
            return res.status(400).json({
                success: false,
                message: firstErr ? firstErr.message : "Validation error"
            });
        }

        console.error("Registration error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Registration failed"
        });
    }
});

// ================= LOGIN =================
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (
            typeof email !== "string" ||
            typeof password !== "string" ||
            !email.trim() ||
            !password
        ) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required"
            });
        }

        if (!process.env.JWT_SECRET) {
            return res.status(500).json({
                success: false,
                message: "Authentication is not configured"
            });
        }

        if (mongoose.connection.readyState !== 1) {
            return res.status(503).json({
                success: false,
                message: "Database service is temporarily unavailable. Please try again shortly."
            });
        }

        const user = await User.findOne({
            email: email.trim().toLowerCase()
        }).select("+password");

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        const passwordMatches = await bcrypt.compare(
            password,
            user.password
        );

        if (!passwordMatches) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        const token = generateToken(user);

        return res.status(200).json({
            success: true,
            message: "Login successful",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error("Login error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Login failed"
        });
    }
});

// ================= PROFILE (ME) =================
router.get("/me", authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select(
            "name email role createdAt"
        );

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        return res.status(200).json({
            success: true,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                createdAt: user.createdAt
            }
        });
    } catch (error) {
        console.error("Profile error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Unable to load profile"
        });
    }
});

// ================= LOGOUT =================
router.post("/logout", (req, res) => {
    return res.status(200).json({
        success: true,
        message: "Logged out successfully"
    });
});

module.exports = router;