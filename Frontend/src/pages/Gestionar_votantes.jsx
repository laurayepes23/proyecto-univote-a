import React, { useState, useEffect } from "react";
import Navbar_admin from "../components/Navbar_admin";
import Footer from "../components/Footer";
import axios from 'axios'; 

const API_BASE_URL = 'http://localhost:3000/voters';

const Gestionar_votantes = () => {
  const [votantes, setVotantes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Estados para la paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);

  // Calcular el número total de páginas
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  // Función para obtener y ordenar los votantes de la API
  const fetchVoters = async (page = 1) => {
    try {
      setLoading(true);
      const response = await axios.get(API_BASE_URL);
      const allVoters = response.data;
      
      // Ordenar alfabéticamente por nombre (primera letra)
      const sortedVoters = [...allVoters].sort((a, b) => {
        const nombreA = a.nombre_voter?.toLowerCase() || '';
        const nombreB = b.nombre_voter?.toLowerCase() || '';
        return nombreA.localeCompare(nombreB);
      });
      
      setTotalItems(sortedVoters.length);
      
      // Paginación en el frontend
      const startIndex = (page - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      const paginatedVoters = sortedVoters.slice(startIndex, endIndex);
      
      setVotantes(paginatedVoters.map(voter => ({
        id: voter.id_voter,
        nombre: voter.nombre_voter,
        apellido: voter.apellido_voter,
        tipoDoc: voter.tipo_doc_voter,
        numeroDoc: voter.num_doc_voter,
        correo: voter.correo_voter,
        estado: voter.estado_voter,
      })));
      
      setCurrentPage(page);
    } catch (err) {
      console.error("Error al cargar los votantes:", err);
      setError("No se pudieron cargar los datos de los votantes.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVoters(currentPage);
  }, []);

  // Función para cambiar el estado del votante (Activo/Inactivo)
  const toggleEstado = async (id) => {
    try {
      const votanteToUpdate = votantes.find(v => v.id === id);
      if (!votanteToUpdate) return;

      // Cambiar entre "Activo" e "Inactivo"
      const nuevoEstado = votanteToUpdate.estado === "Activo" ? "Inactivo" : "Activo";
      
      // Llama a la API para actualizar el estado del votante
      await axios.patch(`${API_BASE_URL}/${id}`, { estado_voter: nuevoEstado });

      // Actualiza el estado localmente y reordena
      setVotantes((prevVotantes) => {
        const updatedVotantes = prevVotantes.map((votante) =>
          votante.id === id ? { ...votante, estado: nuevoEstado } : votante
        );
        
        // Reordenar después de la actualización
        return [...updatedVotantes].sort((a, b) => {
          const nombreA = a.nombre?.toLowerCase() || '';
          const nombreB = b.nombre?.toLowerCase() || '';
          return nombreA.localeCompare(nombreB);
        });
      });
      
      // Recargar los datos para mantener el orden correcto en todas las páginas
      fetchVoters(currentPage);
      
    } catch (err) {
      console.error("Error al actualizar el estado del votante:", err);
      setError("No se pudo actualizar el estado del votante.");
    }
  };

  // Funciones de paginación
  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      fetchVoters(page);
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
      <>
        <Navbar_admin />
        <div className="p-6 mt-24 text-center">Cargando votantes...</div>
        <Footer />
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar_admin />
        <div className="p-6 mt-24 text-center text-red-600 font-bold">Error: {error}</div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar_admin />
      <div className="p-6 mt-24">
        <h1 className="text-4xl font-extrabold text-center text-blue-900 mb-6">
          Información de Votantes
        </h1>

        {/* Información de paginación */}
        <div className="flex justify-between items-center mb-4">
          <div className="text-sm text-gray-600">
            Mostrando {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, totalItems)} de {totalItems} votantes
            <span className="ml-2 text-blue-600">(Ordenados alfabéticamente por nombre)</span>
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
                fetchVoters(1);
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

        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-300 bg-white shadow-md rounded-lg">
            <thead className="bg-blue-900 text-white">
              <tr>
                <th className="px-4 py-3 border">ID Votante</th>
                <th className="px-4 py-3 border">Nombre</th>
                <th className="px-4 py-3 border">Apellido</th>
                <th className="px-4 py-3 border">Tipo Doc</th>
                <th className="px-4 py-3 border">Número Doc</th>
                <th className="px-4 py-3 border">Correo</th>
                <th className="px-4 py-3 border">Estado</th>
                <th className="px-4 py-3 border">Acción</th>
              </tr>
            </thead>
            <tbody>
              {votantes.map((votante) => (
                <tr key={votante.id} className="text-center hover:bg-gray-100">
                  <td className="px-4 py-2 border">{votante.id}</td>
                  <td className="px-4 py-2 border font-medium">{votante.nombre}</td>
                  <td className="px-4 py-2 border">{votante.apellido}</td>
                  <td className="px-4 py-2 border">{votante.tipoDoc}</td>
                  <td className="px-4 py-2 border">{votante.numeroDoc.toString()}</td>
                  <td className="px-4 py-2 border">{votante.correo}</td>
                  <td
                    className={`px-4 py-2 border font-semibold ${
                      votante.estado === "Activo" 
                        ? "text-green-600" 
                        : "text-red-600"
                    }`}
                  >
                    {votante.estado}
                  </td>
                  <td className="px-4 py-2 border">
                    <button
                      onClick={() => toggleEstado(votante.id)}
                      className={`px-4 py-2 rounded font-medium transition-colors ${
                        votante.estado === "Activo"
                          ? "bg-red-500 text-white hover:bg-red-700"
                          : "bg-green-500 text-white hover:bg-green-700"
                      }`}
                    >
                      {votante.estado === "Activo" ? "Deshabilitar" : "Habilitar"}
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
      </div>
    </>
  );
};

export default Gestionar_votantes;