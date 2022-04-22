/*
  Warnings:

  - The primary key for the `collection_rel_owner` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[owner_id,num]` on the table `collection_rel_owner` will be added. If there are existing duplicate values, this will fail.
  - The required column `id` was added to the `collection_rel_owner` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - Added the required column `num` to the `collection_rel_owner` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "collection_rel_owner_collection_id_key";

-- DropIndex
DROP INDEX "collection_rel_owner_owner_id_key";

-- AlterTable
ALTER TABLE "collection_rel_owner" DROP CONSTRAINT "collection_rel_owner_pkey",
ADD COLUMN     "id" TEXT NOT NULL,
ADD COLUMN     "num" INTEGER NOT NULL,
ADD CONSTRAINT "collection_rel_owner_pkey" PRIMARY KEY ("id");

-- CreateIndex
CREATE UNIQUE INDEX "collection_rel_owner_owner_id_num_key" ON "collection_rel_owner"("owner_id", "num");
