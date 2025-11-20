// ==================== INTERFACES DE ENTIDADES ====================
export interface Career {
  id_career: number;
  nombre_career: string;
  facultad_career: string;
}

export interface Election {
  id_election: number;
  nombre_election: string;
  estado_election: string;
  fecha_inicio: string;
  fecha_fin: string;
}

// ==================== INTERFACES DE FORMULARIOS ====================
export interface VoterFormData {
  nombre_voter: string;
  apellido_voter: string;
  tipo_doc_voter: string;
  num_doc_voter: string;
  correo_voter: string;
  contrasena_voter: string;
  id_career: string;
  id_role: number;
  estado_voter: string;
}

export interface CandidateFormData {
  nombre_candidate: string;
  apellido_candidate: string;
  tipo_doc_candidate: string;
  num_doc_candidate: string;
  correo_candidate: string;
  contrasena_candidate: string;
  estado_candidate: string;
  id_role: number;
  id_career: string;
  id_election: string;
  foto_candidate?: string;
}

// ==================== INTERFACES DE AUTENTICACIÓN ====================
export interface VoterData {
  id_voter: number;
  nombre_voter: string;
  apellido_voter: string;
  correo_voter: string;
  tipo_doc_voter: string;
  num_doc_voter: string;
  estado_voter: string;
  id_career: number;
  id_role: number;
}

export interface CandidateData {
  id_candidate: number;
  nombre_candidate: string;
  apellido_candidate: string;
  correo_candidate: string;
  tipo_doc_candidate: string;
  num_doc_candidate: string;
  estado_candidate: string;
  foto_candidate?: string;
  id_career: number;
  id_election: number;
  id_role: number;
}

export interface AdminData {
  id_admin: number;
  nombre_admin: string;
  apellido_admin: string;
  correo_admin: string;
  tipo_doc_admin: string;
  num_doc_admin: string;
  id_role: number;
}

export type UserRole = 'voter' | 'candidate' | 'admin';

export interface AuthContextType {
  isAuthenticated: boolean;
  userRole: UserRole | null;
  userId: number | null;
  userName: string | null;
  userData: VoterData | CandidateData | AdminData | null;
  login: (userData: any, role: UserRole) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}