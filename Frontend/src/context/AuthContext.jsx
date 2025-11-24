import { createContext, useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../api/axios";
import "react-toastify/dist/ReactToastify.css";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Verificar si el token sigue siendo válido al montar
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token && !user) {
      // Token existe pero user no está en estado, limpiar
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
  }, [user]);

  const login = async (correo, contrasena) => {
    setIsLoading(true);
    try {
      const { data } = await api.post("/api/auth/login", { correo, contrasena });

      if (!data.token || !data.usuario) {
        throw new Error("Respuesta de login inválida");
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.usuario));
      setUser(data.usuario);

      toast.success(`Bienvenido ${data.usuario.nombre}`);

      // Redirección según rol
      if (data.usuario.rol === "ADMIN") {
        navigate("/admin", { replace: true });
      } else if (data.usuario.rol === "CANDIDATE") {
        navigate("/candidato", { replace: true });
      } else if (data.usuario.rol === "VOTER") {
        navigate("/votante", { replace: true });
      } else {
        navigate("/", { replace: true });
      }
    } catch (e) {
      console.error("Error en login:", e);
      const errorMessage =
        e.response?.data?.message ||
        e.message ||
        "Error al iniciar sesión. Verifica tus credenciales.";
      toast.error(errorMessage);
      throw e;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    toast.info("Sesión cerrada correctamente");
    navigate("/login", { replace: true });
  };

  const value = {
    user,
    login,
    logout,
    isLoading,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe usarse dentro de AuthProvider");
  }
  return context;
}
