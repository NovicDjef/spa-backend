-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('SECRETAIRE', 'MASSOTHERAPEUTE', 'ESTHETICIENNE', 'ADMIN');

-- CreateEnum
CREATE TYPE "ServiceType" AS ENUM ('MASSOTHERAPIE', 'ESTHETIQUE');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('HOMME', 'FEMME', 'AUTRE');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "telephone" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "nom" TEXT,
    "prenom" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClientProfile" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "prenom" TEXT NOT NULL,
    "adresse" TEXT NOT NULL,
    "ville" TEXT NOT NULL,
    "codePostal" TEXT NOT NULL,
    "telMaison" TEXT,
    "telBureau" TEXT,
    "telCellulaire" TEXT NOT NULL,
    "courriel" TEXT NOT NULL,
    "dateNaissance" TIMESTAMP(3) NOT NULL,
    "occupation" TEXT,
    "gender" "Gender" NOT NULL,
    "serviceType" "ServiceType" NOT NULL,
    "assuranceCouvert" BOOLEAN NOT NULL,
    "raisonConsultation" TEXT,
    "diagnosticMedical" BOOLEAN,
    "diagnosticMedicalDetails" TEXT,
    "medicaments" BOOLEAN,
    "medicamentsDetails" TEXT,
    "accidents" BOOLEAN,
    "accidentsDetails" TEXT,
    "operationsChirurgicales" BOOLEAN,
    "operationsChirurgicalesDetails" TEXT,
    "traitementsActuels" TEXT,
    "problemesCardiaques" BOOLEAN NOT NULL DEFAULT false,
    "problemesCardiaquesDetails" TEXT,
    "maladiesGraves" BOOLEAN NOT NULL DEFAULT false,
    "maladiesGravesDetails" TEXT,
    "ortheses" BOOLEAN NOT NULL DEFAULT false,
    "orthesesDetails" TEXT,
    "allergies" BOOLEAN NOT NULL DEFAULT false,
    "allergiesDetails" TEXT,
    "raideurs" BOOLEAN NOT NULL DEFAULT false,
    "arthrose" BOOLEAN NOT NULL DEFAULT false,
    "hernieDiscale" BOOLEAN NOT NULL DEFAULT false,
    "oedeme" BOOLEAN NOT NULL DEFAULT false,
    "tendinite" BOOLEAN NOT NULL DEFAULT false,
    "mauxDeTete" BOOLEAN NOT NULL DEFAULT false,
    "flatulence" BOOLEAN NOT NULL DEFAULT false,
    "troublesCirculatoires" BOOLEAN NOT NULL DEFAULT false,
    "hypothyroidie" BOOLEAN NOT NULL DEFAULT false,
    "diabete" BOOLEAN NOT NULL DEFAULT false,
    "stresse" BOOLEAN NOT NULL DEFAULT false,
    "premenopause" BOOLEAN NOT NULL DEFAULT false,
    "douleurMusculaire" BOOLEAN NOT NULL DEFAULT false,
    "fibromyalgie" BOOLEAN NOT NULL DEFAULT false,
    "rhumatisme" BOOLEAN NOT NULL DEFAULT false,
    "sciatique" BOOLEAN NOT NULL DEFAULT false,
    "bursite" BOOLEAN NOT NULL DEFAULT false,
    "migraine" BOOLEAN NOT NULL DEFAULT false,
    "diarrhee" BOOLEAN NOT NULL DEFAULT false,
    "phlebite" BOOLEAN NOT NULL DEFAULT false,
    "hypertension" BOOLEAN NOT NULL DEFAULT false,
    "hypoglycemie" BOOLEAN NOT NULL DEFAULT false,
    "burnOut" BOOLEAN NOT NULL DEFAULT false,
    "menopause" BOOLEAN NOT NULL DEFAULT false,
    "inflammationAigue" BOOLEAN NOT NULL DEFAULT false,
    "arteriosclerose" BOOLEAN NOT NULL DEFAULT false,
    "osteoporose" BOOLEAN NOT NULL DEFAULT false,
    "mauxDeDos" BOOLEAN NOT NULL DEFAULT false,
    "fatigueDesJambes" BOOLEAN NOT NULL DEFAULT false,
    "troublesDigestifs" BOOLEAN NOT NULL DEFAULT false,
    "constipation" BOOLEAN NOT NULL DEFAULT false,
    "hyperthyroidie" BOOLEAN NOT NULL DEFAULT false,
    "hypotension" BOOLEAN NOT NULL DEFAULT false,
    "insomnie" BOOLEAN NOT NULL DEFAULT false,
    "depressionNerveuse" BOOLEAN NOT NULL DEFAULT false,
    "autres" TEXT,
    "zonesDouleur" TEXT[],
    "etatPeau" TEXT,
    "etatPores" TEXT,
    "coucheCornee" TEXT,
    "irrigationSanguine" TEXT,
    "impuretes" TEXT,
    "sensibiliteCutanee" TEXT,
    "fumeur" TEXT,
    "niveauStress" TEXT,
    "expositionSoleil" TEXT,
    "protectionSolaire" TEXT,
    "suffisanceEau" TEXT,
    "travailExterieur" TEXT,
    "bainChauds" TEXT,
    "routineSoins" TEXT,
    "changementsRecents" TEXT,
    "preferencePeau" TEXT,
    "diagnosticVisuelNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClientProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Note" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Note_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Assignment" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "professionalId" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Assignment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_telephone_key" ON "User"("telephone");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE UNIQUE INDEX "ClientProfile_telCellulaire_key" ON "ClientProfile"("telCellulaire");

-- CreateIndex
CREATE UNIQUE INDEX "ClientProfile_courriel_key" ON "ClientProfile"("courriel");

-- CreateIndex
CREATE INDEX "ClientProfile_courriel_idx" ON "ClientProfile"("courriel");

-- CreateIndex
CREATE INDEX "ClientProfile_telCellulaire_idx" ON "ClientProfile"("telCellulaire");

-- CreateIndex
CREATE INDEX "ClientProfile_serviceType_idx" ON "ClientProfile"("serviceType");

-- CreateIndex
CREATE INDEX "ClientProfile_nom_prenom_idx" ON "ClientProfile"("nom", "prenom");

-- CreateIndex
CREATE INDEX "Note_clientId_idx" ON "Note"("clientId");

-- CreateIndex
CREATE INDEX "Note_authorId_idx" ON "Note"("authorId");

-- CreateIndex
CREATE INDEX "Note_createdAt_idx" ON "Note"("createdAt");

-- CreateIndex
CREATE INDEX "Assignment_clientId_idx" ON "Assignment"("clientId");

-- CreateIndex
CREATE INDEX "Assignment_professionalId_idx" ON "Assignment"("professionalId");

-- CreateIndex
CREATE UNIQUE INDEX "Assignment_clientId_professionalId_key" ON "Assignment"("clientId", "professionalId");

-- AddForeignKey
ALTER TABLE "Note" ADD CONSTRAINT "Note_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "ClientProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Note" ADD CONSTRAINT "Note_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Assignment" ADD CONSTRAINT "Assignment_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "ClientProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Assignment" ADD CONSTRAINT "Assignment_professionalId_fkey" FOREIGN KEY ("professionalId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
