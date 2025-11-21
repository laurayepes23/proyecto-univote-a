import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = "http://localhost:3000";

export default function CardCandidato({ candidato, onVotar, disabled, esVotoEnBlanco = false }) {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);

  // Función para obtener la URL completa de la foto
  const getCandidatePhoto = (candidato) => {
    if (esVotoEnBlanco) {
      return '/img/voto-blanco.png';
    }
    
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

  const handleVerPropuestas = () => {
    if (esVotoEnBlanco) {
      setShowModal(true);
      return;
    }
    navigate(`/Propuestas/${candidato.id_candidate}`);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const fotoUrl = getCandidatePhoto(candidato);

  return (
    <>
      <div className={`bg-white rounded-2xl shadow-lg p-6 text-center flex flex-col items-center hover:shadow-xl transition-all duration-300 border-2 ${
        esVotoEnBlanco 
          ? 'border-gray-300 bg-gray-50' 
          : 'border-gray-100'
      }`}>
        
        {/* Contenedor de imagen con borde especial para Voto en Blanco */}
        <div className={`w-40 h-40 rounded-full mb-4 shadow-md overflow-hidden border-4 ${
          esVotoEnBlanco 
            ? 'border-gray-300' 
            : 'border-blue-200'
        }`}>
          <img
            src={fotoUrl}
            alt={esVotoEnBlanco ? "Voto en Blanco" : `${candidato.nombre_candidate} ${candidato.apellido_candidate}`}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.src = '/img/default-avatar.png';
            }}
          />
        </div>

        {/* Título especial para Voto en Blanco */}
        <h3 className={`text-xl font-bold mb-1 ${
          esVotoEnBlanco 
            ? 'text-gray-700' 
            : 'text-blue-900'
        }`}>
          {esVotoEnBlanco ? "Voto en Blanco" : `${candidato.nombre_candidate} ${candidato.apellido_candidate}`}
          
          {/* Subtítulo para Voto en Blanco */}
          {esVotoEnBlanco && (
            <span className="block text-sm font-normal text-gray-500 mt-1">
              Expresa tu desacuerdo
            </span>
          )}
        </h3>
        
        {/* Información condicional */}
        {!esVotoEnBlanco && candidato.career?.nombre_career && (
          <p className="text-gray-600 text-sm mb-2">
            {candidato.career.nombre_career}
          </p>
        )}
        
        {/* Descripción especial para Voto en Blanco */}
        <p className="text-gray-700 text-sm mb-4 text-center line-clamp-2">
          {esVotoEnBlanco 
            ? "Tu voto será contabilizado pero no favorecerá a ningún candidato específico."
            : candidato.descripcion_candidate || candidato.proposals?.[0]?.descripcion_proposal || 'Candidato comprometido con la comunidad universitaria'
          }
        </p>

        {/* Botones invertidos - Propuestas/Info primero */}
        <div className="flex gap-3 mt-2 w-full justify-center">
          {/* Botón Propuestas/Info ahora primero */}
          <button
            onClick={handleVerPropuestas}
            className={`px-4 py-2 rounded-lg transition-all font-medium flex-1 max-w-32 hover:shadow-md transform hover:scale-105 ${
              esVotoEnBlanco
                ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            }`}
          >
            {esVotoEnBlanco ? 'Info' : 'Propuestas'}
          </button>

          {/* Botón Votar ahora segundo */}
          <button
            onClick={() => onVotar(candidato)}
            disabled={disabled}
            className={`px-4 py-2 rounded-lg transition-all font-medium flex-1 max-w-32 ${
              disabled 
                ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
                : esVotoEnBlanco
                ? 'bg-gray-600 text-white hover:bg-gray-700 hover:shadow-md transform hover:scale-105'
                : 'bg-blue-900 text-white hover:bg-blue-800 hover:shadow-md transform hover:scale-105'
            }`}
          >
            {disabled 
              ? 'Ya Votado' 
              : esVotoEnBlanco 
                ? 'Votar Blanco' 
                : 'Votar'
            }
          </button>
        </div>


      </div>

      {/* Modal para Voto en Blanco */}
      {showModal && (
        <div className="fixed inset-0 bg-white/30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full transform transition-all duration-300 scale-100">
            {/* Header del modal */}
            <div className="bg-gray-100 px-6 py-4 rounded-t-2xl border-b border-gray-200">
              <div className="flex items-center justify-center">
                <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center mr-3">
                  <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-800">Voto en Blanco</h3>
              </div>
            </div>

            {/* Body del modal */}
            <div className="px-6 py-6">
              <div className="text-center mb-4">
                <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-10 h-10 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                
                <h4 className="text-lg font-semibold text-gray-800 mb-3">
                  ¿Qué significa el Voto en Blanco?
                </h4>
                
                <p className="text-gray-600 leading-relaxed mb-4">
                  El <span className="font-semibold text-gray-800">Voto en Blanco</span> no tiene propuestas específicas. Representa tu desacuerdo con todas las opciones presentadas en la elección.
                </p>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <p className="text-sm text-blue-800 font-medium">
                    💡 Tu voto será contabilizado pero no favorecerá a ningún candidato específico.
                  </p>
                </div>
              </div>
            </div>

            {/* Footer del modal */}
            <div className="bg-gray-50 px-6 py-4 rounded-b-2xl border-t border-gray-200">
              <div className="flex justify-center">
                <button
                  onClick={handleCloseModal}
                  className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200 font-medium shadow-sm hover:shadow-md"
                >
                  Entendido
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}