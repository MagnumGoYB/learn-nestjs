/*
  Warnings:

  - A unique constraint covering the columns `[owner_id]` on the table `collection_rel_owner` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[collection_id]` on the table `collection_rel_owner` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "orders_collection_id_key";

-- CreateIndex
CREATE UNIQUE INDEX "collection_rel_owner_owner_id_key" ON "collection_rel_owner"("owner_id");

-- CreateIndex
CREATE UNIQUE INDEX "collection_rel_owner_collection_id_key" ON "collection_rel_owner"("collection_id");
