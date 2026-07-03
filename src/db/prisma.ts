// src/db/prisma.ts
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import { getDatabaseUrl } from '../../prisma/prisma.config';

const pool = new pg.Pool({ connectionString: getDatabaseUrl() });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const getModelName = (collectionName: string): string => {
  switch (collectionName) {
    case 'coaAccounts': return 'coaAccount';
    case 'returnRequests': return 'returnRequest';
    case 'stockTransfers': return 'stockTransfer';
    case 'parties': return 'party';
    case 'batches': return 'batch';
    case 'branches': return 'branch';
    default:
      if (collectionName.endsWith('s')) {
        return collectionName.slice(0, -1);
      }
      return collectionName;
  }
};

const getParsedId = (modelName: string, id: any): any => {
  const integerIdModels = ['customer', 'product', 'variant', 'batch'];
  if (integerIdModels.includes(modelName)) {
    const parsed = Number(id);
    return isNaN(parsed) ? id : parsed;
  }
  return id;
};

export const initDatabase = async () => {
  await prisma.$connect();
  console.log('✅ Prisma connected');
};

export const dbService = {
  async getCollection<T>(name: string): Promise<T[]> {
    const model = getModelName(name);
    // @ts-ignore dynamic access
    return (prisma as any)[model].findMany();
  },
  async saveDoc<T extends { id: any }>(name: string, data: T): Promise<void> {
    const model = getModelName(name);
    const parsedId = getParsedId(model, data.id);
    const payload = { ...data, id: parsedId };
    // @ts-ignore dynamic access
    await (prisma as any)[model].upsert({
      where: { id: parsedId },
      update: payload,
      create: payload,
    });
  },
  async updateDoc(name: string, id: string, fields: Record<string, any>): Promise<void> {
    const model = getModelName(name);
    const parsedId = getParsedId(model, id);
    const payload = { ...fields };
    if (payload.hasOwnProperty('id')) {
      payload.id = getParsedId(model, payload.id);
    }
    // @ts-ignore dynamic access
    await (prisma as any)[model].update({ where: { id: parsedId }, data: payload });
  },
  async deleteDoc(name: string, id: string): Promise<void> {
    const model = getModelName(name);
    const parsedId = getParsedId(model, id);
    // @ts-ignore dynamic access
    await (prisma as any)[model].delete({ where: { id: parsedId } });
  },
};
