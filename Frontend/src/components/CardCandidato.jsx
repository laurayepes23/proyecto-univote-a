import React from "react";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = "http://localhost:3000";

// MODIFICADO: Recibimos la propiedad 'esVotoEnBlanco'
export default function CardCandidato({ candidato, onVotar, disabled, esVotoEnBlanco = false }) {
  const navigate = useNavigate();

  // Función para obtener la URL completa de la foto
  const getCandidatePhoto = (candidato) => {
    // MODIFICADO: Imagen especial para Voto en Blanco
    if (esVotoEnBlanco) {
      return '/img/voto-blanco.png'; // Crea esta imagen o usa '/img/default-avatar.png'
    }
    
    if (!candidato.foto_candidate) return '/img/default-avatar.png';
    
    let fotoUrl = candidato.foto_candidate;
    
    // Si ya es una URL completa
    if (fotoUrl.startsWith('http')) {
      return fotoUrl;
    }
    // Si es una ruta relativa que empieza con /
    else if (fotoUrl.startsWith('/')) {
      return `${API_BASE_URL}${fotoUrl}`;
    }
    // Si es solo el nombre del archivo
    else {
      return `${API_BASE_URL}/uploads/candidatos/${fotoUrl}`;
    }
  };

  const handleVerPropuestas = () => {
    // MODIFICADO: No navegar a propuestas para Voto en Blanco
    if (esVotoEnBlanco) {
      alert("El Voto en Blanco no tiene propuestas específicas. Representa tu desacuerdo con todas las opciones presentadas.");
      return;
    }
    navigate(`/Propuestas/${candidato.id_candidate}`);
  };

  const fotoUrl = getCandidatePhoto(candidato);

  return (
    <div className={`bg-white rounded-2xl shadow-lg p-6 text-center flex flex-col items-center hover:shadow-xl transition-all duration-300 border-2 ${
      esVotoEnBlanco 
        ? 'border-gray-300 bg-gray-50' 
        : 'border-gray-100'
    }`}>
      
      {/* MODIFICADO: Contenedor de imagen con borde especial para Voto en Blanco */}
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

      {/* MODIFICADO: Título especial para Voto en Blanco */}
      <h3 className={`text-xl font-bold mb-1 ${
        esVotoEnBlanco 
          ? 'text-gray-700' 
          : 'text-blue-900'
      }`}>
        {esVotoEnBlanco ? "Voto en Blanco" : `${candidato.nombre_candidate} ${candidato.apellido_candidate}`}
        
        {/* MODIFICADO: Subtítulo para Voto en Blanco */}
        {esVotoEnBlanco && (
          <span className="block text-sm font-normal text-gray-500 mt-1">
            Expresa tu desacuerdo
          </span>
        )}
      </h3>
      
      {/* MODIFICADO: Información condicional */}
      {!esVotoEnBlanco && candidato.career?.nombre_career && (
        <p className="text-gray-600 text-sm mb-2">
          {candidato.career.nombre_career}
        </p>
      )}
      
      {/* MODIFICADO: Descripción especial para Voto en Blanco */}
      <p className="text-gray-700 text-sm mb-4 text-center line-clamp-2">
        {esVotoEnBlanco 
          ? "Tu voto será contabilizado pero no favorecerá a ningún candidato específico."
          : candidato.descripcion_candidate || candidato.proposals?.[0]?.descripcion_proposal || 'Candidato comprometido con la comunidad universitaria'
        }
      </p>

      {/* MODIFICADO: Botones con estilos especiales para Voto en Blanco */}
      <div className="flex gap-3 mt-2 w-full justify-center">
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
      </div>

      {/* MODIFICADO: Badge indicador para Voto en Blanco */}
      {esVotoEnBlanco && (
        <div className="mt-3 px-3 py-1 bg-gray-200 text-gray-700 text-xs rounded-full font-medium">
          Opción de protesta
        </div>
      )}
    </div>
  );
}