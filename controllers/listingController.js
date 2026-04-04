import Listing from "../models/courseListing.model.js";
import cloudinary from "../config/cloudinary.js";

// POST - Create Listing
export const createListing = async (req, res) => {
  try {
    const { title, description, price, location, amenities } = req.body;

    // Validate
    if (!title || !price) {
      return res.status(400).json({ message: "Required field missing" });
    }

    // Cloudinary se images URL lo
    const images = req.files && req.files.length > 0
      ? req.files.map(file => ({
          url: file.path,
          public_id: file.filename
        }))
      : [];

    const newListing = new Listing({
      title,
      description,
      price,
      location,
      amenities,
      images,           // ✅ images add ki
      host: req.user.id
    });

    await newListing.save();

    res.status(201).json({
      message: "Listing Created Successfully",
      listing: newListing
    });
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
};

// GET - All Listings
export const getAllListings = async (req, res) => {
  try {
    // Step 1: Query params lo
    const { search, minPrice, maxPrice, category } = req.query;

    // Step 2: Empty query object banao
    const query = {};

    // Step 3: Agar search hai toh add karo
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    // Step 4: Agar category hai toh add karo
    if (category) {
      query.amenities = { $regex: category, $options: "i" };
    }

    // Step 5: Agar price range hai toh add karo
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // Step 6: Query run karo
    const listings = await Listing.find(query).sort({ createdAt: -1 });

    res.json(listings);
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
};

// GET - Single Listing by ID
export const getListingById = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) {
      return res.status(404).json({ message: "Listing not found" });
    }
    res.json(listing);
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
};

// DELETE - Listing
export const deleteListing = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({ message: "Listing not found" });
    }

    // ✅ Cloudinary se images delete karo pehle
    for (const img of listing.images) {
      await cloudinary.uploader.destroy(img.public_id);
    }

    await listing.deleteOne();
    res.status(200).json({ message: "Listing deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
};

export const updateListing = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({ message: "Listing not found" });
    }

    // Update object banao
    const updateData = {};

    // Text fields
    const { title, description, price, location, amenities } = req.body;
    if (title) updateData.title = title;
    if (description) updateData.description = description;
    if (price) updateData.price = price;
    if (location) updateData.location = location;
    if (amenities) updateData.amenities = amenities;

    // ✅ Nayi images aayi hain toh
    if (req.files && req.files.length > 0) {
      // Purani images delete karo (public_id check ke saath)
      for (const img of listing.images) {
        if (img.public_id) {
          await cloudinary.uploader.destroy(img.public_id);
        }
      }

      // Nayi images set karo
      updateData.images = req.files.map(file => ({
        url: file.path,
        public_id: file.filename
      }));
    }

    // ✅ findByIdAndUpdate use karo — version conflict nahi hoga
    const updatedListing = await Listing.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true } // Updated document return karo
    );

    res.status(200).json({
      message: "Listing Updated Successfully",
      listing: updatedListing
    });

  } catch (err) {
    console.error("UPDATE ERROR:", err);
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};