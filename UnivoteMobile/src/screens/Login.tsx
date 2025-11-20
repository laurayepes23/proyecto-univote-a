import React, { useState } from 'react';
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
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

import api from '../api/axios';

type RootStackParamList = {
  Login: undefined;
  Dashboard: undefined;
  RegistroVotante: undefined;
  RegistroCandidato: undefined;
};

type Props = {
  navigation: StackNavigationProp<RootStackParamList, 'Login'>;
};

export default function Login({ navigation }: Props) {
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [mostrarContrasena, setMostrarContrasena] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!correo.trim() || !contrasena.trim()) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }

    setLoading(true);

    try {
      // Intento 1: Login como Candidato
      try {
        const candidateResponse = await api.post('/candidates/login', {
          correo_candidate: correo,
          contrasena_candidate: contrasena,
        });

        await AsyncStorage.multiSet([
          ['candidateData', JSON.stringify(candidateResponse.data)],
          ['candidateId', candidateResponse.data.id_candidate.toString()],
          ['candidateName', `${candidateResponse.data.nombre_candidate} ${candidateResponse.data.apellido_candidate}`],
          ['userRole', 'candidate'],
        ]);

        Alert.alert('¡Bienvenido!', 'Inicio de sesión exitoso');
        navigation.navigate('Dashboard');
        return;
      } catch (candidateError: any) {
        console.log('❌ Error login candidato:', candidateError.response?.data);
      }

      // Intento 2: Login como Votante
      try {
        const voterResponse = await api.post('/voters/login', {
          correo_voter: correo,
          contrasena_voter: contrasena,
        });

        const voterData = voterResponse.data.voter || voterResponse.data;

        await AsyncStorage.multiSet([
          ['voterData', JSON.stringify(voterData)],
          ['voterId', voterData.id_voter.toString()],
          ['voterName', `${voterData.nombre_voter} ${voterData.apellido_voter}`],
          ['userRole', 'voter'],
        ]);

        Alert.alert('¡Bienvenido!', 'Inicio de sesión exitoso');
        navigation.navigate('Dashboard');
        return;
      } catch (voterError: any) {
        console.log('❌ Error login votante:', voterError.response?.data);
      }

      // Intento 3: Login como Administrador
      try {
        const adminResponse = await api.post('/administrators/login', {
          correo_admin: correo,
          contrasena_admin: contrasena,
        });

        await AsyncStorage.multiSet([
          ['adminData', JSON.stringify(adminResponse.data)],
          ['adminId', adminResponse.data.id_admin.toString()],
          ['adminName', `${adminResponse.data.nombre_admin} ${adminResponse.data.apellido_admin}`],
          ['userRole', 'admin'],
        ]);

        Alert.alert('¡Bienvenido!', 'Inicio de sesión exitoso');
        navigation.navigate('Dashboard');
        return;
      } catch (adminError: any) {
        // Si los tres intentos fallan
        const errorMessage = adminError.response?.data?.message || 'Correo o contraseña incorrectos';
        Alert.alert('Error', errorMessage);
        
        // Limpiar AsyncStorage
        await AsyncStorage.multiRemove([
          'candidateData', 'candidateId', 'voterData', 'voterId',
          'adminData', 'adminId', 'userRole',
        ]);
      }
    } catch (error) {
      console.error('Error inesperado:', error);
      Alert.alert('Error', 'Ocurrió un error al intentar iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        {/* Logo */}
        <View style={styles.logoContainer}>
          <Ionicons name="person-circle-outline" size={120} color="#1a237e" />
          <Text style={styles.logoText}>UNIVOTE</Text>
        </View>

        <Text style={styles.title}>Iniciar Sesión</Text>

        {/* Formulario */}
        <View style={styles.form}>
          {/* Correo */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Correo</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="mail-outline" size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={correo}
                onChangeText={setCorreo}
                placeholder="Escribe tu correo institucional"
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!loading}
              />
            </View>
          </View>

          {/* Contraseña */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Contraseña</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed-outline" size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { flex: 1 }]}
                value={contrasena}
                onChangeText={setContrasena}
                placeholder="Escribe tu contraseña"
                secureTextEntry={!mostrarContrasena}
                editable={!loading}
              />
              <TouchableOpacity
                onPress={() => setMostrarContrasena(!mostrarContrasena)}
                style={styles.eyeIcon}
              >
                <Ionicons
                  name={mostrarContrasena ? 'eye-outline' : 'eye-off-outline'}
                  size={20}
                  color="#666"
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Botón Ingresar */}
          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Ingresar</Text>
            )}
          </TouchableOpacity>

          {/* Enlaces */}
          <View style={styles.linksContainer}>
            <Text style={styles.linkText}>
              ¿Aún no tienes cuenta?{' '}
              <Text
                style={styles.link}
                onPress={() => navigation.navigate('RegistroVotante')}
              >
                Regístrate
              </Text>
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logoText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1a237e',
    marginTop: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#333',
    marginBottom: 30,
  },
  form: {
    gap: 20,
  },
  inputGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: '#333',
  },
  eyeIcon: {
    padding: 5,
  },
  button: {
    backgroundColor: '#1a237e',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#1a237e',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 3,
  },
  buttonDisabled: {
    backgroundColor: '#9fa8da',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  linksContainer: {
    alignItems: 'center',
    marginTop: 10,
  },
  linkText: {
    fontSize: 14,
    color: '#666',
  },
  link: {
    color: '#1a237e',
    fontWeight: '600',
  },
});
