-- CreateTable
CREATE TABLE "collection_rel_owner" (
    "owner_id" TEXT NOT NULL,
    "collection_id" TEXT NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "collection_rel_owner_pkey" PRIMARY KEY ("owner_id","collection_id")
);

-- AddForeignKey
ALTER TABLE "collection_rel_owner" ADD CONSTRAINT "collection_rel_owner_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "collection_rel_owner" ADD CONSTRAINT "collection_rel_owner_collection_id_fkey" FOREIGN KEY ("collection_id") REFERENCES "collections"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
