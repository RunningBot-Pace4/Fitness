import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().trim().min(2, "Name must contain at least 2 characters.").max(80),
  email: z.string().trim().email("Enter a valid email address."),
  password: z.string().min(8, "Password must contain at least 8 characters.").max(128),
  centerKey: z.string().trim().min(3).max(64)
});

export const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid email address."),
  password: z.string().min(1, "Password is required.")
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
