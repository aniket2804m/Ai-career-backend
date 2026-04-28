import mongoose from "mongoose";

const ListingSchema = new mongoose.Schema({
    title: {type: String, required: true},
    description: String,
    // price: {type: Number, required: true},
    date: { type: Date, default: Date.now },
    location: String,
    amenities: String,
    images: [              // ✅ String se Array mein change kiya
      {
        url: String,       // Cloudinary image URL
        public_id: String  // Delete ke liye
      }
    ],
    host: {type: mongoose.Schema.Types.ObjectId, ref: "User", }
}, {timestamps: true}
);

const Listing = mongoose.model("Listing", ListingSchema);

export default Listing;