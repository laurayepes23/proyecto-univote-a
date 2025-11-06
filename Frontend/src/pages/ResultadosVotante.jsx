import React, { useState, useEffect } from "react";
import NavbarVotante from "../components/NavbarVotante";
import { jsPDF } from "jspdf";
import autoTable from 'jspdf-autotable'; 
import axios from "axios";

export default function ResultadosVotante() {
  const [elecciones, setElecciones] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchResultados = async () => {
      try {
        setCargando(true);
        setError(null);
        
        const response = await axios.get("http://localhost:3000/elections/results");
        const data = response.data;

        const eleccionesFinalizadas = data.filter(
          (eleccion) => eleccion.estado_election === "Finalizada"
        );

        const resultadosAdaptados = eleccionesFinalizadas.map((eleccion) => {
          const totalVotos = eleccion.candidates.reduce(
            (sum, candidato) => sum + candidato.votos,
            0
          );

          const candidatosOrdenados = [...eleccion.candidates].sort((a, b) => b.votos - a.votos);

          return {
            id: eleccion.id_election,
            nombre: eleccion.nombre_election,
            fecha: new Date(eleccion.fecha_fin).toLocaleDateString("es-ES", {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            }),
            fechaFin: eleccion.fecha_fin,
            imagen: eleccion.imagen || "/img/rector.png",
            totalVotos: totalVotos,
            resultados: candidatosOrdenados.map((candidato) => ({
              nombre: `${candidato.nombre_candidate} ${candidato.apellido_candidate}`,
              votos: candidato.votos,
              porcentaje:
                totalVotos > 0
                  ? ((candidato.votos / totalVotos) * 100).toFixed(2)
                  : "0.00",
            })),
          };
        });

        resultadosAdaptados.sort((a, b) => new Date(b.fechaFin) - new Date(a.fechaFin));
        
        setElecciones(resultadosAdaptados);

      } catch (error) {
        console.error("Error al cargar los resultados de las elecciones:", error);
        setError("No se pudieron cargar los resultados. Intente nuevamente.");
      } finally {
        setCargando(false);
      }
    };

    fetchResultados();
  }, []);

  const generarPDF = (eleccion) => {
    try {
      const doc = new jsPDF();

      doc.setFontSize(18);
      doc.text(`Resultados Electorales: ${eleccion.nombre}`, 14, 22);
      doc.setFontSize(12);
      doc.text(`Fecha de Finalización: ${eleccion.fecha}`, 14, 30);
      doc.text(`Total de Votos: ${eleccion.totalVotos}`, 14, 38);

      const tableColumn = ["Candidato", "Votos Obtenidos", "Porcentaje"];
      
      const tableRows = eleccion.resultados.map((res, index) => [
        `${index + 1}. ${res.nombre}`,
        res.votos,
        `${res.porcentaje}%`
      ]);

      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 50,
        theme: 'grid',
        headStyles: { 
          fillColor: [22, 160, 133],
          textColor: 255,
          fontStyle: 'bold'
        },
        styles: {
          fontSize: 10,
          cellPadding: 3,
        },
        columnStyles: {
          0: { cellWidth: 'auto' },
          1: { cellWidth: 40 },
          2: { cellWidth: 40 }
        }
      });

      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(10);
        doc.text(
          `Página ${i} de ${pageCount}`,
          doc.internal.pageSize.width / 2,
          doc.internal.pageSize.height - 10,
          { align: 'center' }
        );
      }

      doc.save(`Resultados_${eleccion.nombre.replace(/\s+/g, "_")}.pdf`);
    } catch (error) {
      console.error("Error al generar PDF:", error);
      alert("Error al generar el PDF. Intente nuevamente.");
    }
  };

  const verDetalles = (eleccion) => {
    console.log("Detalles de elección:", eleccion);
    alert(`Total de votos: ${eleccion.totalVotos}\nCandidatos: ${eleccion.resultados.length}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center px-4 py-10">
      <NavbarVotante />

      <h1 className="text-3xl font-bold text-blue-900 mt-24 mb-8 text-center">
        Resultados de Elecciones Finalizadas
      </h1>

      <div className="w-full max-w-6xl">
        {cargando ? (
          <div className="text-center">
            <p className="text-gray-600 mb-4">Cargando resultados...</p>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900 mx-auto"></div>
          </div>
        ) : error ? (
          <div className="text-center bg-red-50 p-4 rounded-lg">
            <p className="text-red-600 mb-2">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Reintentar
            </button>
          </div>
        ) : elecciones.length === 0 ? (
          <div className="text-center bg-yellow-50 p-6 rounded-lg">
            <p className="text-yellow-700 text-lg">
              No hay elecciones finalizadas aún.
            </p>
            <p className="text-yellow-600 mt-2">
              Los resultados estarán disponibles una vez que las elecciones hayan concluido.
            </p>
          </div>
        ) : (
          <>
            <div className="mb-6 text-center">
              <p className="text-gray-600">
                Mostrando {elecciones.length} elección{elecciones.length !== 1 ? 'es' : ''} finalizada{elecciones.length !== 1 ? 's' : ''}
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {elecciones.map((eleccion) => (
                <div
                  key={eleccion.id}
                  className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition duration-300"
                >
                  <img
                    src={eleccion.imagen}
                    alt={eleccion.nombre}
                    className="h-48 w-full object-cover"
                    onError={(e) => {
                      e.target.src = "/img/rector.png";
                    }}
                  />
                  <div className="p-6">
                    <h2 className="text-xl font-bold text-blue-700 mb-2 line-clamp-2">
                      {eleccion.nombre}
                    </h2>
                    <p className="text-gray-600 text-sm mb-2">
                      📅 Finalizada el: {eleccion.fecha}
                    </p>
                    <p className="text-gray-700 mb-3">
                      <span className="font-semibold">Total de votos:</span> {eleccion.totalVotos}
                    </p>
                    
                    <div className="space-y-2 mt-4">
                      <button
                        className="w-full bg-blue-900 text-white py-2 rounded-lg font-medium hover:bg-blue-800 transition"
                        onClick={() => generarPDF(eleccion)}
                      >
                        📊 Descargar Resultados
                      </button>
                      <button
                        className="w-full bg-gray-200 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-300 transition"
                        onClick={() => verDetalles(eleccion)}
                      >
                        👁️ Ver Detalles
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}