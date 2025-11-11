import React, { useState, useEffect, useCallback } from "react";
import api from "../api/axios";
import Navbar_admin from "../components/Navbar_admin";

// SVG Icons como componentes de React
// eslint-disable-next-line react-refresh/only-export-components
const DocumentIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-blue-500 mr-3" viewBox="0 0 24 24" fill="currentColor">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM6 4h7v5h5v11H6z"/>
  </svg>
);
// eslint-disable-next-line react-refresh/only-export-components
const EnvelopeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-blue-500 mr-3" viewBox="0 0 24 24" fill="currentColor">
    <path d="M22 6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6zm-2 0l-8 5-8-5h16zm0 12H4V8l8 5 8-5v10z"/>
  </svg>
);
// eslint-disable-next-line react-refresh/only-export-components
const BuildingIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-blue-500 mr-3" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 12h-2v2h2v-2zm0 4h-2v2h2v-2zm0-8h-2v2h2V8zm-4 4H9v6h6v-6zm-2-2h2v2h-2v-2zm0 4h2v2h-2v-2zm-4-4h2v2H7v-2zm0 4h2v2H7v-2zm-2-4H3v6h2v-6zm0-4H3v2h2V8zM7 2h10v2h-2v-2H9v2H7V2zm2 2h6v2h2V4h-6v2H9V4zM5 4h2v2H5V4zM3 4h2v2H3V4z"/>
  </svg>
);


const Ver_candidatos_adm = () => {
  const [candidatos, setCandidatos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Estados para la paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(6);
  const [totalItems, setTotalItems] = useState(0);

  // Calcular el número total de páginas
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  // Función para obtener la URL completa de la foto
  const getCandidatePhoto = (candidato) => {
    if (!candidato.foto_candidate) return '/img/default-avatar.png';
    const fotoUrl = candidato.foto_candidate;
    if (fotoUrl.startsWith('http')) return fotoUrl;
    if (fotoUrl.startsWith('/')) return fotoUrl; // ya es relativo al backend por proxy/baseURL si se sirve estático
    return `/uploads/candidatos/${fotoUrl}`;
  };

  // Función para obtener candidatos con paginación
  const fetchCandidatos = useCallback(async (page = 1) => {
    try {
      setLoading(true);
  const response = await api.get(`/candidates`);
      if (Array.isArray(response.data)) {
        const allCandidates = response.data;
        setTotalItems(allCandidates.length);
        
        // Paginación en el frontend
        const startIndex = (page - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const paginatedCandidates = allCandidates.slice(startIndex, endIndex);
        
        setCandidatos(paginatedCandidates);
        setCurrentPage(page);
      } else {
        console.error("La respuesta de la API no es un array:", response.data);
        setError("Error: La respuesta del servidor no tiene el formato esperado.");
        setCandidatos([]);
      }
    } catch (err) {
      console.error("Error al cargar los candidatos:", err);
      setError("Error al cargar los datos. Verifique la conexión con el servidor.");
    } finally {
      setLoading(false);
    }
  }, [itemsPerPage]);

  useEffect(() => {
    fetchCandidatos();
  }, [fetchCandidatos]);

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navbar_admin />
        <div className="pt-28 flex justify-center items-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900 mx-auto"></div>
            <p className="text-xl font-semibold text-gray-700 mt-4">Cargando candidatos...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navbar_admin />
        <div className="pt-28 flex justify-center items-center">
          <p className="text-xl font-bold text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar_admin />
      <div className="pt-28 pb-12 px-4">
        <h1 className="text-5xl font-extrabold text-center text-blue-800 mb-10">
          Ver Candidatos
        </h1>

        {/* Información de paginación */}
        <div className="flex justify-between items-center mb-6 max-w-7xl mx-auto">
          <div className="text-sm text-gray-600">
            Mostrando {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, totalItems)} de {totalItems} candidatos
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
            fetchCandidatos(1);
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
        
        {candidatos.length === 0 ? (
           <div className="text-center">
             <p className="text-xl text-gray-600">No hay candidatos registrados.</p>
           </div>
        ) : (
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {candidatos.map((candidato) => (
                <div key={candidato.id_candidate} className="bg-white p-6 rounded-3xl shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300 border-t-8 border-blue-600">
                  <div className="flex flex-col items-center">
                    <img
                      src={getCandidatePhoto(candidato)}
                      alt={`Foto de ${candidato.nombre_candidate} ${candidato.apellido_candidate}`}
                      className="w-32 h-32 rounded-full object-cover border-4 border-blue-400 mb-4 shadow-lg"
                      onError={(e) => {
                        e.target.src = '/img/default-avatar.png';
                      }}
                    />
                    <h2 className="text-2xl font-bold text-gray-800 text-center mb-1">
                      {`${candidato.nombre_candidate} ${candidato.apellido_candidate}`}
                    </h2>
                    <span className={`px-4 py-1 rounded-full text-sm font-semibold mb-4
                      ${candidato.estado_candidate === 'Aprobado' ? 'bg-green-200 text-green-800 border border-green-300' :
                      candidato.estado_candidate === 'Pendiente' ? 'bg-yellow-200 text-yellow-800 border border-yellow-300' :
                      'bg-red-200 text-red-800 border border-red-300'}`}
                    >
                      {candidato.estado_candidate}
                    </span>
                  </div>
                  
                  <ul className="space-y-3 mt-4 text-gray-700">
                    <li className="flex items-center">
                      <DocumentIcon />
                      <span className="text-sm">Documento: {candidato.num_doc_candidate}</span>
                    </li>
                    <li className="flex items-center">
                      <EnvelopeIcon />
                      <span className="text-sm">Correo: {candidato.correo_candidate}</span>
                    </li>
                    <li className="flex items-center">
                      <BuildingIcon />
                      <span className="text-sm">Carrera: {candidato.career?.nombre_career || 'No asignada'}</span>
                    </li>
                    <li className="flex items-center">
                      <BuildingIcon />
                      <span className="text-sm">Elección: {candidato.election?.nombre_election || 'N/A'}</span>
                    </li>
                    <li className="flex items-start flex-wrap mt-2">
                      <span className="font-semibold text-gray-900 mr-2 text-sm">Propuesta:</span>
                      <p className="text-sm italic text-gray-600">
                        "{candidato.proposals?.[0]?.descripcion_proposal || 'Sin propuesta registrada'}"
                      </p>
                    </li>
                  </ul>
                </div>
              ))}
            </div>

            {/* Controles de paginación */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center space-x-2 mt-12">
                <button
                  onClick={goToPreviousPage}
                  disabled={currentPage === 1}
                  className={`px-4 py-2 rounded-lg ${
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
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100"
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
                    className={`px-4 py-2 border rounded-lg ${
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
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100"
                    >
                      {totalPages}
                    </button>
                  </>
                )}

                <button
                  onClick={goToNextPage}
                  disabled={currentPage === totalPages}
                  className={`px-4 py-2 rounded-lg ${
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

export default Ver_candidatos_adm;