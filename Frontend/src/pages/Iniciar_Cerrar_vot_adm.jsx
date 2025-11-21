import React, { useState, useEffect } from "react";
import axios from "axios";
import Navbar_admin from "../components/Navbar_admin";

const Iniciar_Cerrar_vot_adm = () => {
  const [elecciones, setElecciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [info, setInfo] = useState(null);

  // Estados para la paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [totalItems, setTotalItems] = useState(0);

  // Estados para los modales
  const [showDetallesModal, setShowDetallesModal] = useState(false);
  const [showDebugModal, setShowDebugModal] = useState(false);
  const [modalData, setModalData] = useState(null);

  // Calcular el número total de páginas
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  useEffect(() => {
    fetchElections();
  }, []);

  const fetchElections = async (page = 1) => {
    try {
      setLoading(true);
      const response = await axios.get("http://localhost:3000/elections/with-candidate-count");
      const allElections = response.data;
      
      console.log("Datos recibidos del backend:", allElections);
      
      setTotalItems(allElections.length);
      
      const startIndex = (page - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      const paginatedElections = allElections.slice(startIndex, endIndex);
      
      setElecciones(paginatedElections);
      setCurrentPage(page);
      setError(null);
    } catch (err) {
      setError("Error al cargar las elecciones.");
      console.error("Error detallado:", err);
    } finally {
      setLoading(false);
    }
  };

  // Cargar estadísticas para una elección específica
  const loadElectionStats = async (electionId) => {
    try {
      const response = await axios.get(`http://localhost:3000/elections/stats/${electionId}`);
      return response.data;
    } catch (err) {
      console.error("Error al cargar estadísticas:", err);
      return null;
    }
  };

  // Verificar si se puede iniciar una elección
  const checkCanStartElection = async (electionId) => {
    try {
      const response = await axios.get(`http://localhost:3000/elections/can-start-simple/${electionId}`);
      return response.data;
    } catch (err) {
      console.error("Error al verificar elección:", err);
      return { canStart: false, message: "Error al verificar la elección" };
    }
  };

  // Función para ver detalles de la elección - ACTUALIZADA
  const verDetallesEleccion = async (id, nombreEleccion, candidateCount) => {
    try {
      const validation = await checkCanStartElection(id);
      const stats = await loadElectionStats(id);
      
      const detallesData = {
        nombreEleccion,
        candidateCount,
        validation,
        stats,
        tipo: 'detalles'
      };
      
      setModalData(detallesData);
      setShowDetallesModal(true);
    } catch (err) {
      console.error("Error al ver detalles:", err);
      setError("Error al cargar los detalles de la elección.");
    }
  };

  // Función para debug rápido - ACTUALIZADA
  const debugCandidatesCount = async (electionId, electionName) => {
    try {
      const response = await axios.get(`http://localhost:3000/elections/debug/candidates-count/${electionId}`);
      console.log(` ${electionName}:`, response.data);
      
      const debugData = {
        electionName,
        totalCandidates: response.data.totalCandidates,
        approvedCandidates: response.data.approvedCandidates,
        candidatesWithProposals: response.data.candidatesWithProposals,
        tipo: 'debug'
      };
      
      setModalData(debugData);
      setShowDebugModal(true);
    } catch (err) {
      console.error("Error en debug:", err);
      setError("Error al cargar información de debug.");
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

  const iniciarEleccion = async (id, nombreEleccion, candidateCount) => {
    try {
      const validation = await checkCanStartElection(id);
      
      if (!validation.canStart) {
        setError(validation.message || "No se puede iniciar la elección.");
        return;
      }

      const confirmar = window.confirm(
        `¿Está seguro de que desea iniciar la elección "${nombreEleccion}"?\n\n` +
        `Candidatos registrados: ${candidateCount}\n\n` +
        `Se agregará automáticamente "Voto en Blanco" como opción.`
      );

      if (!confirmar) return;

      await axios.put(`http://localhost:3000/elections/iniciar/${id}`);
      setInfo(`Elección "${nombreEleccion}" iniciada correctamente. Voto en Blanco agregado automáticamente.`);
      fetchElections(currentPage);
      
      setTimeout(() => setInfo(null), 5000);
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Error al iniciar la elección.";
      setError(errorMessage);
      console.error(err);
    }
  };

  const cerrarEleccion = async (id, nombreEleccion) => {
    try {
      const confirmar = window.confirm(`¿Está seguro de que desea cerrar la elección "${nombreEleccion}"?`);
      if (!confirmar) return;

      await axios.put(`http://localhost:3000/elections/cerrar/${id}`);
      setInfo(`Elección "${nombreEleccion}" cerrada correctamente.`);
      fetchElections(currentPage);
      
      setTimeout(() => setInfo(null), 5000);
    } catch (err) {
      setError("Error al cerrar la elección.");
      console.error(err);
    }
  };

  // Función para determinar el color del estado
  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'Programada':
        return 'text-blue-600 bg-blue-100 px-2 py-1 rounded';
      case 'Activa':
        return 'text-green-600 bg-green-100 px-2 py-1 rounded';
      case 'Finalizada':
        return 'text-red-600 bg-red-100 px-2 py-1 rounded';
      default:
        return 'text-gray-600 bg-gray-100 px-2 py-1 rounded';
    }
  };

  // Componente Modal para Detalles
  const DetallesModal = () => {
    if (!showDetallesModal || !modalData) return null;

    const { nombreEleccion, candidateCount, validation, stats } = modalData;

    return (
      <div className="fixed inset-0 bg-white/30 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white rounded-lg max-w-md w-full mx-auto">
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">Detalles de la Elección</h3>
              <button
                onClick={() => setShowDetallesModal(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                &times;
              </button>
            </div>
            
            <div className="mb-4">
              <h4 className="text-lg font-semibold text-blue-900 mb-2">{nombreEleccion}</h4>
              
              {validation.canStart ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                  <div className="flex items-center mb-2">
                    <span className="text-green-600 text-xl mr-2">✅</span>
                    <span className="text-green-800 font-semibold">La elección puede iniciarse</span>
                  </div>
                  
                  <div className="space-y-2 text-sm text-gray-700">
                    <div className="flex justify-between">
                      <span>Candidatos aprobados:</span>
                      <span className="font-semibold">{candidateCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Votantes registrados:</span>
                      <span className="font-semibold">{stats?.totalVoters || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Votos realizados:</span>
                      <span className="font-semibold">{stats?.totalVotes || 0}</span>
                    </div>
                  </div>
                  
                  <div className="mt-3 p-2 bg-green-100 rounded text-green-800 text-xs">
                    Se agregará "Voto en Blanco" automáticamente al iniciar la elección.
                  </div>
                </div>
              ) : (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <span className="text-red-600 text-xl mr-2">❌</span>
                    <span className="text-red-800 font-semibold">No se puede iniciar la elección</span>
                  </div>
                  
                  <div className="text-sm text-gray-700 mb-3">
                    <div className="flex justify-between mb-2">
                      <span>Candidatos registrados:</span>
                      <span className="font-semibold">{candidateCount}</span>
                    </div>
                    <p className="text-red-700 mt-2">{validation.message}</p>
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex justify-end">
              <button
                onClick={() => setShowDetallesModal(false)}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition font-medium"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Componente Modal para Debug
  const DebugModal = () => {
    if (!showDebugModal || !modalData) return null;

    const { electionName, totalCandidates, approvedCandidates, candidatesWithProposals } = modalData;

    return (
      <div className="fixed inset-0 bg-white/30 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white rounded-lg max-w-sm w-full mx-auto">
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">Información</h3>
              <button
                onClick={() => setShowDebugModal(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                &times;
              </button>
            </div>
            
            <div className="mb-4">
              <h4 className="text-lg font-semibold text-blue-900 mb-3">{electionName}</h4>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-700">Total de candidatos:</span>
                  <span className="font-bold text-blue-600">{totalCandidates}</span>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                  <span className="text-gray-700">Candidatos aprobados:</span>
                  <span className="font-bold text-green-600">{approvedCandidates}</span>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                  <span className="text-gray-700">Con propuestas activas:</span>
                  <span className="font-bold text-blue-900">{candidatesWithProposals}</span>
                </div>
              </div>
              
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-xs text-yellow-800">
                  <strong>Nota:</strong> Solo los candidatos aprobados con propuestas activas son considerados para iniciar la elección.
                </p>
              </div>
            </div>
            
            <div className="flex justify-end">
              <button
                onClick={() => setShowDebugModal(false)}
                className="bg-blue-900 text-white px-4 py-2 rounded hover:bg-blue-600 transition font-medium"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-xl font-semibold text-gray-700">Cargando elecciones...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <p className="text-xl font-semibold text-red-600 mb-4">
            Error: {error}
          </p>
          <button 
            onClick={() => fetchElections(1)}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar_admin />
      <div className="pt-24 px-6 pb-6">
        <h1 className="text-3xl font-bold mb-6 text-center text-blue-900">
          Gestión de Elecciones
        </h1>

        {/* Mensajes de información */}
        {info && (
          <div className="max-w-4xl mx-auto mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
            {info}
          </div>
        )}

        {/* Mensajes de error */}
        {error && (
          <div className="max-w-4xl mx-auto mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
            <button 
              onClick={() => setError(null)}
              className="float-right text-red-800 font-bold"
            >
              ×
            </button>
          </div>
        )}

        {/* Información de paginación */}
        <div className="flex justify-between items-center mb-4 max-w-4xl mx-auto">
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

        {elecciones.length === 0 ? (
          <div className="max-w-4xl mx-auto text-center py-8">
            <p className="text-gray-600 text-lg mb-4">
              No hay elecciones registradas para gestionar.
            </p>
            <button 
              onClick={() => fetchElections(1)}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Recargar
            </button>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse bg-white shadow-lg rounded-lg overflow-hidden">
                <thead className="bg-blue-900 text-white text-lg">
                  <tr>
                    <th className="p-3 border text-center">ID</th>
                    <th className="p-3 border text-center">Nombre</th>
                    <th className="p-3 border text-center">Estado</th>
                    <th className="p-3 border text-center">Candidatos</th>
                    <th className="p-3 border text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {elecciones.map((eleccion) => {
                    const realCandidates = eleccion.realCandidatesCount || 0;
                    
                    return (
                      <tr key={eleccion.id_election} className="hover:bg-gray-100 text-center">
                        <td className="p-3 border">{eleccion.id_election}</td>
                        <td className="p-3 border font-medium">{eleccion.nombre_election}</td>
                        <td className="p-3 border">
                          <span className={getEstadoColor(eleccion.estado_election)}>
                            {eleccion.estado_election}
                          </span>
                        </td>
                        <td className="p-3 border">
                          <div className="flex flex-col items-center">
                            <span className={`font-semibold ${
                              realCandidates > 0 ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {realCandidates}
                            </span>
                            <small className="text-gray-500">candidatos</small>
                            {/* Botón de debug */}
                            <button 
                              onClick={() => debugCandidatesCount(eleccion.id_election, eleccion.nombre_election)}
                              className="text-xs text-blue-5¿900 hover:text-blue-700 mt-1 transition"
                              title="Información de debug"
                            >
                              🔍
                            </button>
                          </div>
                        </td>
                        <td className="p-3 border">
                          <div className="flex flex-col space-y-2">
                            {eleccion.estado_election === "Activa" ? (
                              <button
                                onClick={() => cerrarEleccion(eleccion.id_election, eleccion.nombre_election)}
                                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition font-medium"
                              >
                                Cerrar Elección
                              </button>
                            ) : (
                              <button
                                onClick={() => iniciarEleccion(eleccion.id_election, eleccion.nombre_election, realCandidates)}
                                className={`px-4 py-2 rounded-lg transition font-medium ${
                                  eleccion.estado_election === "Finalizada"
                                    ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                                    : realCandidates === 0
                                    ? "bg-yellow-500 text-white hover:bg-yellow-600"
                                    : "bg-green-600 text-white hover:bg-green-700"
                                }`}
                                disabled={eleccion.estado_election === "Finalizada"}
                                title={
                                  eleccion.estado_election === "Finalizada" 
                                    ? "Elección finalizada" 
                                    : realCandidates === 0
                                    ? "No hay candidatos registrados"
                                    : "Iniciar elección"
                                }
                              >
                                {realCandidates === 0 && eleccion.estado_election !== "Finalizada" 
                                  ? "Sin Candidatos" 
                                  : "Iniciar Elección"
                                }
                              </button>
                            )}
                            <button
                              onClick={() => verDetallesEleccion(eleccion.id_election, eleccion.nombre_election, realCandidates)}
                              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition font-medium text-sm"
                            >
                              Ver Detalles
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
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
          </div>
        )}

        {/* Información del sistema */}
        <div className="max-w-4xl mx-auto mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-semibold text-blue-800 mb-2">Información del Sistema:</h3>
          <ul className="text-sm text-blue-700 list-disc list-inside space-y-1">
            <li>Para iniciar una elección debe haber al menos 1 candidato aprobado con propuestas activas</li>
            <li>El sistema agregará automáticamente "Voto en Blanco" al iniciar la elección</li>
            <li>Use el botón "Ver Detalles" para verificar el estado de cada elección</li>
            <li>Las elecciones sin candidatos se muestran en amarillo</li>
            <li>Use el botón "Debug" para ver información detallada del conteo de candidatos</li>
          </ul>
        </div>
      </div>

      {/* Modales */}
      <DetallesModal />
      <DebugModal />
    </div>
  );
};

export default Iniciar_Cerrar_vot_adm;