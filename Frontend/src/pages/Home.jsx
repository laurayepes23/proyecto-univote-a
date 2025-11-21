import React from "react";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import Carrusel from "../components/Carrusel";
import { FaUser, FaUserTie } from "react-icons/fa";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-white text-gray-800 overflow-x-hidden">
      {/* NAVBAR */}
      <Navbar />

      {/* ESPACIO */}
      <div className="h-20"></div>

      {/* CARRUSEL */}
      <Carrusel />

      {/* SECCIÓN DE INSCRIPCIONES */}
      <section className="max-w-4xl mx-auto mt-12 p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
          {/* Cuadro de Inscripción de Votante */}
          <a
            href="/Inf_votante"
            className="flex flex-col items-center justify-center p-12 bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
          >
            <FaUser className="text-blue-900 w-20 h-20 mb-6" />
            <h5 className="text-2xl font-bold text-blue-900 leading-tight text-center">
              Inscripción <br />
              de Votante
            </h5>
          </a>

          {/* Cuadro de Inscripción de Candidatos */}
          <a
            href="/Inf_candidato"
            className="flex flex-col items-center justify-center p-12 bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
          >
            <FaUserTie className="text-blue-900 w-20 h-20 mb-6" />
            <h5 className="text-2xl font-bold text-blue-900 leading-tight text-center">
              Inscripción <br />
              de Candidatos
            </h5>
          </a>
        </div>
      </section>

      {/* SECCIÓN QUIÉNES SOMOS */}
      <section
        id="quienes-somos"
        className="max-w-4xl mx-auto mt-12 p-6 border border-blue-400 rounded-md"
      >
        <h5 className="text-center text-3xl font-semibold mb-4">¿Quiénes somos?</h5>
        <p className="text-justify text-gray-700 leading-relaxed">
          Somos una plataforma dedicada a transformar y facilitar los procesos electorales universitarios,
          garantizando seguridad, transparencia y accesibilidad para todos los miembros de la comunidad académica.
          Nuestra misión es integrar tecnologías modernas, como blockchain y validaciones digitales, para asegurar
          que cada voto sea confiable y cada proceso de elección sea legítimo. Nos enfocamos en la innovación tecnológica,
          la participación activa de estudiantes y docentes, y en fomentar la confianza en los sistemas de votación electrónica.
          Buscamos ser una herramienta que conecte a la comunidad universitaria, promoviendo la democracia y la transparencia
          en cada elección, y asegurando que los procesos electorales sean inclusivos, seguros y eficientes.
        </p>

        {/* VIDEO Nosotros */}
        <div className="mt-6">
          <video className="w-full rounded-md shadow-md" controls autoPlay={false}>
            <source src="/videos/Nosotros.mp4" type="video/mp4" />
            Tu navegador no soporta la reproducción de videos.
          </video>
        </div>
      </section>

      {/* VISIÓN Y MISIÓN - TAMAÑO AUMENTADO */}
      <section className="w-full mt-12 grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto px-6">
        <div id="vision" className="bg-gradient-to-br from-blue-100 to-blue-200 p-8 rounded-xl shadow-xl transform transition-all duration-300 hover:scale-105">
          <h3 className="text-3xl font-bold mb-4 text-center text-blue-900">Visión</h3>
          <p className="text-lg text-gray-800 text-justify leading-relaxed">
            Ser la plataforma líder en votaciones electrónicas universitarias a nivel nacional e internacional,
            reconocida por su innovación tecnológica, confiabilidad y capacidad para fomentar la participación democrática
            en la comunidad académica.
          </p>
        </div>

        <div id="mision" className="bg-gradient-to-br from-gray-100 to-gray-200 p-8 rounded-xl shadow-xl transform transition-all duration-300 hover:scale-105">
          <h3 className="text-3xl font-bold mb-4 text-center text-gray-800">Misión</h3>
          <p className="text-lg text-gray-800 text-justify leading-relaxed">
            Facilitar un proceso electoral universitario seguro, transparente y accesible, integrando tecnologías modernas
            como blockchain y validaciones digitales, para garantizar la participación confiable de estudiantes y docentes
            en la elección de sus representantes.
          </p>
        </div>
      </section>

      {/* CONTACTO SIN FORMULARIO */}
      <section id="contactanos" className="max-w-4xl mx-auto mt-12 px-6">
        <div className="text-center mt-8">
          <h2 className="text-blue-900 font-bold text-2xl mb-6 uppercase">
            ¿Necesitas ayuda o tienes preguntas?
          </h2>
          <p className="text-gray-600 mb-4">
            Visita nuestro Centro de Ayuda para encontrar respuestas a preguntas frecuentes o contactar con nuestro soporte técnico.
          </p>
          <a
            href="/CentroAyuda"
            className="inline-block bg-blue-900 text-white font-semibold px-8 py-3 rounded-lg hover:bg-blue-800 transition duration-300"
          >
            Ir al Centro de Ayuda
          </a>
        </div>
      </section>

    </div>
  );
}