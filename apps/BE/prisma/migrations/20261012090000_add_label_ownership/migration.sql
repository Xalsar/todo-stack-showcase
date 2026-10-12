-- Labels are user-scoped again. Existing labels are global (no owner), so drop
-- them and let each user create their own. Todo.labelId has ON DELETE SET NULL,
-- so affected todos are simply left unlabelled.
DELETE FROM "Label";

-- AlterTable
ALTER TABLE "Label" ADD COLUMN     "userId" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "Label_userId_idx" ON "Label"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Label_userId_name_key" ON "Label"("userId", "name");

-- AddForeignKey
ALTER TABLE "Label" ADD CONSTRAINT "Label_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
