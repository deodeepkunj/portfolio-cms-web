import { z } from "zod";

export const ProjectsSchema = z.object({
  status: z.enum(["draft", "published"]),
  header: z.object({
    badge: z.string(),
    title: z.string(),
    subtitle: z.string().optional(),
  }),
  items: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      description: z.string(),
      imageUrl: z.string().optional(),
      technologies: z.array(z.string()),
      order: z.number(),
      projectUrl: z.string().optional().default(""), // ✅ REQUIRED
    })
  ),
});
