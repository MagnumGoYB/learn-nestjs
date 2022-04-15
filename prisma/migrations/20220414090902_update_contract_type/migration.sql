/*
  Warnings:

  - Added the required column `contract_type` to the `collections` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ContractTypeEnum" AS ENUM ('ERC_721', 'ERC_1155');

-- AlterTable
ALTER TABLE "collections" ADD COLUMN     "contract_type" "ContractTypeEnum" NOT NULL;
