/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import NavbarCandidato from '../components/NavbarCandidato'
import Footer from '../components/Footer'
import axios from 'axios'
import {
  FaEnvelope,
  FaPen,
  FaCamera,
  FaSave,
  FaTrash,
  FaUpload,
  FaLock,
  FaSignOutAlt,
  FaVoteYea,
  FaUser,
  FaIdCard,
  FaUniversity,
  FaExclamationTriangle,
  FaClock,
  FaCheck,
  FaTimes,
  FaEye,
  FaEyeSlash,
  FaExclamationCircle
} from 'react-icons/fa'

const API_BASE_URL = 'http://localhost:3000'

export default function MiPerfilCandidato() {
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    tipo_doc_candidate: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [photoUploading, setPhotoUploading] = useState(false)
  const [withdrawConfirm, setWithdrawConfirm] = useState(false)
  const [withdrawPassword, setWithdrawPassword] = useState('')
  const [showWithdrawPassword, setShowWithdrawPassword] = useState(false)

  // Estados para visibilidad de contraseñas
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Estados para modales
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [showErrorModal, setShowErrorModal] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [showPhotoSuccessModal, setShowPhotoSuccessModal] = useState(false)
  const [photoSuccessMessage, setPhotoSuccessMessage] = useState('')
  const [showPhotoErrorModal, setShowPhotoErrorModal] = useState(false)
  const [photoErrorMessage, setPhotoErrorMessage] = useState('')

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

  // ✅ CARGAR ESTADO DE INTENTOS AL INICIAR
  useEffect(() => {
    // Cargar estado de intentos desde localStorage
    const intentosGuardados = localStorage.getItem('intentosCambioContrasenaCandidato')
    const tiempoBloqueo = localStorage.getItem('tiempoBloqueoContrasenaCandidato')
    
    if (intentosGuardados) {
      setIntentos(parseInt(intentosGuardados))
    }

    if (tiempoBloqueo && new Date().getTime() < parseInt(tiempoBloqueo)) {
      setBloqueado(true)
      const tiempoRestanteCalc = parseInt(tiempoBloqueo) - new Date().getTime()
      setTiempoRestante(tiempoRestanteCalc)
    }
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
            localStorage.removeItem('tiempoBloqueoContrasenaCandidato')
            localStorage.removeItem('intentosCambioContrasenaCandidato')
            return 0
          }
          return prev - 1000
        })
      }, 1000)
    }
    return () => clearInterval(intervalo)
  }, [bloqueado, tiempoRestante])

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
      const candidateId = localStorage.getItem('candidateId')
      
      const response = await axios.post(`${API_BASE_URL}/candidates/validate-password`, {
        candidateId: parseInt(candidateId),
        password: formData.newPassword
      })

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

  // ✅ FUNCIÓN PARA MOSTRAR MODAL DE ÉXITO DE FOTO
  const showPhotoSuccessMessage = (message) => {
    setPhotoSuccessMessage(message);
    setShowPhotoSuccessModal(true);
  };

  // ✅ FUNCIÓN PARA MOSTRAR MODAL DE ERROR DE FOTO
  const showPhotoErrorMessage = (message) => {
    setPhotoErrorMessage(message);
    setShowPhotoErrorModal(true);
  };

  // ✅ FUNCIÓN PARA CARGAR EL PERFIL
  const loadCandidateProfile = useCallback(async () => {
    try {
      setLoading(true)

      const candidateId = localStorage.getItem('candidateId')
      const userRole = localStorage.getItem('userRole')

      if (userRole !== 'candidate' || !candidateId) {
        showErrorMessage('No tienes permisos para acceder a esta página. Debes iniciar sesión como candidato.')
        setLoading(false)
        return
      }

      const response = await axios.get(`${API_BASE_URL}/candidates/${candidateId}`)
      const candidateData = response.data

      let fotoUrl = '/img/default-avatar.png'
      if (candidateData.foto_candidate) {
        if (candidateData.foto_candidate.startsWith('http')) {
          fotoUrl = candidateData.foto_candidate
        } 
        else if (candidateData.foto_candidate.startsWith('/')) {
          fotoUrl = `${API_BASE_URL}${candidateData.foto_candidate}`
        }
        else {
          fotoUrl = `${API_BASE_URL}/uploads/candidatos/${candidateData.foto_candidate}`
        }
        fotoUrl += `?t=${Date.now()}`
      }

      const profileData = {
        id_candidato: candidateData.id_candidate,
        nombre: candidateData.nombre_candidate,
        apellido: candidateData.apellido_candidate,
        tipo_documento: candidateData.tipo_doc_candidate,
        numero_documento: candidateData.num_doc_candidate,
        correo: candidateData.correo_candidate,
        estado: candidateData.estado_candidate,
        foto: fotoUrl,
        foto_original: candidateData.foto_candidate,
        eleccion: candidateData.election?.nombre_election || 'No postulado',
        id_eleccion: candidateData.election?.id_election || null,
      }

      setProfile(profileData)
      setFormData({
        email: profileData.correo,
        tipo_doc_candidate: profileData.tipo_documento,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
      localStorage.setItem('candidateData', JSON.stringify(candidateData))
      
    } catch (err) {
      console.error('❌ Error loading candidate profile:', err)
      showErrorMessage('Error al cargar el perfil: ' + (err.response?.data?.message || err.message))
      loadFromLocalStorage()
    } finally {
      setLoading(false)
    }
  }, [])

  // ✅ FUNCIÓN PARA CARGAR DESDE LOCALSTORAGE
  const loadFromLocalStorage = () => {
    try {
      const candidateData = localStorage.getItem('candidateData')
      if (candidateData) {
        const parsedData = JSON.parse(candidateData)
        const profileData = {
          id_candidato: parsedData.id_candidate,
          nombre: parsedData.nombre_candidate,
          apellido: parsedData.apellido_candidate,
          tipo_documento: parsedData.tipo_doc_candidate,
          numero_documento: parsedData.num_doc_candidate,
          correo: parsedData.correo_candidate,
          estado: parsedData.estado_candidate,
          foto: parsedData.foto_candidate ? 
                `${API_BASE_URL}${parsedData.foto_candidate}?t=${Date.now()}` : 
                '/img/default-avatar.png',
          eleccion: parsedData.election?.nombre_election || 'No postulado',
          id_eleccion: parsedData.election?.id_election || null,
        }
        setProfile(profileData)
        setFormData({
          email: profileData.correo,
          tipo_doc_candidate: profileData.tipo_documento,
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        })
      } else {
        showErrorMessage('No se encontraron datos del candidato. Por favor, inicia sesión nuevamente.')
      }
    } catch (error) {
      console.error('Error loading from localStorage:', error)
      showErrorMessage('Error al cargar los datos del almacenamiento local')
    }
  }

  // ✅ FUNCIÓN PARA MANEJAR CAMBIOS EN EL FORMULARIO
  const handleInputChange = (e) => {
    const { name, value } = e.target
    
    // Limitar la longitud de la contraseña a 20 caracteres
    if (name === 'newPassword' && value.length > 20) {
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  // ✅ FUNCIÓN PARA VALIDAR CONTRASEÑA ACTUAL
  const validateCurrentPassword = async () => {
    try {
      const candidateId = localStorage.getItem('candidateId')
      
      const response = await axios.post(`${API_BASE_URL}/candidates/validate-password`, {
        candidateId: parseInt(candidateId),
        password: formData.currentPassword
      })

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

  // ✅ FUNCIÓN PARA VALIDAR FORMULARIO COMPLETO CON LÍMITE DE INTENTOS
  const validateForm = async () => {
    if (bloqueado) {
      showErrorMessage(`Debes esperar ${formatearTiempo(tiempoRestante)} antes de intentar cambiar la contraseña nuevamente.`)
      return false
    }

    if (intentos >= 3) {
      // Bloquear por 30 minutos
      const tiempoBloqueo = new Date().getTime() + (30 * 60 * 1000)
      localStorage.setItem('tiempoBloqueoContrasenaCandidato', tiempoBloqueo.toString())
      setBloqueado(true)
      setTiempoRestante(30 * 60 * 1000)
      showErrorMessage('Has excedido el número máximo de intentos. Intenta nuevamente en 30 minutos.')
      return false
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    
    if (!formData.email || !emailRegex.test(formData.email.trim())) {
      showErrorMessage('Por favor ingresa un email válido (ejemplo: usuario@dominio.com)')
      return false
    }

    // Validar tipo de documento
    if (!formData.tipo_doc_candidate) {
      showErrorMessage('Por favor selecciona un tipo de documento')
      return false
    }

    // Si se intenta cambiar la contraseña, validar contraseña actual
    if (formData.newPassword || formData.confirmPassword) {
      if (!formData.currentPassword) {
        showErrorMessage('Debes ingresar tu contraseña actual para cambiar la contraseña')
        return false
      }

      // Validar que la contraseña actual sea correcta
      const isCurrentPasswordValid = await validateCurrentPassword()
      if (!isCurrentPasswordValid) {
        const nuevosIntentos = intentos + 1
        setIntentos(nuevosIntentos)
        localStorage.setItem('intentosCambioContrasenaCandidato', nuevosIntentos.toString())
        
        if (nuevosIntentos >= 3) {
          const tiempoBloqueo = new Date().getTime() + (30 * 60 * 1000)
          localStorage.setItem('tiempoBloqueoContrasenaCandidato', tiempoBloqueo.toString())
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

  // ✅ FUNCIÓN PARA GUARDAR CAMBIOS
  const handleSaveChanges = async () => {
    try {
      setUpdating(true)

      const candidateId = localStorage.getItem('candidateId')
      
      if (!candidateId) {
        showErrorMessage('Error: No se encontró el ID del candidato')
        return
      }

      if (!await validateForm()) {
        return
      }

      // ✅ PREPARAR DATOS CON LOS NOMBRES EXACTOS QUE ESPERA EL DTO
      const updateData = {}

      // Solo enviar correo si cambió
      if (formData.email.trim() !== profile.correo) {
        updateData.correo_candidate = formData.email.trim()
      }

      // Solo enviar tipo de documento si cambió
      if (formData.tipo_doc_candidate !== profile.tipo_documento) {
        updateData.tipo_doc_candidate = formData.tipo_doc_candidate
      }

      // Solo enviar contraseña si se proporcionó una nueva
      if (formData.newPassword) {
        updateData.contrasena_candidate = formData.newPassword
      }

      // Verificar si hay cambios reales
      const hasEmailChanged = formData.email.trim() !== profile.correo
      const hasTipoDocumentoChanged = formData.tipo_doc_candidate !== profile.tipo_documento
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
        `${API_BASE_URL}/candidates/${candidateId}`,
        updateData,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      )

      console.log('✅ Perfil actualizado con éxito:', response.data)

      // ✅ ACTUALIZAR ESTADO
      setProfile((prev) => ({
        ...prev,
        correo: formData.email,
        tipo_documento: formData.tipo_doc_candidate
      }))

      // ✅ RESETEAR CAMPOS Y CONTADOR DE INTENTOS
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }))

      // ✅ RESETEAR VISIBILIDAD DE CONTRASEÑAS
      setShowCurrentPassword(false)
      setShowNewPassword(false)
      setShowConfirmPassword(false)

      // ✅ RESETEAR INTENTOS EN ÉXITO
      setIntentos(0)
      localStorage.removeItem('intentosCambioContrasenaCandidato')
      localStorage.removeItem('tiempoBloqueoContrasenaCandidato')

      setIsEditing(false)
      showSuccessMessage('¡Perfil actualizado con éxito!')
      
      // ✅ ACTUALIZAR LOCALSTORAGE
      const updatedCandidateData = {
        ...JSON.parse(localStorage.getItem('candidateData') || '{}'),
        correo_candidate: formData.email.trim(),
        tipo_doc_candidate: formData.tipo_doc_candidate
      }
      localStorage.setItem('candidateData', JSON.stringify(updatedCandidateData))
      
    } catch (error) {
      console.error('❌ Error actualizando perfil:', error)
      
      let errorMessage = 'Error al actualizar el perfil'
      
      if (error.response?.data) {
        const errorData = error.response.data
        
        if (Array.isArray(errorData.message)) {
          errorMessage = 'Errores de validación:\n' + errorData.message.join('\n• ')
        } 
        else if (errorData.message) {
          errorMessage = errorData.message
        }
        else if (errorData.error) {
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

  // ✅ FUNCIÓN PARA RETIRARSE DE ELECCIÓN
  const handleWithdrawFromElection = async () => {
    try {
      if (!withdrawPassword) {
        showErrorMessage('Debes ingresar tu contraseña para confirmar el retiro')
        return
      }

      const candidateId = localStorage.getItem('candidateId')
      
      // Validar contraseña
      const response = await axios.post(`${API_BASE_URL}/candidates/validate-password`, {
        candidateId: parseInt(candidateId),
        password: withdrawPassword
      })

      if (!response.data.valid) {
        showErrorMessage('La contraseña es incorrecta')
        return
      }

      // Realizar el retiro de la elección
      const withdrawResponse = await axios.patch(
        `${API_BASE_URL}/candidates/${candidateId}/withdraw-election`
      )

      console.log('✅ Retiro exitoso:', withdrawResponse.data)

      showSuccessMessage('¡Te has retirado exitosamente de la elección!')
      setWithdrawConfirm(false)
      setWithdrawPassword('')
      setShowWithdrawPassword(false)
      
      // Recargar perfil para actualizar datos
      loadCandidateProfile()
      
    } catch (error) {
      console.error('❌ Error retirándose de elección:', error)
      
      let errorMessage = 'Error al retirarse de la elección'
      
      if (error.response?.data) {
        const errorData = error.response.data
        errorMessage = errorData.message || errorData.error || errorMessage
      }
      
      showErrorMessage(errorMessage)
    }
  }

  // ✅ FUNCIONES PARA MANEJO DE FOTOS
  const handlePhotoUpload = async (file) => {
    try {
      setPhotoUploading(true)

      const candidateId = localStorage.getItem('candidateId')
      
      if (!candidateId) {
        showPhotoErrorMessage('No se encontró el ID del candidato')
        return
      }

      const validTypes = ['image/jpeg', 'image/jpg', 'image/png']
      const maxSize = 5 * 1024 * 1024

      if (!validTypes.includes(file.type)) {
        showPhotoErrorMessage('Solo se permiten imágenes JPG, JPEG o PNG')
        return
      }

      if (file.size > maxSize) {
        showPhotoErrorMessage('La imagen no debe superar los 5MB')
        return
      }

      const formData = new FormData()
      formData.append('photo', file)

      const response = await axios.post(
        `${API_BASE_URL}/candidates/${candidateId}/photo`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      )

      const newPhotoUrl = `${API_BASE_URL}${response.data.foto_candidate}?t=${Date.now()}`
      
      setProfile(prev => ({
        ...prev,
        foto: newPhotoUrl,
        foto_original: response.data.foto_candidate
      }))

      const updatedCandidateData = {
        ...JSON.parse(localStorage.getItem('candidateData') || '{}'),
        foto_candidate: response.data.foto_candidate
      }
      localStorage.setItem('candidateData', JSON.stringify(updatedCandidateData))

      showPhotoSuccessMessage('¡Foto actualizada exitosamente!')

    } catch (error) {
      console.error('❌ Error subiendo foto:', error)
      const errorMessage = error.response?.data?.message || 'Error al subir la foto'
      showPhotoErrorMessage(errorMessage)
    } finally {
      setPhotoUploading(false)
    }
  }

  const handleDeletePhoto = async () => {
    if (!confirm('¿Estás seguro de que quieres eliminar tu foto de perfil?')) {
      return
    }

    try {
      setPhotoUploading(true)
      const candidateId = localStorage.getItem('candidateId')

      if (!candidateId) {
        showPhotoErrorMessage('No se encontró el ID del candidato')
        return
      }

      await axios.delete(`${API_BASE_URL}/candidates/${candidateId}/photo`)

      setProfile(prev => ({
        ...prev,
        foto: '/img/default-avatar.png',
        foto_original: null
      }))

      const updatedCandidateData = {
        ...JSON.parse(localStorage.getItem('candidateData') || '{}'),
        foto_candidate: null
      }
      localStorage.setItem('candidateData', JSON.stringify(updatedCandidateData))

      showPhotoSuccessMessage('¡Foto eliminada exitosamente!')

    } catch (error) {
      console.error('❌ Error eliminando foto:', error)
      const errorMessage = error.response?.data?.message || 'Error al eliminar la foto'
      showPhotoErrorMessage(errorMessage)
    } finally {
      setPhotoUploading(false)
    }
  }

  const handlePhotoChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      const previewUrl = URL.createObjectURL(file)
      setProfile(prev => ({ ...prev, foto: previewUrl }))
      handlePhotoUpload(file)
      e.target.value = ''
    }
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    setFormData({
      email: profile?.correo || '',
      tipo_doc_candidate: profile?.tipo_documento || '',
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    })
    setShowCurrentPassword(false)
    setShowNewPassword(false)
    setShowConfirmPassword(false)
  }

  const handleStartEditing = () => {
    setIsEditing(true)
    setFormData({
      email: profile?.correo || '',
      tipo_doc_candidate: profile?.tipo_documento || '',
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    })
  }

  useEffect(() => {
    loadCandidateProfile()
  }, [loadCandidateProfile])

  const handleRetry = () => {
    setLoading(true)
    loadCandidateProfile()
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-blue-50 text-gray-800">
        <NavbarCandidato />
        <div className="h-20"></div>
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900 mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando perfil...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-blue-50 text-gray-800">
      <NavbarCandidato />
      <div className="h-20"></div>

      <main className="flex-grow max-w-4xl mx-auto p-8 w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-blue-900">
              Perfil de Candidato
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

          {profile && (
            <div className="space-y-8">
              {/* ✅ SECCIÓN FOTO E INFORMACIÓN BÁSICA */}
              <div className="flex flex-col lg:flex-row items-start gap-8">
                {/* Sección de la foto */}
                <div className="flex flex-col items-center lg:items-start">
                  <div className="relative w-48 h-48 rounded-full overflow-hidden mb-4 border-4 border-blue-200 shadow-lg">
                    <img 
                      src={profile.foto} 
                      alt="Foto de Perfil" 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = '/img/default-avatar.png'
                      }}
                    />
                    
                    {!photoUploading && (
                      <label htmlFor="photo-upload" className="absolute inset-0 bg-black bg-opacity-40 flex flex-col items-center justify-center cursor-pointer opacity-0 hover:opacity-100 transition-opacity">
                        <FaCamera className="text-white text-2xl mb-1" />
                        <span className="text-white text-xs text-center px-2">Cambiar foto</span>
                      </label>
                    )}

                    {photoUploading && (
                      <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                      </div>
                    )}
                  </div>

                  <input
                    id="photo-upload"
                    type="file"
                    accept="image/jpeg,image/jpg,image/png"
                    onChange={handlePhotoChange}
                    className="hidden"
                    disabled={photoUploading}
                  />

                  <div className="flex flex-col space-y-3 w-full max-w-xs">
                    <button
                      onClick={() => document.getElementById('photo-upload').click()}
                      disabled={photoUploading}
                      className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center disabled:opacity-50 shadow-sm"
                    >
                      <FaUpload className="mr-2" />
                      {photoUploading ? 'Subiendo...' : 'Nueva Foto'}
                    </button>

                    {profile.foto_original && profile.foto !== '/img/default-avatar.png' && (
                      <button
                        onClick={handleDeletePhoto}
                        disabled={photoUploading}
                        className="px-4 py-2 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center disabled:opacity-50 shadow-sm"
                      >
                        <FaTrash className="mr-2" />
                        Eliminar Foto
                      </button>
                    )}
                  </div>
                </div>

                {/* ✅ INFORMACIÓN PERSONAL - MEJOR DISEÑO */}
                <div className="flex-grow bg-blue-50 p-6 rounded-xl border border-blue-200">
                  <h3 className="text-xl font-bold text-blue-900 mb-4 flex items-center">
                    <FaUser className="mr-2" />
                    Información Personal
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                      <p className="text-xs font-bold text-gray-500 mb-1">Nombre Completo</p>
                      <p className="font-semibold text-gray-800 text-lg">{profile.nombre} {profile.apellido}</p>
                    </div>
                    
                    {/* Tipo de Documento - Ahora editable */}
                    <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                      <p className="text-xs font-bold text-gray-500 mb-1">Tipo de Documento</p>
                      {isEditing ? (
                        <select
                          name="tipo_doc_candidate"
                          value={formData.tipo_doc_candidate}
                          onChange={handleInputChange}
                          className="w-full font-semibold text-gray-800 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          disabled={bloqueado}
                        >
                          <option value="">Seleccione tipo</option>
                          <option value="CC">Cédula de Ciudadanía</option>
                          <option value="TI">Tarjeta de Identidad</option>
                          <option value="CE">Cédula de Extranjería</option>
                        </select>
                      ) : (
                        <p className="font-semibold text-gray-800 text-lg">{profile.tipo_documento}</p>
                      )}
                    </div>

                    <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                      <p className="text-xs font-bold text-gray-500 mb-1">Número de Documento</p>
                      <p className="font-semibold text-gray-800 text-lg">{profile.numero_documento}</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                      <p className="text-xs font-bold text-gray-500 mb-1">Estado</p>
                      <p className="font-semibold text-gray-800 text-lg">{profile.estado}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* ✅ INFORMACIÓN ELECTORAL */}
              <div className="bg-green-50 p-6 rounded-xl border border-green-200">
                <h3 className="text-xl font-bold text-green-900 mb-4 flex items-center">
                  <FaVoteYea className="mr-2" />
                  Información Electoral
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
                    <div className="flex items-center mb-3">
                      <FaUniversity className="text-green-600 mr-2 text-lg" />
                      <p className="text-sm font-bold text-gray-500">Elección</p>
                    </div>
                    <p className="font-semibold text-gray-800 text-lg">{profile.eleccion}</p>
                  </div>
                  <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
                    <div className="flex items-center mb-3">
                      <FaIdCard className="text-blue-600 mr-2 text-lg" />
                      <p className="text-sm font-bold text-gray-500">Estado Electoral</p>
                    </div>
                    <p className="font-semibold text-gray-800 text-lg">{profile.estado}</p>
                  </div>
                </div>

                {/* Botón para retirarse de elección */}
                {profile.id_eleccion && (
                  <div className="mt-6 bg-yellow-50 p-5 rounded-lg border border-yellow-200">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div>
                        <p className="text-sm font-semibold text-yellow-800">
                          Estás postulado a una elección
                        </p>
                        <p className="text-xs text-yellow-600 mt-1">
                          Si deseas retirarte, haz clic en el botón
                        </p>
                      </div>
                      <button
                        onClick={() => setWithdrawConfirm(true)}
                        className="px-6 py-3 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors flex items-center shadow-sm"
                      >
                        <FaSignOutAlt className="mr-2" />
                        Retirarse de Elección
                      </button>
                    </div>
                  </div>
                )}
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
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className="w-full font-semibold text-gray-800 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          placeholder="Ingresa tu correo electrónico"
                          disabled={bloqueado}
                        />
                        <p className="text-xs text-gray-500">Este será tu nuevo correo de contacto</p>
                      </div>
                    ) : (
                      <div>
                        <p className="font-semibold text-gray-800 text-lg bg-gray-50 p-3 rounded-md">{profile.correo}</p>
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
                              onChange={handleInputChange}
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
                              onChange={handleInputChange}
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
                              onChange={handleInputChange}
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

      {/* Modal de confirmación para retirarse de elección */}
      {withdrawConfirm && (
        <div className="fixed inset-0 bg-white/30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-lg font-bold text-red-600 mb-4">
              Confirmar Retiro de Elección
            </h3>
            <p className="text-gray-600 mb-4">
              ¿Estás seguro de que deseas retirarte de la elección "{profile.eleccion}"? 
              Esta acción no se puede deshacer.
            </p>
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Confirma tu contraseña:
              </label>
              <div className="relative">
                <input
                  type={showWithdrawPassword ? "text" : "password"}
                  value={withdrawPassword}
                  onChange={(e) => setWithdrawPassword(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 pr-10"
                  placeholder="Ingresa tu contraseña"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-600 hover:text-gray-800"
                  onClick={() => setShowWithdrawPassword(!showWithdrawPassword)}
                >
                  {showWithdrawPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setWithdrawConfirm(false)
                  setWithdrawPassword('')
                  setShowWithdrawPassword(false)
                }}
                className="px-6 py-3 text-sm font-semibold text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleWithdrawFromElection}
                className="px-6 py-3 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors flex items-center"
              >
                <FaSignOutAlt className="mr-2" />
                Confirmar Retiro
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de éxito para cambios generales */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaCheck className="text-green-600 text-2xl" />
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

      {/* Modal de éxito para fotos */}
      {showPhotoSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaCamera className="text-green-600 text-2xl" />
            </div>
            <h3 className="text-xl font-bold text-green-600 mb-2">¡Foto Actualizada!</h3>
            <p className="text-gray-600 mb-6">{photoSuccessMessage}</p>
            <button
              onClick={() => setShowPhotoSuccessModal(false)}
              className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
            >
              Aceptar
            </button>
          </div>
        </div>
      )}

      {/* Modal de error para fotos */}
      {showPhotoErrorModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaExclamationCircle className="text-red-600 text-2xl" />
            </div>
            <h3 className="text-xl font-bold text-red-600 mb-2">Error con Foto</h3>
            <p className="text-gray-600 mb-6">{photoErrorMessage}</p>
            <button
              onClick={() => setShowPhotoErrorModal(false)}
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