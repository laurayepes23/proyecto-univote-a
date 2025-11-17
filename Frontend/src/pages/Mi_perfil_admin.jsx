import React, { useState, useEffect } from 'react'
import Navbar_admin from '../components/Navbar_admin'
import Footer from '../components/Footer'
import axios from 'axios'
import {
  FaEnvelope,
  FaLock,
  FaSave,
  FaUser,
  FaIdCard,
  FaPen,
  FaExclamationTriangle,
  FaClock,
  FaEye,
  FaEyeSlash,
  FaCheck,
  FaTimes,
  FaExclamationCircle,
  FaCheckCircle
} from 'react-icons/fa'

const Mi_perfil_admin = () => {
  const [perfil, setPerfil] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    correo: '',
    tipo_doc_admin: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)

  // Estados para visibilidad de contraseñas
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Estados para modales
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [showErrorModal, setShowErrorModal] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  // Estados para el límite de intentos
  const [intentos, setIntentos] = useState(0)
  const [bloqueado, setBloqueado] = useState(false)
  const [tiempoRestante, setTiempoRestante] = useState(0)

  // Estados para validación de contraseña segura
  const [passwordRequirements, setPasswordRequirements] = useState({
    minLength: false,
    hasLowercase: false,
    hasUppercase: false,
    hasNumber: false,
    hasSpecialChar: false,
    maxLength: true
  })

  // ✅ VALIDAR CONTRASEÑA SEGURA EN TIEMPO REAL
  useEffect(() => {
    if (formData.newPassword) {
      const password = formData.newPassword;
      setPasswordRequirements({
        minLength: password.length >= 8,
        hasLowercase: /[a-z]/.test(password),
        hasUppercase: /[A-Z]/.test(password),
        hasNumber: /[0-9]/.test(password),
        hasSpecialChar: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password),
        maxLength: password.length <= 20
      });
    } else {
      setPasswordRequirements({
        minLength: false,
        hasLowercase: false,
        hasUppercase: false,
        hasNumber: false,
        hasSpecialChar: false,
        maxLength: true
      });
    }
  }, [formData.newPassword]);

  // ✅ FUNCIÓN PARA VALIDAR CONTRASEÑA SEGURA
  const validateSecurePassword = (password) => {
    const errors = [];
    
    if (password.length < 8) {
      errors.push("Mínimo 8 caracteres");
    }
    
    if (password.length > 20) {
      errors.push("Máximo 20 caracteres");
    }
    
    if (!/(?=.*[a-z])/.test(password)) {
      errors.push("Al menos una minúscula");
    }
    
    if (!/(?=.*[A-Z])/.test(password)) {
      errors.push("Al menos una mayúscula");
    }
    
    if (!/(?=.*\d)/.test(password)) {
      errors.push("Al menos un número");
    }
    
    if (!/(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?])/.test(password)) {
      errors.push("Al menos un carácter especial");
    }
    
    return errors.length > 0 ? errors.join(", ") : null;
  };

  // ✅ FUNCIÓN PARA VALIDAR QUE NO SEA LA MISMA CONTRASEÑA
  const validateSamePassword = async () => {
    if (!formData.newPassword || !formData.currentPassword) {
      return true; // No validar si no hay contraseñas
    }

    try {
      const adminDataString = localStorage.getItem('adminData')
      const adminData = JSON.parse(adminDataString)
      const adminId = adminData.id_admin

      const response = await axios.post(
        `http://localhost:3000/administrators/validate-password`,
        {
          adminId: parseInt(adminId),
          password: formData.newPassword,
        }
      )

      // Si la nueva contraseña es válida contra la actual, significa que son iguales
      if (response.data.valid) {
        return false; // Son la misma contraseña
      }
      
      return true; // No son la misma contraseña
    } catch (error) {
      console.error('Error validando misma contraseña:', error)
      return true; // En caso de error, permitir continuar
    }
  };

  // ✅ FUNCIÓN PARA MOSTRAR MODAL DE ÉXITO
  const showSuccessMessage = (message) => {
    setSuccessMessage(message);
    setShowSuccessModal(true);
  };

  // ✅ FUNCIÓN PARA MOSTRAR MODAL DE ERROR
  const showErrorMessage = (message) => {
    setErrorMessage(message);
    setShowErrorModal(true);
  };

  // ✅ COMPONENTE PARA MOSTRAR REQUISITOS DE CONTRASEÑA
  const PasswordRequirements = () => (
    <div className="mt-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
      <p className="text-sm font-semibold text-gray-700 mb-2">Requisitos de la contraseña:</p>
      <div className="space-y-1 text-xs">
        <div className={`flex items-center ${passwordRequirements.minLength ? 'text-green-600' : 'text-red-600'}`}>
          {passwordRequirements.minLength ? <FaCheck className="mr-2" /> : <FaTimes className="mr-2" />}
          Mínimo 8 caracteres
        </div>
        <div className={`flex items-center ${passwordRequirements.maxLength ? 'text-green-600' : 'text-red-600'}`}>
          {passwordRequirements.maxLength ? <FaCheck className="mr-2" /> : <FaTimes className="mr-2" />}
          Máximo 20 caracteres ({formData.newPassword.length}/20)
        </div>
        <div className={`flex items-center ${passwordRequirements.hasLowercase ? 'text-green-600' : 'text-red-600'}`}>
          {passwordRequirements.hasLowercase ? <FaCheck className="mr-2" /> : <FaTimes className="mr-2" />}
          Al menos una letra minúscula
        </div>
        <div className={`flex items-center ${passwordRequirements.hasUppercase ? 'text-green-600' : 'text-red-600'}`}>
          {passwordRequirements.hasUppercase ? <FaCheck className="mr-2" /> : <FaTimes className="mr-2" />}
          Al menos una letra mayúscula
        </div>
        <div className={`flex items-center ${passwordRequirements.hasNumber ? 'text-green-600' : 'text-red-600'}`}>
          {passwordRequirements.hasNumber ? <FaCheck className="mr-2" /> : <FaTimes className="mr-2" />}
          Al menos un número
        </div>
        <div className={`flex items-center ${passwordRequirements.hasSpecialChar ? 'text-green-600' : 'text-red-600'}`}>
          {passwordRequirements.hasSpecialChar ? <FaCheck className="mr-2" /> : <FaTimes className="mr-2" />}
          Al menos un carácter especial (!@#$%^&* etc.)
        </div>
      </div>
    </div>
  );

  // Cargar datos del administrador y estado de intentos
  useEffect(() => {
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

        const response = await axios.get(
          `http://localhost:3000/administrators/${adminId}`
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
          tipo_doc_admin: data.tipo_doc_admin,
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
        showErrorMessage(error.message || 'No se pudieron cargar los datos del perfil.')
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
    const { name, value } = e.target
    
    // Limitar la longitud de la contraseña a 20 caracteres
    if (name === 'newPassword' && value.length > 20) {
      return;
    }
    
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  // Validar contraseña actual
  const validateCurrentPassword = async () => {
    try {
      const adminDataString = localStorage.getItem('adminData')
      const adminData = JSON.parse(adminDataString)
      const adminId = adminData.id_admin

      const response = await axios.post(
        `http://localhost:3000/administrators/validate-password`,
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
      showErrorMessage(`Debes esperar ${formatearTiempo(tiempoRestante)} antes de intentar cambiar la contraseña nuevamente.`)
      return false
    }

    if (intentos >= 3) {
      // Bloquear por 30 minutos
      const tiempoBloqueo = new Date().getTime() + (30 * 60 * 1000)
      localStorage.setItem('tiempoBloqueoContrasena', tiempoBloqueo.toString())
      setBloqueado(true)
      setTiempoRestante(30 * 60 * 1000)
      showErrorMessage('Has excedido el número máximo de intentos. Intenta nuevamente en 30 minutos.')
      return false
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    if (!formData.correo || !emailRegex.test(formData.correo.trim())) {
      showErrorMessage(
        'Por favor ingresa un email válido (ejemplo: usuario@dominio.com)'
      )
      return false
    }

    // Validar tipo de documento
    if (!formData.tipo_doc_admin) {
      showErrorMessage('Por favor selecciona un tipo de documento')
      return false
    }

    // Si se intenta cambiar la contraseña, validar contraseña actual
    if (formData.newPassword || formData.confirmPassword) {
      if (!formData.currentPassword) {
        showErrorMessage(
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
          showErrorMessage('Has excedido el número máximo de intentos. Intenta nuevamente en 30 minutos.')
        } else {
          showErrorMessage(`Contraseña actual incorrecta. Intentos restantes: ${3 - nuevosIntentos}`)
        }
        return false
      }

      // Validar que no sea la misma contraseña
      const isDifferentPassword = await validateSamePassword()
      if (!isDifferentPassword) {
        showErrorMessage('No puedes usar la misma contraseña actual. Por favor, elige una contraseña diferente.')
        return false
      }

      // Validar contraseña segura
      const passwordError = validateSecurePassword(formData.newPassword)
      if (passwordError) {
        showErrorMessage(`La nueva contraseña no cumple con los requisitos: ${passwordError}`)
        return false
      }

      if (formData.newPassword !== formData.confirmPassword) {
        showErrorMessage('Las nuevas contraseñas no coinciden')
        return false
      }
    }

    return true
  }

  // Guardar cambios - CORREO, TIPO DOCUMENTO Y CONTRASEÑA
  const handleSaveChanges = async () => {
    try {
      setUpdating(true)

      const adminDataString = localStorage.getItem('adminData')
      const adminData = JSON.parse(adminDataString)
      const adminId = adminData.id_admin

      if (!(await validateForm())) {
        return
      }

      // ✅ PREPARAR DATOS - CORREO, TIPO DOCUMENTO Y CONTRASEÑA
      const updateData = {}

      // Solo enviar correo si cambió
      if (formData.correo.trim() !== perfil.correo) {
        updateData.correo_admin = formData.correo.trim()
      }

      // Solo enviar tipo de documento si cambió
      if (formData.tipo_doc_admin !== perfil.tipoDoc) {
        updateData.tipo_doc_admin = formData.tipo_doc_admin
      }

      // ✅ AGREGAR CONTRASEÑA SOLO SI SE PROPORCIONÓ UNA NUEVA
      if (formData.newPassword) {
        updateData.contrasena_admin = formData.newPassword
      }

      // ✅ VERIFICAR SI HAY CAMBIOS REALES
      const hasEmailChanged = formData.correo.trim() !== perfil.correo
      const hasTipoDocumentoChanged = formData.tipo_doc_admin !== perfil.tipoDoc
      const hasPasswordChanged = formData.newPassword.length > 0

      if (!hasEmailChanged && !hasTipoDocumentoChanged && !hasPasswordChanged) {
        showErrorMessage('No hay cambios que guardar')
        return
      }

      console.log('📤 Enviando actualización:', updateData)

      // ✅ ENVIAR SOLO SI HAY DATOS PARA ACTUALIZAR
      if (Object.keys(updateData).length === 0) {
        showErrorMessage('No hay cambios que guardar')
        return
      }

      const response = await axios.patch(
        `http://localhost:3000/administrators/${adminId}`,
        updateData
      )

      console.log('✅ Perfil actualizado con éxito:', response.data)

      // ✅ ACTUALIZAR ESTADO
      setPerfil((prev) => ({
        ...prev,
        correo: formData.correo,
        tipoDoc: formData.tipo_doc_admin
      }))

      // ✅ RESETEAR CAMPOS DE CONTRASEÑA Y CONTADOR DE INTENTOS
      setFormData((prev) => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      }))

      // ✅ RESETEAR VISIBILIDAD DE CONTRASEÑAS
      setShowCurrentPassword(false)
      setShowNewPassword(false)
      setShowConfirmPassword(false)

      // ✅ RESETEAR INTENTOS EN ÉXITO
      setIntentos(0)
      localStorage.removeItem('intentosCambioContrasena')
      localStorage.removeItem('tiempoBloqueoContrasena')

      setIsEditing(false)
      showSuccessMessage('¡Perfil actualizado con éxito!')

      // ✅ ACTUALIZAR LOCALSTORAGE
      const updatedAdminData = {
        ...adminData,
        correo_admin: formData.correo.trim(),
        tipo_doc_admin: formData.tipo_doc_admin
      }
      localStorage.setItem('adminData', JSON.stringify(updatedAdminData))

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

      showErrorMessage(errorMessage)
    } finally {
      setUpdating(false)
    }
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    setFormData({
      correo: perfil?.correo || '',
      tipo_doc_admin: perfil?.tipoDoc || '',
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    })
    setShowCurrentPassword(false)
    setShowNewPassword(false)
    setShowConfirmPassword(false)
  }

  const handleStartEditing = () => {
    setIsEditing(true)
    setFormData((prev) => ({
      ...prev,
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    }))
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
            <p className="text-red-600 text-lg mb-4">Error al cargar el perfil</p>
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
                    
                    {/* Tipo de Documento - Ahora editable */}
                    <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                      <p className="text-xs font-bold text-gray-500 mb-1">Tipo de Documento</p>
                      {isEditing ? (
                        <select
                          name="tipo_doc_admin"
                          value={formData.tipo_doc_admin}
                          onChange={handleChange}
                          className="w-full font-semibold text-gray-800 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          disabled={bloqueado}
                        >
                          <option value="">Seleccione tipo</option>
                          <option value="CC">Cédula de Ciudadanía</option>
                          <option value="TI">Tarjeta de Identidad</option>
                          <option value="CE">Cédula de Extranjería</option>
                        </select>
                      ) : (
                        <p className="font-semibold text-gray-800 text-lg">{perfil.tipoDoc}</p>
                      )}
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
                          <div className="relative">
                            <input
                              type={showCurrentPassword ? "text" : "password"}
                              name="currentPassword"
                              value={formData.currentPassword}
                              onChange={handleChange}
                              className="w-full font-semibold text-gray-800 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all pr-10"
                              placeholder="Ingresa tu contraseña actual"
                              disabled={bloqueado}
                            />
                            <button
                              type="button"
                              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-600 hover:text-gray-800"
                              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                            >
                              {showCurrentPassword ? <FaEyeSlash /> : <FaEye />}
                            </button>
                          </div>
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
                          <div className="relative">
                            <input
                              type={showNewPassword ? "text" : "password"}
                              name="newPassword"
                              value={formData.newPassword}
                              onChange={handleChange}
                              className="w-full font-semibold text-gray-800 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all pr-10"
                              placeholder="Ingresa nueva contraseña segura"
                              disabled={bloqueado}
                              maxLength={20}
                            />
                            <button
                              type="button"
                              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-600 hover:text-gray-800"
                              onClick={() => setShowNewPassword(!showNewPassword)}
                            >
                              {showNewPassword ? <FaEyeSlash /> : <FaEye />}
                            </button>
                          </div>
                          <p className="text-xs text-gray-500">
                            {bloqueado 
                              ? 'Cambio de contraseña bloqueado temporalmente' 
                              : 'La contraseña debe cumplir con todos los requisitos de seguridad'
                            }
                          </p>
                          
                          {/* Mostrar requisitos de contraseña cuando se esté escribiendo */}
                          {formData.newPassword && <PasswordRequirements />}
                        </div>
                      </div>

                      {/* ✅ CONFIRMAR CONTRASEÑA - SEPARADO */}
                      <div className="bg-white p-5 rounded-lg border-2 border-dashed border-purple-300 shadow-sm">
                        <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center">
                          <FaLock className="inline mr-2 text-purple-600" />
                          Confirmar Nueva Contraseña
                        </label>
                        <div className="space-y-2">
                          <div className="relative">
                            <input
                              type={showConfirmPassword ? "text" : "password"}
                              name="confirmPassword"
                              value={formData.confirmPassword}
                              onChange={handleChange}
                              className="w-full font-semibold text-gray-800 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all pr-10"
                              placeholder="Confirmar nueva contraseña"
                              disabled={bloqueado}
                            />
                            <button
                              type="button"
                              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-600 hover:text-gray-800"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            >
                              {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                            </button>
                          </div>
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

      {/* Modal de éxito para cambios generales */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaCheckCircle className="text-green-600 text-2xl" />
            </div>
            <h3 className="text-xl font-bold text-green-600 mb-2">¡Éxito!</h3>
            <p className="text-gray-600 mb-6">{successMessage}</p>
            <button
              onClick={() => setShowSuccessModal(false)}
              className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
            >
              Aceptar
            </button>
          </div>
        </div>
      )}

      {/* Modal de error para cambios generales */}
      {showErrorModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaExclamationCircle className="text-red-600 text-2xl" />
            </div>
            <h3 className="text-xl font-bold text-red-600 mb-2">Error</h3>
            <p className="text-gray-600 mb-6 whitespace-pre-line">{errorMessage}</p>
            <button
              onClick={() => setShowErrorModal(false)}
              className="w-full px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold"
            >
              Aceptar
            </button>
          </div>
        </div>
      )}

    </div>
  )
}

export default Mi_perfil_admin