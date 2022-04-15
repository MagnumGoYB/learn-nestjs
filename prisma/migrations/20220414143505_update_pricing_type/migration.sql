/*
  Warnings:

  - You are about to drop the column `price` on the `collections` table. All the data in the column will be lost.
  - You are about to drop the column `amount` on the `orders` table. All the data in the column will be lost.
  - Added the required column `pricing` to the `collections` table without a default value. This is not possible if the table is not empty.
  - Added the required column `pricing` to the `orders` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "collections" DROP COLUMN "price",
ADD COLUMN     "pricing" DOUBLE PRECISION NOT NULL;

-- AlterTable
ALTER TABLE "orders" DROP COLUMN "amount",
ADD COLUMN     "pricing" DOUBLE PRECISION NOT NULL;
