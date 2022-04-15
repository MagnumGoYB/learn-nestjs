/*
  Warnings:

  - You are about to drop the column `collection_id` on the `stocks` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[stock_id]` on the table `collections` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `stock_id` to the `collections` table without a default value. This is not possible if the table is not empty.
  - Added the required column `owner_id` to the `orders` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "stocks" DROP CONSTRAINT "stocks_collection_id_fkey";

-- DropIndex
DROP INDEX "stocks_collection_id_key";

-- AlterTable
ALTER TABLE "collections" ADD COLUMN     "stock_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "owner_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "stocks" DROP COLUMN "collection_id";

-- CreateIndex
CREATE UNIQUE INDEX "collections_stock_id_key" ON "collections"("stock_id");

-- AddForeignKey
ALTER TABLE "collections" ADD CONSTRAINT "collections_stock_id_fkey" FOREIGN KEY ("stock_id") REFERENCES "stocks"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
