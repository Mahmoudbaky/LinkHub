import { prisma } from "../db/prisma";

async function checkDatabase() {
  try {
    console.log("Checking database contents...");

    // Check users
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
      },
    });
    console.log("Users found:", users);

    // Check links
    const links = await prisma.link.findMany({
      select: {
        id: true,
        title: true,
        userId: true,
        appearInSlider: true,
        bannerImage: true,
      },
    });
    console.log("Links found:", links);

    // Check if database is empty
    if (users.length === 0) {
      console.log(
        "No users found - database appears to be empty after migration reset"
      );
    }
  } catch (error) {
    console.error("Error checking database:", error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabase();
