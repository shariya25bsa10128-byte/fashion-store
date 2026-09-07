
import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { db } from "../prisma/db";

const router = Router();


// =========================================
// SIGNUP
// =========================================

router.post("/signup", async (req, res) => {
  try {
    const {
      name,
      username,
      email,
      phone,
      password,
    } = req.body;

    // -----------------------------
    // VALIDATION
    // -----------------------------

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message:
          "Password must be at least 6 characters long",
      });
    }

    // -----------------------------
    // CLEAN DATA
    // -----------------------------

    const cleanEmail = email
      .trim()
      .toLowerCase();

    const cleanName =
      name?.trim() || null;

    const cleanUsername =
      username?.trim() || null;

    const cleanPhone =
      phone?.trim() || "";

    // -----------------------------
    // CHECK EXISTING USER
    // -----------------------------

    const existingUser =
      await db.orm.public.User
        .where({
          email: cleanEmail,
        })
        .first();

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message:
          "An account with this email already exists",
      });
    }

    // -----------------------------
    // HASH PASSWORD
    // -----------------------------

    const hashedPassword =
      await bcrypt.hash(password, 12);

    // -----------------------------
    // CREATE USER
    // -----------------------------

    const user =
      await db.orm.public.User.create({
        email: cleanEmail,

        username: cleanUsername,

        name: cleanName,

        phone: cleanPhone,

        password: hashedPassword,

        passwordHash: hashedPassword,

        role: "USER",
      });

    // -----------------------------
    // RESPONSE
    // -----------------------------

    return res.status(201).json({
      success: true,

      message:
        "Account created successfully",

      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        name: user.name,
        phone: user.phone,
        role: user.role,
        createdAt: user.createdAt,
      },
    });

  } catch (error) {

    console.error(
      "Signup error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Something went wrong while creating the account",
    });
  }
});


// =========================================
// LOGIN
// =========================================

router.post("/login", async (req, res) => {
  try {

    const {
      email,
      password,
    } = req.body;

    // -----------------------------
    // VALIDATION
    // -----------------------------

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message:
          "Email and password are required",
      });
    }

    // -----------------------------
    // CLEAN EMAIL
    // -----------------------------

    const cleanEmail =
      email.trim().toLowerCase();

    // -----------------------------
    // FIND USER
    // -----------------------------

    const user =
      await db.orm.public.User
        .where({
          email: cleanEmail,
        })
        .first();

    if (!user) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid email or password",
      });
    }

    // -----------------------------
    // CHECK PASSWORD
    // -----------------------------

    const passwordMatches =
      await bcrypt.compare(
        password,
        user.passwordHash
      );

    if (!passwordMatches) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid email or password",
      });
    }

    // -----------------------------
    // JWT SECRET
    // -----------------------------

    const jwtSecret =
      process.env.JWT_SECRET;

    if (!jwtSecret) {
      throw new Error(
        "JWT_SECRET is not configured"
      );
    }

    // -----------------------------
    // CREATE JWT TOKEN
    // -----------------------------

    const token =
      jwt.sign(
        {
          userId: user.id,
          email: user.email,
          role: user.role,
        },
        jwtSecret,
        {
          expiresIn: "7d",
        }
      );

    // -----------------------------
    // LOGIN SUCCESS
    // -----------------------------

    return res.status(200).json({
      success: true,

      message:
        "Login successful",

      token,

      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        name: user.name,
        phone: user.phone,
        role: user.role,
        createdAt: user.createdAt,
      },
    });

  } catch (error) {

    console.error(
      "Login error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Something went wrong while logging in",
    });
  }
});


// =========================================
// GET CURRENT USER
// =========================================

router.get("/me", async (req, res) => {
  try {

    const userId =
      Number(req.query.userId);

    // -----------------------------
    // VALIDATE USER ID
    // -----------------------------

    if (
      !userId ||
      Number.isNaN(userId)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Valid user ID is required",
      });
    }

    // -----------------------------
    // FIND USER
    // -----------------------------

    const user =
      await db.orm.public.User
        .where({
          id: userId,
        })
        .first();

    if (!user) {
      return res.status(404).json({
        success: false,
        message:
          "User not found",
      });
    }

    // -----------------------------
    // RESPONSE
    // -----------------------------

    return res.status(200).json({
      success: true,

      message:
        "User found successfully",

      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        name: user.name,
        phone: user.phone,
        role: user.role,
        createdAt: user.createdAt,
      },
    });

  } catch (error) {

    console.error(
      "Get user error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Something went wrong while loading your account",
    });
  }
});


// =========================================
// UPDATE PROFILE
// =========================================

router.put("/profile", async (req, res) => {
  try {

    const {
      userId,
      name,
      username,
      email,
      phone,
    } = req.body;

    // -----------------------------
    // USER ID
    // -----------------------------

    const parsedUserId =
      Number(userId);

    if (
      !parsedUserId ||
      Number.isNaN(parsedUserId)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Valid user ID is required",
      });
    }

    // -----------------------------
    // VALIDATION
    // -----------------------------

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message:
          "Full name is required",
      });
    }

    if (!email || !email.trim()) {
      return res.status(400).json({
        success: false,
        message:
          "Email address is required",
      });
    }

    if (!phone || !phone.trim()) {
      return res.status(400).json({
        success: false,
        message:
          "Phone number is required",
      });
    }

    // -----------------------------
    // CLEAN DATA
    // -----------------------------

    const cleanName =
      name.trim();

    const cleanUsername =
      username?.trim() || null;

    const cleanEmail =
      email.trim().toLowerCase();

    const cleanPhone =
      phone.trim();

    // -----------------------------
    // CHECK USER EXISTS
    // -----------------------------

    const existingUser =
      await db.orm.public.User
        .where({
          id: parsedUserId,
        })
        .first();

    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message:
          "User not found",
      });
    }

    // -----------------------------
    // CHECK EMAIL
    // -----------------------------

    const emailUser =
      await db.orm.public.User
        .where({
          email: cleanEmail,
        })
        .first();

    if (
      emailUser &&
      emailUser.id !== parsedUserId
    ) {
      return res.status(409).json({
        success: false,
        message:
          "An account with this email already exists",
      });
    }

    // -----------------------------
    // UPDATE USER
    // -----------------------------

    const updatedUser =
      await db.orm.public.User
        .where({
          id: parsedUserId,
        })
        .update({
          name: cleanName,
          username: cleanUsername,
          email: cleanEmail,
          phone: cleanPhone,
        });

    // -----------------------------
    // SAFETY CHECK
    // -----------------------------

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message:
          "User not found",
      });
    }

    // -----------------------------
    // RESPONSE
    // -----------------------------

    return res.status(200).json({
      success: true,

      message:
        "Profile updated successfully",

      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        username: updatedUser.username,
        name: updatedUser.name,
        phone: updatedUser.phone,
        role: updatedUser.role,
        createdAt: updatedUser.createdAt,
      },
    });

  } catch (error) {

    console.error(
      "Update profile error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Something went wrong while updating your profile",
    });
  }
});


// =========================================
// EXPORT ROUTER
// =========================================

export default router;