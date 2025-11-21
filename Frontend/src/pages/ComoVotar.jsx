import React from "react";
import Navbar from "../components/Navbar";

export default function ComoVotar() {
    const steps = [
        {
            title: "1. Registrarse o Iniciar Sesión",
            description:
                "El votante debe crear una cuenta para participar. Si ya tiene una, simplemente debe loguearse utilizando sus credenciales.",
        },
        {
            title: "2. Buscar la elección disponible",
            description:
                "Dentro del sistema podrá visualizar las elecciones activas. Deberá seleccionar aquella en la que desea participar.",
        },
        {
            title: "3. Seleccionar su candidato",
            description:
                "Al entrar a la elección, podrá ver los candidatos con sus datos, perfiles y propuestas para tomar una decisión informada.",
        },
        {
            title: "4. Emitir su voto",
            description:
                "El votante seleccionará al candidato de su preferencia y pulsará en 'Votar'.",
        },
        {
            title: "5. Confirmación de voto",
            description:
                "Por motivos de seguridad, aparecerá una ventana de confirmación donde deberá validar su elección.",
        },
        {
            title: "6. Registro exitoso",
            description:
                "Finalmente, el sistema mostrará un mensaje confirmando que el voto fue registrado correctamente.",
        },
    ];

    return (
        <div className="min-h-screen bg-white flex items-center justify-center px-4">

            <Navbar />
            <div className="max-w-4xl mx-auto bg-white shadow-xl rounded-xl p-8 mt-30">
                <h1 className="text-3xl font-bold text-blue-900 text-center mb-8">
                    ¿Cómo Votar en UNIVOTE?
                </h1>

                <div className="space-y-6">
                    {steps.map((step, index) => (
                        <div
                            key={index}
                            className="bg-blue-50 border-l-4 border-blue-700 p-6 rounded-lg"
                        >
                            <h2 className="text-xl font-semibold text-blue-900">
                                {step.title}
                            </h2>
                            <p className="text-gray-700 mt-2">{step.description}</p>
                        </div>
                    ))}
                </div>

                <div className="text-center mt-10">
                    <p className="text-gray-600">
                        UNIVOTE garantiza un proceso electoral seguro, transparente y fácil
                        para todos los usuarios.
                    </p>
                </div>
            </div>
        </div>
    );
}
