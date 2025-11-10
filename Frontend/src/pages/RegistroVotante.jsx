import React, { useState, useEffect } from "react";
import { Link, useNavigate } from 'react-router-dom';
import Navbar from "../components/Navbar";
import api from '../api/axios';

export default function RegistroVotante() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        nombre_voter: "",
        apellido_voter: "",
        tipo_doc_voter: "",
        num_doc_voter: "",
        correo_voter: "",
        contrasena_voter: "",
        id_career: "",
        id_role: 2,
        estado_voter: "Activo",
    });
    const [careers, setCareers] = useState([]);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [fieldErrors, setFieldErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        const fetchCareers = async () => {
            try {
                const response = await api.get('/careers');
                setCareers(response.data);
            } catch (error) {
                console.error("Error al obtener las carreras:", error);
                setError("Error al cargar las carreras. Intenta recargar la página.");
            }
        };
        fetchCareers();
    }, []);

    // Función para capitalizar nombre y apellido (solo primera letra en mayúscula)
    // eslint-disable-next-line no-unused-vars
    const capitalizeFirstLetter = (str) => {
        if (!str) return '';
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    };

    // Función para validar correo institucional - SIN CARACTERES ESPECIALES
    const validateEmail = (email) => {
        // Solo permite letras, números, puntos, guiones y @
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
        
        const domain = email.split('@')[1].toLowerCase();
        if (!commonDomains.some(commonDomain => domain.includes(commonDomain))) {
            return "Debe usar un dominio de correo válido (gmail.com, hotmail.com, etc.)";
        }
        
        return null;
    };

    // Función para validar contraseña
    const validatePassword = (password) => {
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
    const validateDocumentNumber = (docNumber) => {
        if (!docNumber || docNumber.length < 10) {
            return "El documento debe tener mínimo 10 dígitos";
        }
        
        if (!/^\d+$/.test(docNumber)) {
            return "Solo se permiten números";
        }
        
        return null;
    };

    // Función para validar nombre y apellido - SIN CARACTERES ESPECIALES
    const validateName = (name, fieldName) => {
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
    const cleanName = (str) => {
        if (!str) return '';
        // Remover caracteres especiales, números y múltiples espacios
        return str
            .replace(/[^A-Za-zÁáÉéÍíÓóÚúÑñ\s]/g, '') // Remover caracteres no permitidos
            .replace(/\s{2,}/g, ' ') // Reemplazar múltiples espacios por uno solo
            .trim() // Eliminar espacios al inicio y final
            .replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()); // Capitalizar
    };

    // Función para limpiar correo
    const cleanEmail = (email) => {
        if (!email) return '';
        // Remover caracteres peligrosos del local-part (antes del @)
        const [localPart, domain] = email.split('@');
        if (!domain) return email.toLowerCase();
        
        const cleanLocalPart = localPart.replace(/[<>{}[\]\\|`~!@#$%^&*()=+';?]/g, '');
        return `${cleanLocalPart}@${domain}`.toLowerCase();
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        let processedValue = value;

        // Aplicar transformaciones según el campo
        if (name === 'nombre_voter' || name === 'apellido_voter') {
            processedValue = cleanName(value);
        }
        
        if (name === 'correo_voter') {
            processedValue = cleanEmail(value);
        }

        setFormData({ ...formData, [name]: processedValue });

        // Validación en tiempo real
        validateField(name, processedValue);
    };

    const validateField = (fieldName, value) => {
        const errors = { ...fieldErrors };
        
        switch (fieldName) {
            case 'nombre_voter':
                errors.nombre_voter = validateName(value, 'nombre');
                break;
            case 'apellido_voter':
                errors.apellido_voter = validateName(value, 'apellido');
                break;
            case 'tipo_doc_voter':
                errors.tipo_doc_voter = !value ? "El tipo de documento es requerido" : null;
                break;
            case 'num_doc_voter':
                errors.num_doc_voter = validateDocumentNumber(value);
                break;
            case 'correo_voter':
                errors.correo_voter = validateEmail(value);
                break;
            case 'contrasena_voter':
                errors.contrasena_voter = validatePassword(value);
                break;
            case 'id_career':
                errors.id_career = !value ? "La carrera es requerida" : null;
                break;
            default:
                break;
        }

        setFieldErrors(errors);
    };

    const validateForm = () => {
        const errors = {};
        
        errors.nombre_voter = validateName(formData.nombre_voter, 'nombre');
        errors.apellido_voter = validateName(formData.apellido_voter, 'apellido');
        errors.tipo_doc_voter = !formData.tipo_doc_voter ? "El tipo de documento es requerido" : null;
        errors.num_doc_voter = validateDocumentNumber(formData.num_doc_voter);
        errors.correo_voter = validateEmail(formData.correo_voter);
        errors.contrasena_voter = validatePassword(formData.contrasena_voter);
        errors.id_career = !formData.id_career ? "La carrera es requerida" : null;

        setFieldErrors(errors);
        
        // Retorna true si no hay errores
        return !Object.values(errors).some(error => error !== null);
    };

    // Función para alternar visibilidad de la contraseña
    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        // Validar todo el formulario antes de enviar
        if (!validateForm()) {
            setError("Por favor, corrige los errores en el formulario.");
            return;
        }

        try {
            const payload = {
                ...formData,
                num_doc_voter: Number(formData.num_doc_voter),
                id_career: Number(formData.id_career),
            };

            const response = await api.post('/voters', payload);

            console.log("Registro exitoso:", response.data);
            setSuccess("¡Registro exitoso! Serás redirigido al login.");

            setTimeout(() => {
                navigate('/login');
            }, 2000);

        } catch (error) {
            const errorMessage = error.response?.data?.message || "Error en el registro. Por favor, inténtalo de nuevo.";
            console.error("Hubo un error al registrar el votante:", errorMessage);
            setError(errorMessage);
        }
    };

    // Función para obtener clase CSS según si hay error
    const getInputClassName = (fieldName) => {
        const baseClass = "mt-1 block w-full border rounded-md shadow-sm p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition";
        
        if (fieldErrors[fieldName]) {
            return `${baseClass} border-red-500 bg-red-50`;
        }
        
        return `${baseClass} border-gray-300`;
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-white">
            <Navbar/>
            <div className="bg-white shadow-2xl rounded-2xl p-8 w-full max-w-6xl mt-30 border border-gray-200">
                <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                    {/* Logo y título en la parte superior y centrado */}
                    <div className="w-full md:w-1/3 flex flex-col items-center justify-center mb-6 md:mb-0">
                        <Link to="/">
                            <div className="flex justify-center mb-4">
                                <img
                                    src="/img/logo.png"
                                    alt="Logo"
                                    className="w-32 h-32 object-contain"
                                />
                            </div>
                        </Link>

                        <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">
                            Registro Univote
                        </h2>
                        <p className="text-center text-gray-600 text-sm">
                            Completa tus datos para registrarte
                        </p>
                    </div>

                    {/* Formulario a la derecha */}
                    <div className="w-full md:w-2/3 bg-white p-8 rounded-xl ">
                        {error && (
                            <div className="bg-red-100 text-red-700 p-3 rounded-md mb-4 text-sm text-center">
                                {error}
                            </div>
                        )}
                        {success && (
                            <div className="bg-green-100 text-green-700 p-3 rounded-md mb-4 text-sm text-center">
                                {success}
                            </div>
                        )}

                        {/* Formulario */}
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Nombre */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Nombre</label>
                                    <input
                                        type="text"
                                        name="nombre_voter"
                                        value={formData.nombre_voter}
                                        onChange={handleChange}
                                        required
                                        className={getInputClassName('nombre_voter')}
                                        placeholder="Ej: María (solo letras)"
                                        maxLength={50}
                                    />
                                    {fieldErrors.nombre_voter && (
                                        <p className="text-red-500 text-xs mt-1">{fieldErrors.nombre_voter}</p>
                                    )}
                                </div>

                                {/* Apellido */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Apellido</label>
                                    <input
                                        type="text"
                                        name="apellido_voter"
                                        value={formData.apellido_voter}
                                        onChange={handleChange}
                                        required
                                        className={getInputClassName('apellido_voter')}
                                        placeholder="Ej: González (solo letras)"
                                        maxLength={50}
                                    />
                                    {fieldErrors.apellido_voter && (
                                        <p className="text-red-500 text-xs mt-1">{fieldErrors.apellido_voter}</p>
                                    )}
                                </div>

                                {/* Tipo de Documento */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Tipo de Documento</label>
                                    <select
                                        name="tipo_doc_voter"
                                        value={formData.tipo_doc_voter}
                                        onChange={handleChange}
                                        required
                                        className={getInputClassName('tipo_doc_voter')}
                                    >
                                        <option value="">Seleccione</option>
                                        <option value="CC">Cédula de Ciudadanía</option>
                                        <option value="TI">Tarjeta de Identidad</option>
                                        <option value="CE">Cédula de Extranjería</option>
                                    </select>
                                    {fieldErrors.tipo_doc_voter && (
                                        <p className="text-red-500 text-xs mt-1">{fieldErrors.tipo_doc_voter}</p>
                                    )}
                                </div>

                                {/* Número de Documento */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Número de Documento</label>
                                    <input
                                        type="number"
                                        name="num_doc_voter"
                                        value={formData.num_doc_voter}
                                        onChange={handleChange}
                                        required
                                        className={getInputClassName('num_doc_voter')}
                                        placeholder="Mínimo 10 dígitos"
                                        min="1000000000"
                                        max="999999999999999"
                                    />
                                    {fieldErrors.num_doc_voter && (
                                        <p className="text-red-500 text-xs mt-1">{fieldErrors.num_doc_voter}</p>
                                    )}
                                </div>

                                {/* Correo Institucional */}
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700">Correo Institucional</label>
                                    <input
                                        type="email"
                                        name="correo_voter"
                                        value={formData.correo_voter}
                                        onChange={handleChange}
                                        required
                                        className={getInputClassName('correo_voter')}
                                        placeholder="ejemplo@gmail.com (sin caracteres especiales)"
                                        maxLength={100}
                                    />
                                    {fieldErrors.correo_voter && (
                                        <p className="text-red-500 text-xs mt-1">{fieldErrors.correo_voter}</p>
                                    )}
                                </div>

                                {/* Contraseña con ojito */}
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700">Contraseña</label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            name="contrasena_voter"
                                            value={formData.contrasena_voter}
                                            onChange={handleChange}
                                            required
                                            className={`${getInputClassName('contrasena_voter')} pr-10`}
                                            placeholder="Mínimo 8 caracteres con mayúscula, minúscula, número y carácter especial"
                                            maxLength={50}
                                        />
                                        <button
                                            type="button"
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-600 hover:text-gray-800"
                                            onClick={togglePasswordVisibility}
                                        >
                                            {showPassword ? (
                                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                </svg>
                                            ) : (
                                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                                </svg>
                                            )}
                                        </button>
                                    </div>
                                    {fieldErrors.contrasena_voter && (
                                        <p className="text-red-500 text-xs mt-1">
                                            {fieldErrors.contrasena_voter}
                                        </p>
                                    )}
                                    <p className="text-gray-500 text-xs mt-1">
                                        La contraseña debe tener: mínimo 8 caracteres, al menos una mayúscula, una minúscula, un número y un carácter especial.
                                    </p>
                                </div>

                                {/* Carrera */}
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700">Carrera</label>
                                    <select
                                        name="id_career"
                                        value={formData.id_career}
                                        onChange={handleChange}
                                        required
                                        className={getInputClassName('id_career')}
                                    >
                                        <option value="">Seleccione una carrera</option>
                                        {careers.map((career) => (
                                            <option key={career.id_career} value={career.id_career}>
                                                {career.nombre_career}
                                            </option>
                                        ))}
                                    </select>
                                    {fieldErrors.id_career && (
                                        <p className="text-red-500 text-xs mt-1">{fieldErrors.id_career}</p>
                                    )}
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-blue-900 text-white py-3 rounded-md font-semibold hover:bg-blue-800 transition shadow-sm disabled:bg-gray-400 disabled:cursor-not-allowed"
                                disabled={Object.values(fieldErrors).some(error => error !== null) || 
                                         Object.values(formData).some(value => !value)}
                            >
                                Registrarse
                            </button>
                        </form>

                        <p className="text-center text-sm mt-6 text-gray-600">
                            ¿Ya tienes cuenta?{" "}
                            <Link to="/login" className="text-blue-600 hover:underline font-medium">
                                Inicia sesión
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}