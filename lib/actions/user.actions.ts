"use server";
import { prisma } from "@/db/prisma";

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
