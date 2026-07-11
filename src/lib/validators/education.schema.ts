import { z } from "zod";

export const EducationCreateSchema = z.object({
  title: z.string().min(1),
  degree: z.string().min(1),
  detail: z.string().min(1),
  year: z.string().min(1),
  order: z.number().optional(),
  isActive: z.boolean().optional(),
});

export const EducationUpdateSchema = EducationCreateSchema.partial();
