/**
 * Estados de candidatos
 */
export enum CandidateStatus {
  PENDING = "Pendiente",
  APPROVED = "Aprobado",
  REJECTED = "Rechazado",
}

/**
 * Estados de elecciones
 */
export enum ElectionStatus {
  PENDING = "Pendiente",
  ACTIVE = "Activa",
  CLOSED = "Cerrada",
}

/**
 * Estados de votantes
 */
export enum VoterStatus {
  ACTIVE = "Activo",
  INACTIVE = "Inactivo",
}

/**
 * Estados de propuestas
 */
export enum ProposalStatus {
  ACTIVE = "Activa",
  INACTIVE = "Inactiva",
}

/**
 * Roles del sistema
 */
export enum UserRole {
  ADMIN = "ADMIN",
  CANDIDATE = "CANDIDATE",
  VOTER = "VOTER",
}

/**
 * Tipos de notificaciones
 */
export enum NotificationType {
  APPROVAL = "aprobacion",
  REJECTION = "rechazo",
}

/**
 * Constantes del sistema
 */
export const SYSTEM_CONSTANTS = {
  BLANK_VOTE_NAME: "Voto en Blanco",
  BLANK_VOTE_LASTNAME: "Sistema",
  BLANK_VOTE_DOC_TYPE: "N/A",
  BLANK_VOTE_PASSWORD: "no_password",
  DEFAULT_BLANK_DOC: 9999999999n,
  BCRYPT_ROUNDS: 12,
  JWT_EXPIRATION: "24h" as string,
};
