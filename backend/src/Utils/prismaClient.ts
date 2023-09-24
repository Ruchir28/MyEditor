import { PrismaClient } from '@prisma/client';

// Singleton instance
let prisma: PrismaClient;

// Lazy initialization
function ensurePrismaClient(): PrismaClient {
    if (!prisma) {
        prisma = new PrismaClient();
    }
    return prisma;
}

// Export the client
export const primsaClient = ensurePrismaClient();

// Optional: handle cleanup on shutdown
process.on('exit', () => {
    if (prisma) {
        prisma.$disconnect();
    }
});
