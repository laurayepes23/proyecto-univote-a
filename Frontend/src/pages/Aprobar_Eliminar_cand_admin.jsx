// Aprobar_Eliminar_cand_admin.js (COMPLETO ACTUALIZADO)
import React, { useState, useEffect } from "react";
import Navbar_admin from "../components/Navbar_admin";
import axios from "axios";

const API_BASE_URL = "http://localhost:3000";

const Aprobar_Eliminar_cand_admin = () => {
  const [candidatos, setCandidatos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [showRechazoModal, setShowRechazoModal] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [motivoRechazo, setMotivoRechazo] = useState("");

  // Estados para la paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [totalItems, setTotalItems] = useState(0);

  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const fetchCandidatos = async (page = 1) => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/candidates`);
      const allCandidates = response.data;
      
      setTotalItems(allCandidates.length);
      
      const startIndex = (page - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      const paginatedCandidates = allCandidates.slice(startIndex, endIndex);
      
      setCandidatos(paginatedCandidates);
      setCurrentPage(page);
    } catch (err) {
      console.error("Error al cargar la lista de candidatos:", err);
      setError("No se pudo cargar la lista de candidatos.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidatos();
  }, []);

  // Función para abrir modal de rechazo
  const openRechazoModal = (candidato) => {
    setSelectedCandidate(candidato);
    setMotivoRechazo("");
    setShowRechazoModal(true);
  };

  // Función para cerrar modal
  const closeRechazoModal = () => {
    setShowRechazoModal(false);
    setSelectedCandidate(null);
    setMotivoRechazo("");
  };

  // Función para aprobar un candidato
  const aprobarCandidato = async (id_candidate) => {
    try {
      await axios.patch(`${API_BASE_URL}/candidates/${id_candidate}/approve`);
      setMessage("✅ Candidato aprobado correctamente. Se ha enviado una notificación al candidato.");
      
      // Actualizar estado local
      setCandidatos(candidatos.map(cand => 
        cand.id_candidate === id_candidate ? { ...cand, estado_candidate: "Aprobado" } : cand
      ));
      
      // Recargar lista después de 2 segundos
      setTimeout(() => {
        fetchCandidatos(currentPage);
      }, 2000);
    } catch (err) {
      console.error("Error al aprobar el candidato:", err);
      setMessage("❌ Error al aprobar el candidato. Intente de nuevo.");
    }
  };

  // Función para rechazar un candidato
  const rechazarCandidato = async () => {
    if (!selectedCandidate) return;

    if (!motivoRechazo.trim()) {
      setMessage("❌ Por favor, ingresa un motivo de rechazo.");
      return;
    }

    try {
      await axios.patch(`${API_BASE_URL}/candidates/${selectedCandidate.id_candidate}/reject`, {
        motivo_rechazo: motivoRechazo
      });
      
      setMessage("✅ Candidato rechazado correctamente. Se ha enviado una notificación al candidato con el motivo.");
      
      // Actualizar estado local
      setCandidatos(candidatos.map(cand => 
        cand.id_candidate === selectedCandidate.id_candidate ? { 
          ...cand, 
          estado_candidate: "No Aprobado",
          motivo_rechazo: motivoRechazo,
          electionId: null,
          election: null
        } : cand
      ));
      
      closeRechazoModal();
      
      // Recargar lista después de 2 segundos
      setTimeout(() => {
        fetchCandidatos(currentPage);
      }, 2000);
    } catch (err) {
      console.error("Error al rechazar el candidato:", err);
      setMessage("❌ Error al rechazar el candidato. Intente de nuevo.");
    }
  };

  // Funciones de paginación
  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      fetchCandidatos(page);
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

  // Función para obtener la URL completa de la foto
  const getCandidatePhoto = (candidato) => {
    if (!candidato.foto_candidate) return '/img/default-avatar.png';
    
    let fotoUrl = candidato.foto_candidate;
    
    if (fotoUrl.startsWith('http')) {
      return fotoUrl;
    }
    else if (fotoUrl.startsWith('/')) {
      return `${API_BASE_URL}${fotoUrl}`;
    }
    else {
      return `${API_BASE_URL}/uploads/candidatos/${fotoUrl}`;
    }
  };

  // Función para determinar si un botón debe estar deshabilitado
  const isButtonDisabled = (candidato, action) => {
    if (action === 'aprobar') {
      return candidato.estado_candidate === 'Aprobado' || candidato.estado_candidate === 'No Aprobado';
    }
    if (action === 'rechazar') {
      return candidato.estado_candidate === 'No Aprobado' || candidato.estado_candidate === 'Aprobado';
    }
    return false;
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col font-sans">
      <Navbar_admin />
      
      <div className="flex-grow pt-24 px-6 pb-8">
        <h1 className="text-4xl font-extrabold mb-8 text-center text-blue-900">
          Gestión de Candidatos
        </h1>

        {message && (
          <div
            className={`mb-6 p-4 rounded-xl font-semibold text-center shadow-lg transform transition-all duration-300 ${
              message.startsWith("✅") ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
            }`}
          >
            {message}
          </div>
        )}

        {/* Modal de Rechazo */}
        {showRechazoModal && (
          <div className="fixed inset-0 bg-white/30 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
              <h3 className="text-xl font-bold text-red-600 mb-4">
                Rechazar Candidato
              </h3>
              
              <p className="text-gray-700 mb-4">
                Estás por rechazar a <strong>{selectedCandidate?.nombre_candidate} {selectedCandidate?.apellido_candidate}</strong>. 
                Por favor, ingresa el motivo del rechazo:
              </p>

              <textarea
                value={motivoRechazo}
                onChange={(e) => setMotivoRechazo(e.target.value)}
                placeholder="Ej: Documentación incompleta, no cumple con los requisitos, etc."
                className="w-full h-32 p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                required
              />

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={closeRechazoModal}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={rechazarCandidato}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                >
                  Confirmar Rechazo
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Información de paginación */}
        <div className="flex justify-between items-center mb-4">
          <div className="text-sm text-gray-600">
            Mostrando {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, totalItems)} de {totalItems} candidatos
          </div>
          
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
                fetchCandidatos(1);
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
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900 mx-auto"></div>
            <p className="text-gray-500 text-lg mt-4">Cargando candidatos...</p>
          </div>
        ) : error ? (
          <p className="text-center text-red-500 text-lg font-bold">{error}</p>
        ) : candidatos.length === 0 ? (
          <p className="text-gray-600 text-center text-lg">
            No hay candidatos para gestionar.
          </p>
        ) : (
          <>
            <div className="overflow-x-auto shadow-xl rounded-lg">
              <table className="w-full border-collapse bg-white">
                <thead className="bg-blue-800 text-white">
                  <tr>
                    <th className="p-4 border-b text-left">Foto</th>
                    <th className="p-4 border-b text-left">Nombre Completo</th>
                    <th className="p-4 border-b">Correo</th>
                    <th className="p-4 border-b">Carrera</th>
                    <th className="p-4 border-b">Elección</th>
                    <th className="p-4 border-b">Estado</th>
                    <th className="p-4 border-b">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {candidatos.map((candidato) => (
                    <tr key={candidato.id_candidate} className="hover:bg-gray-50 transition-colors">
                      <td className="p-4 border-b">
                        <div className="flex justify-center">
                          <img
                            src={getCandidatePhoto(candidato)}
                            alt={`Foto de ${candidato.nombre_candidate} ${candidato.apellido_candidate}`}
                            className="w-16 h-16 rounded-full object-cover border-2 border-gray-300 shadow-sm"
                            onError={(e) => {
                              e.target.src = '/img/default-avatar.png';
                            }}
                          />
                        </div>
                      </td>
                      <td className="p-4 border-b text-left font-medium text-gray-900">
                        {`${candidato.nombre_candidate} ${candidato.apellido_candidate}`}
                      </td>
                      <td className="p-4 border-b text-gray-700">
                        {candidato.correo_candidate}
                      </td>
                      <td className="p-4 border-b text-gray-700">
                        {candidato.career?.nombre_career || 'No asignada'}
                      </td>
                      <td className="p-4 border-b text-gray-700">
                        {candidato.election?.nombre_election || 'Sin elección'}
                      </td>
                      <td className="p-4 border-b">
                        <span
                          className={`px-3 py-2 rounded-full text-sm font-bold
                            ${candidato.estado_candidate === "Aprobado" ? "bg-green-100 text-green-800 border border-green-300" :
                            candidato.estado_candidate === "Pendiente" ? "bg-yellow-100 text-yellow-800 border border-yellow-300" :
                            "bg-red-100 text-red-800 border border-red-300"}`}
                        >
                          {candidato.estado_candidate}
                        </span>
                      </td>
                      <td className="p-4 border-b">
                        <div className="flex flex-col sm:flex-row justify-center items-center space-y-2 sm:space-y-0 sm:space-x-2">
                          <button
                            onClick={() => aprobarCandidato(candidato.id_candidate)}
                            className={`px-4 py-2 rounded-lg transition-colors shadow-md text-sm font-medium w-full sm:w-auto
                              ${isButtonDisabled(candidato, 'aprobar') 
                                ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
                                : 'bg-green-600 text-white hover:bg-green-700'}`}
                            aria-label="Aprobar candidato"
                            disabled={isButtonDisabled(candidato, 'aprobar')}
                          >
                            {candidato.estado_candidate === 'Aprobado' ? 'Aprobado' : 'Aprobar'}
                          </button>
                          <button
                            onClick={() => openRechazoModal(candidato)}
                            className={`px-4 py-2 rounded-lg transition-colors shadow-md text-sm font-medium w-full sm:w-auto
                              ${isButtonDisabled(candidato, 'rechazar') 
                                ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
                                : 'bg-red-600 text-white hover:bg-red-700'}`}
                            aria-label="Rechazar candidato"
                            disabled={isButtonDisabled(candidato, 'rechazar')}
                          >
                            {candidato.estado_candidate === 'No Aprobado' ? 'Rechazado' : 'Rechazar'}
                          </button>
                        </div>
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
        )}
      </div>
    </div>
  );
};

export default Aprobar_Eliminar_cand_admin;