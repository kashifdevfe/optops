import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixMigration() {
  try {
    // Check if categories table exists
    const categoriesExist = await prisma.$queryRaw`
      SELECT name FROM sqlite_master WHERE type='table' AND name='categories'
    `;
    
    if (categoriesExist.length === 0) {
      console.log('Creating categories table...');
      await prisma.$executeRawUnsafe(`
        CREATE TABLE "categories" (
          "id" TEXT NOT NULL PRIMARY KEY,
          "name" TEXT NOT NULL,
          "companyId" TEXT NOT NULL,
          "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" DATETIME NOT NULL,
          CONSTRAINT "categories_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies" ("id") ON DELETE CASCADE ON UPDATE CASCADE
        )
      `);
    }

    // Check if categoryId column exists
    const columns = await prisma.$queryRaw`
      PRAGMA table_info(inventory_items)
    `;
    
    const hasCategoryId = columns.some((col) => col.name === 'categoryId');
    
    if (!hasCategoryId) {
      console.log('Adding categoryId column...');
      await prisma.$executeRawUnsafe(`
        ALTER TABLE "inventory_items" ADD COLUMN "categoryId" TEXT
      `);
    }

    // Create categories from existing inventory items
    console.log('Creating categories from existing items...');
    await prisma.$executeRawUnsafe(`
      INSERT OR IGNORE INTO "categories" ("id", "name", "companyId", "createdAt", "updatedAt")
      SELECT 
        lower(hex(randomblob(4)) || '-' || hex(randomblob(2)) || '-' || hex(randomblob(2)) || '-' || hex(randomblob(2)) || '-' || hex(randomblob(6))) as id,
        category as name,
        companyId,
        CURRENT_TIMESTAMP as createdAt,
        CURRENT_TIMESTAMP as updatedAt
      FROM inventory_items
      WHERE category IS NOT NULL
      GROUP BY companyId, category
    `);

    // Update inventory_items to set categoryId
    console.log('Updating inventory items with categoryId...');
    await prisma.$executeRawUnsafe(`
      UPDATE inventory_items
      SET categoryId = (
        SELECT id FROM categories 
        WHERE categories.name = inventory_items.category 
        AND categories.companyId = inventory_items.companyId
        LIMIT 1
      )
      WHERE categoryId IS NULL
    `);

    // Create index
    try {
      await prisma.$executeRawUnsafe(`
        CREATE INDEX "inventory_items_categoryId_idx" ON "inventory_items"("categoryId")
      `);
    } catch (e) {
      // Index might already exist
    }

    // Create unique index on categories
    try {
      await prisma.$executeRawUnsafe(`
        CREATE UNIQUE INDEX "categories_name_companyId_key" ON "categories"("name", "companyId")
      `);
    } catch (e) {
      // Index might already exist
    }

    console.log('Migration fix completed!');
  } catch (error) {
    console.error('Error fixing migration:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixMigration();

