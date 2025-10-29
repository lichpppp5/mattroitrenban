// Simple Prisma client for development
// This will be replaced with actual database connection later

export const prisma = {
  user: {
    findUnique: () => Promise.resolve(null),
    create: () => Promise.resolve({}),
    update: () => Promise.resolve({}),
    delete: () => Promise.resolve({}),
  },
  activity: {
    findMany: () => Promise.resolve([]),
    findUnique: () => Promise.resolve(null),
    create: () => Promise.resolve({}),
    update: () => Promise.resolve({}),
    delete: () => Promise.resolve({}),
  },
  donation: {
    findMany: () => Promise.resolve([]),
    create: () => Promise.resolve({}),
  },
  expense: {
    findMany: () => Promise.resolve([]),
    create: () => Promise.resolve({}),
  },
  siteContent: {
    findUnique: () => Promise.resolve(null),
    upsert: () => Promise.resolve({}),
  },
  media: {
    findMany: () => Promise.resolve([]),
    create: () => Promise.resolve({}),
  },
  contactMessage: {
    create: () => Promise.resolve({}),
  },
  $disconnect: () => Promise.resolve(),
}
