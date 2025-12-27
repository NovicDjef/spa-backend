-- DropIndex
DROP INDEX "Assignment_clientId_professionalId_key";

-- CreateIndex
CREATE INDEX "Assignment_assignedAt_idx" ON "Assignment"("assignedAt");
