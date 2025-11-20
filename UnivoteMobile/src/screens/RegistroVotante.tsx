import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';

import api from '../api/axios';
import { Career, VoterFormData } from '../types';
import {
  validateEmail,
  validatePassword,
  validateDocumentNumber,
  validateName,
  cleanName,
  cleanEmail,
} from '../utils/validations';

type RootStackParamList = {
  Login: undefined;
  RegistroVotante: undefined;
};

type Props = {
  navigation: StackNavigationProp<RootStackParamList, 'RegistroVotante'>;
  route: RouteProp<RootStackParamList, 'RegistroVotante'>;
};

export default function RegistroVotante({ navigation }: Props) {
  const [formData, setFormData] = useState<VoterFormData>({
    nombre_voter: '',
    apellido_voter: '',
    tipo_doc_voter: '',
    num_doc_voter: '',
    correo_voter: '',
    contrasena_voter: '',
    id_career: '',
    id_role: 2,
    estado_voter: 'Activo',
  });
  
  const [careers, setCareers] = useState<Career[]>([]);
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string | null }>({});
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    fetchCareers();
  }, []);

  const fetchCareers = async () => {
    try {
      const response = await api.get('/careers');
      setCareers(response.data);
    } catch (error) {
      console.error('Error al obtener las carreras:', error);
      Alert.alert('Error', 'Error al cargar las carreras. Intenta recargar la página.');
    }
  };

  const handleChange = (field: keyof VoterFormData, value: string) => {
    let processedValue = value;

    if (field === 'nombre_voter' || field === 'apellido_voter') {
      processedValue = cleanName(value);
    }

    if (field === 'correo_voter') {
      processedValue = cleanEmail(value);
    }

    setFormData(prev => ({ ...prev, [field]: processedValue }));
    validateField(field, processedValue);
  };

  const validateField = (fieldName: keyof VoterFormData, value: string) => {
    const errors = { ...fieldErrors };

    switch (fieldName) {
      case 'nombre_voter':
        errors.nombre_voter = validateName(value, 'nombre');
        break;
      case 'apellido_voter':
        errors.apellido_voter = validateName(value, 'apellido');
        break;
      case 'tipo_doc_voter':
        errors.tipo_doc_voter = !value ? 'El tipo de documento es requerido' : null;
        break;
      case 'num_doc_voter':
        errors.num_doc_voter = validateDocumentNumber(value);
        break;
      case 'correo_voter':
        errors.correo_voter = validateEmail(value);
        break;
      case 'contrasena_voter':
        errors.contrasena_voter = validatePassword(value);
        break;
      case 'id_career':
        errors.id_career = !value ? 'La carrera es requerida' : null;
        break;
      default:
        break;
    }

    setFieldErrors(errors);
  };

  const validateForm = (): boolean => {
    const errors: { [key: string]: string | null } = {};

    errors.nombre_voter = validateName(formData.nombre_voter, 'nombre');
    errors.apellido_voter = validateName(formData.apellido_voter, 'apellido');
    errors.tipo_doc_voter = !formData.tipo_doc_voter ? 'El tipo de documento es requerido' : null;
    errors.num_doc_voter = validateDocumentNumber(formData.num_doc_voter);
    errors.correo_voter = validateEmail(formData.correo_voter);
    errors.contrasena_voter = validatePassword(formData.contrasena_voter);
    errors.id_career = !formData.id_career ? 'La carrera es requerida' : null;

    setFieldErrors(errors);
    return !Object.values(errors).some(error => error !== null);
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      Alert.alert('Error', 'Por favor, corrige los errores en el formulario.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...formData,
        num_doc_voter: Number(formData.num_doc_voter),
        id_career: Number(formData.id_career),
      };

      await api.post('/voters', payload);

      Alert.alert('Éxito', '¡Registro exitoso! Serás redirigido al login.', [
        {
          text: 'OK',
          onPress: () => navigation.navigate('Login'),
        },
      ]);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Error en el registro. Por favor, inténtalo de nuevo.';
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = () => {
    return !Object.values(fieldErrors).some(error => error !== null) &&
           Object.values(formData).every(value => value !== '');
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Registro Univote</Text>
        <Text style={styles.subtitle}>Completa tus datos para registrarte</Text>
      </View>

      <View style={styles.form}>
        {/* Nombre */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Nombre</Text>
          <TextInput
            style={[
              styles.input,
              fieldErrors.nombre_voter && styles.inputError
            ]}
            value={formData.nombre_voter}
            onChangeText={(value) => handleChange('nombre_voter', value)}
            placeholder="Ej: María (solo letras)"
            maxLength={50}
          />
          {fieldErrors.nombre_voter && (
            <Text style={styles.errorText}>{fieldErrors.nombre_voter}</Text>
          )}
        </View>

        {/* Apellido */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Apellido</Text>
          <TextInput
            style={[
              styles.input,
              fieldErrors.apellido_voter && styles.inputError
            ]}
            value={formData.apellido_voter}
            onChangeText={(value) => handleChange('apellido_voter', value)}
            placeholder="Ej: González (solo letras)"
            maxLength={50}
          />
          {fieldErrors.apellido_voter && (
            <Text style={styles.errorText}>{fieldErrors.apellido_voter}</Text>
          )}
        </View>

        {/* Tipo de Documento */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Tipo de Documento</Text>
          <View style={[
            styles.pickerContainer,
            fieldErrors.tipo_doc_voter && styles.inputError
          ]}>
            <Picker
              selectedValue={formData.tipo_doc_voter}
              onValueChange={(value: string) => handleChange('tipo_doc_voter', value)}
              style={styles.picker}
            >
              <Picker.Item label="Seleccione" value="" />
              <Picker.Item label="Cédula de Ciudadanía" value="CC" />
              <Picker.Item label="Tarjeta de Identidad" value="TI" />
              <Picker.Item label="Cédula de Extranjería" value="CE" />
            </Picker>
          </View>
          {fieldErrors.tipo_doc_voter && (
            <Text style={styles.errorText}>{fieldErrors.tipo_doc_voter}</Text>
          )}
        </View>

        {/* Número de Documento */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Número de Documento</Text>
          <TextInput
            style={[
              styles.input,
              fieldErrors.num_doc_voter && styles.inputError
            ]}
            value={formData.num_doc_voter}
            onChangeText={(value) => handleChange('num_doc_voter', value)}
            placeholder="Mínimo 10 dígitos"
            keyboardType="numeric"
            maxLength={15}
          />
          {fieldErrors.num_doc_voter && (
            <Text style={styles.errorText}>{fieldErrors.num_doc_voter}</Text>
          )}
        </View>

        {/* Correo Institucional */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Correo Institucional</Text>
          <TextInput
            style={[
              styles.input,
              fieldErrors.correo_voter && styles.inputError
            ]}
            value={formData.correo_voter}
            onChangeText={(value) => handleChange('correo_voter', value)}
            placeholder="ejemplo@gmail.com (sin caracteres especiales)"
            keyboardType="email-address"
            autoCapitalize="none"
            maxLength={100}
          />
          {fieldErrors.correo_voter && (
            <Text style={styles.errorText}>{fieldErrors.correo_voter}</Text>
          )}
        </View>

        {/* Contraseña */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Contraseña</Text>
          <View style={[
            styles.passwordContainer,
            fieldErrors.contrasena_voter && styles.inputError
          ]}>
            <TextInput
              style={styles.passwordInput}
              value={formData.contrasena_voter}
              onChangeText={(value) => handleChange('contrasena_voter', value)}
              placeholder="Mínimo 8 caracteres con mayúscula, minúscula, número y carácter especial"
              secureTextEntry={!showPassword}
              maxLength={50}
            />
            <TouchableOpacity
              style={styles.eyeButton}
              onPress={() => setShowPassword(!showPassword)}
            >
              <Icon
                name={showPassword ? 'eye-off' : 'eye'}
                size={20}
                color="#666"
              />
            </TouchableOpacity>
          </View>
          {fieldErrors.contrasena_voter && (
            <Text style={styles.errorText}>{fieldErrors.contrasena_voter}</Text>
          )}
          <Text style={styles.passwordHint}>
            La contraseña debe tener: mínimo 8 caracteres, al menos una mayúscula, una minúscula, un número y un carácter especial.
          </Text>
        </View>

        {/* Carrera */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Carrera</Text>
          <View style={[
            styles.pickerContainer,
            fieldErrors.id_career && styles.inputError
          ]}>
            <Picker
              selectedValue={formData.id_career}
              onValueChange={(value: string) => handleChange('id_career', value)}
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

        {/* Botón de Registro */}
        <TouchableOpacity
          style={[
            styles.registerButton,
            (!isFormValid() || loading) && styles.registerButtonDisabled
          ]}
          onPress={handleSubmit}
          disabled={!isFormValid() || loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.registerButtonText}>Registrarse</Text>
          )}
        </TouchableOpacity>

        {/* Enlace al Login */}
        <TouchableOpacity
          style={styles.loginLink}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.loginText}>
            ¿Ya tienes cuenta? <Text style={styles.loginLinkText}>Inicia sesión</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a237e',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  form: {
    padding: 20,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  inputError: {
    borderColor: '#dc3545',
    backgroundColor: '#f8d7da',
  },
  errorText: {
    color: '#dc3545',
    fontSize: 12,
    marginTop: 4,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  picker: {
    height: 50,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#fff',
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
    color: '#666',
    marginTop: 4,
  },
  registerButton: {
    backgroundColor: '#1a237e',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  registerButtonDisabled: {
    backgroundColor: '#ccc',
  },
  registerButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loginLink: {
    marginTop: 20,
    alignItems: 'center',
  },
  loginText: {
    fontSize: 14,
    color: '#666',
  },
  loginLinkText: {
    color: '#1a237e',
    fontWeight: 'bold',
  },
});