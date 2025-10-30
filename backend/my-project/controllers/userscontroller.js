const User = require("../models/usermodel")
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const Cart = require("../models/cartmodel");
const mongoose = require("mongoose")


const addUser = async (req, res) => {
  const { fname, lname, email, password, role } = req.body;

  if (!fname || !lname || !email || !password) {
    return res.status(400).json({
      error: "All fields (fname, lname, email, password) are required",
    });
  }

  if (password.length < 6) {
    return res.status(400).json({
      error: "Password must be at least 6 characters",
    });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        error: "Email already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      fname,
      lname,
      email,
      password: hashedPassword,
      role: role || "user", 
    });

    const newCart = new Cart({
      userId: newUser._id,
    });

    await newCart.save();
    newUser.cart = newCart._id;
    await newUser.save();

    res.status(201).json({
      message: "User created successfully",
      user: {
        _id: newUser._id,
        fname: newUser.fname,
        lname: newUser.lname,
        email: newUser.email,
        role: newUser.role,
        cart: newUser.cart,
      },
    });
  } catch (error) {
    console.error("Error while creating user:", error.message);
    if (error.name === "MongoError" && error.code === 11000) {
      return res.status(400).json({
        error: "Email already exists", 
      });
    }
    return res.status(500).json({
      error: "Server error while creating user",
    });
  }
};


const getallUsers = async (req, res) => {
  const users = await User.find()
  res.json(users)
}



const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({
        error: "Please enter both email and password.",
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        error: "Email not found. Please sign up first.",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        error: "Incorrect password. Please try again.", 
      });
    }

    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
        fname: user.fname,
        lname: user.lname,
        email: user.email,
      },
      process.env.secret_key,
      { expiresIn: "7d" }
    );

    res.status(200).json({
      message: "Login successful",
      token,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      error: "Server error during login. Please try again later.",
    });
  }
};

const getUserbyID = async (req, res) => {
  const id = req.params.userID
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ success: false, message: "Invalid product ID" })
  }
  try {
    const user = await User.findById(id)
    res.json(user)

  } catch (error) {
    console.log("Error while reading user id", id);
    return res.send("Error")
  }
}

const deleteUserbyID = async (req, res) => {
  const id = req.params.userID
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ success: false, message: "Invalid product ID" })
  }
  try {
    const user = await User.findByIdAndDelete(id)
    res.json(user)

  } catch (error) {
    console.log("Error while reading user id", id);
    return res.send("Error")
  }
}
const updateUserByID = async (req, res) => {
  const id = req.params.userID;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid user ID",
    });
  }

  try {
    const { fname, lname, email, password, role } = req.body;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (fname) user.fname = fname;
    if (lname) user.lname = lname;
    if (email) user.email = email;
    if (role) user.role = role;

    if (password) {
      if (password.length < 6) {
        return res.status(400).json({
          success: false,
          message: "Password must be at least 6 characters",
        });
      }
      const hashed = await bcrypt.hash(password, 10);
      user.password = hashed;
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: "User info updated successfully",
      user: {
        _id: user._id,
        fname: user.fname,
        lname: user.lname,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({
      success: false,
      message: "Server error while updating user info",
    });
  }
};

const updateMyProfile = async (req, res) => {
  try {
const userId = req.user._id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const { fname, lname, email, password } = req.body;

    if (fname) user.fname = fname;
    if (lname) user.lname = lname;
    if (email) user.email = email;

    if (password) {
      if (password.length < 6) {
        return res.status(400).json({
          success: false,
          message: "Password must be at least 6 characters",
        });
      }
      if (typeof password !== "string") {
  return res.status(400).json({
    success: false,
    message: "Password must be a string",
  });
}

const hashedPassword = await bcrypt.hash(password.toString(), 10);
      user.password = hashedPassword;
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: {
        _id: user._id,
        fname: user.fname,
        lname: user.lname,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({
      success: false,
      message: "Server error while updating profile",
    });
  }
};


module.exports = { addUser, deleteUserbyID, getUserbyID, getallUsers, loginUser,updateUserByID , updateMyProfile}