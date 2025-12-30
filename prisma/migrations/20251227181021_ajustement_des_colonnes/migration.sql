/*
  Warnings:

  - A unique constraint covering the columns `[professionalId,date]` on the table `Availability` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterEnum
ALTER TYPE "PaymentStatus" ADD VALUE 'CANCELLED';

-- DropIndex
DROP INDEX "Availability_professionalId_date_startTime_key";

-- AlterTable
ALTER TABLE "Assignment" ADD COLUMN     "createdById" TEXT;

-- AlterTable
ALTER TABLE "Availability" ALTER COLUMN "startTime" DROP NOT NULL,
ALTER COLUMN "endTime" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "googleCalendarEventId" TEXT,
ADD COLUMN     "reminderSent" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "ClientProfile" ADD COLUMN     "feedbackEmailsSent" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "lastEmailSent" TIMESTAMP(3),
ADD COLUMN     "lastVisitDate" TIMESTAMP(3),
ADD COLUMN     "promoEmailsSent" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Note" ADD COLUMN     "emailSent" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "emailSentAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Payment" ALTER COLUMN "stripePaymentId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "adresse" TEXT,
ADD COLUMN     "numeroOrdre" TEXT,
ADD COLUMN     "signatureUrl" TEXT,
ADD COLUMN     "titreProfessionnel" TEXT;

-- CreateTable
CREATE TABLE "Campaign" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "messageTemplate" TEXT NOT NULL,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "totalRecipients" INTEGER NOT NULL DEFAULT 0,
    "successCount" INTEGER NOT NULL DEFAULT 0,
    "failureCount" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Campaign_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmailLog" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "clientEmail" TEXT NOT NULL,
    "clientName" TEXT,
    "subject" TEXT NOT NULL,
    "htmlContent" TEXT NOT NULL,
    "noteId" TEXT,
    "promotionId" TEXT,
    "campaignId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'sent',
    "errorMessage" TEXT,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "opened" BOOLEAN NOT NULL DEFAULT false,
    "clicked" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "EmailLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Receipt" (
    "id" TEXT NOT NULL,
    "receiptNumber" INTEGER NOT NULL,
    "clientId" TEXT NOT NULL,
    "noteId" TEXT,
    "clientName" TEXT NOT NULL,
    "clientEmail" TEXT NOT NULL,
    "therapistId" TEXT NOT NULL,
    "therapistName" TEXT NOT NULL,
    "numeroOrdre" TEXT NOT NULL,
    "serviceId" TEXT,
    "serviceName" TEXT NOT NULL,
    "duration" INTEGER NOT NULL,
    "subtotal" DECIMAL(10,2) NOT NULL,
    "taxTPS" DECIMAL(10,2) NOT NULL,
    "taxTVQ" DECIMAL(10,2) NOT NULL,
    "total" DECIMAL(10,2) NOT NULL,
    "spaName" TEXT NOT NULL DEFAULT 'Spa Renaissance',
    "spaAddress" TEXT NOT NULL,
    "spaPhone" TEXT NOT NULL,
    "treatmentDate" DATE NOT NULL,
    "treatmentTime" TEXT NOT NULL,
    "pdfUrl" TEXT,
    "emailSent" BOOLEAN NOT NULL DEFAULT false,
    "emailSentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Receipt_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Campaign_createdAt_idx" ON "Campaign"("createdAt");

-- CreateIndex
CREATE INDEX "Campaign_createdBy_idx" ON "Campaign"("createdBy");

-- CreateIndex
CREATE INDEX "EmailLog_clientEmail_idx" ON "EmailLog"("clientEmail");

-- CreateIndex
CREATE INDEX "EmailLog_type_idx" ON "EmailLog"("type");

-- CreateIndex
CREATE INDEX "EmailLog_sentAt_idx" ON "EmailLog"("sentAt");

-- CreateIndex
CREATE INDEX "EmailLog_noteId_idx" ON "EmailLog"("noteId");

-- CreateIndex
CREATE INDEX "EmailLog_campaignId_idx" ON "EmailLog"("campaignId");

-- CreateIndex
CREATE INDEX "EmailLog_status_idx" ON "EmailLog"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Receipt_noteId_key" ON "Receipt"("noteId");

-- CreateIndex
CREATE INDEX "Receipt_therapistId_idx" ON "Receipt"("therapistId");

-- CreateIndex
CREATE INDEX "Receipt_noteId_idx" ON "Receipt"("noteId");

-- CreateIndex
CREATE INDEX "Receipt_createdAt_idx" ON "Receipt"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Receipt_therapistId_receiptNumber_key" ON "Receipt"("therapistId", "receiptNumber");

-- CreateIndex
CREATE INDEX "Assignment_createdById_idx" ON "Assignment"("createdById");

-- CreateIndex
CREATE UNIQUE INDEX "Availability_professionalId_date_key" ON "Availability"("professionalId", "date");

-- CreateIndex
CREATE INDEX "Note_emailSent_idx" ON "Note"("emailSent");

-- AddForeignKey
ALTER TABLE "EmailLog" ADD CONSTRAINT "EmailLog_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Assignment" ADD CONSTRAINT "Assignment_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Receipt" ADD CONSTRAINT "Receipt_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "ClientProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Receipt" ADD CONSTRAINT "Receipt_noteId_fkey" FOREIGN KEY ("noteId") REFERENCES "Note"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Receipt" ADD CONSTRAINT "Receipt_therapistId_fkey" FOREIGN KEY ("therapistId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Receipt" ADD CONSTRAINT "Receipt_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE SET NULL ON UPDATE CASCADE;
