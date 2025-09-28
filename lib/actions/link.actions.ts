"use server";

import { prisma } from "@/db/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createLinkSchema, linkSliderSchema } from "@/lib/validators";

export const createLink = async (data: z.infer<typeof createLinkSchema>) => {
  try {
    const reformattedData = {
      ...data,
      url: data.url.startsWith("https://") ? data.url : `https://${data.url}`,
    };

    // Validate input
    const validatedData = createLinkSchema.parse(reformattedData);

    // Get the current highest position for this user
    const lastLink = await prisma.link.findFirst({
      where: { userId: validatedData.userId },
      orderBy: { position: "desc" },
      select: { position: true },
    });

    const newPosition = (lastLink?.position || -1) + 1;

    // Create the link
    const link = await prisma.link.create({
      data: {
        ...validatedData,
        position: newPosition,
        isActive: true,
        clicks: 0,
      },
    });

    // Revalidate the dashboard page
    revalidatePath("/");

    return { success: true, message: "Link created successfully", data: link };
  } catch (error) {
    console.error("Error creating link:", error);

    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: "Validation failed",
        details: error,
      };
    }

    return {
      success: false,
      error: "Failed to create link",
    };
  }
};

export const updateLinkPositions = async (
  userId: string,
  links: { id: string; position: number }[]
) => {
  try {
    await prisma.$transaction(
      links.map((link) => {
        return prisma.link.update({
          where: { id: link.id },
          data: { position: link.position },
        });
      })
    );
  } catch (error) {
    console.error("Error updating link positions:", error);
  }
};

export const editLink = async (
  id: string,
  data: Partial<z.infer<typeof createLinkSchema>>
) => {
  console.log("Editing link in action:", id, data);
  try {
    // First check if the link exists
    const existingLink = await prisma.link.findUnique({
      where: { id },
    });

    if (!existingLink) {
      console.error("Link not found with ID:", id);
      return {
        success: false,
        error: "Link not found. Please refresh the page and try again.",
      };
    }

    const link = await prisma.link.update({
      where: { id },
      data,
    });

    // Revalidate the page to refresh the data
    revalidatePath("/");

    return { success: true, message: "Link updated successfully", data: link };
  } catch (error) {
    console.error("Error updating link:", error);
    return { success: false, error: "Failed to update link" };
  }
};

export const deleteLink = async (id: string) => {
  try {
    await prisma.link.delete({
      where: { id },
    });
    return { success: true, message: "Link deleted successfully" };
  } catch (error) {
    console.error("Error deleting link:", error);
    return { success: false, error: "Failed to delete link" };
  }
};

export const toggleLinkActivation = async (id: string, isActive: boolean) => {
  console.log("Toggling link in action:", id, isActive);
  try {
    const link = await prisma.link.update({
      where: { id },
      data: { isActive: isActive },
    });
    return { success: true, message: "Link updated successfully", data: link };
  } catch (error) {
    console.error("Error updating link:", error);
    return { success: false, error: "Failed to update link" };
  }
};

export const editLinkTheme = async (
  id: string,
  data: {
    backgroundColor: string | null;
    textColor: string | null;
    icon: string | null;
  }
) => {
  try {
    const link = await prisma.link.update({
      where: { id },
      data,
    });
    return {
      success: true,
      message: "Link theme updated successfully",
      data: link,
    };
  } catch (error) {
    console.error("Error updating link theme:", error);
    return { success: false, error: "Failed to update link theme" };
  }
};

export const incrementLinkClicks = async (id: string) => {
  try {
    const link = await prisma.link.update({
      where: { id },
      data: { clicks: { increment: 1 } },
    });
    return {
      success: true,
      message: "Link clicks incremented successfully",
      data: link,
    };
  } catch (error) {
    console.error("Error incrementing link clicks:", error);
    return { success: false, error: "Failed to increment link clicks" };
  }
};

export const updateLinkSliderSettings = async (
  id: string,
  data: z.infer<typeof linkSliderSchema>
) => {
  try {
    const link = await prisma.link.update({
      where: { id },
      data,
    });
    return {
      success: true,
      message: "Link slider settings updated successfully",
      data: link,
    };
  } catch (error) {
    console.error("Error updating link slider settings:", error);
    return { success: false, error: "Failed to update link slider settings" };
  }
};
