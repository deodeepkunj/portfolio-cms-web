import {z} from "zod";

export const FeatureSchema = z.object({
    id: z.string(),
    icon: z.string(),
    text: z.string().min(1),
    order: z.number(),
});

export const AboutUsSchema = z.object({
    status: z.enum(["draft", "published"]),
    header: z.object({
        badge: z.string(),
        title: z.string(),
        subtitle: z.string(),
    }),
    hero: z.object({
        imageUrl: z.string().url(),
        yearsOfExperience: z.number().min(0),
    }),
    content: z.object({
        heading: z.string(),
        paragraphs: z.array(z.string()),
    }),
    features: z.array(FeatureSchema),
});