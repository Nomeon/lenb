-- DropForeignKey
ALTER TABLE "Machine" DROP CONSTRAINT "Machine_halId_fkey";

-- AlterTable
ALTER TABLE "Machine" ALTER COLUMN "halId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Machine" ADD CONSTRAINT "Machine_halId_fkey" FOREIGN KEY ("halId") REFERENCES "Hal"("id") ON DELETE SET NULL ON UPDATE CASCADE;
