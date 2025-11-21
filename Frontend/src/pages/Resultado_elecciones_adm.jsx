import React, { useState, useEffect, useRef } from "react";
import Navbar_admin from "../components/Navbar_admin";
import Footer from "../components/Footer";
import axios from "axios";
import { jsPDF } from "jspdf";
import autoTable from 'jspdf-autotable';

const API_BASE_URL = "http://localhost:3000/results";

const Resultado_candidatos_admin = () => {
  // Estado para almacenar los resultados de la API
  const [elecciones, setElecciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Estados para la paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(3);
  const [totalItems, setTotalItems] = useState(0);

  // Refs para los canvas de gráficas
  const chartRefs = useRef({});

  // Calcular el número total de páginas
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  // Colores para las barras del gráfico (mismos que en la otra vista)
  const COLORS = ['#1E40AF', '#DC2626', '#16A34A', '#D97706', '#7C3AED', '#0891B2', '#E11D48', '#65A30D'];

  // Función para obtener los resultados de las elecciones de la API
  const fetchResults = async (page = 1) => {
    setLoading(true);
    try {
      const response = await axios.get(API_BASE_URL);
      const allElections = response.data;
      
      // Agregado para depuración: muestra los datos en la consola
      console.log("Datos recibidos del backend:", allElections);
      
      setTotalItems(allElections.length);
      
      // Paginación en el frontend
      const startIndex = (page - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      const paginatedElections = allElections.slice(startIndex, endIndex);
      
      setElecciones(paginatedElections);
      setCurrentPage(page);
    } catch (err) {
      console.error("Error al cargar los resultados:", err);
      setError("No se pudieron cargar los resultados de las elecciones.");
    } finally {
      setLoading(false);
    }
  };

  // Carga los resultados al montar el componente
  useEffect(() => {
    fetchResults();
  }, []);

  // Dibujar gráfica en canvas después de que se renderice el componente
  useEffect(() => {
    if (elecciones.length > 0) {
      elecciones.forEach((eleccion, index) => {
        const canvasId = `chart-${eleccion.id_election}`;
        if (chartRefs.current[canvasId]) {
          drawChart(eleccion, canvasId);
        }
      });
    }
  }, [elecciones]);

  // Funciones de paginación
  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      fetchResults(page);
    }
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      goToPage(currentPage + 1);
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      goToPage(currentPage - 1);
    }
  };

  // Generar números de página para mostrar
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  };

  // Función para preparar datos para el gráfico
  const prepararDatosGrafico = (candidates) => {
    const totalVotos = candidates.reduce((sum, candidato) => sum + (candidato._count?.votes || 0), 0);
    
    return candidates
      .sort((a, b) => {
        const votesA = a._count?.votes || 0;
        const votesB = b._count?.votes || 0;
        return votesB - votesA;
      })
      .map((candidato, index) => {
        const votos = candidato._count?.votes || 0;
        const porcentaje = totalVotos > 0 ? (votos / totalVotos) * 100 : 0;
        
        return {
          nombre: `${candidato.nombre_candidate} ${candidato.apellido_candidate}`,
          nombre_corto: `${candidato.nombre_candidate} ${candidato.apellido_candidate.substring(0, 1)}.`,
          votos: votos,
          porcentaje: porcentaje,
          color: COLORS[index % COLORS.length],
          esGanador: index === 0
        };
      });
  };

  // Función para dibujar gráfica en canvas (estilo similar a la otra vista)
  const drawChart = (eleccion, canvasId) => {
    const canvas = chartRefs.current[canvasId];
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const datosGrafico = prepararDatosGrafico(eleccion.candidates || []);
    
    // Limpiar canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Configuración del gráfico - similar a la otra vista
    const padding = { top: 50, right: 40, bottom: 80, left: 60 };
    const chartWidth = canvas.width - (padding.left + padding.right);
    const chartHeight = canvas.height - (padding.top + padding.bottom);
    const barWidth = 35;
    const maxVotos = Math.max(...datosGrafico.map(d => d.votos), 1);
    const spacing = chartWidth / datosGrafico.length;

    // Fondo del gráfico
    ctx.fillStyle = '#F9FAFB';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Dibujar ejes con estilo similar
    ctx.strokeStyle = '#6B7280';
    ctx.lineWidth = 1;
    
    // Líneas de guía horizontales
    const lineCount = 5;
    for (let i = 0; i <= lineCount; i++) {
      const y = padding.top + (i * chartHeight) / lineCount;
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(padding.left + chartWidth, y);
      ctx.strokeStyle = '#E5E7EB';
      ctx.stroke();
      
      // Etiquetas del eje Y
      if (i < lineCount) {
        const value = Math.round(maxVotos - (i * maxVotos) / lineCount);
        ctx.fillStyle = '#6B7280';
        ctx.font = '12px Arial';
        ctx.textAlign = 'right';
        ctx.fillText(value.toString(), padding.left - 10, y + 4);
      }
    }

    // Eje Y principal
    ctx.strokeStyle = '#374151';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(padding.left, padding.top);
    ctx.lineTo(padding.left, padding.top + chartHeight);
    ctx.stroke();
    
    // Eje X principal
    ctx.beginPath();
    ctx.moveTo(padding.left, padding.top + chartHeight);
    ctx.lineTo(padding.left + chartWidth, padding.top + chartHeight);
    ctx.stroke();

    // Dibujar barras con efecto de profundidad
    datosGrafico.forEach((candidato, index) => {
      const barHeight = (candidato.votos / maxVotos) * chartHeight;
      const x = padding.left + (index * spacing) + (spacing - barWidth) / 2;
      const y = padding.top + chartHeight - barHeight;

      // Sombra de la barra
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.fillRect(x + 2, y + 2, barWidth, barHeight);

      // Barra principal
      ctx.fillStyle = candidato.color;
      ctx.fillRect(x, y, barWidth, barHeight);

      // Borde de la barra
      ctx.strokeStyle = '#1F2937';
      ctx.lineWidth = 1;
      ctx.strokeRect(x, y, barWidth, barHeight);

      // Etiqueta del candidato (nombre corto)
      ctx.fillStyle = '#374151';
      ctx.font = 'bold 12px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      
      // Rotar texto para mejor ajuste
      ctx.save();
      ctx.translate(x + barWidth / 2, padding.top + chartHeight + 15);
      ctx.rotate(-Math.PI / 4);
      ctx.fillText(candidato.nombre_corto, 0, 0);
      ctx.restore();

      // Valor de votos arriba de la barra
      ctx.fillStyle = '#1F2937';
      ctx.font = 'bold 11px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      ctx.fillText(candidato.votos.toString(), x + barWidth / 2, y - 5);

      // Porcentaje dentro de la barra (si hay espacio)
      if (barHeight > 25) {
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 10px Arial';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${candidato.porcentaje.toFixed(1)}%`, x + barWidth / 2, y + barHeight / 2);
      }
    });

    // Título del gráfico
    ctx.fillStyle = '#1E40AF';
    ctx.font = 'bold 18px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Distribución de Votos por Candidato', canvas.width / 2, 25);

    // Etiqueta del eje Y
    ctx.fillStyle = '#6B7280';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.save();
    ctx.translate(20, canvas.height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('Votos Obtenidos', 0, 0);
    ctx.restore();
  };

  // Función auxiliar para convertir hex a RGB
  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? [
      parseInt(result[1], 16),
      parseInt(result[2], 16),
      parseInt(result[3], 16)
    ] : [0, 0, 0];
  };

  // Función para generar PDF de una elección específica
  const generarPDF = (eleccion) => {
    try {
      const doc = new jsPDF();
      const datosGrafico = prepararDatosGrafico(eleccion.candidates || []);
      const totalVotos = datosGrafico.reduce((sum, candidato) => sum + candidato.votos, 0);

      // Título del documento
      doc.setFontSize(20);
      doc.setTextColor(0, 0, 128);
      doc.text("RESULTADOS ELECTORALES", 105, 20, { align: 'center' });

      // Información de la elección
      doc.setFontSize(16);
      doc.setTextColor(0, 0, 0);
      doc.text(`Elección: ${eleccion.nombre_election}`, 14, 35);
      
      doc.setFontSize(12);
      doc.text(`Fecha de generación: ${new Date().toLocaleDateString('es-ES')}`, 14, 45);
      doc.text(`Total de votos emitidos: ${totalVotos}`, 14, 55);

      // Preparar datos para la tabla
      const tableColumn = ["#", "Candidato", "Votos Obtenidos", "Porcentaje"];
      
      const tableRows = datosGrafico.map((candidato, index) => [
        index + 1,
        candidato.nombre,
        candidato.votos,
        `${candidato.porcentaje.toFixed(2)}%`
      ]);

      // Crear la tabla
      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 65,
        theme: 'grid',
        headStyles: { 
          fillColor: [0, 51, 102],
          textColor: 255,
          fontStyle: 'bold',
          fontSize: 12
        },
        styles: {
          fontSize: 10,
          cellPadding: 4,
        },
        columnStyles: {
          0: { cellWidth: 15, halign: 'center' },
          1: { cellWidth: 'auto' },
          2: { cellWidth: 35, halign: 'center' },
          3: { cellWidth: 35, halign: 'center' }
        },
        margin: { top: 65 }
      });

      // Obtener la posición Y después de la tabla
      const finalY = doc.lastAutoTable.finalY || 120;

      // Agregar espacio antes del gráfico
      const startYGrafico = finalY + 15;

      // Título del gráfico
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 128);
      doc.text("GRÁFICA DE RESULTADOS", 105, startYGrafico, { align: 'center' });

      // Crear gráfico de barras simple en el PDF
      const chartStartY = startYGrafico + 10;
      const chartWidth = 180;
      const chartHeight = 80;
      const barWidth = 20;
      const maxVotos = Math.max(...datosGrafico.map(d => d.votos));
      const spacing = chartWidth / (datosGrafico.length + 1);

      // Dibujar ejes
      doc.setDrawColor(0);
      doc.line(20, chartStartY + chartHeight, 20 + chartWidth, chartStartY + chartHeight); // Eje X
      doc.line(20, chartStartY, 20, chartStartY + chartHeight); // Eje Y

      // Dibujar barras
      datosGrafico.forEach((candidato, index) => {
        const barHeight = (candidato.votos / maxVotos) * (chartHeight - 10);
        const x = 20 + (index + 1) * spacing - barWidth / 2;
        const y = chartStartY + chartHeight - barHeight;

        // Barra
        doc.setFillColor(...hexToRgb(candidato.color));
        doc.rect(x, y, barWidth, barHeight, 'F');

        // Etiqueta del candidato (nombre abreviado)
        const nombreAbreviado = candidato.nombre_corto;
        
        doc.setFontSize(6);
        doc.setTextColor(0, 0, 0);
        doc.text(nombreAbreviado, x + barWidth/2, chartStartY + chartHeight + 5, { align: 'center' });

        // Valor de votos
        doc.text(candidato.votos.toString(), x + barWidth/2, y - 5, { align: 'center' });
      });

      // Leyenda del gráfico
      const legendStartY = chartStartY + chartHeight + 20;
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      doc.text("Leyenda:", 20, legendStartY);

      datosGrafico.forEach((candidato, index) => {
        const legendY = legendStartY + 5 + (index * 5);
        
        // Color de la leyenda
        doc.setFillColor(...hexToRgb(candidato.color));
        doc.rect(35, legendY - 3, 3, 3, 'F');
        
        // Nombre del candidato
        doc.text(`${candidato.nombre}: ${candidato.votos} votos (${candidato.porcentaje.toFixed(2)}%)`, 40, legendY);
      });

      // Pie de página
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text(
          `Página ${i} de ${pageCount} - Sistema Electoral`,
          doc.internal.pageSize.width / 2,
          doc.internal.pageSize.height - 10,
          { align: 'center' }
        );
      }

      // Guardar el PDF
      const fileName = `Resultados_${eleccion.nombre_election.replace(/\s+/g, '_')}.pdf`;
      doc.save(fileName);

    } catch (error) {
      console.error("Error al generar el PDF:", error);
      alert("Error al generar el PDF. Intente nuevamente.");
    }
  };

  // Función para generar PDF de todas las elecciones
  const generarPDFTodas = async () => {
    try {
      const response = await axios.get(API_BASE_URL);
      const todasLasElecciones = response.data;

      const doc = new jsPDF();

      doc.setFontSize(20);
      doc.setTextColor(0, 0, 128);
      doc.text("REPORTE GENERAL DE ELECCIONES", 105, 20, { align: 'center' });

      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text(`Fecha de generación: ${new Date().toLocaleDateString('es-ES')}`, 14, 35);
      doc.text(`Total de elecciones: ${todasLasElecciones.length}`, 14, 45);

      let startY = 55;

      todasLasElecciones.forEach((eleccion, eleccionIndex) => {
        if (eleccionIndex > 0) {
          doc.addPage();
          startY = 20;
        }

        const datosGrafico = prepararDatosGrafico(eleccion.candidates || []);
        const totalVotos = datosGrafico.reduce((sum, candidato) => sum + candidato.votos, 0);

        doc.setFontSize(16);
        doc.text(`Elección: ${eleccion.nombre_election}`, 14, startY);
        
        doc.setFontSize(12);
        doc.text(`Total de votos: ${totalVotos}`, 14, startY + 10);

        const tableColumn = ["#", "Candidato", "Votos", "%"];
        const tableRows = datosGrafico.map((candidato, index) => [
          index + 1,
          candidato.nombre,
          candidato.votos,
          `${candidato.porcentaje.toFixed(2)}%`
        ]);

        autoTable(doc, {
          head: [tableColumn],
          body: tableRows,
          startY: startY + 20,
          theme: 'grid',
          headStyles: { 
            fillColor: [0, 51, 102],
            textColor: 255,
            fontStyle: 'bold'
          },
          styles: {
            fontSize: 9,
            cellPadding: 3,
          },
          columnStyles: {
            0: { cellWidth: 12, halign: 'center' },
            1: { cellWidth: 'auto' },
            2: { cellWidth: 25, halign: 'center' },
            3: { cellWidth: 25, halign: 'center' }
          }
        });

        // Agregar gráfico simple después de la tabla
        const finalY = doc.lastAutoTable.finalY || startY + 50;
        const chartStartY = finalY + 10;

        doc.setFontSize(10);
        doc.text("Distribución de Votos:", 14, chartStartY);

        // Crear mini gráfico de barras
        const miniChartWidth = 180;
        const miniChartHeight = 30;
        const miniBarWidth = 15;
        const maxVotosMini = Math.max(...datosGrafico.map(d => d.votos));
        const miniSpacing = miniChartWidth / (datosGrafico.length + 1);

        datosGrafico.forEach((candidato, index) => {
          const barHeight = (candidato.votos / maxVotosMini) * (miniChartHeight - 5);
          const x = 14 + (index + 1) * miniSpacing - miniBarWidth / 2;
          const y = chartStartY + 15 + (miniChartHeight - barHeight);

          doc.setFillColor(...hexToRgb(candidato.color));
          doc.rect(x, y, miniBarWidth, barHeight, 'F');

          // Número de votos
          doc.setFontSize(6);
          doc.setTextColor(0, 0, 0);
          doc.text(candidato.votos.toString(), x + miniBarWidth/2, y - 2, { align: 'center' });
        });

        startY = chartStartY + miniChartHeight + 20;
      });

      // Numeración de páginas
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text(
          `Página ${i} de ${pageCount} - Sistema Electoral`,
          doc.internal.pageSize.width / 2,
          doc.internal.pageSize.height - 10,
          { align: 'center' }
        );
      }

      doc.save("Reporte_General_Elecciones.pdf");

    } catch (error) {
      console.error("Error al generar el PDF general:", error);
      alert("Error al generar el reporte general. Intente nuevamente.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navbar administrador */}
      <Navbar_admin />

      {/* Contenido */}
      <div className="pt-24 px-6 pb-6">
        <div className="flex justify-between items-center mb-6 max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-blue-900">
            Resultados de ELecciones
          </h1>
          
          {elecciones.length > 0 && (
            <button
              onClick={generarPDFTodas}
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg flex items-center"
            >
              📊 Descargar Reporte General
            </button>
          )}
        </div>

        {/* Información de paginación */}
        <div className="flex justify-between items-center mb-4 max-w-6xl mx-auto">
          <div className="text-sm text-gray-600">
            Mostrando {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, totalItems)} de {totalItems} elecciones
          </div>
          
          {/* Selector de items por página */}
          <div className="flex items-center space-x-2">
            <label htmlFor="itemsPerPage" className="text-sm text-gray-600">
              Mostrar:
            </label>
            <select
              id="itemsPerPage"
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
                fetchResults(1);
              }}
              className="border border-gray-300 rounded px-2 py-1 text-sm"
            >
              <option value="3">3</option>
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="20">20</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900 mx-auto mb-4"></div>
            <p className="text-gray-500">Cargando resultados...</p>
          </div>
        ) : error ? (
          <div className="text-center bg-red-50 p-4 rounded-lg max-w-6xl mx-auto">
            <p className="text-red-600 mb-2">{error}</p>
            <button 
              onClick={() => fetchResults(currentPage)}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Reintentar
            </button>
          </div>
        ) : elecciones.length === 0 ? (
          <div className="text-center bg-yellow-50 p-6 rounded-lg max-w-6xl mx-auto">
            <p className="text-yellow-700 text-lg">
              No hay resultados de candidatos disponibles.
            </p>
          </div>
        ) : (
          <div className="max-w-6xl mx-auto">
            <div className="flex justify-center flex-col items-center">
              {elecciones.map((eleccion, index) => {
                const datosGrafico = prepararDatosGrafico(eleccion.candidates || []);
                const totalVotos = datosGrafico.reduce((sum, candidato) => sum + candidato.votos, 0);
                
                return (
                  <div key={eleccion.id_election + '-' + index} className="mb-8 w-full">
                    <div className="bg-white p-6 rounded-lg shadow-lg border-l-4 border-blue-600">
                      <div className="flex justify-between items-center mb-4">
                        <h2 className="text-2xl font-semibold text-gray-700">
                          {eleccion.nombre_election}
                        </h2>
                        <button
                          onClick={() => generarPDF(eleccion)}
                          className="bg-blue-900 hover:bg-blue-800 text-white font-medium py-2 px-4 rounded-lg flex items-center"
                        >
                          📄 Descargar PDF
                        </button>
                      </div>
                      
                      <p className="text-gray-600 mb-6">
                        <strong>Total de votos:</strong> {totalVotos}
                      </p>

                      {/* Gráfica de resultados - Estilo similar a la otra vista */}
                      <div className="mb-8">
                        <h3 className="text-xl font-semibold text-gray-700 mb-4 text-center">
                          Gráfica de Resultados
                        </h3>
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                          <div className="flex justify-center">
                            <canvas 
                              ref={el => chartRefs.current[`chart-${eleccion.id_election}`] = el}
                              width="800" 
                              height="400"
                              className="max-w-full"
                            />
                          </div>
                        </div>
                        
                        {/* Leyenda de colores mejorada */}
                        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {datosGrafico.map((candidato, index) => (
                            <div key={index} className="flex items-center p-2 bg-white rounded-lg border border-gray-200">
                              <div 
                                className="w-4 h-4 mr-3 rounded"
                                style={{ backgroundColor: candidato.color }}
                              ></div>
                              <div className="flex-1">
                                <span className="text-sm font-medium text-gray-900 block">
                                  {candidato.nombre}
                                </span>
                                <span className="text-xs text-gray-600">
                                  {candidato.votos} votos ({candidato.porcentaje.toFixed(2)}%)
                                </span>
                              </div>
                              {candidato.esGanador && (
                                <span className="ml-2 bg-green-100 text-green-800 text-xs font-bold px-2 py-1 rounded">
                                  GANADOR
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Tabla de resultados */}
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse bg-white rounded-lg overflow-hidden">
                          <thead className="bg-blue-900 text-white text-lg">
                            <tr>
                              <th className="p-3 border text-left">Candidato</th>
                              <th className="p-3 border text-center">Votos Obtenidos</th>
                              <th className="p-3 border text-center">Porcentaje</th>
                            </tr>
                          </thead>
                          <tbody>
                            {eleccion.candidates && eleccion.candidates.length > 0 ? (
                              datosGrafico.map((candidato, candidateIndex) => (
                                <tr 
                                  key={candidateIndex} 
                                  className={`hover:bg-gray-50 ${
                                    candidateIndex === 0 ? 'bg-green-50' : ''
                                  }`}
                                >
                                  <td className="p-3 border">
                                    <div className="flex items-center">
                                      {candidateIndex === 0 && (
                                        <span className="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full mr-3">
                                          🏆
                                        </span>
                                      )}
                                      <span className={candidateIndex === 0 ? 'font-bold text-green-800' : ''}>
                                        {candidato.nombre}
                                      </span>
                                    </div>
                                  </td>
                                  <td className="p-3 border text-center font-bold">
                                    <span className={candidateIndex === 0 ? 'text-green-800 text-lg' : ''}>
                                      {candidato.votos}
                                    </span>
                                  </td>
                                  <td className="p-3 border text-center font-bold">
                                    <span className={candidateIndex === 0 ? 'text-green-800 text-lg' : ''}>
                                      {candidato.porcentaje.toFixed(2)}%
                                    </span>
                                  </td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td colSpan="3" className="p-3 text-center text-gray-500">
                                  No hay candidatos registrados para esta elección.
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Controles de paginación */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center space-x-2 mt-6">
                <button
                  onClick={goToPreviousPage}
                  disabled={currentPage === 1}
                  className={`px-4 py-2 rounded ${
                    currentPage === 1
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-blue-500 text-white hover:bg-blue-700"
                  }`}
                >
                  Anterior
                </button>

                {currentPage > 3 && (
                  <>
                    <button
                      onClick={() => goToPage(1)}
                      className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100"
                    >
                      1
                    </button>
                    {currentPage > 4 && <span className="px-2">...</span>}
                  </>
                )}

                {getPageNumbers().map(page => (
                  <button
                    key={page}
                    onClick={() => goToPage(page)}
                    className={`px-4 py-2 border rounded ${
                      currentPage === page
                        ? "bg-blue-500 text-white border-blue-500"
                        : "border-gray-300 hover:bg-gray-100"
                    }`}
                  >
                    {page}
                  </button>
                ))}

                {currentPage < totalPages - 2 && (
                  <>
                    {currentPage < totalPages - 3 && <span className="px-2">...</span>}
                    <button
                      onClick={() => goToPage(totalPages)}
                      className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100"
                    >
                      {totalPages}
                    </button>
                  </>
                )}

                <button
                  onClick={goToNextPage}
                  disabled={currentPage === totalPages}
                  className={`px-4 py-2 rounded ${
                    currentPage === totalPages
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-blue-500 text-white hover:bg-blue-700"
                  }`}
                >
                  Siguiente
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Resultado_candidatos_admin;