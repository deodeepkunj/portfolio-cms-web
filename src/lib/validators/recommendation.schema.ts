import { z } from "zod";

export const RecommendationCreateSchema = z.object({
  name: z.string().min(1),
  image: z.string().min(1),
  designation: z.string().min(1),
  company: z.string().min(1),
  view: z.string().min(1),
  linkedinURL: z.string().min(1),
  isActive: z.boolean().optional(),
});

export const RecommendationUpdateSchema = RecommendationCreateSchema.partial();
