/*
  Warnings:

  - The values [WECHAT] on the enum `OrderPayWayEnum` will be removed. If these variants are still used in the database, this will fail.
  - The primary key for the `orders` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `number` on the `orders` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[id]` on the table `orders` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "OrderPayWayEnum_new" AS ENUM ('ALIPAY', 'WECHATPAY');
ALTER TABLE "orders" ALTER COLUMN "pay_way" TYPE "OrderPayWayEnum_new" USING ("pay_way"::text::"OrderPayWayEnum_new");
ALTER TYPE "OrderPayWayEnum" RENAME TO "OrderPayWayEnum_old";
ALTER TYPE "OrderPayWayEnum_new" RENAME TO "OrderPayWayEnum";
DROP TYPE "OrderPayWayEnum_old";
COMMIT;

-- DropIndex
DROP INDEX "orders_number_key";

-- AlterTable
ALTER TABLE "orders" DROP CONSTRAINT "orders_pkey",
DROP COLUMN "number";

-- CreateIndex
CREATE UNIQUE INDEX "orders_id_key" ON "orders"("id");
