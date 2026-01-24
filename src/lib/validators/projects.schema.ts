import {z} from "zod";

export const ProjectsSchema = z.object({
    status: z.enum(["draft", "published"]),
    header: z.object({
        badge: z.string().min(1),
        title: z.string().min(1),
        subtitle: z.string().optional(),
    }),
    items: z.array(
        z.object({
            id: z.string(),
            title: z.string().min(1),
            description: z.string().min(1),
            imageUrl: z.string().url().optional().or(z.literal("")),
            technologies: z.array(z.string()),
            order: z.number(),
        })
    ),
});