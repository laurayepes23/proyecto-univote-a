// Función para validar correo institucional - SIN CARACTERES ESPECIALES PELIGROSOS
export const validateEmail = (email: string): string | null => {
  if (!email.trim()) {
    return "El correo es requerido";
  }

  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const commonDomains = ['gmail.com', 'hotmail.com', 'outlook.com', 'yahoo.com', 'edu.co', 'university.edu', 'college.edu'];
  
  // Validar que no tenga caracteres especiales peligrosos
  const dangerousChars = /[<>{}[\]\\|`~!@#$%^&*()=+';?]/;
  if (dangerousChars.test(email.split('@')[0])) {
    return "El correo no puede contener caracteres especiales como < > { } [ ] | ` ~ ! @ # $ % ^ & * ( ) = + ' ; ?";
  }
  
  if (!emailRegex.test(email)) {
    return "Formato de correo no válido";
  }
  
  const domain = email.split('@')[1]?.toLowerCase();
  if (!domain) {
    return "Formato de correo no válido";
  }

  if (!commonDomains.some(commonDomain => domain.includes(commonDomain))) {
    return "Debe usar un dominio de correo válido (gmail.com, hotmail.com, etc.)";
  }
  
  return null;
};

// Función para validar contraseña
export const validatePassword = (password: string): string | null => {
  if (!password.trim()) {
    return "La contraseña es requerida";
  }

  const errors = [];
  
  if (password.length < 8) {
    errors.push("Mínimo 8 caracteres");
  }
  
  if (!/(?=.*[a-z])/.test(password)) {
    errors.push("Al menos una minúscula");
  }
  
  if (!/(?=.*[A-Z])/.test(password)) {
    errors.push("Al menos una mayúscula");
  }
  
  if (!/(?=.*\d)/.test(password)) {
    errors.push("Al menos un número");
  }
  
  if (!/(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?])/.test(password)) {
    errors.push("Al menos un carácter especial");
  }
  
  return errors.length > 0 ? errors.join(", ") : null;
};

// Función para validar número de documento
export const validateDocumentNumber = (docNumber: string): string | null => {
  if (!docNumber || !docNumber.trim()) {
    return "El número de documento es requerido";
  }
  
  if (docNumber.length < 10) {
    return "El documento debe tener mínimo 10 dígitos";
  }
  
  if (!/^\d+$/.test(docNumber)) {
    return "Solo se permiten números";
  }
  
  return null;
};

// Función para validar nombre y apellido - SIN CARACTERES ESPECIALES
export const validateName = (name: string, fieldName: string): string | null => {
  if (!name.trim()) {
    return `El ${fieldName} es requerido`;
  }
  
  // Solo permite letras, espacios y vocales con acento
  if (!/^[A-Za-zÁáÉéÍíÓóÚúÑñ\s]+$/.test(name)) {
    return `El ${fieldName} solo puede contener letras y espacios. No se permiten números ni caracteres especiales.`;
  }
  
  if (name.length < 2) {
    return `El ${fieldName} debe tener mínimo 2 caracteres`;
  }
  
  // Validar que no tenga múltiples espacios consecutivos
  if (/\s{2,}/.test(name)) {
    return `El ${fieldName} no puede tener espacios consecutivos`;
  }
  
  // Validar que no empiece o termine con espacio
  if (name.startsWith(' ') || name.endsWith(' ')) {
    return `El ${fieldName} no puede empezar o terminar con espacios`;
  }
  
  return null;
};

// Función para limpiar y formatear nombre y apellido
export const cleanName = (str: string): string => {
  if (!str) return '';
  // Remover caracteres especiales, números y múltiples espacios
  return str
    .replace(/[^A-Za-zÁáÉéÍíÓóÚúÑñ\s]/g, '') // Remover caracteres no permitidos
    .replace(/\s{2,}/g, ' ') // Reemplazar múltiples espacios por uno solo
    .trim() // Eliminar espacios al inicio y final
    .replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()); // Capitalizar
};

// Función para limpiar correo
export const cleanEmail = (email: string): string => {
  if (!email) return '';
  // Remover caracteres peligrosos del local-part (antes del @)
  const [localPart, domain] = email.split('@');
  if (!domain) return email.toLowerCase();
  
  const cleanLocalPart = localPart.replace(/[<>{}[\]\\|`~!@#$%^&*()=+';?]/g, '');
  return `${cleanLocalPart}@${domain}`.toLowerCase();
};

// Función para validar tipo de documento
export const validateDocumentType = (docType: string): string | null => {
  if (!docType) {
    return "El tipo de documento es requerido";
  }
  
  const validTypes = ['CC', 'TI', 'CE'];
  if (!validTypes.includes(docType)) {
    return "Tipo de documento no válido";
  }
  
  return null;
};

// Función para validar carrera
export const validateCareer = (careerId: string): string | null => {
  if (!careerId) {
    return "La carrera es requerida";
  }
  
  return null;
};

// Función para validar archivo de imagen (para React Native)
export const validateImageFile = (file: any): string | null => {
  if (!file) return null;
  
  // En React Native, validamos por extensión del nombre de archivo
  const validExtensions = ['jpg', 'jpeg', 'png'];
  const fileExtension = file.uri?.split('.').pop()?.toLowerCase() || '';
  
  if (!validExtensions.includes(fileExtension)) {
    return "Solo se permiten archivos JPG, JPEG o PNG";
  }
  
  return null;
};

// Función para validar campos requeridos genérica
export const validateRequired = (value: string, fieldName: string): string | null => {
  if (!value || !value.trim()) {
    return `El ${fieldName} es requerido`;
  }
  return null;
};

// Función para validar longitud mínima
export const validateMinLength = (value: string, minLength: number, fieldName: string): string | null => {
  if (value && value.length < minLength) {
    return `El ${fieldName} debe tener al menos ${minLength} caracteres`;
  }
  return null;
};

// Función para validar longitud máxima
export const validateMaxLength = (value: string, maxLength: number, fieldName: string): string | null => {
  if (value && value.length > maxLength) {
    return `El ${fieldName} no puede tener más de ${maxLength} caracteres`;
  }
  return null;
};

// Función para validar solo números
export const validateNumbersOnly = (value: string, fieldName: string): string | null => {
  if (value && !/^\d+$/.test(value)) {
    return `El ${fieldName} solo puede contener números`;
  }
  return null;
};

// Función para validar formato de texto (solo letras y espacios)
export const validateTextOnly = (value: string, fieldName: string): string | null => {
  if (value && !/^[A-Za-zÁáÉéÍíÓóÚúÑñ\s]+$/.test(value)) {
    return `El ${fieldName} solo puede contener letras y espacios`;
  }
  return null;
};

// Interfaces para los datos de formulario
export interface VoterFormData {
  nombre_voter: string;
  apellido_voter: string;
  tipo_doc_voter: string;
  num_doc_voter: string;
  correo_voter: string;
  contrasena_voter: string;
  id_career: string;
}

export interface CandidateFormData {
  nombre_candidate: string;
  apellido_candidate: string;
  tipo_doc_candidate: string;
  num_doc_candidate: string;
  correo_candidate: string;
  contrasena_candidate: string;
  id_career: string;
  id_election?: string;
}

// Función de validación completa para votante
export const validateVoterForm = (formData: VoterFormData) => {
  const errors: { [key: string]: string | null } = {};

  errors.nombre_voter = validateName(formData.nombre_voter, 'nombre');
  errors.apellido_voter = validateName(formData.apellido_voter, 'apellido');
  errors.tipo_doc_voter = validateDocumentType(formData.tipo_doc_voter);
  errors.num_doc_voter = validateDocumentNumber(formData.num_doc_voter);
  errors.correo_voter = validateEmail(formData.correo_voter);
  errors.contrasena_voter = validatePassword(formData.contrasena_voter);
  errors.id_career = validateCareer(formData.id_career);

  return errors;
};

// Función de validación completa para candidato
export const validateCandidateForm = (formData: CandidateFormData, imageFile: any = null) => {
  const errors: { [key: string]: string | null } = {};

  errors.nombre_candidate = validateName(formData.nombre_candidate, 'nombre');
  errors.apellido_candidate = validateName(formData.apellido_candidate, 'apellido');
  errors.tipo_doc_candidate = validateDocumentType(formData.tipo_doc_candidate);
  errors.num_doc_candidate = validateDocumentNumber(formData.num_doc_candidate);
  errors.correo_candidate = validateEmail(formData.correo_candidate);
  errors.contrasena_candidate = validatePassword(formData.contrasena_candidate);
  errors.id_career = validateCareer(formData.id_career);
  
  if (imageFile) {
    errors.foto_candidate = validateImageFile(imageFile);
  }

  return errors;
};

// Función para verificar si hay errores en el formulario
export const hasFormErrors = (errors: { [key: string]: string | null }): boolean => {
  return Object.values(errors).some(error => error !== null);
};

// Función para verificar si el formulario está completo
export const isFormComplete = (formData: any, requiredFields: string[]): boolean => {
  return requiredFields.every(field => {
    const value = formData[field];
    return value !== undefined && value !== null && value !== '';
  });
};

// Función para obtener campos requeridos por tipo de formulario
export const getRequiredFields = (formType: 'voter' | 'candidate'): string[] => {
  const baseFields = [
    'nombre',
    'apellido', 
    'tipo_doc',
    'num_doc',
    'correo',
    'contrasena',
    'id_career'
  ];

  if (formType === 'voter') {
    return baseFields.map(field => `${field}_voter`);
  } else {
    return baseFields.map(field => `${field}_candidate`);
  }
};

// Función para limpiar datos antes del envío
export const cleanFormData = (formData: any, formType: 'voter' | 'candidate') => {
  const cleaned = { ...formData };
  
  // Limpiar nombres y apellidos
  if (formType === 'voter') {
    cleaned.nombre_voter = cleanName(cleaned.nombre_voter);
    cleaned.apellido_voter = cleanName(cleaned.apellido_voter);
    cleaned.correo_voter = cleanEmail(cleaned.correo_voter);
  } else {
    cleaned.nombre_candidate = cleanName(cleaned.nombre_candidate);
    cleaned.apellido_candidate = cleanName(cleaned.apellido_candidate);
    cleaned.correo_candidate = cleanEmail(cleaned.correo_candidate);
  }
  
  return cleaned;
};