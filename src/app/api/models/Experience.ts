import mongoose, { Schema, Document, Model } from "mongoose";

export interface IExperience extends Document {
  id: number;
  title: string;
  role: string;
  desc: string[];
  year: string;
  location: string;
  order: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ExperienceSchema = new Schema<IExperience>(
  {
    id: { type: Number, required: true, unique: true },
    title: { type: String, required: true, trim: true },
    role: { type: String, required: true, trim: true },
    desc: [{ type: String }],
    year: { type: String, required: true },
    location: { type: String, required: true },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Experience: Model<IExperience> =
  mongoose.models.Experience ||
  mongoose.model<IExperience>("Experience", ExperienceSchema);

export default Experience;
