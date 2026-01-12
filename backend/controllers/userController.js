import { uploadToCloudinary } from "../libs/cloudinary.js";
import User from "../models/user.js";
import bcrypt from "bcrypt";
import Workspace from "../models/workspace.js";
import Project from "../models/project.js";
import Task from "../models/task.js";
import mongoose from "mongoose";

export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "No user found",
      });
    }

    return res.status(200).json(user);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const updateUserProfile = async (req, res) => {
  try {
    const { name } = req.body;

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.name = name;

    await user.save();

    res.status(200).json(user);
  } catch (error) {
    console.error("Error updating user profile:", error);

    res.status(500).json({ message: "Server error" });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    const user = await User.findById(req.user._id).select("+password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (newPassword !== confirmPassword) {
      return res
        .status(400)
        .json({ message: "New password and confirm password do not match" });
    }

    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password
    );

    if (!isPasswordValid) {
      return res.status(403).json({ message: "Invalid old password" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Error changing password:", error);

    res.status(500).json({ message: "Server error" });
  }
};

export const uploadUserProfilePic = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const imageUrl = await uploadToCloudinary(req.file.buffer);

    if (!imageUrl) {
      return res.status(400).json({
        message: "Failed to update your profile pic. Please try again!",
      });
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    user.profilePicture = imageUrl;

    await user.save();

    return res.status(200).json({
      message: "Profile picture updated successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const deleteAccount = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const ownedWorkspaces = await Workspace.find({
      owner: user._id,
    });

    const ownedWorkspaceIds = ownedWorkspaces.map((ws) => ws._id);

    if (ownedWorkspaceIds.length > 0) {
      const projectsInOwnedWorkspaces = await Project.find({
        workspace: { $in: ownedWorkspaceIds },
      }).session(session);

      const projectIds = projectsInOwnedWorkspaces.map((proj) => proj._id);

      await Task.deleteMany({
        project: { $in: projectIds },
      }).session(session);

      await Project.deleteMany({
        workspace: { $in: ownedWorkspaceIds },
      }).session(session);

      await Workspace.deleteMany({
        _id: { $in: ownedWorkspaceIds },
      }).session(session);
    }

    await Workspace.updateMany(
      {
        "members.user": user._id,
      },
      {
        $pull: { members: { user: req.user._id } },
      }
    ).session(session);

    await Project.updateMany(
      {
        "members.user": user._id,
      },
      {
        $pull: {
          members: { user: req.user._id },
        },
      }
    ).session(session);

    await Task.updateMany(
      { $or: [{ assignees: req.user._id }, { watchers: req.user._id }] },
      { $pull: { assignees: req.user._id, watchers: req.user._id } }
    ).session(session);

    await User.deleteOne({ _id: req.user._id }).session(session);

    await session.commitTransaction();
    session.endSession();

    res.clearCookie("token");

    return res.status(200).json({
      message: "Account and all owned data deleted successfully",
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.log(error);
    return res.status(500).json({ message: "Delete failed" });
  }
};
