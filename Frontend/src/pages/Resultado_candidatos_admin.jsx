import React, { useState, useEffect, useCallback } from "react";
import Navbar_admin from "../components/Navbar_admin";
import Footer from "../components/Footer";
import api from "../api/axios";


const Resultado_candidatos_admin = () => {
  // Estado para almacenar los resultados de la API
  const [elecciones, setElecciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Estados para la paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(3);
  const [totalItems, setTotalItems] = useState(0);

  // Calcular el número total de páginas
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  // Función para obtener los resultados de las elecciones de la API
  const fetchResults = useCallback(async (page = 1) => {
    setLoading(true);
    try {
  const response = await api.get('/results');
      const allElections = response.data;
      
      // Agregado para depuración: muestra los datos en la consola
      console.log("Datos recibidos del backend:", allElections);
      
      setTotalItems(allElections.length);
      
      // Paginación en el frontend
      const startIndex = (page - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      const paginatedElections = allElections.slice(startIndex, endIndex);
      
      setElecciones(paginatedElections);
      setCurrentPage(page);
    } catch (err) {
      console.error("Error al cargar los resultados:", err);
      setError("No se pudieron cargar los resultados de las elecciones.");
    } finally {
      setLoading(false);
    }
  }, [itemsPerPage]);

  // Carga los resultados al montar el componente
  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  // Funciones de paginación
  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      fetchResults(page);
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

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navbar administrador */}
      <Navbar_admin />

      {/* Contenido */}
      <div className="pt-24 px-6 pb-6">
        <h1 className="text-3xl font-bold mb-6 text-center text-blue-900">
          Resultados de Votación por Candidato
        </h1>

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
            fetchResults(1);
              }}
              className="border border-gray-300 rounded px-2 py-1 text-sm"
            >
              <option value="3">3</option>
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="20">20</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900 mx-auto mb-4"></div>
            <p className="text-gray-500">Cargando resultados...</p>
          </div>
        ) : error ? (
          <div className="text-center bg-red-50 p-4 rounded-lg max-w-4xl mx-auto">
            <p className="text-red-600 mb-2">{error}</p>
            <button 
              onClick={() => fetchResults(currentPage)}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Reintentar
            </button>
          </div>
        ) : elecciones.length === 0 ? (
          <div className="text-center bg-yellow-50 p-6 rounded-lg max-w-4xl mx-auto">
            <p className="text-yellow-700 text-lg">
              No hay resultados de candidatos disponibles.
            </p>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto">
            <div className="flex justify-center flex-col items-center">
              {elecciones.map((eleccion, index) => (
                <div key={eleccion.id_election + '-' + index} className="mb-8 w-full">
                  <div className="bg-white p-6 rounded-lg shadow-lg border-l-4 border-blue-600">
                    <h2 className="text-2xl font-semibold mb-4 text-center text-gray-700">
                      {eleccion.nombre_election}
                    </h2>
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse bg-white rounded-lg overflow-hidden">
                        <thead className="bg-blue-900 text-white text-lg">
                          <tr>
                            <th className="p-3 border text-left">Candidato</th>
                            <th className="p-3 border text-center">Votos Obtenidos</th>
                          </tr>
                        </thead>
                        <tbody>
                          {eleccion.candidates && eleccion.candidates.length > 0 ? (
                            eleccion.candidates
                              .sort((a, b) => {
                                const votesA = a._count?.votes || 0;
                                const votesB = b._count?.votes || 0;
                                return votesB - votesA;
                              })
                              .map((candidato, candidateIndex) => (
                                <tr 
                                  key={candidato.id_candidate} 
                                  className={`hover:bg-gray-50 ${
                                    candidateIndex === 0 ? 'bg-green-50' : ''
                                  }`}
                                >
                                  <td className="p-3 border">
                                    <div className="flex items-center">
                                      {candidateIndex === 0 && (
                                        <span className="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full mr-3">
                                          🏆
                                        </span>
                                      )}
                                      <span className={candidateIndex === 0 ? 'font-bold text-green-800' : ''}>
                                        {candidato.nombre_candidate} {candidato.apellido_candidate}
                                      </span>
                                    </div>
                                  </td>
                                  <td className="p-3 border text-center font-bold">
                                    <span className={candidateIndex === 0 ? 'text-green-800 text-lg' : ''}>
                                      {candidato._count && candidato._count.votes !== undefined ? candidato._count.votes : 0}
                                    </span>
                                  </td>
                                </tr>
                              ))
                          ) : (
                            <tr>
                              <td colSpan="2" className="p-3 text-center text-gray-500">
                                No hay candidatos registrados para esta elección.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              ))}
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
      </div>
    </div>
  );
};

export default Resultado_candidatos_admin;
