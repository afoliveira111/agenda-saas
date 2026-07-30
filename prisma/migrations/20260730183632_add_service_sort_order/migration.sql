-- AlterTable
ALTER TABLE "Service" ADD COLUMN     "sortOrder" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE INDEX "Service_businessId_categoryId_sortOrder_idx" ON "Service"("businessId", "categoryId", "sortOrder");
