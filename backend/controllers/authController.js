import User from "../models/user.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Verification from "../models/verification.js";
import { sendEmail } from "../libs/send-email.js";
import aj from "../libs/arcjet.js";
import speakeasy from "speakeasy";
import QRCode from "qrcode";

import dotenv from "dotenv";

dotenv.config();

export const registerUser = async (req, res) => {
  try {
    const { email, name, password } = req.body;

    const decision = await aj.protect(req, { email }); // Deduct 5 tokens from the bucket
    console.log("Arcjet decision", decision);

    if (decision.isDenied()) {
      res.writeHead(403, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ message: "Invalid email address" }));
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      email,
      password: hashedPassword,
      name,
    });

    const verificationToken = jwt.sign(
      {
        userId: newUser._id,
        property: "email-verification",
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h",
      }
    );

    await Verification.create({
      userId: newUser._id,
      token: verificationToken,
      expiresAt: new Date(Date.now() + 1 * 60 * 60 * 1000),
    });

    const verificationLink = `${process.env.CLIENT_URL}/verify-email?token=${verificationToken}`;
    const emailBody = `<p> Click <a href="${verificationLink}">here</a> to verify your email. This link will expire in 1 hour.</p>`;
    const emailSubject = "Email Verification";

    const isEmailSent = await sendEmail(email, emailSubject, emailBody);

    if (!isEmailSent) {
      return res.status(500).json({
        message: "Failed to send verification email",
      });
    }

    res.status(201).json({
      message: "Verification email sent! Please verify your email.",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (!user.isEmailVerified) {
      const existingVerfication = await Verification.findOne({
        userId: user._id,
      });

      if (existingVerfication && existingVerfication.expiresAt > new Date()) {
        return res.status(400).json({
          message:
            "Email not verified. Please check your email for verification link.",
        });
      } else {
        await Verification.findByIdAndDelete(existingVerfication._id);

        const verificationToken = jwt.sign(
          {
            userId: user._id,
            property: "email-verification",
          },
          process.env.JWT_SECRET,
          {
            expiresIn: "1h",
          }
        );

        await Verification.create({
          userId: user._id,
          token: verificationToken,
          expiresAt: new Date(Date.now() + 1 * 60 * 60 * 1000),
        });

        const verificationLink = `${process.env.CLIENT_URL}/verify-email?token=${verificationToken}`;
        const emailBody = `<p> Click <a href="${verificationLink}">here</a> to verify your email. This link will expire in 1 hour.</p>`;
        const emailSubject = "Email Verification";

        const isEmailSent = await sendEmail(email, emailSubject, emailBody);

        if (!isEmailSent) {
          return res.status(500).json({
            message: "Failed to send verification email",
          });
        }

        res.status(201).json({
          message: "Verification email sent! Please verify your email.",
        });
      }
    }

    if (user.isF2AEnabled) {
      return res.status(200).json({
        message: "2FA required",
        isTwoFactorRequired: true,
        userId: user._id,
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(400).json({
        message: "Invalid credentials",
      });
    }

    const token = jwt.sign(
      {
        userId: user._id,
        property: "login",
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    user.lastLogin = new Date();

    await user.save();

    const userData = user.toObject();
    delete userData.password;

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "none",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      message: "Login successful",
      token,
      user,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const logoutUser = async (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });

  res.status(200).json({ message: "Logged out successfully" });
};

export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.body;

    const payload = jwt.verify(token, process.env.JWT_SECRET);

    if (!payload || payload.property !== "email-verification") {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const { userId } = payload;

    const verification = await Verification.findOne({
      userId,
      token,
    });

    if (!verification) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const isTokenExpired = verification.expiresAt < new Date();

    if (isTokenExpired) {
      return res.status(401).json({
        message: "Token expired",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({
        message: "Email already verified",
      });
    }

    user.isEmailVerified = true;

    await user.save();

    await Verification.deleteMany({ userId: user._id });

    res.status(200).json({
      message: "Email verified successfully!",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

export const resetPasswordRequest = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        message: "User not found",
      });
    }

    if (!user.isEmailVerified) {
      return res.status(400).json({
        message: "Email not verified!",
      });
    }

    const existingVerification = await Verification.findOne({
      userId: user._id,
    });

    if (existingVerification && existingVerification.expiresAt > new Date()) {
      return res.status(400).json({
        message: "Reset password request already sent",
      });
    }

    if (existingVerification && existingVerification.expiresAt < new Date()) {
      await Verification.findByIdAndDelete(existingVerification._id);
    }

    const resetPasswordToken = jwt.sign(
      {
        userId: user._id,
        property: "reset-password",
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "15m",
      }
    );

    await Verification.create({
      userId: user._id,
      token: resetPasswordToken,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000),
    });

    const resetPasswordLink = `${process.env.CLIENT_URL}/reset-password?token=${resetPasswordToken}`;
    const emailBody = `<p>Click <a href="${resetPasswordLink}">here</a> to reset your password</p>`;
    const emailSubject = "Reset your password";

    const isEmailSent = await sendEmail(email, emailSubject, emailBody);

    if (!isEmailSent) {
      return res.status(500).json({
        message: "Failed to send reset password email",
      });
    }

    return res.status(200).json({
      message: "Reset password email sent",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

export const verifyResetPasswordTokenAndResetPassword = async (req, res) => {
  try {
    const { token, newPassword, confirmPassword } = req.body;

    const payload = jwt.verify(token, process.env.JWT_SECRET);

    if (!payload) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const { userId, property } = payload;

    if (property !== "reset-password") {
      return res.status(401).json({
        message: "unauthorized",
      });
    }

    const verification = await Verification.findOne({
      userId,
      token,
    });

    if (!verification) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const isTokenExpired = verification.expiresAt < new Date();

    if (isTokenExpired) {
      return res.status(401).json({
        message: "Token expired",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        message: "Passwords do not match",
      });
    }

    const salt = await bcrypt.genSalt(10);

    const hashPassword = await bcrypt.hash(newPassword, salt);

    user.password = hashPassword;

    await user.save();

    await Verification.findByIdAndDelete(verification._id);

    return res.status(200).json({
      message: "Password reset successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message,
    });
  }
};

export const generateF2FASecret = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    const secret = speakeasy.generateSecret({
      name: `Taskly (${user.email})`,
    });

    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);

    res.status(200).json({
      secret: secret.base32,
      qrCodeUrl,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error generating 2FA secret" });
  }
};

export const verifyAndEnable2FA = async (req, res) => {
  try {
    const { token, secret } = req.body;

    const verified = speakeasy.totp.verify({
      secret: secret,
      encoding: "base32",
      token: token,
      window: 1,
    });

    if (verified) {
      const user = await User.findById(req.user._id);
      user.twoFAOtp = secret;
      user.isF2AEnabled = true;

      await user.save();

      res.status(200).json({ message: "2FA enabled successfully" });
    } else {
      res.status(400).json({ message: "Invalid code. Please try again." });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const disable2FA = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.isTwoFactorEnabled = false;
    user.twoFactorSecret = undefined;
    await user.save();
    res.status(200).json({ message: "2FA disabled" });
  } catch (error) {
    res.status(500).json({ message: "Error disabling 2FA" });
  }
};

export const validate2FALogin = async (req, res) => {
  try {
    const { userId, token } = req.body;

    const user = await User.findById(userId);

    if (!user) return res.status(404).json({ message: "User not found" });

    const verified = speakeasy.totp.verify({
      secret: user.twoFAOtp,
      encoding: "base32",
      token: token,
    });

    console.log(verified);

    if (verified) {
      // NOW we generate the JWT and set the cookie
      const jwtToken = jwt.sign(
        { userId: user._id, property: "login" },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );

      // Set Cookie
      res.cookie("token", jwtToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "none",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      return res.status(200).json({
        message: "Login successful",
        user: { name: user.name, email: user.email /* ... */ },
      });
    } else {
      // Debugging: See why it failed
      console.log("--------------------------------");
      console.log("Client sent:", token);
      console.log(
        "Server expected:",
        speakeasy.totp({
          secret: user.twoFAOtp,
          encoding: "base32",
        })
      );
      console.log("--------------------------------");
      return res.status(400).json({ message: "Invalid 2FA code" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};
