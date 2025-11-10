import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import CardEleccion from "../components/CardEleccion";
import NavbarVotante from "../components/NavbarVotante";
import axios from 'axios'; 
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

export default function GestionElecciones() {
  const [elecciones, setElecciones] = useState([]);
  const [cargando, setCargando] = useState(true);
  const navigate = useNavigate();

  // Estados para la paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(6);
  const [totalItems, setTotalItems] = useState(0);

  // Calcular el número total de páginas
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  useEffect(() => {
    const fetchElecciones = async () => {
      try {
        const response = await axios.get('http://localhost:3000/elections');
        const data = response.data;

        const eleccionesAdaptadas = data.map(eleccion => ({
          id: eleccion.id_election,
          nombre: eleccion.nombre_election,
          fechaInicio: eleccion.fecha_inicio, 
          fechaFin: eleccion.fecha_fin,       
          estado: eleccion.estado_election,
          imagen: "/img/rector.png", 
        }));
        
        setTotalItems(eleccionesAdaptadas.length);
        
        // Paginación en el frontend
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const paginatedElections = eleccionesAdaptadas.slice(startIndex, endIndex);
        
        setElecciones(paginatedElections);

      } catch (error) {
        console.error("Error al cargar las elecciones:", error);
      } finally {
        setCargando(false);
      }
    };

    fetchElecciones();
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

  const handleVotar = (id) => {
    navigate(`/CandidatosVotante/${id}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center px-4 py-8">
      <NavbarVotante />
      
      <h1 className="text-3xl font-bold text-blue-900 mb-8 mt-24">
        Elecciones Disponibles
      </h1>

      {/* Información de paginación */}
      <div className="w-full max-w-6xl flex justify-between items-center mb-6">
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

      <div className="w-full max-w-6xl">
        {cargando ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando elecciones...</p>
          </div>
        ) : elecciones.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl shadow-lg">
            <p className="text-gray-600 text-lg mb-4">No hay elecciones registradas.</p>
            <p className="text-gray-500">Vuelve a revisar más tarde.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {elecciones.map((eleccion) => (
                <CardEleccion
                  key={eleccion.id}
                  eleccion={eleccion}
                  onVotar={() => handleVotar(eleccion.id)}
                />
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
      </div>
    </div>
  );
}