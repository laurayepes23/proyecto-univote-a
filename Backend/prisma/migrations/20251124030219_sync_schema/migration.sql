/*
  Warnings:

  - You are about to drop the `Proposal` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Vote` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Voter` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[id_election,id_candidate]` on the table `Result` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "public"."Proposal" DROP CONSTRAINT "Proposal_id_candidate_fkey";

-- DropForeignKey
ALTER TABLE "public"."Vote" DROP CONSTRAINT "Vote_id_candidate_fkey";

-- DropForeignKey
ALTER TABLE "public"."Vote" DROP CONSTRAINT "Vote_id_election_fkey";

-- DropForeignKey
ALTER TABLE "public"."Vote" DROP CONSTRAINT "Vote_id_voter_fkey";

-- DropForeignKey
ALTER TABLE "public"."Voter" DROP CONSTRAINT "Voter_id_career_fkey";

-- DropForeignKey
ALTER TABLE "public"."Voter" DROP CONSTRAINT "Voter_id_election_fkey";

-- DropForeignKey
ALTER TABLE "public"."Voter" DROP CONSTRAINT "Voter_id_role_fkey";

-- DropIndex
DROP INDEX "public"."Result_id_candidate_key";

-- DropIndex
DROP INDEX "public"."Result_id_election_key";

-- AlterTable
ALTER TABLE "public"."Candidate" ADD COLUMN     "motivo_rechazo" TEXT;

-- DropTable
DROP TABLE "public"."Proposal";

-- DropTable
DROP TABLE "public"."Vote";

-- DropTable
DROP TABLE "public"."Voter";

-- CreateTable
CREATE TABLE "public"."voters" (
    "id_voter" SERIAL NOT NULL,
    "nombre_voter" TEXT NOT NULL,
    "apellido_voter" TEXT NOT NULL,
    "tipo_doc_voter" TEXT NOT NULL,
    "num_doc_voter" BIGINT NOT NULL,
    "correo_voter" TEXT NOT NULL,
    "estado_voter" TEXT NOT NULL,
    "contrasena_voter" TEXT NOT NULL,
    "id_role" INTEGER NOT NULL,
    "id_election" INTEGER,
    "id_career" INTEGER NOT NULL,

    CONSTRAINT "voters_pkey" PRIMARY KEY ("id_voter")
);

-- CreateTable
CREATE TABLE "public"."votes" (
    "id_vote" SERIAL NOT NULL,
    "fecha_vote" TIMESTAMP(3) NOT NULL,
    "hora_vote" TIMESTAMP(3) NOT NULL,
    "id_voter" INTEGER,
    "id_candidate" INTEGER,
    "id_election" INTEGER,

    CONSTRAINT "votes_pkey" PRIMARY KEY ("id_vote")
);

-- CreateTable
CREATE TABLE "public"."proposals" (
    "id_proposal" SERIAL NOT NULL,
    "titulo_proposal" TEXT NOT NULL,
    "descripcion_proposal" TEXT NOT NULL,
    "estado_proposal" TEXT NOT NULL,
    "id_candidate" INTEGER NOT NULL,
    "id_election" INTEGER,

    CONSTRAINT "proposals_pkey" PRIMARY KEY ("id_proposal")
);

-- CreateTable
CREATE TABLE "public"."notifications" (
    "id_notification" SERIAL NOT NULL,
    "id_candidate" INTEGER NOT NULL,
    "titulo" TEXT NOT NULL,
    "mensaje" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "leida" BOOLEAN NOT NULL DEFAULT false,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id_notification")
);

-- CreateIndex
CREATE UNIQUE INDEX "voters_num_doc_voter_key" ON "public"."voters"("num_doc_voter");

-- CreateIndex
CREATE UNIQUE INDEX "voters_correo_voter_key" ON "public"."voters"("correo_voter");

-- CreateIndex
CREATE UNIQUE INDEX "Result_id_election_id_candidate_key" ON "public"."Result"("id_election", "id_candidate");

-- AddForeignKey
ALTER TABLE "public"."voters" ADD CONSTRAINT "voters_id_role_fkey" FOREIGN KEY ("id_role") REFERENCES "public"."Role"("id_role") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."voters" ADD CONSTRAINT "voters_id_election_fkey" FOREIGN KEY ("id_election") REFERENCES "public"."Election"("id_election") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."voters" ADD CONSTRAINT "voters_id_career_fkey" FOREIGN KEY ("id_career") REFERENCES "public"."Career"("id_career") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."votes" ADD CONSTRAINT "votes_id_voter_fkey" FOREIGN KEY ("id_voter") REFERENCES "public"."voters"("id_voter") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."votes" ADD CONSTRAINT "votes_id_candidate_fkey" FOREIGN KEY ("id_candidate") REFERENCES "public"."Candidate"("id_candidate") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."votes" ADD CONSTRAINT "votes_id_election_fkey" FOREIGN KEY ("id_election") REFERENCES "public"."Election"("id_election") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."proposals" ADD CONSTRAINT "proposals_id_candidate_fkey" FOREIGN KEY ("id_candidate") REFERENCES "public"."Candidate"("id_candidate") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."proposals" ADD CONSTRAINT "proposals_id_election_fkey" FOREIGN KEY ("id_election") REFERENCES "public"."Election"("id_election") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."notifications" ADD CONSTRAINT "notifications_id_candidate_fkey" FOREIGN KEY ("id_candidate") REFERENCES "public"."Candidate"("id_candidate") ON DELETE CASCADE ON UPDATE CASCADE;
