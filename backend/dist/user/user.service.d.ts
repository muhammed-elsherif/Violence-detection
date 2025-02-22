import { PrismaClient, UserRole } from '@prisma/client';
export declare class UserService {
    private prisma;
    constructor(prisma: PrismaClient);
    createUser(username: string, email: string, password: string, role?: UserRole): Promise<{
        id: string;
        username: string;
        email: string;
        password: string;
        role: import(".prisma/client").$Enums.UserRole;
        createdAt: Date;
        updatedAt: Date;
    }>;
    findOneByEmail(email: string): Promise<{
        id: string;
        username: string;
        email: string;
        password: string;
        role: import(".prisma/client").$Enums.UserRole;
        createdAt: Date;
        updatedAt: Date;
    } | null>;
    validateUser(email: string, password: string): Promise<{
        id: string;
        username: string;
        email: string;
        role: import(".prisma/client").$Enums.UserRole;
        createdAt: Date;
        updatedAt: Date;
    } | null>;
}
