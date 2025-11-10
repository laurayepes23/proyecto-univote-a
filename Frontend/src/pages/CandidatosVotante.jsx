import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import CardCandidato from "../components/CardCandidato";
import NavbarVotante from "../components/NavbarVotante";
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const API_BASE_URL = "http://localhost:3000";

export default function CandidatosVotante() {
    const { id } = useParams();
    const [candidatos, setCandidatos] = useState([]);
    const [nombreEleccion, setNombreEleccion] = useState("");
    const [candidatoSeleccionado, setCandidatoSeleccionado] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [yaVoto, setYaVoto] = useState(false);
    const [voterId, setVoterId] = useState(null);

    // Estados para la paginación
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(6);
    const [totalItems, setTotalItems] = useState(0);

    // Calcular el número total de páginas
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    // Obtener voterId del localStorage al cargar el componente
    useEffect(() => {
        const storedVoterId = localStorage.getItem('voterId');
        console.log("🔍 DEBUG - voterId del localStorage:", storedVoterId);
        
        if (storedVoterId) {
            setVoterId(parseInt(storedVoterId, 10));
        } else {
            setError("No se encontró la información del votante. Por favor, inicia sesión nuevamente.");
            setIsLoading(false);
        }
    }, []);

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

    useEffect(() => {
        if (!voterId) return;

        const fetchCandidatos = async () => {
            try {
                const response = await axios.get(`${API_BASE_URL}/elections/${id}`);
                const electionData = response.data;

                if (electionData && electionData.candidates) {
                    const candidatosAprobados = electionData.candidates.filter(
                        c => c.estado_candidate === 'Aprobado'
                    );
                    
                    // Agregar URLs completas de fotos a cada candidato
                    const candidatosConFotos = candidatosAprobados.map(candidato => ({
                        ...candidato,
                        foto_completa: getCandidatePhoto(candidato)
                    }));
                    
                    setTotalItems(candidatosConFotos.length);
                    
                    // Paginación en el frontend
                    const startIndex = (currentPage - 1) * itemsPerPage;
                    const endIndex = startIndex + itemsPerPage;
                    const paginatedCandidates = candidatosConFotos.slice(startIndex, endIndex);
                    
                    setCandidatos(paginatedCandidates);
                    setNombreEleccion(electionData.nombre_election);
                } else {
                    setCandidatos([]);
                    setTotalItems(0);
                }

            } catch (err) {
                setError("No se pudo cargar la información de la elección. Por favor, inténtalo más tarde.");
                console.error("Error al obtener candidatos:", err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchCandidatos();
    }, [id, voterId, currentPage, itemsPerPage]); 

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

    const handleVotar = (candidato) => {
        if (yaVoto) {
            alert("Ya has emitido tu voto en esta elección.");
            return;
        }
        setCandidatoSeleccionado(candidato);
    };

    const confirmarVoto = async () => {
        if (!voterId) {
            alert("Error: No se pudo identificar al votante. Por favor, inicia sesión nuevamente.");
            setCandidatoSeleccionado(null);
            return;
        }

        const voteData = {
            electionId: parseInt(id, 10),
            candidateId: candidatoSeleccionado.id_candidate,
            voterId: voterId
        };

        console.log("📤 Enviando voto con datos:", voteData);

        try {
            await axios.post(`${API_BASE_URL}/votes`, voteData);
            alert(`✅ ¡Gracias por votar! Tu voto para ${candidatoSeleccionado.nombre_candidate} ha sido registrado.`);
            setYaVoto(true);
        } catch (error) {
            console.error("Error al registrar el voto:", error.response?.data);
            const errorMessage = error.response?.data?.message || "Hubo un error al registrar tu voto.";
            alert(`❌ Error: ${errorMessage}`);
        } finally {
            setCandidatoSeleccionado(null);
        }
    };

    const cancelarVoto = () => {
        setCandidatoSeleccionado(null);
    };

    // Mostrar loading mientras obtenemos voterId
    if (isLoading && !voterId) {
        return (
            <div className="min-h-screen bg-gray-50">
                <NavbarVotante />
                <div className="pt-24 flex justify-center items-center">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900 mx-auto"></div>
                        <p className="text-gray-600 text-lg mt-4">Cargando...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50">
                <NavbarVotante />
                <div className="pt-24 flex justify-center items-center">
                    <p className="text-red-600 text-lg">Error: {error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 px-4 py-10 flex flex-col items-center">
            <NavbarVotante />
            <h1 className="text-3xl font-bold text-blue-900 mb-2 text-center mt-24">
                Candidatos para: {nombreEleccion}
            </h1>

            {/* Información de paginación */}
            <div className="w-full max-w-6xl flex justify-between items-center mb-6">
                <div className="text-sm text-gray-600">
                    Mostrando {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, totalItems)} de {totalItems} candidatos aprobados
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

            {yaVoto && (
                <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6 w-full max-w-6xl rounded-lg" role="alert">
                    <p className="font-bold">¡Voto registrado!</p>
                    <p>Ya has participado en esta elección. Gracias.</p>
                </div>
            )}

            {candidatos.length === 0 ? (
                <div className="text-center mt-8">
                    <p className="text-gray-600 text-lg">
                        No hay candidatos aprobados disponibles para esta elección.
                    </p>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 w-full max-w-6xl mb-8">
                        {candidatos.map((candidato) => (
                            <CardCandidato
                                key={candidato.id_candidate}
                                candidato={candidato}
                                onVotar={handleVotar}
                                disabled={yaVoto}
                            />
                        ))}
                    </div>

                    {/* Controles de paginación */}
                    {totalPages > 1 && (
                        <div className="flex justify-center items-center space-x-2 mt-4">
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

            {/* Modal de confirmación */}
            {candidatoSeleccionado && (
                <div className="fixed inset-0 bg-white/30 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl p-6 shadow-lg max-w-sm w-full text-center mx-4">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">Confirmar Voto</h2>
                        <p className="text-gray-600 mb-6">
                            ¿Estás seguro de que deseas votar por{" "}
                            <span className="font-semibold">{candidatoSeleccionado.nombre_candidate}</span>?
                        </p>
                        <div className="flex justify-between gap-4">
                            <button 
                                onClick={cancelarVoto} 
                                className="flex-1 py-2 bg-gray-300 rounded-lg hover:bg-gray-400 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button 
                                onClick={confirmarVoto} 
                                className="flex-1 py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-600 transition-colors"
                            >
                                Confirmar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}