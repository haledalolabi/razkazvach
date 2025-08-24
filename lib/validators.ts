import { z } from "zod";

export const StoryUpsertSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(3).max(120),
  slug: z
    .string()
    .min(3)
    .max(140)
    .regex(/^[a-z0-9-]+$/),
  description: z.string().min(10).max(500),
  tags: z
    .string()
    .transform((s) =>
      s
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
    )
    .optional(),
  ageMin: z.coerce.number().min(3).max(12),
  ageMax: z.coerce.number().min(3).max(12),
  isInteractive: z.coerce.boolean().optional().default(false),
  bodyHtml: z.string().optional(),
});
