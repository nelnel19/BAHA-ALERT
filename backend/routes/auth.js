const router = require("express").Router();
const User = require("../models/User");
const upload = require("../middleware/multer");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Register
router.post("/register", async (req, res) => {
  try {
    const { name, fullname, email, password, age } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ msg: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      fullname,
      email,
      password: hashedPassword,
      age,
    });

    await newUser.save();
    res.json({ msg: "User registered" });
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({ msg: "Internal server error" });
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        fullname: user.fullname,
        email: user.email,
        age: user.age,
        profileImage: user.profileImage,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ msg: "Internal server error" });
  }
});

// Edit profile (with optional password update)
router.put("/edit/:id", upload.single("profileImage"), async (req, res) => {
  try {
    const { name, fullname, age, password } = req.body;
    const updateFields = { name, fullname, age };

    // If a new profile image is uploaded
    if (req.file && req.file.path) {
      updateFields.profileImage = req.file.path;
    }

    // If a new password is provided, hash it
    if (password && password.trim() !== "") {
      const hashedPassword = await bcrypt.hash(password, 10);
      updateFields.password = hashedPassword;
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      updateFields,
      { new: true }
    );

    res.json({
      msg: "Profile updated",
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        fullname: updatedUser.fullname,
        email: updatedUser.email,
        age: updatedUser.age,
        profileImage: updatedUser.profileImage,
        role: updatedUser.role,
        createdAt: updatedUser.createdAt,
        updatedAt: updatedUser.updatedAt,
      },
    });
  } catch (err) {
    console.error("Edit error:", err);
    res.status(500).json({ msg: "Internal server error" });
  }
});

// Delete account
router.delete("/delete/:id", async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ msg: "User deleted" });
  } catch (err) {
    console.error("Delete error:", err);
    res.status(500).json({ msg: "Internal server error" });
  }
});
// Get user statistics for dashboard (no auth required)
router.get("/stats", async (req, res) => {
  try {
    // Get total number of users
    const totalUsers = await User.countDocuments();
    
    // Get users grouped by creation date (for chart)
    const usersByDate = await User.aggregate([
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id": 1 } }
    ]);

    res.json({
      totalUsers,
      usersByDate
    });
  } catch (err) {
    console.error("Stats error:", err);
    res.status(500).json({ msg: "Internal server error" });
  }
});

// Get total number of users
router.get("/count", async (req, res) => {
  try {
    const count = await User.countDocuments();
    res.json({ totalUsers: count });
  } catch (err) {
    console.error("Count error:", err);
    res.status(500).json({ msg: "Internal server error" });
  }
});

module.exports = router;