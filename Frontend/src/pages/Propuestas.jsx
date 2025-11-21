/* eslint-disable no-unused-vars */
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import NavbarVotante from "../components/NavbarVotante";
import axios from "axios";
import { FaUserGraduate, FaLightbulb, FaUniversity, FaExclamationTriangle, FaCheckCircle, FaList, FaArrowLeft, FaVoteYea } from 'react-icons/fa';

const API_BASE_URL = "http://localhost:3000";

export default function Propuestas() {
  const { id } = useParams(); // Obtiene el ID del candidato de la URL
  const [propuestas, setPropuestas] = useState([]);
  const [candidato, setCandidato] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [electionInfo, setElectionInfo] = useState(null);
  const [activeElections, setActiveElections] = useState([]);
  const [selectedElection, setSelectedElection] = useState(null);
  const [showVoteModal, setShowVoteModal] = useState(false);
  const [isVoting, setIsVoting] = useState(false);
  const navigate = useNavigate();

  // Obtener información del votante desde localStorage
  const voterData = JSON.parse(localStorage.getItem('voterData') || '{}');
  const voterId = voterData.id_voter;

  // Función para obtener la URL completa de la foto
  const getCandidatePhoto = (candidato) => {
    if (!candidato?.foto_candidate) return '/img/default-avatar.png';
    
    let fotoUrl = candidato.foto_candidate;
    
    if (fotoUrl.startsWith('http')) {
      return fotoUrl;
    } else if (fotoUrl.startsWith('/')) {
      return `${API_BASE_URL}${fotoUrl}`;
    } else {
      return `${API_BASE_URL}/uploads/candidatos/${fotoUrl}`;
    }
  };

  // Cargar elecciones activas
  useEffect(() => {
    const fetchActiveElections = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/proposals/active-elections`);
        setActiveElections(response.data);
      } catch (error) {
        console.error("Error al cargar elecciones activas:", error);
      }
    };

    fetchActiveElections();
  }, []);

  // Cargar datos del candidato y propuestas
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // 1. Cargar información del candidato
        const candidateResponse = await axios.get(`${API_BASE_URL}/candidates/${id}`);
        const candidateData = candidateResponse.data;
        setCandidato(candidateData);

        // 2. Si el candidato tiene elección, cargar sus propuestas
        if (candidateData.election) {
          setSelectedElection(candidateData.election);
          setElectionInfo(candidateData.election);
          
          // Cargar propuestas del candidato para esta elección
          const proposalsResponse = await axios.get(`${API_BASE_URL}/proposals/owner/${id}`);
          const activeProposals = proposalsResponse.data.filter(
            proposal => proposal.estado_proposal === 'Activa'
          );
          setPropuestas(activeProposals);
        }
        
      } catch (err) {
        console.error("Error fetching data:", err);
        if (err.response?.status === 404) {
          setError("Candidato no encontrado.");
        } else {
          setError("No se pudo cargar la información del candidato.");
        }
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id]);

  // Función para cambiar de elección
  const handleElectionChange = async (electionId) => {
    try {
      setIsLoading(true);
      const election = activeElections.find(e => e.id_election === electionId);
      setSelectedElection(election);
      setElectionInfo(election);

      // Cargar propuestas del candidato para la nueva elección
      const proposalsResponse = await axios.get(`${API_BASE_URL}/proposals/owner/${id}`);
      const activeProposals = proposalsResponse.data.filter(
        proposal => proposal.estado_proposal === 'Activa' && 
                   proposal.electionId === electionId
      );
      setPropuestas(activeProposals);
    } catch (error) {
      console.error("Error al cambiar elección:", error);
      setError("Error al cargar las propuestas de la elección seleccionada.");
    } finally {
      setIsLoading(false);
    }
  };

  // Función para volver a CandidatosVotante
  const handleBackToCandidates = () => {
    navigate("/CandidatosVotante");
  };

  // Función para mostrar el modal de votación
  const handleShowVoteModal = () => {
    if (!selectedElection) {
      alert("Por favor, selecciona una elección primero.");
      return;
    }
    setShowVoteModal(true);
  };

  // Función para confirmar el voto
  const handleConfirmVote = async () => {
    if (!voterId || !candidato || !selectedElection) {
      alert("Error: Información incompleta para realizar el voto.");
      return;
    }

    setIsVoting(true);
    
    const voteData = {
      electionId: selectedElection.id_election,
      candidateId: candidato.id_candidate,
      voterId: voterId
    };

    console.log("📤 Enviando voto con datos:", voteData);

    try {
      await axios.post(`${API_BASE_URL}/votes`, voteData);
      
      alert(`✅ ¡Gracias por votar! Tu voto para ${candidato.nombre_candidate} ha sido registrado exitosamente.`);
      
      // Cerrar modal y redirigir
      setShowVoteModal(false);
      navigate("/CandidatosVotante");
      
    } catch (error) {
      console.error("Error al registrar el voto:", error.response?.data);
      const errorMessage = error.response?.data?.message || "Hubo un error al registrar tu voto. Por favor, intenta nuevamente.";
      alert(`❌ Error: ${errorMessage}`);
    } finally {
      setIsVoting(false);
    }
  };

  // Función para cancelar el voto
  const handleCancelVote = () => {
    setShowVoteModal(false);
  };

  // Renderizado mientras carga la información
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <NavbarVotante />
        <div className="pt-24 flex justify-center items-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900 mx-auto"></div>
            <p className="text-gray-600 text-lg mt-4">Cargando propuestas...</p>
          </div>
        </div>
      </div>
    );
  }

  // Renderizado si ocurre un error
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <NavbarVotante />
        <div className="pt-24 flex justify-center items-center px-4">
          <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
            <FaExclamationTriangle className="text-6xl text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Error</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={handleBackToCandidates}
              className="bg-blue-900 text-white font-semibold py-3 px-6 rounded-xl shadow-md hover:bg-blue-800 transition-colors"
            >
              Volver a Candidatos
            </button>
          </div>
        </div>
      </div>
    );
  }

  const fotoUrl = candidato ? getCandidatePhoto(candidato) : '/img/default-avatar.png';

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center px-4 py-10">
      <NavbarVotante />

      {/* Header con información de la elección */}
      <div className="w-full max-w-6xl mb-8 mt-24">
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <h1 className="text-3xl font-bold text-blue-900 mb-2">
                Propuestas del Candidato
              </h1>
              
              {/* Selector de elección */}
              <div className="flex items-center space-x-4 mt-4">
                <div className="flex items-center text-gray-700">
                  <FaList className="mr-2 text-blue-500" />
                  <span className="font-semibold">Elección:</span>
                </div>
                <select
                  value={selectedElection?.id_election || ''}
                  onChange={(e) => handleElectionChange(Number(e.target.value))}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Seleccionar elección</option>
                  {activeElections.map(election => (
                    <option key={election.id_election} value={election.id_election}>
                      {election.nombre_election} ({election.candidates.length} candidatos)
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="flex space-x-4 mt-4 md:mt-0">
              
              {selectedElection && (
                <button
                  onClick={handleShowVoteModal}
                  className="bg-blue-900 text-white font-semibold py-2 px-6 rounded-xl hover:bg-blue-700 transition-colors flex items-center"
                >
                  <FaVoteYea className="mr-2" />
                  Votar por este Candidato
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {!selectedElection ? (
        <div className="max-w-6xl mx-auto w-full">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <FaList className="text-6xl text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Selecciona una Elección
            </h2>
            <p className="text-gray-600 mb-6">
              Por favor, selecciona una elección activa para ver las propuestas del candidato.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto items-stretch w-full">
          {/* Columna izquierda: candidato */}
          {candidato && (
            <div className="bg-white rounded-2xl shadow-xl p-6 flex flex-col items-center text-center h-full border border-gray-100">
              <div className="flex justify-center items-center w-full mb-6">
                <img
                  src={fotoUrl}
                  alt={`${candidato.nombre_candidate} ${candidato.apellido_candidate}`}
                  className="w-48 h-48 object-cover rounded-full border-4 border-blue-200 shadow-lg"
                  onError={(e) => {
                    e.target.src = '/img/default-avatar.png';
                  }}
                />
              </div>
              
              <h3 className="text-2xl font-bold text-blue-900 mb-2">
                {candidato.nombre_candidate} {candidato.apellido_candidate}
              </h3>
              
              {/* Estado del candidato */}
              <div className="mb-4">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  candidato.estado_candidate === 'Aprobado' 
                    ? 'bg-green-100 text-green-800'
                    : candidato.estado_candidate === 'Pendiente'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {candidato.estado_candidate === 'Aprobado' && <FaCheckCircle className="mr-1" />}
                  {candidato.estado_candidate}
                </span>
              </div>
              
              {/* Información adicional del candidato */}
              {candidato.career?.nombre_career && (
                <div className="flex items-center justify-center text-gray-600 mb-3 text-lg">
                  <FaUniversity className="mr-2 text-blue-500" />
                  {candidato.career.nombre_career}
                </div>
              )}
             
              {/* Información de la elección seleccionada */}
              <div className="w-full mt-4 space-y-2 text-left">
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="font-semibold text-blue-800 text-sm">
                    Elección Actual:
                  </p>
                  <p className="text-blue-700 text-sm">
                    {selectedElection.nombre_election}
                  </p>
                </div>
                
                {/* Contador de propuestas activas */}
                <div className="flex items-center mt-4 p-3 bg-green-50 rounded-lg">
                  <FaLightbulb className="text-green-500 mr-2" />
                  <div>
                    <p className="font-semibold text-green-800 text-sm">
                      {propuestas.length} {propuestas.length === 1 ? 'propuesta activa' : 'propuestas activas'}
                    </p>
                    <p className="text-green-600 text-xs">
                      En esta elección
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Columna derecha: propuestas */}
          <div className="md:col-span-2 bg-white rounded-2xl shadow-xl p-8 h-full flex flex-col border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-blue-800">
                Propuestas del Candidato
              </h2>
              <div className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                {propuestas.length} {propuestas.length === 1 ? 'propuesta' : 'propuestas'}
              </div>
            </div>
            
            {propuestas.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center py-12">
                <FaLightbulb className="text-6xl text-gray-300 mb-4" />
                <p className="text-gray-600 text-lg mb-2">
                  {candidato?.estado_candidate === 'Aprobado' 
                    ? 'Este candidato no tiene propuestas activas en esta elección.'
                    : 'Este candidato no está aprobado para mostrar propuestas.'
                  }
                </p>
                <p className="text-gray-500 text-sm max-w-md">
                  Las propuestas activas aparecerán aquí cuando sean registradas para esta elección.
                </p>
              </div>
            ) : (
              <div className="flex-1">
                {/* Información sobre las propuestas */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <div className="flex items-start">
                    <FaLightbulb className="text-blue-500 text-xl mt-1 mr-3 flex-shrink-0" />
                    <div>
                      <p className="text-blue-800 font-semibold mb-1">
                        Propuestas para tu consideración
                      </p>
                      <p className="text-blue-700 text-sm">
                        Revisa cuidadosamente cada propuesta antes de tomar tu decisión de voto.
                      </p>
                    </div>
                  </div>
                </div>
                
                <ul className="space-y-6">
                  {propuestas.map((propuesta, index) => (
                    <li
                      key={propuesta.id_proposal}
                      className="flex items-start gap-6 bg-gray-50 p-6 rounded-xl border border-gray-200 hover:shadow-md transition-all duration-300 hover:border-blue-200"
                    >
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg shadow-lg">
                          {index + 1}
                        </div>
                      </div>
                      
                      <div className="flex-grow">
                        {propuesta.titulo_proposal && (
                          <h4 className="font-bold text-gray-900 mb-3 text-xl">
                            {propuesta.titulo_proposal}
                          </h4>
                        )}
                        
                        <p className="text-gray-800 leading-relaxed text-lg mb-4">
                          {propuesta.descripcion_proposal}
                        </p>
                        
                        {/* Estado de la propuesta */}
                        <div className="flex items-center space-x-2">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            propuesta.estado_proposal === 'Activa' 
                              ? 'bg-green-100 text-green-800 border border-green-200'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {propuesta.estado_proposal === 'Activa' && <FaCheckCircle className="inline mr-1" />}
                            {propuesta.estado_proposal}
                          </span>
                          
                          <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-medium">
                            Elección: {selectedElection.nombre_election}
                          </span>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}


      {/* Modal de confirmación de voto */}
      {showVoteModal && (
        <div className="fixed inset-0 bg-white/30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 shadow-lg max-w-sm w-full text-center mx-4">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Confirmar Voto</h2>
            
            {candidato?.nombre_candidate === 'Voto en Blanco' ? (
              <>
                <p className="text-gray-600 mb-4">
                  ¿Estás seguro de que deseas emitir un <strong>Voto en Blanco</strong>?
                </p>
                <p className="text-sm text-gray-500 mb-4">
                  Esta opción expresa tu desacuerdo con todas las candidaturas presentadas.
                </p>
              </>
            ) : (
              <p className="text-gray-600 mb-6">
                ¿Estás seguro de que deseas votar por{" "}
                <span className="font-semibold">{candidato?.nombre_candidate}</span>?
              </p>
            )}
            
            <div className="flex justify-between gap-4">
              <button 
                onClick={handleCancelVote} 
                className="flex-1 py-2 bg-gray-300 rounded-lg hover:bg-gray-400 transition-colors"
                disabled={isVoting}
              >
                Cancelar
              </button>
              <button 
                onClick={handleConfirmVote} 
                className="flex-1 py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center"
                disabled={isVoting}
              >
                {isVoting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Procesando...
                  </>
                ) : (
                  'Confirmar'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}