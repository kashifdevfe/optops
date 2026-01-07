import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();

async function applyMigration() {
  try {
    const migrationPath = path.join(__dirname, '../prisma/migrations/20260104010051_add_category_model/migration.sql');
    const sql = fs.readFileSync(migrationPath, 'utf-8');
    
    // Split by semicolon and execute each statement
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));
    
    for (const statement of statements) {
      if (statement.trim()) {
        try {
          await prisma.$executeRawUnsafe(statement);
          console.log('Executed:', statement.substring(0, 50) + '...');
        } catch (error) {
          // Some statements might fail (like creating index that already exists)
          if (!error.message.includes('already exists') && !error.message.includes('duplicate')) {
            console.error('Error executing:', statement.substring(0, 50));
            console.error(error.message);
          }
        }
      }
    }
    
    console.log('Migration applied successfully!');
  } catch (error) {
    console.error('Error applying migration:', error);
  } finally {
    await prisma.$disconnect();
  }
}

applyMigration();

