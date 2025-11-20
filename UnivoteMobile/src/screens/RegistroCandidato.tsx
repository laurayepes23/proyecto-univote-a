import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  StyleSheet,
  ActivityIndicator,
  Image,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import * as ImagePicker from "expo-image-picker";
import { StackNavigationProp } from "@react-navigation/stack";
import { RouteProp } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons"; // Cambiado a @expo/vector-icons

import api from "../api/axios";
import { Career, CandidateFormData, Election } from "../types";
import {
  validateEmail,
  validatePassword,
  validateDocumentNumber,
  validateName,
  cleanName,
  cleanEmail,
  validateImageFile,
} from "../utils/validations";

type RootStackParamList = {
  Login: undefined;
  RegistroCandidato: undefined;
};

type Props = {
  navigation: StackNavigationProp<RootStackParamList, "RegistroCandidato">;
  route: RouteProp<RootStackParamList, "RegistroCandidato">;
};

export default function RegistroCandidato({ navigation }: Props) {
  const [formData, setFormData] = useState<CandidateFormData>({
    nombre_candidate: "",
    apellido_candidate: "",
    tipo_doc_candidate: "",
    num_doc_candidate: "",
    correo_candidate: "",
    contrasena_candidate: "",
    estado_candidate: "Activo",
    id_role: 3,
    id_career: "",
    id_election: "",
  });

  const [fotoUri, setFotoUri] = useState<string | null>(null);
  const [fotoFile, setFotoFile] = useState<any>(null);
  const [careers, setCareers] = useState<Career[]>([]);
  const [elections, setElections] = useState<Election[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{
    [key: string]: string | null;
  }>({});
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    fetchRelations();
    requestPermissions();
  }, []);

  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permiso necesario",
        "Se necesita acceso a la galería para seleccionar fotos."
      );
    }
  };

  const fetchRelations = async () => {
    try {
      const [careersResponse, electionsResponse] = await Promise.all([
        api.get("/careers"),
        api.get("/elections"),
      ]);

      setCareers(careersResponse.data);

      const eleccionesProgramadas = electionsResponse.data.filter(
        (election: Election) => election.estado_election === "Programada"
      );
      setElections(eleccionesProgramadas);
    } catch (error) {
      console.error("Error al obtener datos:", error);
      Alert.alert(
        "Error",
        "Error al cargar datos. Intenta recargar la página."
      );
    }
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const asset = result.assets[0];
        setFotoUri(asset.uri);

        const file = {
          uri: asset.uri,
          type: "image/jpeg",
          name: `foto_candidato_${Date.now()}.jpg`,
        };

        setFotoFile(file);

        const fileError = validateImageFile(file);
        setFieldErrors((prev) => ({
          ...prev,
          foto_candidate: fileError,
        }));
      }
    } catch (error) {
      console.error("Error al seleccionar imagen:", error);
      Alert.alert("Error", "No se pudo seleccionar la imagen.");
    }
  };

  const handleChange = (field: keyof CandidateFormData, value: string) => {
    let processedValue = value;

    if (field === "nombre_candidate" || field === "apellido_candidate") {
      processedValue = cleanName(value);
    }

    if (field === "correo_candidate") {
      processedValue = cleanEmail(value);
    }

    setFormData((prev) => ({ ...prev, [field]: processedValue }));
    validateField(field, processedValue);
  };

  const validateField = (fieldName: keyof CandidateFormData, value: string) => {
    const errors = { ...fieldErrors };

    switch (fieldName) {
      case "nombre_candidate":
        errors.nombre_candidate = validateName(value, "nombre");
        break;
      case "apellido_candidate":
        errors.apellido_candidate = validateName(value, "apellido");
        break;
      case "tipo_doc_candidate":
        errors.tipo_doc_candidate = !value
          ? "El tipo de documento es requerido"
          : null;
        break;
      case "num_doc_candidate":
        errors.num_doc_candidate = validateDocumentNumber(value);
        break;
      case "correo_candidate":
        errors.correo_candidate = validateEmail(value);
        break;
      case "contrasena_candidate":
        errors.contrasena_candidate = validatePassword(value);
        break;
      case "id_career":
        errors.id_career = !value ? "La carrera es requerida" : null;
        break;
      default:
        break;
    }

    setFieldErrors(errors);
  };

  const validateForm = (): boolean => {
    const errors: { [key: string]: string | null } = {};

    errors.nombre_candidate = validateName(formData.nombre_candidate, "nombre");
    errors.apellido_candidate = validateName(
      formData.apellido_candidate,
      "apellido"
    );
    errors.tipo_doc_candidate = !formData.tipo_doc_candidate
      ? "El tipo de documento es requerido"
      : null;
    errors.num_doc_candidate = validateDocumentNumber(
      formData.num_doc_candidate
    );
    errors.correo_candidate = validateEmail(formData.correo_candidate);
    errors.contrasena_candidate = validatePassword(
      formData.contrasena_candidate
    );
    errors.id_career = !formData.id_career ? "La carrera es requerida" : null;

    // Solo validar foto si se seleccionó una
    if (fotoFile) {
      errors.foto_candidate = validateImageFile(fotoFile);
    }

    setFieldErrors(errors);
    return !Object.values(errors).some((error) => error !== null);
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      Alert.alert("Error", "Por favor, corrige los errores en el formulario.");
      return;
    }

    setUploading(true);
    try {
      const formPayload = new FormData();

      // Agregar campos del formulario - CONVERTIR TODO A STRING
      Object.keys(formData).forEach((key) => {
        const value = formData[key as keyof CandidateFormData];
        if (value !== "" && value !== null && value !== undefined) {
          // Convertir TODO a string, incluyendo números
          formPayload.append(key, String(value));
        }
      });

      // Agregar foto si existe
      if (fotoFile) {
        formPayload.append("foto_candidate", fotoFile as any);
      }

      console.log("Enviando datos del candidato...");

      const response = await api.post("/candidates/register", formPayload, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        timeout: 30000,
      });

      console.log("Registro exitoso:", response.data);
      Alert.alert("Éxito", "¡Registro exitoso! Serás redirigido al login.", [
        {
          text: "OK",
          onPress: () => navigation.navigate("Login"),
        },
      ]);
    } catch (error: any) {
      console.error("Error completo:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Error en el registro. Por favor, inténtalo de nuevo.";
      Alert.alert("Error", errorMessage);
    } finally {
      setUploading(false);
    }
  };
  const isFormValid = () => {
    const requiredFields: (keyof CandidateFormData)[] = [
      "nombre_candidate",
      "apellido_candidate",
      "tipo_doc_candidate",
      "num_doc_candidate",
      "correo_candidate",
      "contrasena_candidate",
      "id_career",
    ];

    const hasEmptyFields = requiredFields.some((field) => !formData[field]);
    const hasErrors = Object.values(fieldErrors).some(
      (error) => error !== null
    );

    return !hasEmptyFields && !hasErrors;
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Registro de Candidato</Text>
        <Text style={styles.subtitle}>Completa tus datos para postularte</Text>
      </View>

      <View style={styles.form}>
        {/* Nombre */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Nombre</Text>
          <TextInput
            style={[
              styles.input,
              fieldErrors.nombre_candidate && styles.inputError,
            ]}
            value={formData.nombre_candidate}
            onChangeText={(value) => handleChange("nombre_candidate", value)}
            placeholder="Ej: Carlos (solo letras)"
            maxLength={50}
          />
          {fieldErrors.nombre_candidate && (
            <Text style={styles.errorText}>{fieldErrors.nombre_candidate}</Text>
          )}
        </View>

        {/* Apellido */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Apellido</Text>
          <TextInput
            style={[
              styles.input,
              fieldErrors.apellido_candidate && styles.inputError,
            ]}
            value={formData.apellido_candidate}
            onChangeText={(value) => handleChange("apellido_candidate", value)}
            placeholder="Ej: Rodríguez (solo letras)"
            maxLength={50}
          />
          {fieldErrors.apellido_candidate && (
            <Text style={styles.errorText}>
              {fieldErrors.apellido_candidate}
            </Text>
          )}
        </View>

        {/* Tipo de Documento */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Tipo de Documento</Text>
          <View
            style={[
              styles.pickerContainer,
              fieldErrors.tipo_doc_candidate && styles.inputError,
            ]}
          >
            <Picker
              selectedValue={formData.tipo_doc_candidate}
              onValueChange={(value: string) =>
                handleChange("tipo_doc_candidate", value)
              }
              style={styles.picker}
            >
              <Picker.Item label="Seleccione" value="" />
              <Picker.Item label="Cédula de Ciudadanía" value="CC" />
              <Picker.Item label="Tarjeta de Identidad" value="TI" />
              <Picker.Item label="Cédula de Extranjería" value="CE" />
            </Picker>
          </View>
          {fieldErrors.tipo_doc_candidate && (
            <Text style={styles.errorText}>
              {fieldErrors.tipo_doc_candidate}
            </Text>
          )}
        </View>

        {/* Número de Documento */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Número de Documento</Text>
          <TextInput
            style={[
              styles.input,
              fieldErrors.num_doc_candidate && styles.inputError,
            ]}
            value={formData.num_doc_candidate}
            onChangeText={(value) => handleChange("num_doc_candidate", value)}
            placeholder="Mínimo 10 dígitos"
            keyboardType="numeric"
            maxLength={15}
          />
          {fieldErrors.num_doc_candidate && (
            <Text style={styles.errorText}>
              {fieldErrors.num_doc_candidate}
            </Text>
          )}
        </View>

        {/* Correo Institucional */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Correo Institucional</Text>
          <TextInput
            style={[
              styles.input,
              fieldErrors.correo_candidate && styles.inputError,
            ]}
            value={formData.correo_candidate}
            onChangeText={(value) => handleChange("correo_candidate", value)}
            placeholder="ejemplo@gmail.com (sin caracteres especiales)"
            keyboardType="email-address"
            autoCapitalize="none"
            maxLength={100}
          />
          {fieldErrors.correo_candidate && (
            <Text style={styles.errorText}>{fieldErrors.correo_candidate}</Text>
          )}
        </View>

        {/* Contraseña */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Contraseña</Text>
          <View
            style={[
              styles.passwordContainer,
              fieldErrors.contrasena_candidate && styles.inputError,
            ]}
          >
            <TextInput
              style={styles.passwordInput}
              value={formData.contrasena_candidate}
              onChangeText={(value) =>
                handleChange("contrasena_candidate", value)
              }
              placeholder="Mínimo 8 caracteres con mayúscula, minúscula, número y carácter especial"
              secureTextEntry={!showPassword}
              maxLength={50}
            />
            <TouchableOpacity
              style={styles.eyeButton}
              onPress={() => setShowPassword(!showPassword)}
            >
              <Ionicons
                name={showPassword ? "eye-off" : "eye"}
                size={20}
                color="#666"
              />
            </TouchableOpacity>
          </View>
          {fieldErrors.contrasena_candidate && (
            <Text style={styles.errorText}>
              {fieldErrors.contrasena_candidate}
            </Text>
          )}
          <Text style={styles.passwordHint}>
            La contraseña debe tener: mínimo 8 caracteres, al menos una
            mayúscula, una minúscula, un número y un carácter especial.
          </Text>
        </View>

        {/* Carrera */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Carrera</Text>
          <View
            style={[
              styles.pickerContainer,
              fieldErrors.id_career && styles.inputError,
            ]}
          >
            <Picker
              selectedValue={formData.id_career}
              onValueChange={(value: string) =>
                handleChange("id_career", value)
              }
              style={styles.picker}
            >
              <Picker.Item label="Seleccione una carrera" value="" />
              {careers.map((career) => (
                <Picker.Item
                  key={career.id_career}
                  label={career.nombre_career}
                  value={career.id_career.toString()}
                />
              ))}
            </Picker>
          </View>
          {fieldErrors.id_career && (
            <Text style={styles.errorText}>{fieldErrors.id_career}</Text>
          )}
        </View>

        {/* Elección */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>
            Elección a la que se postula (Opcional)
          </Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={formData.id_election}
              onValueChange={(value: string) =>
                handleChange("id_election", value)
              }
              style={styles.picker}
            >
              <Picker.Item label="Seleccione una elección" value="" />
              {elections.length > 0 ? (
                elections.map((election) => (
                  <Picker.Item
                    key={election.id_election}
                    label={`${election.nombre_election} - ${election.estado_election}`}
                    value={election.id_election.toString()}
                  />
                ))
              ) : (
                <Picker.Item
                  label="No hay elecciones programadas disponibles"
                  value=""
                />
              )}
            </Picker>
          </View>
          <Text style={styles.hintText}>
            Solo se muestran elecciones en estado "Programada"
          </Text>
        </View>

        {/* Foto */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Foto (Opcional)</Text>

          {fotoUri && (
            <View style={styles.imagePreview}>
              <Image source={{ uri: fotoUri }} style={styles.image} />
              <TouchableOpacity
                style={styles.removeImageButton}
                onPress={() => {
                  setFotoUri(null);
                  setFotoFile(null);
                  setFieldErrors((prev) => ({ ...prev, foto_candidate: null }));
                }}
              >
                <Ionicons name="close-circle" size={24} color="#dc3545" />
              </TouchableOpacity>
            </View>
          )}

          <TouchableOpacity
            style={[
              styles.photoButton,
              fieldErrors.foto_candidate && styles.inputError,
            ]}
            onPress={pickImage}
            disabled={uploading}
          >
            <Ionicons name="camera" size={20} color="#666" />
            <Text style={styles.photoButtonText}>
              {fotoUri ? "Cambiar Foto" : "Seleccionar Foto"}
            </Text>
          </TouchableOpacity>

          {fieldErrors.foto_candidate && (
            <Text style={styles.errorText}>{fieldErrors.foto_candidate}</Text>
          )}

          <Text style={styles.hintText}>
            Formatos permitidos: JPG, JPEG, PNG
          </Text>
        </View>

        {/* Botón de Registro */}
        <TouchableOpacity
          style={[
            styles.registerButton,
            (!isFormValid() || uploading) && styles.registerButtonDisabled,
          ]}
          onPress={handleSubmit}
          disabled={!isFormValid() || uploading}
        >
          {uploading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.registerButtonText}>Registrar Candidato</Text>
          )}
        </TouchableOpacity>

        {/* Enlace al Login */}
        <TouchableOpacity
          style={styles.loginLink}
          onPress={() => navigation.navigate("Login")}
        >
          <Text style={styles.loginText}>
            ¿Ya tienes cuenta?{" "}
            <Text style={styles.loginLinkText}>Inicia sesión</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f8f9fa",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1a237e",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
  form: {
    padding: 20,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#fff",
  },
  inputError: {
    borderColor: "#dc3545",
    backgroundColor: "#f8d7da",
  },
  errorText: {
    color: "#dc3545",
    fontSize: 12,
    marginTop: 4,
  },
  hintText: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    backgroundColor: "#fff",
    overflow: "hidden",
  },
  picker: {
    height: 50,
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    backgroundColor: "#fff",
  },
  passwordInput: {
    flex: 1,
    padding: 12,
    fontSize: 16,
  },
  eyeButton: {
    padding: 12,
  },
  passwordHint: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
  },
  photoButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    backgroundColor: "#f8f9fa",
  },
  photoButtonText: {
    marginLeft: 8,
    fontSize: 16,
    color: "#666",
  },
  imagePreview: {
    position: "relative",
    alignItems: "center",
    marginBottom: 12,
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: "#1a237e",
  },
  removeImageButton: {
    position: "absolute",
    top: -5,
    right: -5,
    backgroundColor: "#fff",
    borderRadius: 12,
  },
  registerButton: {
    backgroundColor: "#1a237e",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
  },
  registerButtonDisabled: {
    backgroundColor: "#ccc",
  },
  registerButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  loginLink: {
    marginTop: 20,
    alignItems: "center",
  },
  loginText: {
    fontSize: 14,
    color: "#666",
  },
  loginLinkText: {
    color: "#1a237e",
    fontWeight: "bold",
  },
});
