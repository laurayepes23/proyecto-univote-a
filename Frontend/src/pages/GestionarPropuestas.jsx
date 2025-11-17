/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import NavbarCandidato from "../components/NavbarCandidato";
import Footer from "../components/Footer";
import { FaEdit, FaTrashAlt, FaPlusCircle, FaRegLightbulb, FaExclamationTriangle, FaSave, FaTimes, FaChevronLeft, FaChevronRight, FaExclamationCircle } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

export default function GestionarPropuestas() {
    const navigate = useNavigate();
    const [proposals, setProposals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [editFormData, setEditFormData] = useState({
        titulo_proposal: '',
        descripcion_proposal: '',
        estado_proposal: 'Activa'
    });

    // Estados para la confirmación de eliminación
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [proposalToDelete, setProposalToDelete] = useState(null);

    // Estados para la paginación
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(6);
    const [totalItems, setTotalItems] = useState(0);

    // Calcular el número total de páginas
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    // Obtener información del candidato desde localStorage
    const candidateData = JSON.parse(localStorage.getItem('candidateData') || '{}');
    const candidateId = candidateData.id_candidate;

    useEffect(() => {
        if (!candidateId) {
            setError('No se pudo identificar al candidato. Por favor, inicia sesión nuevamente.');
            setLoading(false);
            return;
        }
        fetchProposals();
    }, [candidateId]);

    const fetchProposals = async (page = 1) => {
        try {
            setLoading(true);
            const response = await api.get('/proposals');
            
            // Filtrar propuestas del candidato actual
            const candidateProposals = response.data.filter(
                proposal => proposal.candidateId === candidateId
            );
            
            setTotalItems(candidateProposals.length);
            
            // Paginación en el frontend
            const startIndex = (page - 1) * itemsPerPage;
            const endIndex = startIndex + itemsPerPage;
            const paginatedProposals = candidateProposals.slice(startIndex, endIndex);
            
            setProposals(paginatedProposals);
            setCurrentPage(page);
        } catch (error) {
            console.error("Error al cargar propuestas:", error);
            setError('Error al cargar las propuestas. Inténtalo de nuevo.');
        } finally {
            setLoading(false);
        }
    };

    // Funciones de paginación
    const goToPage = (page) => {
        if (page >= 1 && page <= totalPages) {
            fetchProposals(page);
            window.scrollTo({ top: 0, behavior: 'smooth' });
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

    const handleGoToCreatePage = () => {
        navigate("/CrearPropuesta");
    };

    // Mostrar modal de confirmación de eliminación
    const handleShowDeleteModal = (proposal) => {
        setProposalToDelete(proposal);
        setShowDeleteModal(true);
    };

    // Cerrar modal de confirmación
    const handleCloseDeleteModal = () => {
        setShowDeleteModal(false);
        setProposalToDelete(null);
    };

    // Confirmar eliminación
    const handleConfirmDelete = async () => {
        if (!proposalToDelete) return;

        try {
            await api.delete(`/proposals/${proposalToDelete.id_proposal}`);
            // Recargar las propuestas para mantener la paginación correcta
            await fetchProposals(currentPage);
            setSuccess('Propuesta eliminada correctamente');
            setShowDeleteModal(false);
            setProposalToDelete(null);
            
            setTimeout(() => setSuccess(''), 3000);
        } catch (error) {
            console.error("Error al eliminar propuesta:", error);
            setError('Error al eliminar la propuesta. Inténtalo de nuevo.');
            setTimeout(() => setError(''), 3000);
        }
    };

    // Iniciar edición
    const handleStartEdit = (proposal) => {
        setEditingId(proposal.id_proposal);
        setEditFormData({
            titulo_proposal: proposal.titulo_proposal,
            descripcion_proposal: proposal.descripcion_proposal,
            estado_proposal: proposal.estado_proposal
        });
    };

    // Cancelar edición
    const handleCancelEdit = () => {
        setEditingId(null);
        setEditFormData({
            titulo_proposal: '',
            descripcion_proposal: '',
            estado_proposal: 'Activa'
        });
    };

    // Manejar cambios en el formulario de edición
    const handleEditChange = (e) => {
        const { name, value } = e.target;
        setEditFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Guardar cambios - USANDO PATCH
    const handleSaveEdit = async (proposalId) => {
        if (!editFormData.titulo_proposal.trim()) {
            setError('El título es obligatorio');
            return;
        }
        
        if (!editFormData.descripcion_proposal.trim()) {
            setError('La descripción es obligatoria');
            return;
        }

        try {
            setLoading(true);
            
            // USAR PATCH en lugar de PUT
            const response = await api.patch(`/proposals/${proposalId}`, {
                titulo_proposal: editFormData.titulo_proposal,
                descripcion_proposal: editFormData.descripcion_proposal,
                estado_proposal: editFormData.estado_proposal
                // NO enviar candidateId en update
            });

            console.log("Propuesta actualizada:", response.data);

            // Recargar las propuestas para mantener la paginación
            await fetchProposals(currentPage);

            setSuccess('Propuesta actualizada correctamente');
            setEditingId(null);
            
            setTimeout(() => setSuccess(''), 3000);
        } catch (error) {
            console.error("Error al actualizar propuesta:", error);
            console.error("Detalles del error:", error.response?.data);
            setError('Error al actualizar la propuesta. Inténtalo de nuevo.');
            setTimeout(() => setError(''), 3000);
        } finally {
            setLoading(false);
        }
    };

    // Función para obtener el badge de estado - solo Activa e Inactiva
    const getStatusBadge = (estado) => {
        const statusConfig = {
            'Activa': { color: 'bg-green-100 text-green-800', label: 'Activa' },
            'Inactiva': { color: 'bg-gray-100 text-gray-800', label: 'Inactiva' }
        };

        const config = statusConfig[estado] || { color: 'bg-gray-100 text-gray-800', label: estado };
        
        return (
            <span className={`text-xs font-semibold px-2 py-1 rounded-full ${config.color}`}>
                {config.label}
            </span>
        );
    };

    // Solo dos opciones para el estado
    const estados = ['Activa', 'Inactiva'];

    if (!candidateId) {
        return (
            <div className="min-h-screen flex flex-col bg-blue-50 text-gray-800">
                <NavbarCandidato />
                <div className="h-20"></div>
                <main className="flex-grow max-w-6xl mx-auto p-8">
                    <div className="text-center p-12 bg-white rounded-2xl shadow-lg border border-gray-100">
                        <FaExclamationTriangle className="text-6xl text-red-500 mx-auto mb-4" />
                        <p className="text-lg text-gray-600 font-semibold mb-4">
                            No se pudo identificar al candidato.
                        </p>
                        <button
                            onClick={() => navigate('/login')}
                            className="bg-blue-900 text-white font-semibold py-3 px-8 rounded-xl shadow-md hover:bg-blue-800 transition-colors"
                        >
                            Iniciar Sesión
                        </button>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col bg-blue-50 text-gray-800">
            <NavbarCandidato />
            <div className="h-20"></div>

            {/* Contenido principal */}
            <main className="flex-grow max-w-7xl mx-auto p-8 w-full">
                {/* Mensajes de éxito y error */}
                {success && (
                    <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg mb-6">
                        {success}
                    </div>
                )}
                
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6">
                        {error}
                    </div>
                )}

                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-4xl md:text-5xl font-extrabold text-blue-900">
                        Mis Propuestas
                    </h2>
                    <button
                        onClick={handleGoToCreatePage}
                        className="bg-blue-900 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:bg-blue-800 transition-colors flex items-center"
                    >
                        <FaPlusCircle className="mr-2" />
                        Crear Propuesta
                    </button>
                </div>

                {/* Información de paginación */}
                <div className="flex justify-between items-center mb-6">
                    <div className="text-sm text-gray-600">
                        Mostrando {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, totalItems)} de {totalItems} propuestas
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
                                fetchProposals(1);
                            }}
                            className="border border-gray-300 rounded px-2 py-1 text-sm"
                        >
                            <option value="3">3</option>
                            <option value="6">6</option>
                            <option value="9">9</option>
                            <option value="12">12</option>
                        </select>
                    </div>
                </div>

                {loading ? (
                    <div className="text-center p-12 bg-white rounded-2xl shadow-lg border border-gray-100">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900 mx-auto"></div>
                        <p className="text-lg text-gray-600 font-semibold mt-4">Cargando propuestas...</p>
                    </div>
                ) : proposals.length === 0 ? (
                    <div className="text-center p-12 bg-white rounded-2xl shadow-lg border border-gray-100">
                        <FaRegLightbulb className="text-6xl text-blue-500 mx-auto mb-4" />
                        <p className="text-lg text-gray-600 font-semibold mb-4">
                            Aún no tienes propuestas. ¡Crea la primera para empezar!
                        </p>
                        <button
                            onClick={handleGoToCreatePage}
                            className="bg-green-500 text-white font-semibold py-3 px-8 rounded-xl shadow-md hover:bg-green-600 transition-colors"
                        >
                            Crear Propuesta Ahora
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                            {proposals.map(proposal => (
                                <div
                                    key={proposal.id_proposal}
                                    className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 flex flex-col justify-between hover:shadow-xl transition-shadow duration-300"
                                >
                                    {editingId === proposal.id_proposal ? (
                                        // MODO EDICIÓN
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-1">
                                                    Título *
                                                </label>
                                                <input
                                                    type="text"
                                                    name="titulo_proposal"
                                                    value={editFormData.titulo_proposal}
                                                    onChange={handleEditChange}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-transparent"
                                                    required
                                                />
                                            </div>
                                            
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-1">
                                                    Descripción *
                                                </label>
                                                <textarea
                                                    name="descripcion_proposal"
                                                    value={editFormData.descripcion_proposal}
                                                    onChange={handleEditChange}
                                                    rows="3"
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-transparent"
                                                    required
                                                />
                                            </div>
                                            
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-1">
                                                    Estado
                                                </label>
                                                <select
                                                    name="estado_proposal"
                                                    value={editFormData.estado_proposal}
                                                    onChange={handleEditChange}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-transparent"
                                                >
                                                    {estados.map(estado => (
                                                        <option key={estado} value={estado}>
                                                            {estado}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div className="flex space-x-2 mt-4">
                                                <button
                                                    onClick={() => handleSaveEdit(proposal.id_proposal)}
                                                    className="flex-1 bg-green-600 text-white py-2 px-3 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center text-sm"
                                                >
                                                    <FaSave className="mr-1" />
                                                    Guardar
                                                </button>
                                                <button
                                                    onClick={handleCancelEdit}
                                                    className="flex-1 bg-gray-500 text-white py-2 px-3 rounded-lg hover:bg-gray-600 transition-colors flex items-center justify-center text-sm"
                                                >
                                                    <FaTimes className="mr-1" />
                                                    Cancelar
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        // MODO VISUALIZACIÓN
                                        <>
                                            <div>
                                                <div className="flex justify-between items-start mb-2">
                                                    <h3 className="text-xl font-bold text-gray-800 line-clamp-2 flex-1 mr-2">
                                                        {proposal.titulo_proposal}
                                                    </h3>
                                                    {getStatusBadge(proposal.estado_proposal)}
                                                </div>
                                                
                                                <p className="text-gray-600 text-sm mb-4 line-clamp-4">
                                                    {proposal.descripcion_proposal}
                                                </p>
                                            </div>
                                            
                                            <div className="flex space-x-4 mt-4">
                                                <button
                                                    onClick={() => handleStartEdit(proposal)}
                                                    className="flex-1 bg-blue-900 text-white py-2 px-4 rounded-lg shadow-md hover:bg-blue-800 transition-colors flex items-center justify-center"
                                                >
                                                    <FaEdit className="mr-2" />
                                                    Editar
                                                </button>
                                                <button
                                                    onClick={() => handleShowDeleteModal(proposal)}
                                                    className="flex-1 bg-red-500 text-white py-2 px-4 rounded-lg shadow-md hover:bg-red-600 transition-colors flex items-center justify-center"
                                                >
                                                    <FaTrashAlt className="mr-2" />
                                                    Eliminar
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Controles de paginación */}
                        {totalPages > 1 && (
                            <div className="flex justify-center items-center space-x-2 mt-8">
                                <button
                                    onClick={goToPreviousPage}
                                    disabled={currentPage === 1}
                                    className={`p-2 rounded-lg ${
                                        currentPage === 1
                                            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                            : "bg-blue-500 text-white hover:bg-blue-700"
                                    }`}
                                >
                                    <FaChevronLeft />
                                </button>

                                {currentPage > 3 && (
                                    <>
                                        <button
                                            onClick={() => goToPage(1)}
                                            className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-100"
                                        >
                                            1
                                        </button>
                                        {currentPage > 4 && <span className="px-2 text-gray-500">...</span>}
                                    </>
                                )}

                                {getPageNumbers().map(page => (
                                    <button
                                        key={page}
                                        onClick={() => goToPage(page)}
                                        className={`px-3 py-2 border rounded-lg ${
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
                                        {currentPage < totalPages - 3 && <span className="px-2 text-gray-500">...</span>}
                                        <button
                                            onClick={() => goToPage(totalPages)}
                                            className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-100"
                                        >
                                            {totalPages}
                                        </button>
                                    </>
                                )}

                                <button
                                    onClick={goToNextPage}
                                    disabled={currentPage === totalPages}
                                    className={`p-2 rounded-lg ${
                                        currentPage === totalPages
                                            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                            : "bg-blue-500 text-white hover:bg-blue-700"
                                    }`}
                                >
                                    <FaChevronRight />
                                </button>
                            </div>
                        )}
                    </>
                )}
            </main>

            {/* Modal de confirmación de eliminación */}
            {showDeleteModal && proposalToDelete && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl shadow-xl max-w-md w-full transform transition-all">
                        {/* Header del modal */}
                        <div className="flex items-center p-6 border-b border-gray-200">
                            <div className="flex-shrink-0">
                                <FaExclamationCircle className="text-red-500 text-2xl" />
                            </div>
                            <div className="ml-4">
                                <h3 className="text-lg font-semibold text-gray-900">
                                    Confirmar Eliminación
                                </h3>
                            </div>
                        </div>

                        {/* Contenido del modal */}
                        <div className="p-6">
                            <p className="text-gray-600 mb-2">
                                ¿Estás seguro de que deseas eliminar la siguiente propuesta?
                            </p>
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                                <h4 className="font-semibold text-red-800 text-sm mb-1">
                                    Propuesta a eliminar:
                                </h4>
                                <p className="text-red-700 font-medium">
                                    {proposalToDelete.titulo_proposal}
                                </p>
                            </div>
                            <p className="text-sm text-gray-500">
                                Esta acción no se puede deshacer. La propuesta se eliminará permanentemente.
                            </p>
                        </div>

                        {/* Footer del modal */}
                        <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
                            <button
                                onClick={handleCloseDeleteModal}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleConfirmDelete}
                                className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-lg hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                            >
                                Sí, Eliminar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}