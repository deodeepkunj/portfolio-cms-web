import { z } from "zod";

const seoSchema = z.object({
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
});

export const BlogCreateSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
  content: z.string().min(1),
  excerpt: z.string().min(1),
  bannerImage: z.string().optional(),
  categories: z.array(z.string()).optional(),
  status: z.enum(["draft", "published"]).optional(),
  seo: seoSchema,
});

export const BlogUpdateSchema = z.object({
  title: z.string().min(1),
  newSlug: z.string().min(1).optional(),
  content: z.string().min(1),
  excerpt: z.string().min(1),
  bannerImage: z.string().optional(),
  categories: z.array(z.string()).optional(),
  status: z.enum(["draft", "published"]).optional(),
  seo: seoSchema,
});
