import React, { useState, useEffect } from "react";
import Navbar_admin from "../components/Navbar_admin";
import Footer from "../components/Footer";
import axios from "axios";
import { jsPDF } from "jspdf";
import autoTable from 'jspdf-autotable';

const API_BASE_URL = "http://localhost:3000/elections/results";

const Resultado_elecciones_adm = () => {
    // Estado para almacenar los resultados de la API
    const [elecciones, setElecciones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Estados para la paginación
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(3);
    const [totalItems, setTotalItems] = useState(0);

    // Calcular el número total de páginas
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    // Función para obtener los resultados de las elecciones de la API
    const fetchResults = async (page = 1) => {
        setLoading(true);
        try {
            const response = await axios.get(API_BASE_URL);
            console.log("Datos recibidos del backend:", response.data);
            const allElections = response.data;
            
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

    useEffect(() => {
        fetchResults();
    }, []);

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

    // Función para generar PDF de una elección específica
    const generarPDF = (eleccion) => {
        try {
            const doc = new jsPDF();

            // Título del documento
            doc.setFontSize(20);
            doc.setTextColor(0, 0, 128); // Azul oscuro
            doc.text("RESULTADOS ELECTORALES", 105, 20, { align: 'center' });

            // Información de la elección
            doc.setFontSize(16);
            doc.setTextColor(0, 0, 0);
            doc.text(`Elección: ${eleccion.nombre_election}`, 14, 35);
            
            doc.setFontSize(12);
            doc.text(`Fecha de generación: ${new Date().toLocaleDateString('es-ES')}`, 14, 45);
            
            // Calcular total de votos
            const totalVotos = eleccion.candidates.reduce((sum, candidato) => sum + candidato.votos, 0);
            doc.text(`Total de votos emitidos: ${totalVotos}`, 14, 55);

            // Preparar datos para la tabla
            const tableColumn = ["#", "Candidato", "Votos Obtenidos", "Porcentaje"];
            
            const tableRows = eleccion.candidates
                .sort((a, b) => b.votos - a.votos)
                .map((candidato, index) => [
                    index + 1,
                    candidato.nombre_candidate,
                    candidato.votos,
                    totalVotos > 0 ? `${((candidato.votos / totalVotos) * 100).toFixed(2)}%` : "0.00%"
                ]);

            // Crear la tabla
            autoTable(doc, {
                head: [tableColumn],
                body: tableRows,
                startY: 65,
                theme: 'grid',
                headStyles: { 
                    fillColor: [0, 51, 102], // Azul oscuro
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
            // Obtener todas las elecciones para el reporte general
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
                // Si no es la primera elección, agregar nueva página
                if (eleccionIndex > 0) {
                    doc.addPage();
                    startY = 20;
                }

                doc.setFontSize(16);
                doc.text(`Elección: ${eleccion.nombre_election}`, 14, startY);
                
                const totalVotos = eleccion.candidates.reduce((sum, candidato) => sum + candidato.votos, 0);
                
                doc.setFontSize(12);
                doc.text(`Total de votos: ${totalVotos}`, 14, startY + 10);

                const tableColumn = ["#", "Candidato", "Votos", "%"];
                const tableRows = eleccion.candidates
                    .sort((a, b) => b.votos - a.votos)
                    .map((candidato, index) => [
                        index + 1,
                        candidato.nombre_candidate,
                        candidato.votos,
                        totalVotos > 0 ? `${((candidato.votos / totalVotos) * 100).toFixed(2)}%` : "0.00%"
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
            <div className="pt-24 px-6 pb-12">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-blue-900">
                        Resultados de Elecciones
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
                <div className="flex justify-between items-center mb-4">
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
                        <p className="text-gray-500 mb-4">Cargando resultados...</p>
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900 mx-auto"></div>
                    </div>
                ) : error ? (
                    <div className="text-center bg-red-50 p-4 rounded-lg">
                        <p className="text-red-600 mb-2">{error}</p>
                        <button 
                            onClick={() => fetchResults(currentPage)}
                            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                        >
                            Reintentar
                        </button>
                    </div>
                ) : elecciones.length === 0 ? (
                    <div className="text-center bg-yellow-50 p-6 rounded-lg">
                        <p className="text-yellow-700 text-lg">
                            No hay resultados disponibles.
                        </p>
                    </div>
                ) : (
                    <>
                        {elecciones.map((eleccion) => {
                            const totalVotos = eleccion.candidates.reduce((sum, candidato) => sum + candidato.votos, 0);
                            
                            return (
                                <div key={eleccion.id_election} className="mb-8 bg-white rounded-lg shadow-lg p-6">
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
                                    
                                    <p className="text-gray-600 mb-4">
                                        <strong>Total de votos:</strong> {totalVotos}
                                    </p>

                                    <div className="flex justify-center">
                                        <table className="w-full max-w-2xl border-collapse bg-white shadow-lg rounded-lg overflow-hidden">
                                            <thead className="bg-blue-900 text-white text-lg">
                                                <tr>
                                                    <th className="p-3 border text-left">#</th>
                                                    <th className="p-3 border text-left">Candidato</th>
                                                    <th className="p-3 border text-center">Votos</th>
                                                    <th className="p-3 border text-center">Porcentaje</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {eleccion.candidates && eleccion.candidates.length > 0 ? (
                                                    eleccion.candidates
                                                        .sort((a, b) => b.votos - a.votos)
                                                        .map((candidato, index) => {
                                                            const porcentaje = totalVotos > 0 
                                                                ? ((candidato.votos / totalVotos) * 100).toFixed(2)
                                                                : "0.00";
                                                            
                                                            return (
                                                                <tr key={candidato.id_candidate} className="hover:bg-gray-50">
                                                                    <td className="p-3 border text-center font-bold">
                                                                        {index + 1}
                                                                    </td>
                                                                    <td className="p-3 border">
                                                                        {candidato.nombre_candidate}
                                                                    </td>
                                                                    <td className="p-3 border text-center font-bold">
                                                                        {candidato.votos}
                                                                    </td>
                                                                    <td className="p-3 border text-center">
                                                                        {porcentaje}%
                                                                    </td>
                                                                </tr>
                                                            );
                                                        })
                                                ) : (
                                                    <tr>
                                                        <td colSpan="4" className="p-3 text-center text-gray-500">
                                                            No hay candidatos registrados para esta elección.
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            );
                        })}

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
                    </>
                )}
            </div>
        </div>
    );
};

export default Resultado_elecciones_adm;