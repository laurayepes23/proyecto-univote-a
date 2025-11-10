import React, { useState, useEffect } from "react";
import Navbar_admin from "../components/Navbar_admin";
import Footer from "../components/Footer";
import axios from "axios";

const API_BASE_URL = "http://localhost:3000/elections";

const Eliminar_eleccion_adm = () => {
    // Estado para almacenar las elecciones de la base de datos
    const [elecciones, setElecciones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [message, setMessage] = useState(null);

    // Estados para la paginación
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(5);
    const [totalItems, setTotalItems] = useState(0);

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

    // Nueva función para eliminar una elección
    const handleDelete = async (id) => {
        try {
            await axios.delete(`${API_BASE_URL}/${id}`);
            setMessage("✅ Elección eliminada correctamente.");
            // Vuelve a cargar la lista para mostrar el cambio
            await fetchElections(currentPage); 
        } catch (err) {
            console.error("Error al eliminar la elección:", err);
            // Manejo de errores más específico
            if (err.response && err.response.status === 500) {
                setMessage("❌ Error: No se puede eliminar esta elección. Es posible que tenga candidatos o votantes asociados.");
            } else {
                setMessage("❌ Error al eliminar la elección. Por favor, intente de nuevo.");
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
                <h1 className="text-4xl font-extrabold text-center text-red-700 mb-6">
                    Eliminar Elección
                </h1>

                {/* Mensaje de estado (éxito/error) */}
                {message && (
                    <div className={`mb-4 p-3 rounded-lg font-bold w-full max-w-5xl ${
                        message.startsWith("✅") ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                    }`}>
                        {message}
                    </div>
                )}

                {/* Tabla de elecciones */}
                <div className="w-full max-w-5xl">
                    <h2 className="text-2xl font-bold text-center text-gray-800 mb-4">
                        Elecciones Registradas
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
                                            <th className="px-4 py-2 border">Acciones</th>
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
                                                <td className="px-4 py-2 border">
                                                    <button
                                                        onClick={() => handleDelete(eleccion.id_election)}
                                                        className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-800 transition font-medium"
                                                    >
                                                        Eliminar
                                                    </button>
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
                        <p className="text-center text-gray-500">No hay elecciones registradas.</p>
                    )}
                </div>
            </div>
        </>
    );
};

export default Eliminar_eleccion_adm;