-- Labels are now global rather than user-scoped. Delete the existing
-- user-specific labels; the seed repopulates the shared "Personal" and "Work"
-- labels. Todo.labelId has ON DELETE SET NULL, so todos are unaffected.
DELETE FROM "Label";

-- DropForeignKey
ALTER TABLE "Label" DROP CONSTRAINT "Label_userId_fkey";

-- DropIndex
DROP INDEX "Label_userId_idx";

-- AlterTable
ALTER TABLE "Label" DROP COLUMN "userId";