import mongoose, { Schema, Document } from "mongoose";

export interface IBlog extends Document {
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  bannerImage?: string;
  categories: string[];
  status: "draft" | "published";
  publishedAt?: Date;
  seo: {
    metaTitle: string;
    metaDescription: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const blogSchema = new Schema<IBlog>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
    },
    excerpt: {
      type: String,
      required: true,
    },
    bannerImage: {
      type: String,
      default: "",
    },

    /* ✅ NEW */
    categories: {
      type: [String],
      default: [],
      index: true,
    },

    status: {
      type: String,
      enum: ["draft", "published"],
      default: "draft",
    },
    publishedAt: {
      type: Date,
      default: null,
    },
    seo: {
      metaTitle: {
        type: String,
        trim: true,
      },
      metaDescription: {
        type: String,
        trim: true,
      },
    },
  },
  { timestamps: true }
);

/* Optional but recommended */
blogSchema.pre("save", function (next) {
  if (this.isModified("status") && this.status === "published" && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  next();
});

export default mongoose.models.Blog ||
  mongoose.model<IBlog>("Blog", blogSchema);
