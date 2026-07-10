import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().email(),
  password: z.string().min(8).max(128),
  keyFob: z.string().trim().min(2, "Enter your member key fob number.").max(80)
});

export const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1)
});

export const voteSchema = z.object({
  classSlotId: z.string().min(1),
  value: z.enum(["YES", "NO"])
});

export const classSchema = z
  .object({
    title: z.string().trim().min(2).max(100),
    description: z.string().trim().max(500).optional(),
    releaseAt: z.string().datetime(),
    closesAt: z.string().datetime().nullable().optional()
  })
  .refine(
    (data) => !data.closesAt || new Date(data.closesAt) > new Date(data.releaseAt),
    {
      message: "Closing time must be after release time.",
      path: ["closesAt"]
    }
  );
