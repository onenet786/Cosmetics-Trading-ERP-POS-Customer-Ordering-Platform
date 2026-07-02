// src/db/prisma.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const initDatabase = async () => {
  await prisma.$connect();
  console.log('✅ Prisma connected');
};

export const dbService = {
  async getCollection<T>(name: string): Promise<T[]> {
    // @ts-ignore dynamic access
    return (prisma as any)[name].findMany();
  },
  async saveDoc<T extends { id: string }>(name: string, data: T): Promise<void> {
    // @ts-ignore dynamic access
    await (prisma as any)[name].upsert({ where: { id: data.id }, update: data, create: data });
  },
  async updateDoc(name: string, id: string, fields: Record<string, any>): Promise<void> {
    // @ts-ignore dynamic access
    await (prisma as any)[name].update({ where: { id }, data: fields });
  },
  async deleteDoc(name: string, id: string): Promise<void> {
    // @ts-ignore dynamic access
    await (prisma as any)[name].delete({ where: { id } });
  },
};
