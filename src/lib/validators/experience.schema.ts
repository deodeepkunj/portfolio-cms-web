import { z } from "zod";

export const ExperienceCreateSchema = z.object({
  title: z.string().min(1),
  role: z.string().min(1),
  desc: z.array(z.string().min(1)).min(1),
  year: z.string().min(1),
  location: z.string().min(1),
  order: z.number().optional(),
  isActive: z.boolean().optional(),
});

export const ExperienceUpdateSchema = ExperienceCreateSchema.partial();
