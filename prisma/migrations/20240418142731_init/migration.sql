-- CreateTable
CREATE TABLE "Handeling" (
    "id" SERIAL NOT NULL,
    "planpl" TEXT NOT NULL,
    "planpo" TEXT NOT NULL,
    "bewerking" TEXT NOT NULL,
    "bemand" INTEGER NOT NULL,
    "uren" DOUBLE PRECISION NOT NULL,
    "aantal" INTEGER NOT NULL,
    "matnr" TEXT NOT NULL,
    "omschrijving" TEXT NOT NULL,
    "startdatum" TIMESTAMP(3),
    "einddatum" TIMESTAMP(3),
    "machineId" INTEGER,

    CONSTRAINT "Handeling_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Machine" (
    "id" SERIAL NOT NULL,
    "naam" TEXT NOT NULL,
    "capaciteit" INTEGER NOT NULL,
    "totaaluren" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "Machine_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Handeling" ADD CONSTRAINT "Handeling_machineId_fkey" FOREIGN KEY ("machineId") REFERENCES "Machine"("id") ON DELETE SET NULL ON UPDATE CASCADE;
