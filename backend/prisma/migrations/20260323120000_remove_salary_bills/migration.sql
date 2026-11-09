-- Drop salary & bills feature tables and related audit expense columns
DROP TABLE IF EXISTS "salaries";
DROP TABLE IF EXISTS "bills";
DROP TABLE IF EXISTS "employees";

ALTER TABLE "audits" DROP COLUMN IF EXISTS "includeExpenses";
ALTER TABLE "audits" DROP COLUMN IF EXISTS "totalExpenses";
ALTER TABLE "audits" DROP COLUMN IF EXISTS "finalNetProfit";
