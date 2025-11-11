import React, { useState, useEffect, useRef } from 'react'
import Navbar_admin from '../components/Navbar_admin'
import Footer from '../components/Footer'
import api from '../api/axios'
import {
  FaEnvelope,
  FaLock,
  FaSave,
  FaUser,
  FaIdCard,
  FaPen,
  FaExclamationTriangle,
  FaClock,
} from 'react-icons/fa'

const Mi_perfil_admin = () => {
  const [perfil, setPerfil] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    correo: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  // Estados para el límite de intentos
  const [intentos, setIntentos] = useState(0)
  const [bloqueado, setBloqueado] = useState(false)
  const [tiempoRestante, setTiempoRestante] = useState(0)

  // Cargar datos del administrador y estado de intentos
  const initialLoadRef = useRef(false)

  useEffect(() => {
    if (initialLoadRef.current) return
    initialLoadRef.current = true
    const fetchAdminData = async () => {
      try {
        const adminDataString = localStorage.getItem('adminData')
        if (!adminDataString) {
          throw new Error(
            'No se encontraron datos de sesión. Por favor, inicie sesión de nuevo.'
          )
        }
        const adminData = JSON.parse(adminDataString)
        const adminId = adminData.id_admin

        const response = await api.get(
          `/administrators/${adminId}`
        )
        const data = response.data

        const formattedProfile = {
          id: data.id_admin,
          nombre: data.nombre_admin,
          apellido: data.apellido_admin,
          tipoDoc: data.tipo_doc_admin,
          numeroDoc: data.num_doc_admin.toString(),
          correo: data.correo_admin,
        }

        setPerfil(formattedProfile)
        setFormData({
          correo: data.correo_admin,
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        })

        // Cargar estado de intentos desde localStorage
        const intentosGuardados = localStorage.getItem('intentosCambioContrasena')
        const tiempoBloqueo = localStorage.getItem('tiempoBloqueoContrasena')
        
        if (intentosGuardados) {
          setIntentos(parseInt(intentosGuardados))
        }

        if (tiempoBloqueo && new Date().getTime() < parseInt(tiempoBloqueo)) {
          setBloqueado(true)
          const tiempoRestanteCalc = parseInt(tiempoBloqueo) - new Date().getTime()
          setTiempoRestante(tiempoRestanteCalc)
        }
      } catch (error) {
        console.error('Error al cargar el perfil:', error)
        setError(error.message || 'No se pudieron cargar los datos del perfil.')
      } finally {
        setLoading(false)
      }
    }

    fetchAdminData()
  }, [])

  // Contador regresivo cuando está bloqueado
  useEffect(() => {
    let intervalo;
    if (bloqueado && tiempoRestante > 0) {
      intervalo = setInterval(() => {
        setTiempoRestante(prev => {
          if (prev <= 1000) {
            setBloqueado(false)
            setIntentos(0)
            localStorage.removeItem('tiempoBloqueoContrasena')
            localStorage.removeItem('intentosCambioContrasena')
            return 0
          }
          return prev - 1000
        })
      }, 1000)
    }
    return () => clearInterval(intervalo)
  }, [bloqueado, tiempoRestante])

  // Manejar cambios en el formulario
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  // Validar contraseña actual
  const validateCurrentPassword = async () => {
    try {
      const adminDataString = localStorage.getItem('adminData')
      const adminData = JSON.parse(adminDataString)
      const adminId = adminData.id_admin

      const response = await api.post(
        `/administrators/validate-password`,
        {
          adminId: parseInt(adminId),
          password: formData.currentPassword,
        }
      )

      return response.data.valid
    } catch (error) {
      console.error('Error validando contraseña:', error)
      return false
    }
  }

  // Función para formatear el tiempo restante
  const formatearTiempo = (milisegundos) => {
    const minutos = Math.ceil(milisegundos / 1000 / 60)
    return `${minutos} minuto${minutos !== 1 ? 's' : ''}`
  }

  // Validar formulario completo con límite de intentos
  const validateForm = async () => {
    if (bloqueado) {
      setError(`Debes esperar ${formatearTiempo(tiempoRestante)} antes de intentar cambiar la contraseña nuevamente.`)
      return false
    }

    if (intentos >= 3) {
      // Bloquear por 30 minutos
      const tiempoBloqueo = new Date().getTime() + (30 * 60 * 1000)
      localStorage.setItem('tiempoBloqueoContrasena', tiempoBloqueo.toString())
      setBloqueado(true)
      setTiempoRestante(30 * 60 * 1000)
      setError('Has excedido el número máximo de intentos. Intenta nuevamente en 30 minutos.')
      return false
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    if (!formData.correo || !emailRegex.test(formData.correo.trim())) {
      setError(
        'Por favor ingresa un email válido (ejemplo: usuario@dominio.com)'
      )
      return false
    }

    // Si se intenta cambiar la contraseña, validar contraseña actual
    if (formData.newPassword || formData.confirmPassword) {
      if (!formData.currentPassword) {
        setError(
          'Debes ingresar tu contraseña actual para cambiar la contraseña'
        )
        return false
      }

      const isCurrentPasswordValid = await validateCurrentPassword()
      if (!isCurrentPasswordValid) {
        const nuevosIntentos = intentos + 1
        setIntentos(nuevosIntentos)
        localStorage.setItem('intentosCambioContrasena', nuevosIntentos.toString())
        
        if (nuevosIntentos >= 3) {
          const tiempoBloqueo = new Date().getTime() + (30 * 60 * 1000)
          localStorage.setItem('tiempoBloqueoContrasena', tiempoBloqueo.toString())
          setBloqueado(true)
          setTiempoRestante(30 * 60 * 1000)
          setError('Has excedido el número máximo de intentos. Intenta nuevamente en 30 minutos.')
        } else {
          setError(`Contraseña actual incorrecta. Intentos restantes: ${3 - nuevosIntentos}`)
        }
        return false
      }

      if (formData.newPassword.length < 6) {
        setError('La nueva contraseña debe tener al menos 6 caracteres')
        return false
      }

      if (formData.newPassword !== formData.confirmPassword) {
        setError('Las nuevas contraseñas no coinciden')
        return false
      }
    }

    return true
  }

  // Guardar cambios - SOLO CORREO Y CONTRASEÑA
  const handleSaveChanges = async () => {
    try {
      setError('')
      setSuccess('')

      const adminDataString = localStorage.getItem('adminData')
      const adminData = JSON.parse(adminDataString)
      const adminId = adminData.id_admin

      if (!(await validateForm())) {
        return
      }

      // ✅ PREPARAR DATOS - SOLO CORREO Y CONTRASEÑA
      const updateData = {
        correo_admin: formData.correo.trim(),
      }

      // ✅ AGREGAR CONTRASEÑA SOLO SI SE PROPORCIONÓ UNA NUEVA
      if (formData.newPassword) {
        updateData.contrasena_admin = formData.newPassword
      }

      // ✅ VERIFICAR SI HAY CAMBIOS REALES
      const hasEmailChanged = formData.correo.trim() !== perfil.correo
      const hasPasswordChanged = formData.newPassword.length > 0

      if (!hasEmailChanged && !hasPasswordChanged) {
        setError('No hay cambios que guardar')
        return
      }

      console.log('📤 Enviando actualización:', updateData)

      setUpdating(true)

      // eslint-disable-next-line no-unused-vars
      const response = await api.patch(
        `/administrators/${adminId}`,
        updateData
      )

      // ✅ ACTUALIZAR ESTADO
      setPerfil((prev) => ({
        ...prev,
        correo: formData.correo,
      }))

      // ✅ RESETEAR CAMPOS DE CONTRASEÑA Y CONTADOR DE INTENTOS
      setFormData((prev) => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      }))

      // ✅ RESETEAR INTENTOS EN ÉXITO
      setIntentos(0)
      localStorage.removeItem('intentosCambioContrasena')
      localStorage.removeItem('tiempoBloqueoContrasena')

      setIsEditing(false)
      setSuccess('¡Perfil actualizado con éxito!')

      // ✅ ACTUALIZAR LOCALSTORAGE
      const updatedAdminData = {
        ...adminData,
        correo_admin: formData.correo.trim(),
      }
      localStorage.setItem('adminData', JSON.stringify(updatedAdminData))

      setTimeout(() => setSuccess(''), 5000)
    } catch (error) {
      console.error('Error actualizando perfil:', error)
      let errorMessage = 'Error al actualizar el perfil'

      if (error.response?.data) {
        const errorData = error.response.data
        if (Array.isArray(errorData.message)) {
          errorMessage =
            'Errores de validación:\n' + errorData.message.join('\n• ')
        } else if (errorData.message) {
          errorMessage = errorData.message
        } else if (errorData.error) {
          errorMessage = errorData.error
        }
      } else {
        errorMessage = error.message || 'Error de conexión'
      }

      setError(errorMessage)
    } finally {
      setUpdating(false)
    }
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    setFormData({
      correo: perfil?.correo || '',
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    })
    setError('')
    setSuccess('')
  }

  const handleStartEditing = () => {
    setIsEditing(true)
    setFormData((prev) => ({
      ...prev,
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    }))
    setError('')
    setSuccess('')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-blue-50 text-gray-800">
        <Navbar_admin />
        <div className="h-20"></div>
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900 mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando perfil...</p>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  if (!perfil) {
    return (
      <div className="min-h-screen flex flex-col bg-blue-50 text-gray-800">
        <Navbar_admin />
        <div className="h-20"></div>
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center max-w-md mx-auto p-6">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <p className="text-red-600 text-lg mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="w-full px-6 py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-800 transition-colors"
            >
              Reintentar
            </button>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-blue-50 text-gray-800">
      <Navbar_admin />
      <div className="h-20"></div>

      {success && (
        <div className="max-w-4xl mx-auto w-full px-8 mt-10">
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg mb-4">
            <p>{success}</p>
          </div>
        </div>
      )}

      {error && (
        <div className="max-w-4xl mx-auto w-full px-8">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
            <p>{error}</p>
          </div>
        </div>
      )}

      <main className="flex-grow max-w-4xl mx-auto p-8 w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-blue-900">
              Perfil de Administrador
            </h2>
            <button
              onClick={isEditing ? handleCancelEdit : handleStartEditing}
              disabled={bloqueado}
              className={`px-6 py-3 text-sm font-semibold rounded-lg transition-colors flex items-center shadow-md ${
                bloqueado 
                  ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
                  : 'bg-blue-900 text-white hover:bg-blue-800'
              }`}
            >
              <FaPen className="mr-2" />
              {isEditing ? 'Cancelar Edición' : 'Editar Perfil'}
              {bloqueado && ' (Bloqueado)'}
            </button>
          </div>

          {/* Alerta de bloqueo */}
          {bloqueado && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
              <div className="flex items-center">
                <FaExclamationTriangle className="text-red-500 mr-3 text-xl" />
                <div>
                  <p className="font-bold text-red-700">Cambio de contraseña bloqueado</p>
                  <p className="text-red-600 text-sm">
                    Has excedido el número máximo de intentos. Podrás intentar nuevamente en{' '}
                    <span className="font-bold">{formatearTiempo(tiempoRestante)}</span>.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Información de intentos */}
          {!bloqueado && intentos > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
              <div className="flex items-center">
                <FaClock className="text-yellow-600 mr-3 text-xl" />
                <div>
                  <p className="font-bold text-yellow-700">Intentos fallidos</p>
                  <p className="text-yellow-600 text-sm">
                    Has tenido {intentos} intento(s) fallido(s). Te quedan {3 - intentos} intento(s) restante(s).
                  </p>
                </div>
              </div>
            </div>
          )}

          {perfil && (
            <div className="space-y-8">
              {/* ✅ INFORMACIÓN PERSONAL - MEJOR DISEÑO */}
              <div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
                <h3 className="text-xl font-bold text-blue-900 mb-4 flex items-center">
                  <FaUser className="mr-2" />
                  Información Personal
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                      <p className="text-xs font-bold text-gray-500 mb-1">Nombre Completo</p>
                      <p className="font-semibold text-gray-800 text-lg">{perfil.nombre} {perfil.apellido}</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                      <p className="text-xs font-bold text-gray-500 mb-1">Tipo de Documento</p>
                      <p className="font-semibold text-gray-800 text-lg">{perfil.tipoDoc}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                      <p className="text-xs font-bold text-gray-500 mb-1">Número de Documento</p>
                      <p className="font-semibold text-gray-800 text-lg">{perfil.numeroDoc}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* ✅ CAMPOS EDITABLES - MEJOR SEPARADOS */}
              <div className="bg-yellow-50 p-6 rounded-xl border border-yellow-200">
                <h3 className="text-xl font-bold text-yellow-900 mb-6 flex items-center">
                  <FaEnvelope className="mr-2" />
                  Configuración de Cuenta
                </h3>
                
                <div className="space-y-6">
                  {/* ✅ CORREO ELECTRÓNICO - SEPARADO */}
                  <div className="bg-white p-5 rounded-lg border-2 border-dashed border-blue-300 shadow-sm">
                    <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center">
                      <FaEnvelope className="inline mr-2 text-blue-600" />
                      Correo Electrónico
                    </label>
                    {isEditing ? (
                      <div className="space-y-2">
                        <input
                          type="email"
                          name="correo"
                          value={formData.correo}
                          onChange={handleChange}
                          className="w-full font-semibold text-gray-800 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          placeholder="Ingresa tu correo electrónico"
                          disabled={bloqueado}
                        />
                        <p className="text-xs text-gray-500">Este será tu nuevo correo de contacto</p>
                      </div>
                    ) : (
                      <div>
                        <p className="font-semibold text-gray-800 text-lg bg-gray-50 p-3 rounded-md">{perfil.correo}</p>
                        <p className="text-xs text-gray-500 mt-1">Correo actual de tu cuenta</p>
                      </div>
                    )}
                  </div>

                  {isEditing && (
                    <div className="space-y-6">
                      {/* ✅ CONTRASEÑA ACTUAL - SEPARADO */}
                      <div className="bg-white p-5 rounded-lg border-2 border-dashed border-orange-300 shadow-sm">
                        <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center">
                          <FaLock className="inline mr-2 text-orange-600" />
                          Contraseña Actual
                        </label>
                        <div className="space-y-2">
                          <input
                            type="password"
                            name="currentPassword"
                            value={formData.currentPassword}
                            onChange={handleChange}
                            className="w-full font-semibold text-gray-800 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                            placeholder="Ingresa tu contraseña actual"
                            disabled={bloqueado}
                          />
                          <p className="text-xs text-orange-600 font-medium">
                            {bloqueado 
                              ? 'Campo bloqueado temporalmente' 
                              : 'Requerida para realizar cualquier cambio'
                            }
                          </p>
                        </div>
                      </div>

                      {/* ✅ NUEVA CONTRASEÑA - SEPARADO */}
                      <div className="bg-white p-5 rounded-lg border-2 border-dashed border-green-300 shadow-sm">
                        <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center">
                          <FaLock className="inline mr-2 text-green-600" />
                          Nueva Contraseña
                        </label>
                        <div className="space-y-2">
                          <input
                            type="password"
                            name="newPassword"
                            value={formData.newPassword}
                            onChange={handleChange}
                            className="w-full font-semibold text-gray-800 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                            placeholder="Dejar en blanco para no cambiar"
                            disabled={bloqueado}
                          />
                          <p className="text-xs text-gray-500">
                            {bloqueado 
                              ? 'Cambio de contraseña bloqueado temporalmente' 
                              : 'Mínimo 6 caracteres. Campo opcional.'
                            }
                          </p>
                        </div>
                      </div>

                      {/* ✅ CONFIRMAR CONTRASEÑA - SEPARADO */}
                      <div className="bg-white p-5 rounded-lg border-2 border-dashed border-purple-300 shadow-sm">
                        <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center">
                          <FaLock className="inline mr-2 text-purple-600" />
                          Confirmar Nueva Contraseña
                        </label>
                        <div className="space-y-2">
                          <input
                            type="password"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            className="w-full font-semibold text-gray-800 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                            placeholder="Confirmar nueva contraseña"
                            disabled={bloqueado}
                          />
                          <p className="text-xs text-gray-500">
                            {bloqueado 
                              ? 'Campo bloqueado temporalmente' 
                              : 'Debe coincidir con la nueva contraseña'
                            }
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {isEditing && (
                  <div className="flex justify-end space-x-4 mt-8 pt-6 border-t border-gray-200">
                    <button
                      onClick={handleCancelEdit}
                      className="px-8 py-3 text-sm font-semibold text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors shadow-sm flex items-center"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleSaveChanges}
                      disabled={updating || bloqueado}
                      className={`px-8 py-3 text-sm font-semibold rounded-lg transition-colors flex items-center shadow-md ${
                        bloqueado || updating
                          ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                          : 'bg-green-600 text-white hover:bg-green-700'
                      }`}
                    >
                      <FaSave className="mr-2" />
                      {bloqueado ? 'Bloqueado' : updating ? 'Guardando...' : 'Guardar Cambios'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default Mi_perfil_admin