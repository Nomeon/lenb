/*
  Warnings:

  - Added the required column `halId` to the `Machine` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Machine" ADD COLUMN     "halId" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "Hal" (
    "id" SERIAL NOT NULL,
    "afdeling" TEXT NOT NULL,

    CONSTRAINT "Hal_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Machine" ADD CONSTRAINT "Machine_halId_fkey" FOREIGN KEY ("halId") REFERENCES "Hal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
