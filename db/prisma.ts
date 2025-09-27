import { PrismaClient } from "@prisma/client";
import { PrismaLibSQL } from "@prisma/adapter-libsql";

const adapter = new PrismaLibSQL({
  url: process.env.TURSO_DATABASE_URL || "",
  authToken: process.env.TURSO_AUTH_TOKEN,
});
export const prisma = new PrismaClient({ adapter });

// import { PrismaClient } from "@prisma/client";

// const globalForPrisma = globalThis as unknown as {
//   prisma: PrismaClient | undefined;
// };

// export const prisma =
//   globalForPrisma.prisma ??
//   new PrismaClient({
//     log: ["query"],
//     datasources: {
//       db: {
//         url: process.env.DATABASE_URL,
//       },
//     },
//   });

// if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// // Helper function for handling serverless connections
// export async function connectToDatabase() {
//   try {
//     await prisma.$connect();
//     return prisma;
//   } catch (error) {
//     console.error("Failed to connect to database:", error);
//     throw error;
//   }
// }

// // Helper function for graceful disconnection
// export async function disconnectFromDatabase() {
//   await prisma.$disconnect();
// }

// // Connection pool configuration for serverless
// export const prismaConfig = {
//   // Maximum number of connections
//   connection_limit: 10,
//   // Connection timeout in seconds
//   connect_timeout: 15,
//   // Pool timeout in seconds
//   pool_timeout: 15,
//   // SSL mode for Neon
//   sslmode: "require",
// };
