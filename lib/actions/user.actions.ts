"use server";
import { prisma } from "@/db/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";

import { createUserSchema, updateUserAppearanceSchema } from "../validators";

// Register new user
export const registerUser = async (formData: {
  username: string;
  email: string;
  password: string;
  name: string;
}) => {
  try {
    // Validate input
    const validatedData = createUserSchema.parse(formData);

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: validatedData.email },
          { username: validatedData.username },
        ],
      },
    });

    if (existingUser) {
      return {
        error:
          existingUser.email === validatedData.email
            ? "Email already exists"
            : "Username already exists",
      };
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(validatedData.password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        username: validatedData.username,
        email: validatedData.email,
        password: hashedPassword,
        name: validatedData.name,
      },
    });

    return {
      success: true,
      user: { id: user.id, username: user.username, email: user.email },
    };
  } catch (error) {
    console.error("Registration error:", error);
    return { error: "Failed to create account" };
  }
};

// Sign in with credentials

export const getUserById = async (id: string) => {
  return prisma.user.findUnique({
    where: { id },
    include: {
      links: {
        orderBy: {
          position: "asc",
        },
      },
    },
  });
};

export const getUserByUserName = async (username: string) => {
  const user = await prisma.user.findUnique({
    where: { username },
    include: {
      links: {
        orderBy: {
          position: "asc",
        },
      },
    },
  });
  return user;
};

export const updateUserProfileInfo = async (
  id: string,
  name: string,
  bio: string,
  avatar: string
) => {
  try {
    const res = await prisma.user.update({
      where: { id },
      data: { name, bio, avatar },
    });
    return res;
  } catch (error) {
    console.error("Failed to update user profile information:", error);
  }
};

export const updateUserSocialLinks = async (
  id: string,
  facebook: string,
  twitter: string,
  instagram: string,
  linkedin: string,
  tiktok: string,
  youtube: string
) => {
  try {
    const res = await prisma.user.update({
      where: { id },
      data: {
        facebook,
        twitter,
        instagram,
        linkedin,
        tiktok,
        youtube,
      },
    });
    return res;
  } catch (error) {
    console.error("Failed to update user social links:", error);
  }
};

export const updateUserTheme = async (
  id: string,
  data: z.infer<typeof updateUserAppearanceSchema>
) => {
  try {
    const res = await prisma.user.update({
      where: { id },
      data,
    });
    return res;
  } catch (error) {
    console.error("Failed to update user theme:", error);
  }
};
