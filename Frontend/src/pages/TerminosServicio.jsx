import { useState } from 'react';
import Navbar from "../components/Navbar";
import { FaFileContract, FaUserCheck, FaBan, FaExclamationTriangle, FaGavel, FaQuestionCircle, FaShieldAlt, FaUserShield } from 'react-icons/fa';

export default function TerminosServicio() {
  const [activeSection, setActiveSection] = useState('aceptacion-terminos');

  const sections = [
    { id: 'aceptacion-terminos', title: 'Aceptación de Términos' },
    { id: 'descripcion-servicio', title: 'Descripción del Servicio' },
    { id: 'elegibilidad', title: 'Elegibilidad' },
    { id: 'cuenta-usuario', title: 'Cuenta de Usuario' },
    { id: 'uso-permitido', title: 'Uso Permitido' },
    { id: 'uso-prohibido', title: 'Uso Prohibido' },
    { id: 'privacidad-datos', title: 'Privacidad y Datos' },
    { id: 'limitacion-responsabilidad', title: 'Limitación de Responsabilidad' },
    { id: 'terminacion', title: 'Terminación' },
    { id: 'contacto', title: 'Contacto' }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-white text-gray-800 overflow-x-hidden">
      {/* NAVBAR */}
      <Navbar />
      <div className="container mx-auto px-4 max-w-6xl mt-30">
        
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center items-center gap-4 mb-4">
            <FaFileContract className="text-blue-600 text-4xl" />
            <h1 className="text-4xl font-bold text-blue-900">Términos de Servicio</h1>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Por favor, lee detenidamente estos términos de servicio antes de utilizar la plataforma Univote.
          </p>
          <div className="mt-4 text-sm text-gray-500">
            Última actualización: {new Date().toLocaleDateString('es-ES', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Navegación lateral */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-6 sticky top-8">
              <h3 className="font-bold text-gray-800 mb-4">En estos términos</h3>
              <nav className="space-y-2">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                      activeSection === section.id
                        ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-600'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {section.title}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Contenido principal */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-lg p-8">
              
              {/* Aviso importante */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
                <div className="flex items-start gap-3">
                  <FaExclamationTriangle className="text-yellow-600 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-bold text-yellow-800 text-lg mb-2">Aviso Importante</h3>
                    <p className="text-yellow-700">
                      Al registrarte y utilizar Univote, aceptas cumplir con estos términos de servicio. 
                      Si no estás de acuerdo con alguno de los términos, no debes utilizar la plataforma.
                    </p>
                  </div>
                </div>
              </div>

              {/* Aceptación de Términos */}
              <section id="aceptacion-terminos" className="mb-12 scroll-mt-20">
                <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-3">
                  <FaUserCheck className="text-blue-600" />
                  1. Aceptación de Términos
                </h2>
                <div className="space-y-4 text-gray-600">
                  <p>
                    Al acceder y utilizar la plataforma <strong>Univote</strong> aceptas estar legalmente 
                    vinculado por estos Términos de Servicio, nuestra Política de Privacidad 
                    y todas las leyes y regulaciones aplicables.
                  </p>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <p className="text-blue-700 font-semibold">
                      Tu uso continuado de la plataforma constituye tu aceptación expresa de cualquier modificación 
                      futura a estos términos.
                    </p>
                  </div>
                </div>
              </section>

              {/* Descripción del Servicio */}
              <section id="descripcion-servicio" className="mb-12 scroll-mt-20">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">2. Descripción del Servicio</h2>
                <div className="space-y-4 text-gray-600">
                  <p>
                    <strong>Univote</strong> es una plataforma digital de votación desarrollada para facilitar 
                    procesos electorales dentro de la comunidad universitaria, incluyendo pero no limitado a:
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <h4 className="font-semibold text-green-800 mb-2">Elecciones estudiantiles</h4>
                      <ul className="text-green-700 text-sm space-y-1">
                        <li>• Representantes estudiantiles</li>
                        <li>• Consejos de facultad</li>
                        <li>• Asociaciones estudiantiles</li>
                      </ul>
                    </div>
                    
                  </div>

  
                </div>
              </section>

              {/* Elegibilidad */}
              <section id="elegibilidad" className="mb-12 scroll-mt-20">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">3. Elegibilidad</h2>
                <div className="space-y-4 text-gray-600">
                  <p>
                    Para utilizar Univote, debes cumplir con los siguientes requisitos:
                  </p>
                  
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <h4 className="font-semibold text-blue-800 mb-3">Requisitos de elegibilidad:</h4>
                    <ul className="space-y-3 text-blue-700">
                      <li className="flex items-start gap-3">
                        <span className="bg-blue-100 p-2 rounded-lg">🎓</span>
                        <div>
                          <strong>Estatus académico:</strong> Ser estudiante activo de la Universidad 
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="bg-blue-100 p-2 rounded-lg">📧</span>
                        <div>
                          <strong>Correo institucional:</strong> Poseer y acceder con correo electrónico institucional válido
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="bg-blue-100 p-2 rounded-lg">📋</span>
                        <div>
                          <strong>Elegibilidad específica:</strong> Cumplir con los requisitos específicos de cada elección
                        </div>
                      </li>
                    </ul>
                  </div>

                  <p>
                    Nos reservamos el derecho de verificar tu elegibilidad en cualquier momento y de 
                    suspender o terminar tu cuenta si se determina que no cumples con estos requisitos.
                  </p>
                </div>
              </section>

              {/* Cuenta de Usuario */}
              <section id="cuenta-usuario" className="mb-12 scroll-mt-20">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">4. Cuenta de Usuario</h2>
                <div className="space-y-6 text-gray-600">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                    <h4 className="font-semibold text-green-800 mb-3">Responsabilidades del usuario:</h4>
                    <ul className="space-y-3 text-green-700">
                      <li>• Eres responsable de mantener la confidencialidad de tus credenciales de acceso</li>
                      <li>• Debes notificarnos inmediatamente cualquier uso no autorizado de tu cuenta</li>
                      <li>• Eres responsable de toda actividad que ocurra bajo tu cuenta</li>
                      <li>• Debes proporcionar información veraz y actualizada</li>
                    </ul>
                  </div>

                  <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                    <h4 className="font-semibold text-red-800 mb-3">Prohibiciones específicas:</h4>
                    <ul className="space-y-2 text-red-700">
                      <li>• No puedes transferir ni vender tu cuenta a terceros</li>
                      <li>• No puedes crear múltiples cuentas</li>
                      <li>• No puedes utilizar cuentas de otros estudiantes</li>
                      <li>• No puedes suplantar la identidad de otra persona</li>
                    </ul>
                  </div>
                </div>
              </section>

              {/* Uso Permitido */}
              <section id="uso-permitido" className="mb-12 scroll-mt-20">
                <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-3">
                  <FaUserCheck className="text-green-600" />
                  5. Uso Permitido
                </h2>
                <div className="space-y-4 text-gray-600">
                  <p>
                    Puedes utilizar Univote exclusivamente para los siguientes propósitos:
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <h4 className="font-semibold text-green-800">Participación electoral</h4>
                      <p className="text-green-700 text-sm mt-2">
                        Ejercer tu derecho al voto en elecciones para las cuales seas elegible
                      </p>
                    </div>
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <h4 className="font-semibold text-green-800">Consulta de resultados</h4>
                      <p className="text-green-700 text-sm mt-2">
                        Acceder a resultados electorales una vez finalizados los procesos
                      </p>
                    </div>
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <h4 className="font-semibold text-green-800">Información electoral</h4>
                      <p className="text-green-700 text-sm mt-2">
                        Consultar información sobre procesos electorales activos y futuros
                      </p>
                    </div>
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <h4 className="font-semibold text-green-800">Gestión de perfil</h4>
                      <p className="text-green-700 text-sm mt-2">
                        Mantener actualizada tu información personal y preferencias
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Uso Prohibido */}
              <section id="uso-prohibido" className="mb-12 scroll-mt-20">
                <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-3">
                  <FaBan className="text-red-600" />
                  6. Uso Prohibido
                </h2>
                <div className="space-y-4 text-gray-600">
                  <p>
                    Queda estrictamente prohibido:
                  </p>
                  
                  <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                    <ul className="space-y-3 text-red-700">
                      <li className="flex items-start gap-3">
                        <FaBan className="text-red-500 mt-1 flex-shrink-0" />
                        <span>Intentar votar múltiples veces en la misma elección</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <FaBan className="text-red-500 mt-1 flex-shrink-0" />
                        <span>Manipular o interferir con el sistema de votación</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <FaBan className="text-red-500 mt-1 flex-shrink-0" />
                        <span>Utilizar bots, scripts o métodos automatizados para acceder al servicio</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <FaBan className="text-red-500 mt-1 flex-shrink-0" />
                        <span>Suplantar la identidad de otros estudiantes</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <FaBan className="text-red-500 mt-1 flex-shrink-0" />
                        <span>Intentar descifrar, descompilar o realizar ingeniería inversa del software</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <FaBan className="text-red-500 mt-1 flex-shrink-0" />
                        <span>Violar cualquier ley o regulación aplicable mediante el uso del servicio</span>
                      </li>
                    </ul>
                  </div>

                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
                    <h4 className="font-semibold text-orange-800 mb-2">Consecuencias del incumplimiento:</h4>
                    <p className="text-orange-700">
                      El incumplimiento de estas prohibiciones puede resultar en la terminación inmediata de tu cuenta, 
                      acciones disciplinarias según el reglamento estudiantil y, cuando corresponda, acciones legales.
                    </p>
                  </div>
                </div>
              </section>

              
              {/* Privacidad y Datos */}
              <section id="privacidad-datos" className="mb-12 scroll-mt-20">
                <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-3">
                  <FaShieldAlt className="text-blue-600" />
                  8. Privacidad y Protección de Datos
                </h2>
                <div className="space-y-4 text-gray-600">
                  <p>
                    Tu privacidad es importante para nosotros. El tratamiento de tus datos personales se rige 
                    por nuestra Política de Privacidad, que forma parte integral de estos términos.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <FaShieldAlt className="text-green-600 text-2xl mb-2" />
                      <h4 className="font-semibold text-green-800">Seguridad de datos</h4>
                      <p className="text-green-700 text-sm mt-2">
                        Implementamos medidas de seguridad avanzadas para proteger tu información personal.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Limitación de Responsabilidad */}
              <section id="limitacion-responsabilidad" className="mb-12 scroll-mt-20">
                <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-3">
                  <FaGavel className="text-gray-600" />
                  9. Limitación de Responsabilidad
                </h2>
                <div className="space-y-4 text-gray-600">
                  <div className="bg-gray-100 border border-gray-300 rounded-lg p-6">
                    <p className="text-gray-700 font-semibold mb-4">
                      En la máxima medida permitida por la ley aplicable, Univote y sus afiliados no serán responsables por:
                    </p>
                    <ul className="space-y-3 text-gray-700">
                      <li className="flex items-start gap-3">
                        <span className="text-gray-500 mt-1">•</span>
                        <span>Daños indirectos, incidentales o consecuentes</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-gray-500 mt-1">•</span>
                        <span>Pérdida de datos o información</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-gray-500 mt-1">•</span>
                        <span>Interrupciones del servicio por causas fuera de nuestro control</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-gray-500 mt-1">•</span>
                        <span>Uso no autorizado de tu cuenta debido a negligencia en la protección de credenciales</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </section>

              {/* Terminación */}
              <section id="terminacion" className="mb-12 scroll-mt-20">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">10. Terminación</h2>
                <div className="space-y-4 text-gray-600">
                  <p>
                    Podemos suspender o terminar tu acceso a Univote inmediatamente, sin previo aviso, si:
                  </p>
                  
                  <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                    <ul className="space-y-2 text-red-700">
                      <li>• Incumples cualquier disposición de estos términos</li>
                      <li>• Dejas de ser estudiante activo de la universidad</li>
                      <li>• Realizas actividades fraudulentas o que comprometan la integridad electoral</li>
                      <li>• Así lo requiere una orden judicial o autoridad competente</li>
                    </ul>
                  </div>
                </div>
              </section>


              {/* Contacto */}
              <section id="contacto" className="scroll-mt-20">
                <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-3">
                  <FaQuestionCircle className="text-blue-600" />
                  12. Contacto
                </h2>
                <div className="space-y-4 text-gray-600">
                  <p>
                    Si tienes preguntas sobre estos Términos de Servicio, por favor contáctano.
                  </p>
                  
                </div>
              </section>

            </div>
          </div>
        </div>

      </div>
    </div>
  );
}