import mongoose, { Schema, Document, Model } from "mongoose";

export interface IRecommendation extends Document {
  name: string;
  image: string;
  designation: string;
  company: string;
  view: string;
  linkedinURL: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const RecommendationSchema = new Schema<IRecommendation>(
  {
    name: { type: String, required: true, trim: true },
    image: { type: String, required: true },
    designation: { type: String, required: true },
    company: { type: String, required: true },
    view: { type: String, required: true },
    linkedinURL: { type: String, required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Recommendation: Model<IRecommendation> =
  mongoose.models.Recommendation ||
  mongoose.model<IRecommendation>("Recommendation", RecommendationSchema);

export default Recommendation;
