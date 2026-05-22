import express from "express";
const router = express.Router();
import verifyToken from "../middleware/verifyToken.js";
import { isAdmin } from "../middleware/authorizeRole.js";
import upload from "../middleware/upload.js";    
 
import {
  createListing,
  getAllListings,
  getListingById,
  deleteListing,
  updateListing,
  reportAnalytics 
} from "../controllers/listingController.js";     

// Routes
router.post("/create", verifyToken, upload.array("images", 10), createListing);
router.get("/", getAllListings);
router.get("/:id", getListingById);
router.delete("/:id", verifyToken, isAdmin, deleteListing);
router.put("/:id", verifyToken, isAdmin, upload.array("images", 10), updateListing);
router.get("/report-analytics", reportAnalytics);

export default router;