// controllers/adminController.js
import Listing from "../models/listing.js";   // ✅ Course = Listing model tumhara
import User from "../models/user.js";

// ─── COURSES (Listings) ──────────────────────────────────

export const getAllCourses = async (req, res) => {
  try {
    const courses = await Listing.find().sort({ createdAt: -1 });
    res.json(courses);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const createCourse = async (req, res) => {
  try {
    const { title, description, price, location, amenities } = req.body;
    if (!title || !price)
      return res.status(400).json({ message: "Title and Price required" });

    const course = await Listing.create({
      title, description, price, location, amenities,
      host: req.user.id,
    });
    res.status(201).json(course);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const updateCourse = async (req, res) => {
  try {
    const course = await Listing.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!course) return res.status(404).json({ message: "Course not found" });
    res.json(course);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const deleteCourse = async (req, res) => {
  try {
    const course = await Listing.findByIdAndDelete(req.params.id);
    if (!course) return res.status(404).json({ message: "Course not found" });
    res.json({ message: "Course deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ─── USERS ──────────────────────────────────────────────

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const toggleBlockUser = async (req, res) => {
  try {
    const { blocked } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { blocked },
      { new: true }
    ).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ─── ANALYTICS ──────────────────────────────────────────

export const getAnalytics = async (req, res) => {
  try {
    const totalCourses = await Listing.countDocuments();
    const totalUsers = await User.countDocuments();

    // Top 5 listings by price (Order model nahi hai toh listings dikhate hain)
    const topCourses = await Listing.find()
      .sort({ price: -1 })
      .limit(5)
      .select("title price");

    res.json({
      totalRevenue: 0,
      monthRevenue: 0,
      totalOrders: 0,
      monthOrders: 0,
      totalCourses,
      totalUsers,
      topCourses: topCourses.map(c => ({
        title: c.title,
        sales: 0,
        revenue: c.price,
      })),
      monthlyRevenue: [0, 0, 0, 0, 0, 0],
      months: ["Oct", "Nov", "Dec", "Jan", "Feb", "Mar"],
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};