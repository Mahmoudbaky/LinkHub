import { z } from "zod";

export const createUserSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters long")
    .max(20, "Username must be at most 20 characters long")
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Username can only contain letters, numbers, and underscores"
    ),
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(
      /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/,
      "Password must contain at least one special character"
    ),
  name: z.string().min(1, "Name is required").max(50, "Name too long"),
});

export const createLinkSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title too long"),
  url: z.string().url("Invalid URL format"),
  description: z.string().optional(),
  userId: z.string(),
  appearInSlider: z.boolean().default(false).optional(),
  bannerImage: z.string().nullable().optional(),
});

export const updateUserProfileSchema = z.object({
  name: z.string().min(1, "Name is required").max(50, "Name too long"),
  bio: z.string().max(160, "Bio must be 160 characters or less").optional(),
  avatar: z.string().optional(),
});

export const updateUserAppearanceSchema = z.object({
  theme: z.string().optional(),
  backgroundColor: z.string().nullable().optional(),
  textColor: z.string().nullable().optional(),
  titleColor: z.string().nullable().optional(),
});

export const updateUserSocialLinksSchema = z.object({
  facebook: z
    .string()
    .optional()
    .refine(
      (val) => !val || val === "" || val.includes("facebook.com"),
      "Must be a valid Facebook URL"
    ),
  twitter: z
    .string()
    .optional()
    .refine(
      (val) =>
        !val ||
        val === "" ||
        val.includes("twitter.com") ||
        val.includes("x.com"),
      "Must be a valid Twitter/X URL"
    ),
  instagram: z
    .string()
    .optional()
    .refine(
      (val) => !val || val === "" || val.includes("instagram.com"),
      "Must be a valid Instagram URL"
    ),
  linkedin: z
    .string()
    .optional()
    .refine(
      (val) => !val || val === "" || val.includes("linkedin.com"),
      "Must be a valid LinkedIn URL"
    ),
  tiktok: z
    .string()
    .optional()
    .refine(
      (val) => !val || val === "" || val.includes("tiktok.com"),
      "Must be a valid TikTok URL"
    ),
  youtube: z
    .string()
    .optional()
    .refine(
      (val) => !val || val === "" || val.includes("youtube.com"),
      "Must be a valid YouTube URL"
    ),
});

// Zod schema for link theme validation
export const linkThemeSchema = z.object({
  backgroundColor: z.string().nullable().optional(),
  textColor: z.string().nullable().optional(),
  icon: z.string().nullable().optional(),
});

// Zod schema for link slider settings validation
export const linkSliderSchema = z.object({
  appearInSlider: z.boolean(),
  bannerImage: z.string().nullable().optional(),
});
