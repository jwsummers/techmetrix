-- CreateTable
CREATE TABLE "RepairOrder" (
    "id" TEXT NOT NULL,
    "year" TEXT NOT NULL,
    "make" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "roNumber" TEXT NOT NULL,
    "labor" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RepairOrder_pkey" PRIMARY KEY ("id")
);
