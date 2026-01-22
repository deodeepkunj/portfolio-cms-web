import type { ReactNode } from "react";
import mongoose from 'mongoose';

declare global {
  var mongoose: {
    conn: mongoose.Mongoose | null;
    promise: Promise<mongoose.Mongoose> | null;
  };
}

 type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  subItems?: { name: string; path: string; pro?: boolean; new?: boolean }[];
};


 type BlogPost = {
  id: string;
  title: string;
  slug: string;
  content: string; // CKEditor HTML
  excerpt: string;
  featuredImage?: string;
  status: "draft" | "published";
  publishedAt?: string;
  seo: {
    metaTitle: string;
    metaDescription: string;
    noIndex?: boolean;
  };
};
