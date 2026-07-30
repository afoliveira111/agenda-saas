-- AlterTable
ALTER TABLE "Service" ADD COLUMN     "categoryId" TEXT;

-- CreateTable
CREATE TABLE "ServiceCategory" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ServiceCategory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ServiceCategory_businessId_sortOrder_idx" ON "ServiceCategory"("businessId", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "ServiceCategory_businessId_name_key" ON "ServiceCategory"("businessId", "name");

-- CreateIndex
CREATE INDEX "Service_businessId_categoryId_idx" ON "Service"("businessId", "categoryId");

-- AddForeignKey
ALTER TABLE "ServiceCategory" ADD CONSTRAINT "ServiceCategory_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Service" ADD CONSTRAINT "Service_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "ServiceCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;
