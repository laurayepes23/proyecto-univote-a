import { useState } from "react";
import Navbar from "../components/Navbar";
import { FaExclamationTriangle } from "react-icons/fa";

export default function CentroAyuda() {
  const faqs = [
    {
      question: "¿Cómo me registro en UNIVOTE?",
      answer:
        "Debes dirigirte a la sección de Registro, completar tus datos básicos ya sea como candidato o votante.",
    },
    {
      question: "¿Cómo inicio sesión?",
      answer:
        "Ingresa tu correo y contraseña en el formulario de Login. Si olvidaste tu contraseña, puedes recuperarla en '¿Olvidaste tu contraseña?'",
    },
    {
      question: "¿Cómo encuentro una elección disponible?",
      answer:
        "Una vez dentro del sistema, dirígete al panel principal donde verás una opcion para er las elecciones activas",
    },
    {
      question: "¿Puedo cambiar mi voto una vez enviado?",
      answer:
        "No. Una vez confirmado y registrado, el voto no puede ser modificado para garantizar la integridad del proceso.",
    },
    {
      question: "¿Qué hago si tengo problemas técnicos?",
      answer:
        "Puedes contactar al soporte técnico desde esta misma página, enviando un formulario donde explicaras el motivo del problema.",
    },
    {
        question: "¿Cómo puedo postularme como candidato?",
        answer:
          "Debes registrarte como candidato y luego dirigirte a la sección de 'Postularse a Elecciones' para completar tu postulación o en al inicio cuando haces el registro tambien puedes  postularte a la eleccion que desees.",
    },

  ];

  const [openIndex, setOpenIndex] = useState(null);
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    telefono: "",
    motivo: "",
    mensaje: ""
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");

  // Función para validar caracteres especiales
  const hasSpecialChars = (text) => {
    const specialChars = /[<>{}[\]\\]/;
    return specialChars.test(text);
  };

  // Función para validar email
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Limitar longitud según el campo
    let limitedValue = value;
    if (name === 'nombre' && value.length > 40) limitedValue = value.slice(0, 40);
    if (name === 'email' && value.length > 40) limitedValue = value.slice(0, 40);
    if (name === 'telefono' && value.length > 15) limitedValue = value.slice(0, 15);
    if (name === 'mensaje' && value.length > 500) limitedValue = value.slice(0, 500);

    setFormData({
      ...formData,
      [name]: limitedValue
    });

    // Limpiar error cuando el usuario escribe
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Validar nombre
    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es requerido';
    } else if (formData.nombre.length < 2) {
      newErrors.nombre = 'El nombre debe tener al menos 2 caracteres';
    } else if (hasSpecialChars(formData.nombre)) {
      newErrors.nombre = 'El nombre no puede contener caracteres especiales (<, >, {, }, [, ], \\)';
    }

    // Validar email
    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = 'El email debe tener un formato válido (ejemplo@dominio.com)';
    } else if (hasSpecialChars(formData.email)) {
      newErrors.email = 'El email no puede contener caracteres especiales';
    }

    // Validar teléfono
    if (formData.telefono && hasSpecialChars(formData.telefono)) {
      newErrors.telefono = 'El teléfono no puede contener caracteres especiales';
    } else if (formData.telefono && !/^[\d+\-\s()]+$/.test(formData.telefono)) {
      newErrors.telefono = 'El teléfono solo puede contener números, +, -, () y espacios';
    }

    // Validar motivo
    if (!formData.motivo) {
      newErrors.motivo = 'Debes seleccionar un motivo';
    }

    // Validar mensaje
    if (!formData.mensaje.trim()) {
      newErrors.mensaje = 'El mensaje es requerido';
    } else if (formData.mensaje.length < 10) {
      newErrors.mensaje = 'El mensaje debe tener al menos 10 caracteres';
    } else if (hasSpecialChars(formData.mensaje)) {
      newErrors.mensaje = 'El mensaje no puede contener caracteres especiales (<, >, {, }, [, ], \\)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setSubmitMessage("Por favor, corrige los errores en el formulario.");
      return;
    }

    setIsSubmitting(true);
    setSubmitMessage("");

    try {
      const response = await fetch("http://localhost:3000/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        setSubmitMessage(result.message);
        setFormData({
          nombre: "",
          email: "",
          telefono: "",
          motivo: "",
          mensaje: ""
        });
        setErrors({});
      } else {
        setSubmitMessage(result.message);
      }
    } catch (error) {
      setSubmitMessage("Error de conexión. Por favor, verifica tu internet e inténtalo de nuevo.");
      console.error("Error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-gray-800 overflow-x-hidden">
      {/* NAVBAR */}
      <Navbar />
      <div className="max-w-4xl mx-auto bg-white shadow-xl rounded-xl p-8 mt-30">
        <h1 className="text-3xl font-bold text-blue-900 text-center mb-8">
          Centro de Ayuda UNIVOTE
        </h1>

        <p className="text-center text-gray-600 mb-6">
          Encuentra respuestas a las preguntas más frecuentes o contacta con el
          soporte técnico.
        </p>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="border rounded-lg bg-blue-50">
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full text-left p-4 flex justify-between items-center text-blue-900 font-semibold"
              >
                {faq.question}
                <span>{openIndex === index ? "-" : "+"}</span>
              </button>

              {openIndex === index && (
                <div className="p-4 pt-0 text-gray-700">{faq.answer}</div>
              )}
            </div>
          ))}
        </div>

        {/* Contacto */}
        <div className="mt-10 bg-gray-100 p-6 rounded-lg">
          <h2 className="text-2xl font-bold text-blue-900 mb-3">
            ¿Necesitas más ayuda?
          </h2>
          
          {/* Información adicional */}
          <div className="text-center mt-8">
            <h2 className="text-blue-900 font-bold text-2xl mb-6 uppercase">
              ¡Si necesitas de nuestro servicio de votaciones digitales!
            </h2>
            <p className="text-gray-600 mb-4">
              Completa el formulario y nos pondremos en contacto contigo a la brevedad
            </p>
          </div>

          {/* Formulario de contacto */}
          <div className="bg-white rounded-lg shadow-xl p-8 border border-blue-200">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Nombre */}
                <div>
                  <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre completo *
                  </label>
                  <input
                    type="text"
                    id="nombre"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleChange}
                    required
                    maxLength={40}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition ${
                      errors.nombre ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Ingresa tu nombre completo (máx. 40 caracteres)"
                  />
                  <div className="flex justify-between mt-1">
                    <span className="text-red-500 text-sm">{errors.nombre}</span>
                    <span className="text-gray-400 text-sm">{formData.nombre.length}/40</span>
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Correo electrónico *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    maxLength={40}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition ${
                      errors.email ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="tu@correo.com (máx. 40 caracteres)"
                  />
                  <div className="flex justify-between mt-1">
                    <span className="text-red-500 text-sm">{errors.email}</span>
                    <span className="text-gray-400 text-sm">{formData.email.length}/40</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Teléfono */}
                <div>
                  <label htmlFor="telefono" className="block text-sm font-medium text-gray-700 mb-2">
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    id="telefono"
                    name="telefono"
                    value={formData.telefono}
                    onChange={handleChange}
                    maxLength={15}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition ${
                      errors.telefono ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="+57 300 123 4567 (máx. 15 caracteres)"
                  />
                  <div className="flex justify-between mt-1">
                    <span className="text-red-500 text-sm">{errors.telefono}</span>
                    <span className="text-gray-400 text-sm">{formData.telefono.length}/15</span>
                  </div>
                </div>

                {/* Motivo */}
                <div>
                  <label htmlFor="motivo" className="block text-sm font-medium text-gray-700 mb-2">
                    Motivo de contacto *
                  </label>
                  <select
                    id="motivo"
                    name="motivo"
                    value={formData.motivo}
                    onChange={handleChange}
                    required
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition ${
                      errors.motivo ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Selecciona un motivo</option>
                    <option value="Solicitud de información">Solicitud de información</option>
                    <option value="Soporte técnico">Soporte técnico</option>
                    <option value="Comentarios o sugerencias">Comentarios o sugerencias</option>
                    <option value="Solicitud de servicio">Solicitud de servicio</option>
                    <option value="Reportar problema">Reportar problema</option>
                    <option value="Otro">Otro</option>
                  </select>
                  {errors.motivo && (
                    <span className="text-red-500 text-sm mt-1">{errors.motivo}</span>
                  )}
                </div>
              </div>

              {/* Mensaje */}
              <div>
                <label htmlFor="mensaje" className="block text-sm font-medium text-gray-700 mb-2">
                  Mensaje *
                </label>
                <textarea
                  id="mensaje"
                  name="mensaje"
                  value={formData.mensaje}
                  onChange={handleChange}
                  required
                  rows="5"
                  maxLength={500}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition ${
                    errors.mensaje ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Describe tu consulta, comentario o solicitud... (máx. 500 caracteres)"
                />
                <div className="flex justify-between mt-1">
                  <span className="text-red-500 text-sm">{errors.mensaje}</span>
                  <span className="text-gray-400 text-sm">{formData.mensaje.length}/500</span>
                </div>
              </div>

              {/* Información de validación */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <FaExclamationTriangle className="text-yellow-600 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-yellow-800">Requisitos del formulario:</h4>
                    <ul className="text-yellow-700 text-sm mt-1 list-disc list-inside space-y-1">
                      <li>Email debe contener @ y formato válido</li>
                      <li>No se permiten caracteres especiales: &lt; &gt; &#123; &#125; [ ] \</li>
                      <li>Límites de caracteres: Nombre (40), Email (40), Teléfono (15), Mensaje (500)</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Botón enviar */}
              <div className="text-center">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-blue-900 text-white font-semibold px-8 py-3 rounded-lg hover:bg-blue-800 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Enviando..." : "Enviar mensaje"}
                </button>
              </div>

              {/* Mensaje de confirmación */}
              {submitMessage && (
                <div className={`text-center p-4 rounded-lg ${
                  submitMessage.includes("Error") || submitMessage.includes("error") 
                    ? "bg-red-100 text-red-700" 
                    : "bg-green-100 text-green-700"
                }`}>
                  {submitMessage}
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}