/*
  Warnings:

  - You are about to drop the column `is_active` on the `products` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "products" DROP COLUMN "is_active",
ADD COLUMN     "status" BOOLEAN NOT NULL DEFAULT true;
