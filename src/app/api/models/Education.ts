import mongoose, { Schema, Document, Model } from "mongoose";

export interface IEducation extends Document {
  id: number;
  title: string;
  degree: string;
  detail: string;
  year: string;
  order: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const EducationSchema = new Schema<IEducation>(
  {
    id: { type: Number, required: true, unique: true },
    title: { type: String, required: true, trim: true },
    degree: { type: String, required: true, trim: true },
    detail: { type: String, required: true },
    year: { type: String, required: true },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Education: Model<IEducation> =
  mongoose.models.Education ||
  mongoose.model<IEducation>("Education", EducationSchema);

export default Education;
