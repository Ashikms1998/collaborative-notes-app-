import User from "../models/user.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const userSignUp = async (req, res) => {
  const { username, email, password } = req.body;
  try {
    if (!username || !email || !password) {
      return res.status(400).json({ message: "All fields are required." });
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      return res.status(400).json({ message: "Invalid email format." });
    }
    if (password.length < 8) {
      return res
        .status(400)
        .json({ message: "Password must be at least 8 characters long." });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(401)
        .json({ message: "User with this email already exists." });
    }

    const saltRounds = 10;
    const hashPassword = await bcrypt.hash(password, saltRounds);

    const newUser = new User({
      fullName:username,
      email,
      password: hashPassword,
    });
    await newUser.save();
    return res
      .status(201)
      .json({ status: true, message: "user registration successfull" });
  } catch (error) {
    console.error("User signup error:", error);
    return res.status(500).json({
      message: "An error occurred during registration. Please try again.",
    });
  }
};

export const userLogin = async (req, res) => {
  const { email, password } = req.body;
  const secret = process.env.ACCESS_TOKEN_SECRET;
  try {
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    if (!secret) {
      console.error("ACCESS_TOKEN_SECRET is missing in environment variables.");
      return res.status(500).json({ message: "Server configuration error" });
    }

    const token = jwt.sign(
      { username: user.fullName, userid: user._id },
      secret,
      {
        expiresIn: "1h",
      }
    );
    res.cookie("token", token, { httpOnly: true, maxAge: 3600000 });
    return res.status(200).json({
      status: true,
      message: "login successfully",
      userId: user._id,
      username: user.fullName,
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "An error occurred during login" });
  }
};

export const userLogout = async (req, res) => {
  try {
    res.clearCookie("token", { path: "/" });
    return res.status(200).json({ status: true, message: "Logout successful" });
  } catch (error) {
    console.error("Error during logout:", error);
    res.status(500).json({ status: false, message: "Logout failed" });
  }
};
