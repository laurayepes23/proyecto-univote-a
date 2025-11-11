/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import NavbarCandidato from "../components/NavbarCandidato";
import { FaCalendarAlt, FaCheckCircle, FaExclamationCircle, FaChevronLeft, FaChevronRight } from 'react-icons/fa';

export default function PostularseElecciones() {
  const [elecciones, setElecciones] = useState([]);
  const [mensaje, setMensaje] = useState({ texto: '', tipo: '' });
  const [loading, setLoading] = useState(true);
  const [candidateInfo, setCandidateInfo] = useState(null);

  // Estados para la paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(6);
  const [totalItems, setTotalItems] = useState(0);

  // Calcular el número total de páginas
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  // Efecto para cargar la información del candidato y las elecciones
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Obtener información del candidato desde localStorage
        const candidateData = localStorage.getItem('candidateData');
        
        if (candidateData) {
          const parsedCandidate = JSON.parse(candidateData);
          setCandidateInfo(parsedCandidate);
          console.log("Candidato encontrado:", parsedCandidate);
        } else {
          setMensaje({ 
            texto: 'No se pudo encontrar tu información de candidato. Por favor, inicia sesión de nuevo.', 
            tipo: 'error' 
          });
          setLoading(false);
          return;
        }

        // Cargar elecciones
  const response = await api.get('/elections');
        
        // Filtrar solo elecciones programadas
        const eleccionesProgramadas = response.data.filter(
          election => election.estado_election === "Programada"
        );
        
        setTotalItems(eleccionesProgramadas.length);
        
        // Paginación en el frontend
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const paginatedElections = eleccionesProgramadas.slice(startIndex, endIndex);
        
        setElecciones(paginatedElections);
      } catch (error) {
        console.error("Error al cargar las elecciones:", error);
        setMensaje({ 
          texto: 'No se pudieron cargar las elecciones. Inténtalo de nuevo más tarde.', 
          tipo: 'error' 
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentPage, itemsPerPage]);

  // Funciones de paginación
  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
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

  // Función para manejar la postulación del candidato
  const handlePostularse = async (electionId) => {
    if (!candidateInfo || !candidateInfo.id_candidate) {
      setMensaje({ 
        texto: 'No se pudo encontrar tu información de candidato. Por favor, inicia sesión de nuevo.', 
        tipo: 'error' 
      });
      return;
    }

    // Limpiamos el mensaje previo antes de una nueva solicitud
    setMensaje({ texto: '', tipo: '' });

    try {
      const response = await api.post('/candidates/apply', {
        candidateId: candidateInfo.id_candidate,
        electionId: electionId,
      });

      setMensaje({ 
        texto: response.data.message || '¡Postulación exitosa! Tu solicitud está pendiente de aprobación por un administrador.', 
        tipo: 'success' 
      });

      // Actualizar la información del candidato en localStorage
      if (response.data.candidate) {
        localStorage.setItem('candidateData', JSON.stringify(response.data.candidate));
        setCandidateInfo(response.data.candidate);
      }

      // Recargar las elecciones para reflejar el cambio
  const electionsResponse = await api.get('/elections');
      const eleccionesProgramadas = electionsResponse.data.filter(
        election => election.estado_election === "Programada"
      );
      
      setTotalItems(eleccionesProgramadas.length);
      
      const startIndex = (currentPage - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      const paginatedElections = eleccionesProgramadas.slice(startIndex, endIndex);
      
      setElecciones(paginatedElections);

    } catch (error) {
      console.error("Error completo:", error);
      
      let errorMessage = 'Ocurrió un error al postularte. Inténtalo de nuevo.';
      
      if (error.response?.status === 404) {
        errorMessage = 'Candidato o elección no encontrada.';
      } else if (error.response?.status === 409) {
        errorMessage = 'Ya estás postulado a una elección. No puedes postularte a más de una.';
      } else if (error.response?.status === 400) {
        errorMessage = error.response.data.message || 'Datos inválidos.';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      setMensaje({ texto: errorMessage, tipo: 'error' });
    }
  };

  // Función para formatear fecha
  const formatDate = (dateString) => {
    if (!dateString) return 'Fecha no definida';
    
    try {
      let date;
      
      // Si es string en formato DD/MM/YYYY
      if (typeof dateString === 'string' && dateString.includes('/')) {
        const parts = dateString.split('/');
        if (parts.length === 3) {
          const day = parseInt(parts[0]);
          const month = parseInt(parts[1]) - 1;
          const year = parseInt(parts[2]);
          date = new Date(year, month, day);
        }
      } else {
        date = new Date(dateString);
      }

      if (isNaN(date.getTime())) {
        return 'Fecha inválida';
      }

      return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Error al formatear';
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-blue-50 text-gray-800">
      <NavbarCandidato />
      <div className="h-20"></div>

      {/* Sección principal de la página */}
      <main className="flex-grow max-w-7xl mx-auto p-8 w-full">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-extrabold text-blue-900 mb-4">
            Postúlate a Elecciones
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Explora las elecciones disponibles y presenta tus propuestas para el futuro de nuestra comunidad.
          </p>
        </div>

        {/* Información del candidato */}
        {candidateInfo && (
          <div className="bg-blue-100 border-l-4 border-blue-500 p-4 mb-6 rounded-lg">
            <p className="text-blue-700 font-semibold">
              Candidato: {candidateInfo.nombre_candidate} {candidateInfo.apellido_candidate}
            </p>
            {candidateInfo.election && (
              <p className="text-blue-600 text-sm mt-1">
                Estado: {candidateInfo.estado_candidate} - 
                Elección: {candidateInfo.election.nombre_election}
              </p>
            )}
          </div>
        )}

        {/* Información de paginación */}
        <div className="flex justify-between items-center mb-6">
          <div className="text-sm text-gray-600">
            Mostrando {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, totalItems)} de {totalItems} elecciones programadas
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

        {/* Contenedor para mostrar mensajes de éxito o error */}
        {mensaje.texto && (
          <div className={`text-center p-4 mb-8 rounded-lg ${mensaje.tipo === 'success' ? 'bg-green-100 text-green-800 border border-green-300' : 'bg-red-100 text-red-800 border border-red-300'}`}>
            {mensaje.texto}
          </div>
        )}

        {/* Contenedor de las tarjetas de elecciones */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900 mx-auto mb-4"></div>
            <p className="text-gray-500">Cargando elecciones...</p>
          </div>
        ) : elecciones.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl shadow-lg">
            <FaExclamationCircle className="text-gray-400 text-5xl mx-auto mb-4" />
            <p className="text-xl text-gray-600 mb-4">No hay elecciones programadas disponibles en este momento.</p>
            <p className="text-gray-500">Vuelve a revisar más tarde para nuevas oportunidades.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
              {elecciones.map((eleccion) => (
                <div 
                  key={eleccion.id_election} 
                  className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 transform transition-all duration-300 hover:scale-105 hover:shadow-2xl"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-gray-800">{eleccion.nombre_election}</h3>
                    <span className="bg-green-100 text-green-700 text-xs font-semibold px-3 py-1 rounded-full uppercase">
                      {eleccion.estado_election}
                    </span>
                  </div>
                  
                  <div className="text-gray-600 space-y-2 mb-4">
                    <p className="flex items-center">
                      <FaCalendarAlt className="mr-2 text-blue-500" />
                      <span className="font-semibold">Inicio:</span> {formatDate(eleccion.fecha_inicio)}
                    </p>
                    <p className="flex items-center">
                      <FaCalendarAlt className="mr-2 text-blue-500" />
                      <span className="font-semibold">Fin:</span> {formatDate(eleccion.fecha_fin)}
                    </p>
                  </div>

                  <p className="text-sm text-gray-500 mb-4">
                    {eleccion.descripcion_election || 'Sin descripción disponible'}
                  </p>

                  <button
                    onClick={() => handlePostularse(eleccion.id_election)}
                    disabled={candidateInfo?.electionId !== null && candidateInfo?.electionId !== undefined}
                    className="mt-4 w-full bg-blue-900 text-white font-semibold py-3 px-4 rounded-xl shadow-md hover:bg-blue-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    <span className="flex items-center justify-center">
                      <FaCheckCircle className="mr-2" />
                      {candidateInfo?.electionId ? 'Ya estás postulado' : 'Postularme'}
                    </span>
                  </button>
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
    </div>
  );
}