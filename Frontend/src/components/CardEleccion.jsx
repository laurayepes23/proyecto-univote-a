import React from 'react';
import { FaCalendarAlt, FaClock } from 'react-icons/fa';

export default function CardEleccion({ eleccion, onVotar }) {
  // Función para formatear fecha y hora
  const formatDateTime = (dateString) => {
    if (!dateString) return 'Fecha no definida';

    try {
      let date;

      // Si ya viene formateado desde el backend con hora
      if (typeof dateString === 'string' && dateString.includes(',')) {
        return dateString; // Ya está formateado
      }

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

      return date.toLocaleString('es-ES', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
    } catch (error) {
      console.error('Error formateando fecha:', error);
      return 'Error al formatear';
    }
  };

  // Función para obtener el color del badge según el estado
  const getStatusBadgeColor = (estado) => {
    switch (estado) {
      case 'Programada':
        return 'bg-blue-100 text-blue-700 border border-blue-300';
      case 'Activa':
        return 'bg-green-100 text-green-700 border border-green-300';
      case 'Finalizada':
        return 'bg-red-100 text-red-700 border border-red-300';
      default:
        return 'bg-gray-100 text-gray-700 border border-gray-300';
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 transform transition-all duration-300 hover:scale-105 hover:shadow-2xl flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-800">
          {eleccion.nombre_election || eleccion.nombre}
        </h2>
        <span className={`${getStatusBadgeColor(eleccion.estado_election || eleccion.estado)} text-xs font-semibold px-3 py-1 rounded-full uppercase`}>
          {eleccion.estado_election || eleccion.estado}
        </span>
      </div>

      {/* Información de fechas y horas */}
      <div className="text-gray-600 space-y-3 mb-4 flex-1">
        <div className="space-y-2">
          <div className="flex items-start">
            <FaCalendarAlt className="mr-2 text-blue-500 mt-1 flex-shrink-0" />
            <div>
              <p className="font-semibold text-sm text-gray-700">Fecha y Hora de Inicio:</p>
              <p className="text-sm text-gray-600">
                {formatDateTime(eleccion.fecha_inicio || eleccion.fechaInicio)}
              </p>
            </div>
          </div>
          
          <div className="flex items-start">
            <FaClock className="mr-2 text-red-500 mt-1 flex-shrink-0" />
            <div>
              <p className="font-semibold text-sm text-gray-700">Fecha y Hora de Cierre:</p>
              <p className="text-sm text-gray-600">
                {formatDateTime(eleccion.fecha_fin || eleccion.fechaFin)}
              </p>
            </div>
          </div>
        </div>

        {/* Descripción */}
        {eleccion.descripcion_election && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              {eleccion.descripcion_election}
            </p>
          </div>
        )}
      </div>

      {/* Botón de acción */}
      <button
        onClick={(eleccion.estado_election === "Activa" || eleccion.estado === "Activa") ? onVotar : undefined}
        className={`w-full py-3 px-4 rounded-xl font-semibold text-white transition-colors ${
          (eleccion.estado_election === "Activa" || eleccion.estado === "Activa")
            ? "bg-green-600 hover:bg-green-700 shadow-md"
            : (eleccion.estado_election === "Programada" || eleccion.estado === "Programada")
            ? "bg-yellow-500 hover:bg-yellow-600 shadow-md"
            : "bg-red-400 cursor-not-allowed shadow-md"
        }`}
        disabled={eleccion.estado_election === "Finalizada" || eleccion.estado === "Finalizada"}
      >
        {(eleccion.estado_election === "Activa" || eleccion.estado === "Activa")
          ? "Votar Ahora"
          : (eleccion.estado_election === "Programada" || eleccion.estado === "Programada")
          ? "Ver Detalles"
          : "Ver Resultados"}
      </button>
    </div>
  );
}