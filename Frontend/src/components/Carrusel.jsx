import React, { useState, useEffect } from "react";

const carouselImages = [
  { src: "/img/imagen_de_inicio.png.jpeg", alt: "Imagen 1" },
  { src: "/img/IMG-2.png.jpeg", alt: "Imagen 2" },
  { src: "/img/carrusel-a.jpeg", alt: "Imagen 3" },
];

export default function Carrusel() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const prevSlide = () => {
    setCurrentIndex(
      (currentIndex - 1 + carouselImages.length) % carouselImages.length
    );
  };

  const nextSlide = () => {
    setCurrentIndex((currentIndex + 1) % carouselImages.length);
  };

  const handleImageClick = () => {
    // Redirigir a la vista de Login
    window.location.href = "/login";
  };

  // Efecto para cambio automático cada 5 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      nextSlide();
    }, 5000); // Cambia cada 5 segundos

    // Limpiar el intervalo cuando el componente se desmonte
    return () => clearInterval(interval);
  }, [currentIndex]); // Se ejecuta cuando currentIndex cambia

  return (
    <div 
      className="relative w-screen h-[90vh] flex items-center justify-center bg-gradient-to-r from-blue-900 via-black to-blue-900 overflow-hidden cursor-pointer"
      onClick={handleImageClick}
    >
      {/* Imagen */}
      <img
        src={carouselImages[currentIndex].src}
        alt={carouselImages[currentIndex].alt}
        className="w-full h-full object-contain"
      />

      {/* Flechas */}
      <button
        onClick={(e) => {
          e.stopPropagation(); // Evitar que el click en la flecha redirija al login
          prevSlide();
        }}
        className="absolute top-1/2 left-4 transform -translate-y-1/2 bg-black bg-opacity-40 text-white rounded-full p-3 hover:bg-opacity-70 transition z-10"
        aria-label="Anterior"
      >
        ‹
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation(); // Evitar que el click en la flecha redirija al login
          nextSlide();
        }}
        className="absolute top-1/2 right-4 transform -translate-y-1/2 bg-black bg-opacity-40 text-white rounded-full p-3 hover:bg-opacity-70 transition z-10"
        aria-label="Siguiente"
      >
        ›
      </button>

      {/* Indicadores de puntos */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-10">
        {carouselImages.map((_, index) => (
          <button
            key={index}
            onClick={(e) => {
              e.stopPropagation(); // Evitar que el click en los puntos redirija al login
              setCurrentIndex(index);
            }}
            className={`w-3 h-3 rounded-full transition-all ${
              index === currentIndex 
                ? "bg-white scale-125" 
                : "bg-gray-400 hover:bg-gray-300"
            }`}
            aria-label={`Ir a imagen ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}