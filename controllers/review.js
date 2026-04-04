// controllers/review.js
import Review from "../models/review.js";   // Review model banana padega

// POST /api/reviews/create
export const createReview = async (req, res) => {
  try {
    const { listingId, comment, rating } = req.body;

    if (!listingId || !comment || !rating) {
      return res.status(400).json({ message: "All fields required" });
    }

    const review = await Review.create({
      listing: listingId,
      user: req.user.id,
      comment,
      rating,
    });

    const populated = await review.populate("user", "name email");
    res.status(201).json({ message: "Review added", review: populated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};

// GET /api/reviews/:listingId
export const getReview = async (req, res) => {
  try {
    const reviews = await Review.find({ listing: req.params.listingId })
      .populate("user", "name email")
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
};

// DELETE /api/reviews/:id
export const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: "Review not found" });

    // Sirf apna review ya admin delete kar sakta hai
    if (review.user.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized" });
    }

    await review.deleteOne();
    res.json({ message: "Review deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
};