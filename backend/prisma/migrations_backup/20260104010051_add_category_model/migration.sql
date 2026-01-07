-- CreateTable
CREATE TABLE "categories" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "categories_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Create default categories for each company based on existing inventory items
INSERT INTO "categories" ("id", "name", "companyId", "createdAt", "updatedAt")
SELECT 
    lower(hex(randomblob(4)) || '-' || hex(randomblob(2)) || '-' || hex(randomblob(2)) || '-' || hex(randomblob(2)) || '-' || hex(randomblob(6))) as id,
    category as name,
    companyId,
    CURRENT_TIMESTAMP as createdAt,
    CURRENT_TIMESTAMP as updatedAt
FROM inventory_items
GROUP BY companyId, category;

-- Add categoryId column to inventory_items
ALTER TABLE "inventory_items" ADD COLUMN "categoryId" TEXT;

-- Update inventory_items to set categoryId based on category name
UPDATE inventory_items
SET categoryId = (
    SELECT id FROM categories 
    WHERE categories.name = inventory_items.category 
    AND categories.companyId = inventory_items.companyId
    LIMIT 1
);

-- Create missing categories for any items that don't have a categoryId yet
INSERT INTO "categories" ("id", "name", "companyId", "createdAt", "updatedAt")
SELECT 
    lower(hex(randomblob(4)) || '-' || hex(randomblob(2)) || '-' || hex(randomblob(2)) || '-' || hex(randomblob(2)) || '-' || hex(randomblob(6))) as id,
    category as name,
    companyId,
    CURRENT_TIMESTAMP as createdAt,
    CURRENT_TIMESTAMP as updatedAt
FROM inventory_items
WHERE categoryId IS NULL
GROUP BY companyId, category;

-- Update again for any items that still don't have categoryId
UPDATE inventory_items
SET categoryId = (
    SELECT id FROM categories 
    WHERE categories.name = inventory_items.category 
    AND categories.companyId = inventory_items.companyId
    LIMIT 1
)
WHERE categoryId IS NULL;

-- Create index
CREATE INDEX "inventory_items_categoryId_idx" ON "inventory_items"("categoryId");

-- Recreate inventory_items table with categoryId as NOT NULL
CREATE TABLE "inventory_items_new" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "unitPrice" REAL NOT NULL,
    "itemCode" TEXT NOT NULL,
    "totalStock" INTEGER NOT NULL DEFAULT 0,
    "categoryId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "inventory_items_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "inventory_items_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

INSERT INTO "inventory_items_new" SELECT * FROM "inventory_items";
DROP TABLE "inventory_items";
ALTER TABLE "inventory_items_new" RENAME TO "inventory_items";

-- Create unique index on categories
CREATE UNIQUE INDEX "categories_name_companyId_key" ON "categories"("name", "companyId");
