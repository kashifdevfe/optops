-- DropTable if exists (old audits table if it exists)
PRAGMA foreign_keys=off;
DROP TABLE IF EXISTS "audits";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "audits" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "auditDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,
    "totalInventoryValue" REAL NOT NULL DEFAULT 0,
    "totalSalesValue" REAL NOT NULL DEFAULT 0,
    "companyId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "audits_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "audit_items" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "auditId" TEXT NOT NULL,
    "inventoryItemId" TEXT NOT NULL,
    "expectedQuantity" INTEGER NOT NULL,
    "actualQuantity" INTEGER NOT NULL,
    "discrepancy" INTEGER NOT NULL DEFAULT 0,
    "unitPrice" REAL NOT NULL,
    "totalValue" REAL NOT NULL,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "audit_items_auditId_fkey" FOREIGN KEY ("auditId") REFERENCES "audits" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "audit_items_inventoryItemId_fkey" FOREIGN KEY ("inventoryItemId") REFERENCES "inventory_items" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
