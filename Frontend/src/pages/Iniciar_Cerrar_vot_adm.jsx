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

  // Calcular el número total de páginas
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  useEffect(() => {
    fetchElections();
  }, []);

  const fetchElections = async (page = 1) => {
    try {
      setLoading(true);
      // Usar el nuevo endpoint que incluye el conteo de candidatos
      const response = await axios.get("http://localhost:3000/elections/with-candidate-count");
      const allElections = response.data;
      
      setTotalItems(allElections.length);
      
      // Paginación en el frontend
      const startIndex = (page - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      const paginatedElections = allElections.slice(startIndex, endIndex);
      
      setElecciones(paginatedElections);
      setCurrentPage(page);
      setError(null);
    } catch (err) {
      setError("Error al cargar las elecciones.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Cargar estadísticas para una elección específica (para el modal de detalles)
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
      // Primero verificar si se puede iniciar
      const validation = await checkCanStartElection(id);
      
      if (!validation.canStart) {
        setError(validation.message || "No se puede iniciar la elección.");
        return;
      }

      // Mostrar confirmación
      const confirmar = window.confirm(
        `¿Está seguro de que desea iniciar la elección "${nombreEleccion}"?\n\n` +
        `Candidatos registrados: ${candidateCount}\n\n` +
        `Se agregará automáticamente "Voto en Blanco" como opción.`
      );

      if (!confirmar) return;

      await axios.put(`http://localhost:3000/elections/iniciar/${id}`);
      setInfo(`Elección "${nombreEleccion}" iniciada correctamente. Voto en Blanco agregado automáticamente.`);
      fetchElections(currentPage);
      
      // Limpiar mensaje después de 5 segundos
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
      
      // Limpiar mensaje después de 5 segundos
      setTimeout(() => setInfo(null), 5000);
    } catch (err) {
      setError("Error al cerrar la elección.");
      console.error(err);
    }
  };

  // Función para ver detalles de la elección
  const verDetallesEleccion = async (id, nombreEleccion, candidateCount) => {
    try {
      const validation = await checkCanStartElection(id);
      const stats = await loadElectionStats(id);
      
      const mensaje = validation.canStart 
        ? `✅ La elección "${nombreEleccion}" puede iniciarse.\n\n• Candidatos: ${candidateCount}\n• Votantes: ${stats?.totalVoters || 0}\n• Votos: ${stats?.totalVotes || 0}\n\nSe agregará "Voto en Blanco" automáticamente.`
        : `❌ No se puede iniciar la elección "${nombreEleccion}".\n\nRazón: ${validation.message}\n\nCandidatos registrados: ${candidateCount}`;
      
      alert(mensaje);
    } catch (err) {
      console.error("Error al ver detalles:", err);
      alert("Error al cargar los detalles de la elección.");
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
            <li>Para iniciar una elección debe haber al menos 1 candidato registrado</li>
            <li>El sistema agregará automáticamente "Voto en Blanco" al iniciar la elección</li>
            <li>Use el botón "Ver Detalles" para verificar el estado de cada elección</li>
            <li>Las elecciones sin candidatos se muestran en amarillo</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Iniciar_Cerrar_vot_adm;