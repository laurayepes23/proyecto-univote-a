// Login.js (COMPLETO CORREGIDO)
import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api/axios'
import Navbar from '../components/Navbar'

export default function Login() {
  const navigate = useNavigate()
  const [correo, setCorreo] = useState('')
  const [contrasena, setContrasena] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [mostrarContrasena, setMostrarContrasena] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      console.log('🔍 Intentando login unificado con:', { correo })

      // Login unificado que retorna JWT token
      const response = await api.post('/api/auth/login', {
        correo,
        contrasena,
      })

      console.log('✅ Respuesta login:', response.data)

      const { token, usuario } = response.data

      if (!token || !usuario) {
        throw new Error('Respuesta inválida del servidor')
      }

      // Guardar JWT token
      localStorage.setItem('token', token)
      
      console.log('📊 Usuario autenticado:', usuario)
      console.log('🔑 Token JWT guardado')

      // Según el rol, obtener datos completos del usuario
      if (usuario.rol === 'CANDIDATE') {
        try {
          const candidateResponse = await api.get(`/candidates/${usuario.id}`)
          const candidateData = candidateResponse.data

          localStorage.setItem('candidateData', JSON.stringify(candidateData))
          localStorage.setItem('candidateId', candidateData.id_candidate.toString())
          localStorage.setItem(
            'candidateName',
            `${candidateData.nombre_candidate} ${candidateData.apellido_candidate}`
          )
          localStorage.setItem('userRole', 'candidate')

          setSuccess('¡Inicio de sesión exitoso!')
          setTimeout(() => navigate('/candidato'), 500)
        } catch (err) {
          console.error('Error al obtener datos del candidato:', err)
          throw new Error('Error al cargar datos del candidato')
        }
      } else if (usuario.rol === 'VOTER') {
        try {
          const voterResponse = await api.get(`/voters/${usuario.id}`)
          const voterData = voterResponse.data

          localStorage.setItem('voterData', JSON.stringify(voterData))
          localStorage.setItem('voterId', voterData.id_voter.toString())
          localStorage.setItem(
            'voterName',
            `${voterData.nombre_voter} ${voterData.apellido_voter}`
          )
          localStorage.setItem('userRole', 'voter')

          setSuccess('¡Inicio de sesión exitoso!')
          setTimeout(() => navigate('/votante'), 500)
        } catch (err) {
          console.error('Error al obtener datos del votante:', err)
          throw new Error('Error al cargar datos del votante')
        }
      } else if (usuario.rol === 'ADMIN') {
        try {
          const adminResponse = await api.get(`/administrators/${usuario.id}`)
          const adminData = adminResponse.data

          localStorage.setItem('adminData', JSON.stringify(adminData))
          localStorage.setItem('adminId', adminData.id_admin.toString())
          localStorage.setItem(
            'adminName',
            `${adminData.nombre_admin} ${adminData.apellido_admin}`
          )
          localStorage.setItem('userRole', 'admin')

          setSuccess('¡Inicio de sesión exitoso!')
          setTimeout(() => navigate('/administrador'), 500)
        } catch (err) {
          console.error('Error al obtener datos del administrador:', err)
          throw new Error('Error al cargar datos del administrador')
        }
      } else {
        throw new Error('Rol de usuario no reconocido')
      }

    } catch (error) {
      console.error('❌ Error al iniciar sesión:', error)
      
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        'Correo o contraseña incorrectos.'
      
      setError(errorMessage)

      // Limpiar localStorage en caso de error
      localStorage.clear()
    } finally {
      setLoading(false)
    }
  }

  const toggleMostrarContrasena = () => {
    setMostrarContrasena(!mostrarContrasena)
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4 ">
      <Navbar />
      <div className="bg-white shadow-2xl rounded-2xl w-full max-w-sm p-8 border border-gray-200 mt-30">
        {/* Logo */}
        <Link to="/">
          <div className="flex justify-center mb-4">
            <img src="/img/logo.png" alt="Univote" className="w-40 h-40" />
          </div>
        </Link>

        <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">
          Iniciar Sesión
        </h1>

        {/* Mensajes */}
        {error && (
          <div className="bg-red-100 text-red-700 text-sm p-3 rounded-md mb-4 text-center">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-100 text-green-700 text-sm p-3 rounded-md mb-4 text-center">
            {success}
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-gray-700 mb-1">Correo</label>
            <input
              type="text"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              placeholder="Escribe tu correo institucional"
              className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-400 outline-none"
              required
              disabled={loading}
            />
          </div>

          <div className="relative">
            <label className="block text-gray-700 mb-1">Contraseña</label>
            <input
              type={mostrarContrasena ? 'text' : 'password'}
              value={contrasena}
              onChange={(e) => setContrasena(e.target.value)}
              placeholder="Escribe tu contraseña"
              className="w-full border border-gray-300 rounded-lg p-2 pr-10 focus:ring-2 focus:ring-blue-400 outline-none"
              required
              disabled={loading}
            />
            <button
              type="button"
              onClick={toggleMostrarContrasena}
              className="absolute right-3 top-9 text-gray-500 hover:text-gray-700 focus:outline-none"
              disabled={loading}
            >
              {mostrarContrasena ? (
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
              ) : (
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                  />
                </svg>
              )}
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`bg-blue-900 text-white py-2 rounded-lg transition shadow-md ${
              loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-800'
            }`}
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Procesando...
              </div>
            ) : (
              'Ingresar'
            )}
          </button>

          <div className="text-center space-y-2">
            <p className="text-sm">
              ¿Aun no tienes cuenta?{' '}
              <a
                href="/RegistroVotante"
                className="text-blue-600 hover:underline"
              >
                Regístrate
              </a>
            </p>
            <p className="text-sm">
              <a href="#" className="text-blue-600 hover:underline">
                ¿Olvidaste tu contraseña?
              </a>
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}