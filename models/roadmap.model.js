
import mongoose from 'mongoose';

const roadmapSchema = new mongoose.Schema(
  {
    topic:       { type: String, required: true, trim: true },
    hours:       { type: String, required: true },
    level:       { type: String, required: true, enum: ['beginner', 'intermediate', 'advanced'] },
    goal:        { type: String, required: true, trim: true },
    roadmapText: { type: String, required: true },
  },
  { timestamps: true }   // createdAt + updatedAt auto-manage karta hai
);

const Roadmap = mongoose.model('Roadmap', roadmapSchema);

export default Roadmap;