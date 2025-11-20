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
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import api from '../api/axios';

type RootStackParamList = {
  Login: undefined;
  Dashboard: undefined;
  RegistroVotante: undefined;
  RegistroCandidato: undefined;
  RecuperarPassword: undefined;
};

type Props = {
  navigation: StackNavigationProp<RootStackParamList, 'RecuperarPassword'>;
};

export default function RecuperarPassword({ navigation }: Props) {
  const [correo, setCorreo] = useState('');
  const [loading, setLoading] = useState(false);
  const [paso, setPaso] = useState(1); // 1: Ingresar correo, 2: Código verificación, 3: Nueva contraseña
  const [codigo, setCodigo] = useState('');
  const [nuevaContrasena, setNuevaContrasena] = useState('');
  const [confirmarContrasena, setConfirmarContrasena] = useState('');
  const [mostrarContrasena, setMostrarContrasena] = useState(false);
  const [mostrarConfirmarContrasena, setMostrarConfirmarContrasena] = useState(false);
  const [token, setToken] = useState('');

  const handleSolicitarCodigo = async () => {
    if (!correo.trim()) {
      Alert.alert('Error', 'Por favor ingresa tu correo electrónico');
      return;
    }

    if (!correo.includes('@')) {
      Alert.alert('Error', 'Por favor ingresa un correo electrónico válido');
      return;
    }

    setLoading(true);

    try {
      // Enviar solicitud de recuperación
      const response = await api.post('/auth/solicitar-recuperacion', {
        correo: correo,
      });

      Alert.alert(
        'Código enviado',
        'Se ha enviado un código de verificación a tu correo electrónico',
        [{ text: 'OK', onPress: () => setPaso(2) }]
      );
    } catch (error: any) {
      console.error('Error solicitando recuperación:', error);
      const errorMessage = error.response?.data?.message || 'Error al solicitar recuperación de contraseña';
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleVerificarCodigo = async () => {
    if (!codigo.trim()) {
      Alert.alert('Error', 'Por favor ingresa el código de verificación');
      return;
    }

    setLoading(true);

    try {
      const response = await api.post('/auth/verificar-codigo', {
        correo: correo,
        codigo: codigo,
      });

      setToken(response.data.token);
      Alert.alert(
        'Código verificado',
        'Ahora puedes crear tu nueva contraseña',
        [{ text: 'OK', onPress: () => setPaso(3) }]
      );
    } catch (error: any) {
      console.error('Error verificando código:', error);
      const errorMessage = error.response?.data?.message || 'Código inválido o expirado';
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleActualizarPassword = async () => {
    if (!nuevaContrasena.trim() || !confirmarContrasena.trim()) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }

    if (nuevaContrasena !== confirmarContrasena) {
      Alert.alert('Error', 'Las contraseñas no coinciden');
      return;
    }

    if (nuevaContrasena.length < 6) {
      Alert.alert('Error', 'La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setLoading(true);

    try {
      await api.post('/auth/actualizar-password', {
        token: token,
        nuevaContrasena: nuevaContrasena,
      });

      Alert.alert(
        'Contraseña actualizada',
        'Tu contraseña ha sido actualizada exitosamente',
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('Login'),
          },
        ]
      );
    } catch (error: any) {
      console.error('Error actualizando contraseña:', error);
      const errorMessage = error.response?.data?.message || 'Error al actualizar la contraseña';
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const renderPaso1 = () => (
    <View style={styles.pasoContainer}>
      <Text style={styles.subtitle}>Ingresa tu correo electrónico</Text>
      <Text style={styles.instruction}>
        Te enviaremos un código de verificación para restablecer tu contraseña
      </Text>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Correo electrónico</Text>
        <View style={styles.inputContainer}>
          <Ionicons name="mail-outline" size={20} color="#666" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            value={correo}
            onChangeText={setCorreo}
            placeholder="tu.correo@institucion.edu"
            keyboardType="email-address"
            autoCapitalize="none"
            editable={!loading}
          />
        </View>
      </View>

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleSolicitarCodigo}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Enviar código</Text>
        )}
      </TouchableOpacity>
    </View>
  );

  const renderPaso2 = () => (
    <View style={styles.pasoContainer}>
      <Text style={styles.subtitle}>Verifica tu identidad</Text>
      <Text style={styles.instruction}>
        Ingresa el código de 6 dígitos que enviamos a: {'\n'}
        <Text style={styles.correoText}>{correo}</Text>
      </Text>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Código de verificación</Text>
        <View style={styles.inputContainer}>
          <Ionicons name="key-outline" size={20} color="#666" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            value={codigo}
            onChangeText={setCodigo}
            placeholder="123456"
            keyboardType="number-pad"
            maxLength={6}
            editable={!loading}
          />
        </View>
      </View>

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleVerificarCodigo}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Verificar código</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.secondaryButton}
        onPress={handleSolicitarCodigo}
        disabled={loading}
      >
        <Text style={styles.secondaryButtonText}>Reenviar código</Text>
      </TouchableOpacity>
    </View>
  );

  const renderPaso3 = () => (
    <View style={styles.pasoContainer}>
      <Text style={styles.subtitle}>Crea tu nueva contraseña</Text>
      <Text style={styles.instruction}>
        Ingresa y confirma tu nueva contraseña
      </Text>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Nueva contraseña</Text>
        <View style={styles.inputContainer}>
          <Ionicons name="lock-closed-outline" size={20} color="#666" style={styles.inputIcon} />
          <TextInput
            style={[styles.input, { flex: 1 }]}
            value={nuevaContrasena}
            onChangeText={setNuevaContrasena}
            placeholder="Mínimo 6 caracteres"
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

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Confirmar contraseña</Text>
        <View style={styles.inputContainer}>
          <Ionicons name="lock-closed-outline" size={20} color="#666" style={styles.inputIcon} />
          <TextInput
            style={[styles.input, { flex: 1 }]}
            value={confirmarContrasena}
            onChangeText={setConfirmarContrasena}
            placeholder="Repite tu contraseña"
            secureTextEntry={!mostrarConfirmarContrasena}
            editable={!loading}
          />
          <TouchableOpacity
            onPress={() => setMostrarConfirmarContrasena(!mostrarConfirmarContrasena)}
            style={styles.eyeIcon}
          >
            <Ionicons
              name={mostrarConfirmarContrasena ? 'eye-outline' : 'eye-off-outline'}
              size={20}
              color="#666"
            />
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleActualizarPassword}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Actualizar contraseña</Text>
        )}
      </TouchableOpacity>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.card}>
          {/* Header */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => paso === 1 ? navigation.goBack() : setPaso(paso - 1)}
          >
            <Ionicons name="arrow-back" size={24} color="#1a237e" />
          </TouchableOpacity>

          <View style={styles.logoContainer}>
            <Ionicons name="key-outline" size={80} color="#1a237e" />
            <Text style={styles.logoText}>RECUPERAR CONTRASEÑA</Text>
          </View>

          {/* Indicador de pasos */}
          <View style={styles.stepsContainer}>
            <View style={[styles.step, paso >= 1 && styles.stepActive]}>
              <Text style={[styles.stepText, paso >= 1 && styles.stepTextActive]}>1</Text>
            </View>
            <View style={[styles.stepLine, paso >= 2 && styles.stepLineActive]} />
            <View style={[styles.step, paso >= 2 && styles.stepActive]}>
              <Text style={[styles.stepText, paso >= 2 && styles.stepTextActive]}>2</Text>
            </View>
            <View style={[styles.stepLine, paso >= 3 && styles.stepLineActive]} />
            <View style={[styles.step, paso >= 3 && styles.stepActive]}>
              <Text style={[styles.stepText, paso >= 3 && styles.stepTextActive]}>3</Text>
            </View>
          </View>

          {/* Contenido del paso actual */}
          {paso === 1 && renderPaso1()}
          {paso === 2 && renderPaso2()}
          {paso === 3 && renderPaso3()}

          {/* Volver al login */}
          <TouchableOpacity
            style={styles.loginLink}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.loginLinkText}>Volver al inicio de sesión</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 10,
    padding: 5,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logoText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a237e',
    marginTop: 10,
    textAlign: 'center',
  },
  stepsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
  },
  step: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepActive: {
    backgroundColor: '#1a237e',
  },
  stepText: {
    color: '#666',
    fontWeight: 'bold',
  },
  stepTextActive: {
    color: '#fff',
  },
  stepLine: {
    flex: 1,
    height: 2,
    backgroundColor: '#e0e0e0',
    marginHorizontal: 10,
  },
  stepLineActive: {
    backgroundColor: '#1a237e',
  },
  pasoContainer: {
    gap: 20,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#333',
  },
  instruction: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  correoText: {
    fontWeight: 'bold',
    color: '#1a237e',
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
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#1a237e',
    fontSize: 14,
    fontWeight: '600',
  },
  loginLink: {
    alignItems: 'center',
    marginTop: 20,
    padding: 10,
  },
  loginLinkText: {
    color: '#666',
    fontSize: 14,
  },
});  