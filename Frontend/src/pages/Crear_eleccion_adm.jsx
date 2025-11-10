import React, { useState, useEffect } from "react";
import Navbar_admin from "../components/Navbar_admin";
import Footer from "../components/Footer";
import axios from "axios";

// Ajusta esta URL para que apunte a tu endpoint de elecciones en el backend
const API_BASE_URL = "http://localhost:3000/elections";

const Crear_eleccion_adm = () => {
    // Estado para almacenar las elecciones de la base de datos
    const [elecciones, setElecciones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [message, setMessage] = useState(null);

    // Estados para la paginación
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(5);
    const [totalItems, setTotalItems] = useState(0);

    // Estado para los datos del formulario
    const [formData, setFormData] = useState({
        nombre: "",
        fechaInicio: "",
        fechaFin: "",
    });

    // Calcular el número total de páginas
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    // Función para obtener las elecciones de la API
    const fetchElections = async (page = 1) => {
        setLoading(true);
        try {
            const response = await axios.get(API_BASE_URL);
            const allElections = response.data;
            
            setTotalItems(allElections.length);
            
            // Paginación en el frontend
            const startIndex = (page - 1) * itemsPerPage;
            const endIndex = startIndex + itemsPerPage;
            const paginatedElections = allElections.slice(startIndex, endIndex);
            
            setElecciones(paginatedElections);
            setCurrentPage(page);
        } catch (err) {
            console.error("Error al cargar las elecciones:", err);
            setError("No se pudieron cargar las elecciones.");
        } finally {
            setLoading(false);
        }
    };

    // Carga las elecciones al montar el componente
    useEffect(() => {
        fetchElections();
    }, []);

    // Función para obtener la fecha y hora actual en formato para datetime-local
    const getCurrentDateTime = () => {
        const now = new Date();
        // Añadir un minuto extra para evitar problemas con el segundo actual
        now.setMinutes(now.getMinutes() + 1);
        return now.toISOString().slice(0, 16);
    };

    // Maneja cambios en los inputs
    const handleChange = (e) => {
        const { name, value } = e.target;
        
        if (name === "fechaInicio" || name === "fechaFin") {
            const selectedDate = new Date(value);
            const now = new Date();
            
            // Validar que la fecha no sea pasada
            if (selectedDate < now) {
                setMessage("❌ No puedes seleccionar una fecha y hora pasada.");
                return;
            }
            
            // Si es fecha de inicio, validar que fecha fin sea posterior
            if (name === "fechaInicio" && formData.fechaFin) {
                const fechaFin = new Date(formData.fechaFin);
                if (selectedDate >= fechaFin) {
                    setMessage("❌ La fecha de inicio debe ser anterior a la fecha de fin.");
                    return;
                }
            }
            
            // Si es fecha fin, validar que sea posterior a fecha inicio
            if (name === "fechaFin" && formData.fechaInicio) {
                const fechaInicio = new Date(formData.fechaInicio);
                if (selectedDate <= fechaInicio) {
                    setMessage("❌ La fecha de fin debe ser posterior a la fecha de inicio.");
                    return;
                }
            }
            
            setMessage(null); // Limpiar mensaje de error si la validación pasa
        }
        
        setFormData({ ...formData, [name]: value });
    };

    // Maneja el envío del formulario para crear una nueva elección
    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage(null);

        // Validaciones adicionales antes de enviar
        const fechaInicio = new Date(formData.fechaInicio);
        const fechaFin = new Date(formData.fechaFin);
        const now = new Date();

        if (fechaInicio < now) {
            setMessage("❌ La fecha de inicio no puede ser una fecha pasada.");
            return;
        }

        if (fechaFin <= fechaInicio) {
            setMessage("❌ La fecha de fin debe ser posterior a la fecha de inicio.");
            return;
        }

        try {
            // Formatear fechas correctamente para el backend
            const fechaInicioISO = new Date(formData.fechaInicio).toISOString();
            const fechaFinISO = new Date(formData.fechaFin).toISOString();

            console.log('📤 Enviando datos:', {
                nombre_election: formData.nombre,
                fecha_inicio: fechaInicioISO,
                fecha_fin: fechaFinISO,
                estado_election: "Programada"
            });

            const dataToSend = {
                nombre_election: formData.nombre,
                fecha_inicio: fechaInicioISO,
                fecha_fin: fechaFinISO,
                estado_election: "Programada",
                id_admin: 1, 
            };

            const response = await axios.post(API_BASE_URL, dataToSend);
            console.log('✅ Respuesta del servidor:', response.data);

            await fetchElections(currentPage);

            setMessage("✅ Elección creada correctamente.");
            
            // Resetear formulario
            setFormData({
                nombre: "",
                fechaInicio: "",
                fechaFin: "",
            });
        } catch (err) {
            console.error("Error al crear la elección:", err);
            if (err.response) {
                console.error('Detalles del error:', err.response.data);
                setMessage(`❌ Error: ${err.response.data.message || 'No se pudo crear la elección'}`);
            } else {
                setMessage("❌ Error al crear la elección. Por favor, intente de nuevo.");
            }
        }
    };

    // Funciones de paginación
    const goToPage = (page) => {
        if (page >= 1 && page <= totalPages) {
            fetchElections(page);
        }
    };

    const goToNextPage = () => {
        if (currentPage < totalPages) {
            goToPage(currentPage + 1);
        }
    };

    const goToPreviousPage = () => {
        if (currentPage > 1) {
            goToPage(currentPage - 1);
        }
    };

    // Generar números de página para mostrar
    const getPageNumbers = () => {
        const pages = [];
        const maxVisiblePages = 5;
        
        let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
        
        if (endPage - startPage + 1 < maxVisiblePages) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }
        
        for (let i = startPage; i <= endPage; i++) {
            pages.push(i);
        }
        
        return pages;
    };

    // Función para formatear fecha de manera robusta
    const formatDate = (dateString) => {
        if (!dateString) return 'Fecha no definida';
        
        try {
            let date;
            
            // Si es string en formato DD/MM/YYYY (como viene del backend)
            if (typeof dateString === 'string' && dateString.includes('/')) {
                const parts = dateString.split('/');
                if (parts.length === 3) {
                    // Formato DD/MM/YYYY
                    const day = parseInt(parts[0]);
                    const month = parseInt(parts[1]) - 1; // Los meses en JS son 0-based
                    const year = parseInt(parts[2]);
                    
                    date = new Date(year, month, day);
                    
                    // Verificar si la fecha es válida
                    if (isNaN(date.getTime())) {
                        return `Formato inválido`;
                    }
                } else {
                    return `Formato desconocido`;
                }
            } 
            // Si es string en formato ISO
            else if (typeof dateString === 'string') {
                date = new Date(dateString);
                
                if (isNaN(date.getTime())) {
                    // Intentar sin la Z del timezone si existe
                    const withoutZ = dateString.replace('Z', '');
                    date = new Date(withoutZ);
                    
                    if (isNaN(date.getTime())) {
                        return `Formato inválido`;
                    }
                }
            }
            // Si ya es un objeto Date válido
            else if (dateString instanceof Date && !isNaN(dateString)) {
                date = dateString;
            } else {
                return `Tipo inválido`;
            }

            // Verificar que la fecha sea válida
            if (isNaN(date.getTime())) {
                return `Fecha inválida`;
            }

            // Formatear a español
            return date.toLocaleString('es-ES', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (error) {
            console.error('Error formateando fecha:', error, 'Fecha original:', dateString);
            return `Error al formatear`;
        }
    };

    // Función para determinar el color del estado
    const getEstadoColor = (estado) => {
        switch (estado) {
            case 'Programada':
                return 'text-blue-600 bg-blue-100 px-2 py-1 rounded';
            case 'En curso':
                return 'text-green-600 bg-green-100 px-2 py-1 rounded';
            case 'Finalizada':
                return 'text-red-600 bg-red-100 px-2 py-1 rounded';
            default:
                return 'text-gray-600 bg-gray-100 px-2 py-1 rounded';
        }
    };

    return (
        <>
            <Navbar_admin />
            <div className="p-6 mt-24 flex flex-col items-center">
                {/* Título */}
                <h1 className="text-4xl font-extrabold text-center text-blue-900 mb-6">
                    Crear Nueva Elección
                </h1>

                {/* Mensaje de estado (éxito/error) */}
                {message && (
                    <div className={`mb-4 p-3 rounded-lg font-bold w-full max-w-lg ${
                        message.startsWith("✅") ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                    }`}>
                        {message}
                    </div>
                )}

                {/* Formulario */}
                <form
                    onSubmit={handleSubmit}
                    className="w-full max-w-lg bg-white shadow-lg rounded-lg p-6 border mb-10"
                >
                    <div className="mb-4">
                        <label className="block text-gray-700 font-semibold mb-2">
                            Nombre de la elección
                        </label>
                        <input
                            type="text"
                            name="nombre"
                            value={formData.nombre}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
                            placeholder="Ej: Elección de Personero 2025"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-gray-700 font-semibold mb-2">
                                Fecha y hora de inicio
                            </label>
                            <input
                                type="datetime-local"
                                name="fechaInicio"
                                value={formData.fechaInicio}
                                onChange={handleChange}
                                min={getCurrentDateTime()}
                                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
                                required
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                Mínimo: {getCurrentDateTime().replace('T', ' ')}
                            </p>
                        </div>
                        <div>
                            <label className="block text-gray-700 font-semibold mb-2">
                                Fecha y hora de cierre
                            </label>
                            <input
                                type="datetime-local"
                                name="fechaFin"
                                value={formData.fechaFin}
                                onChange={handleChange}
                                min={formData.fechaInicio || getCurrentDateTime()}
                                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
                                required
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                Debe ser posterior al inicio
                            </p>
                        </div>
                    </div>

                    {/* Estado fijo - solo lectura */}
                    <div className="mb-4">
                        <label className="block text-gray-700 font-semibold mb-2">
                            Estado
                        </label>
                        <div className="w-full px-3 py-2 border rounded-lg bg-gray-100 text-gray-700">
                            Programada
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                            Todas las elecciones nuevas se crean con estado "Programada"
                        </p>
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-blue-700 text-white py-2 rounded-lg font-bold hover:bg-blue-900 transition"
                    >
                        Crear Elección
                    </button>
                </form>

                {/* Tabla de elecciones creadas */}
                <div className="w-full max-w-5xl">
                    <h2 className="text-2xl font-bold text-center text-gray-800 mb-4">
                        Elecciones Creadas
                    </h2>

                    {/* Información de paginación */}
                    <div className="flex justify-between items-center mb-4">
                        <div className="text-sm text-gray-600">
                            Mostrando {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, totalItems)} de {totalItems} elecciones
                        </div>
                        
                        {/* Selector de items por página */}
                        <div className="flex items-center space-x-2">
                            <label htmlFor="itemsPerPage" className="text-sm text-gray-600">
                                Mostrar:
                            </label>
                            <select
                                id="itemsPerPage"
                                value={itemsPerPage}
                                onChange={(e) => {
                                    setItemsPerPage(Number(e.target.value));
                                    setCurrentPage(1);
                                    fetchElections(1);
                                }}
                                className="border border-gray-300 rounded px-2 py-1 text-sm"
                            >
                                <option value="5">5</option>
                                <option value="10">10</option>
                                <option value="20">20</option>
                                <option value="50">50</option>
                            </select>
                        </div>
                    </div>

                    {loading ? (
                        <p className="text-center text-gray-500">Cargando elecciones...</p>
                    ) : error ? (
                        <p className="text-center text-red-500">{error}</p>
                    ) : elecciones.length > 0 ? (
                        <>
                            <div className="overflow-x-auto">
                                <table className="min-w-full border border-gray-300 bg-white shadow-md rounded-lg">
                                    <thead className="bg-blue-900 text-white">
                                        <tr>
                                            <th className="px-4 py-2 border">ID Elección</th>
                                            <th className="px-4 py-2 border">Nombre</th>
                                            <th className="px-4 py-2 border">Fecha Inicio</th>
                                            <th className="px-4 py-2 border">Fecha Fin</th>
                                            <th className="px-4 py-2 border">Estado</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {elecciones.map((eleccion) => (
                                            <tr key={eleccion.id_election} className="text-center hover:bg-gray-100">
                                                <td className="px-4 py-2 border">{eleccion.id_election}</td>
                                                <td className="px-4 py-2 border font-medium">{eleccion.nombre_election}</td>
                                                <td className="px-4 py-2 border">
                                                    {formatDate(eleccion.fecha_inicio)}
                                                </td>
                                                <td className="px-4 py-2 border">
                                                    {formatDate(eleccion.fecha_fin)}
                                                </td>
                                                <td className="px-4 py-2 border">
                                                    <span className={getEstadoColor(eleccion.estado_election)}>
                                                        {eleccion.estado_election}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Controles de paginación */}
                            {totalPages > 1 && (
                                <div className="flex justify-center items-center space-x-2 mt-6">
                                    <button
                                        onClick={goToPreviousPage}
                                        disabled={currentPage === 1}
                                        className={`px-4 py-2 rounded ${
                                            currentPage === 1
                                                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                                : "bg-blue-500 text-white hover:bg-blue-700"
                                        }`}
                                    >
                                        Anterior
                                    </button>

                                    {currentPage > 3 && (
                                        <>
                                            <button
                                                onClick={() => goToPage(1)}
                                                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100"
                                            >
                                                1
                                            </button>
                                            {currentPage > 4 && <span className="px-2">...</span>}
                                        </>
                                    )}

                                    {getPageNumbers().map(page => (
                                        <button
                                            key={page}
                                            onClick={() => goToPage(page)}
                                            className={`px-4 py-2 border rounded ${
                                                currentPage === page
                                                    ? "bg-blue-500 text-white border-blue-500"
                                                    : "border-gray-300 hover:bg-gray-100"
                                            }`}
                                        >
                                            {page}
                                        </button>
                                    ))}

                                    {currentPage < totalPages - 2 && (
                                        <>
                                            {currentPage < totalPages - 3 && <span className="px-2">...</span>}
                                            <button
                                                onClick={() => goToPage(totalPages)}
                                                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100"
                                            >
                                                {totalPages}
                                            </button>
                                        </>
                                    )}

                                    <button
                                        onClick={goToNextPage}
                                        disabled={currentPage === totalPages}
                                        className={`px-4 py-2 rounded ${
                                            currentPage === totalPages
                                                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                                : "bg-blue-500 text-white hover:bg-blue-700"
                                        }`}
                                    >
                                        Siguiente
                                    </button>
                                </div>
                            )}
                        </>
                    ) : (
                        <p className="text-center text-gray-500">No hay elecciones creadas.</p>
                    )}
                </div>
            </div>
        </>
    );
};

export default Crear_eleccion_adm;