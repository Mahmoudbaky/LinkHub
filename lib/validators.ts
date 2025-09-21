import { z } from "zod";

export const createLinkSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title too long"),
  url: z.string().url("Invalid URL format"),
  description: z.string().optional(),
  userId: z.string(),
});

export const updateUserProfileSchema = z.object({
  name: z.string().min(1, "Name is required").max(50, "Name too long"),
  bio: z.string().max(160, "Bio must be 160 characters or less").optional(),
  avatar: z.string().optional(),
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
