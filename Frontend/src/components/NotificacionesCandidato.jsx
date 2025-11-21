// src/components/NotificacionesCandidato.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaBell, FaTimes, FaExclamationTriangle, FaCheckCircle, FaInfoCircle, FaEnvelope } from 'react-icons/fa';

const API_BASE_URL = "http://localhost:3000";

const NotificacionesCandidato = () => {
  const [notificaciones, setNotificaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [notificacionSeleccionada, setNotificacionSeleccionada] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    cargarNotificaciones();
  }, []);

  const cargarNotificaciones = async () => {
    try {
      const candidateData = localStorage.getItem('candidateData');
      if (!candidateData) return;

      const candidate = JSON.parse(candidateData);
      
      const response = await axios.get(`${API_BASE_URL}/notifications/candidate/${candidate.id_candidate}`);
      console.log('Notificaciones recibidas:', response.data); // Para debug
      
      setNotificaciones(response.data);
      
      // Calcular notificaciones no leídas
      const count = response.data.filter(notif => !notif.leida).length;
      setUnreadCount(count);
    } catch (error) {
      console.error('Error al cargar notificaciones:', error);
    } finally {
      setLoading(false);
    }
  };

  const marcarComoLeida = async (id_notification) => {
    try {
      await axios.patch(`${API_BASE_URL}/notifications/${id_notification}/read`);
      
      setNotificaciones(notificaciones.map(notif => 
        notif.id_notification === id_notification 
          ? { ...notif, leida: true } 
          : notif
      ));
      
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error al marcar notificación como leída:', error);
    }
  };

  const abrirNotificacion = (notificacion) => {
    setNotificacionSeleccionada(notificacion);
    
    if (!notificacion.leida) {
      marcarComoLeida(notificacion.id_notification);
    }
  };

  const getIconoPorTipo = (tipo) => {
    switch (tipo) {
      case 'rechazo':
        return <FaExclamationTriangle className="text-red-500 text-lg" />;
      case 'aprobacion':
        return <FaCheckCircle className="text-green-500 text-lg" />;
      default:
        return <FaInfoCircle className="text-blue-500 text-lg" />;
    }
  };

  const getColorPorTipo = (tipo) => {
    switch (tipo) {
      case 'rechazo':
        return 'border-l-red-500 bg-red-50';
      case 'aprobacion':
        return 'border-l-green-500 bg-green-50';
      default:
        return 'border-l-blue-500 bg-blue-50';
    }
  };

  const formatFecha = (fecha) => {
    try {
      // Si la fecha es null, undefined o vacía
      if (!fecha) {
        return 'Fecha no disponible';
      }

      console.log('Fecha recibida:', fecha, 'Tipo:', typeof fecha); // Debug

      let fechaObj;
      
      if (fecha instanceof Date) {
        fechaObj = fecha;
      } else if (typeof fecha === 'string') {
        // Si la fecha ya está en formato ISO, usarla directamente
        if (fecha.includes('T')) {
          fechaObj = new Date(fecha);
        } else {
          // Si viene en formato 'YYYY-MM-DD HH:MM:SS.sss', convertirlo a ISO
          const fechaISO = fecha.replace(' ', 'T');
          fechaObj = new Date(fechaISO);
        }
      } else if (typeof fecha === 'number') {
        // Si es un timestamp numérico
        fechaObj = new Date(fecha);
      } else {
        fechaObj = new Date(fecha);
      }
      
      if (isNaN(fechaObj.getTime())) {
        console.warn('Fecha inválida:', fecha, typeof fecha);
        return 'Fecha no disponible';
      }
      
      return fechaObj.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Error formateando fecha:', error, 'Tipo:', typeof fecha, 'Valor:', fecha);
      return 'Fecha no disponible';
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-6"></div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Botón de notificaciones */}
      <button
        onClick={() => setShowModal(true)}
        className="relative p-2 text-white hover:text-blue-200 transition-colors"
      >
        <FaBell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Modal de notificaciones */}
      {showModal && (
        <div className="fixed inset-0 bg-white/30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <div>
                <h3 className="text-xl font-bold text-gray-800">
                  Notificaciones
                </h3>
                {unreadCount > 0 && (
                  <p className="text-sm text-gray-600 mt-1">
                    Tienes {unreadCount} notificación{unreadCount !== 1 ? 'es' : ''} no leída{unreadCount !== 1 ? 's' : ''}
                  </p>
                )}
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors p-2"
              >
                <FaTimes className="w-5 h-5" />
              </button>
            </div>

            {/* Lista de notificaciones */}
            <div className="overflow-y-auto max-h-96">
              {notificaciones.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <FaEnvelope className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-medium">No tienes notificaciones</p>
                  <p className="text-sm mt-2">Te avisaremos cuando tengas novedades</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {notificaciones.map((notificacion) => (
                    <div
                      key={notificacion.id_notification}
                      className={`p-4 cursor-pointer transition-all duration-200 hover:bg-gray-50 border-l-4 ${
                        getColorPorTipo(notificacion.tipo)
                      } ${!notificacion.leida ? 'bg-blue-50 border-l-blue-600' : ''}`}
                      onClick={() => abrirNotificacion(notificacion)}
                    >
                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0 mt-1">
                          {getIconoPorTipo(notificacion.tipo)}
                        </div>
                        <div className="flex-grow min-w-0">
                          <div className="flex items-start justify-between">
                            <h4 className={`font-semibold text-sm ${
                              !notificacion.leida ? 'text-blue-900' : 'text-gray-700'
                            }`}>
                              {notificacion.titulo}
                            </h4>
                            {!notificacion.leida && (
                              <span className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full ml-2 mt-2"></span>
                            )}
                          </div>
                          <p className="text-gray-600 text-sm mt-1 line-clamp-2">
                            {notificacion.mensaje}
                          </p>
                          <p className="text-gray-400 text-xs mt-2">
                            {formatFecha(notificacion.fecha_creacion)} {/* CORREGIDO: fecha_creacion con guión bajo */}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => setShowModal(false)}
                className="w-full py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de detalle de notificación */}
      {notificacionSeleccionada && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                {getIconoPorTipo(notificacionSeleccionada.tipo)}
                <h3 className="text-lg font-bold text-gray-800">
                  {notificacionSeleccionada.titulo}
                </h3>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <p className="text-gray-700 whitespace-pre-wrap text-sm">
                  {notificacionSeleccionada.mensaje}
                </p>
              </div>

              <div className="flex justify-between items-center text-xs text-gray-500">
                <span>
                  {formatFecha(notificacionSeleccionada.fecha_creacion)} {/* CORREGIDO: fecha_creacion con guión bajo */}
                </span>
                <span className={`px-2 py-1 rounded-full ${
                  notificacionSeleccionada.tipo === 'rechazo' 
                    ? 'bg-red-100 text-red-800' 
                    : notificacionSeleccionada.tipo === 'aprobacion'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  {notificacionSeleccionada.tipo}
                </span>
              </div>

              <button
                onClick={() => setNotificacionSeleccionada(null)}
                className="w-full mt-6 px-4 py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-800 transition-colors font-medium"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificacionesCandidato;