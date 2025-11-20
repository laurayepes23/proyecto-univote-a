import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Alert,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

type RootStackParamList = {
  Login: undefined;
  Dashboard: undefined;
  RegistroVotante: undefined;
  RegistroCandidato: undefined;
};

type Props = {
  navigation: StackNavigationProp<RootStackParamList, 'Dashboard'>;
};

export default function Dashboard({ navigation }: Props) {
  const [userName, setUserName] = useState<string>('');
  const [userRole, setUserRole] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const role = await AsyncStorage.getItem('userRole');
      
      if (!role) {
        navigation.replace('Login');
        return;
      }

      setUserRole(role);

      // Obtener nombre según el rol
      if (role === 'voter') {
        const name = await AsyncStorage.getItem('voterName');
        setUserName(name || 'Votante');
      } else if (role === 'candidate') {
        const name = await AsyncStorage.getItem('candidateName');
        setUserName(name || 'Candidato');
      } else if (role === 'admin') {
        const name = await AsyncStorage.getItem('adminName');
        setUserName(name || 'Administrador');
      }
    } catch (error) {
      console.error('Error al cargar datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Cerrar sesión',
      '¿Estás seguro de que deseas cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Salir',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.multiRemove([
                'userRole',
                'voterData', 'voterId', 'voterName',
                'candidateData', 'candidateId', 'candidateName',
                'adminData', 'adminId', 'adminName',
              ]);
              navigation.replace('Login');
            } catch (error) {
              console.error('Error al cerrar sesión:', error);
            }
          },
        },
      ]
    );
  };

  const getRoleDisplay = () => {
    switch (userRole) {
      case 'voter':
        return 'Votante';
      case 'candidate':
        return 'Candidato';
      case 'admin':
        return 'Administrador';
      default:
        return '';
    }
  };

  const getRoleIcon = () => {
    switch (userRole) {
      case 'voter':
        return 'people';
      case 'candidate':
        return 'person-circle';
      case 'admin':
        return 'shield-checkmark';
      default:
        return 'person';
    }
  };

  const getQuickActions = () => {
    if (userRole === 'voter') {
      return [
        { icon: 'ballot', title: 'Ver Elecciones', color: '#2196F3', action: () => {} },
        { icon: 'people-circle', title: 'Candidatos', color: '#9C27B0', action: () => {} },
        { icon: 'bar-chart', title: 'Resultados', color: '#FF9800', action: () => {} },
        { icon: 'person', title: 'Mi Perfil', color: '#4CAF50', action: () => {} },
      ];
    } else if (userRole === 'candidate') {
      return [
        { icon: 'create', title: 'Mis Propuestas', color: '#2196F3', action: () => {} },
        { icon: 'stats-chart', title: 'Estadísticas', color: '#9C27B0', action: () => {} },
        { icon: 'calendar', title: 'Mi Elección', color: '#FF9800', action: () => {} },
        { icon: 'person', title: 'Mi Perfil', color: '#4CAF50', action: () => {} },
      ];
    } else {
      return [
        { icon: 'people', title: 'Gestionar Votantes', color: '#2196F3', action: () => {} },
        { icon: 'calendar', title: 'Crear Elección', color: '#9C27B0', action: () => {} },
        { icon: 'person-add', title: 'Ver Candidatos', color: '#FF9800', action: () => {} },
        { icon: 'analytics', title: 'Resultados', color: '#4CAF50', action: () => {} },
      ];
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Ionicons name="hourglass-outline" size={50} color="#1a237e" />
        <Text style={styles.loadingText}>Cargando...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1a237e" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.headerGreeting}>¡Bienvenido!</Text>
            <Text style={styles.headerName}>{userName}</Text>
            <View style={styles.roleBadge}>
              <Ionicons name={getRoleIcon()} size={14} color="#fff" />
              <Text style={styles.roleText}>{getRoleDisplay()}</Text>
            </View>
          </View>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
            <Ionicons name="log-out-outline" size={28} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Logo Section */}
        <View style={styles.logoSection}>
          <View style={styles.logoCircle}>
            <Ionicons name="checkbox" size={80} color="#1a237e" />
          </View>
          <Text style={styles.appName}>UNIVOTE</Text>
          <Text style={styles.appTagline}>Sistema de Votación Universitaria</Text>
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsSection}>
          <Text style={styles.sectionTitle}>Acciones Rápidas</Text>
          <View style={styles.actionsGrid}>
            {getQuickActions().map((action, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.actionCard, { borderLeftColor: action.color }]}
                onPress={action.action}
                activeOpacity={0.7}
              >
                <View style={[styles.actionIconContainer, { backgroundColor: action.color }]}>
                  <Ionicons name={action.icon as any} size={28} color="#fff" />
                </View>
                <Text style={styles.actionTitle}>{action.title}</Text>
                <Ionicons name="chevron-forward" size={20} color="#999" />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Info Card */}
        <View style={styles.infoCard}>
          <Ionicons name="information-circle" size={24} color="#1a237e" />
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>Estado de la Plataforma</Text>
            <Text style={styles.infoText}>
              Sistema operativo. Todas las funcionalidades disponibles.
            </Text>
          </View>
        </View>

        {/* Bottom Spacing */}
        <View style={{ height: 30 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  header: {
    backgroundColor: '#1a237e',
    paddingTop: 50,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerGreeting: {
    fontSize: 16,
    color: '#b3c5ff',
    fontWeight: '500',
  },
  headerName: {
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold',
    marginTop: 4,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    marginTop: 8,
    alignSelf: 'flex-start',
    gap: 6,
  },
  roleText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  logoutButton: {
    padding: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  logoSection: {
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 30,
  },
  logoCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#1a237e',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  appName: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#1a237e',
    marginTop: 15,
    letterSpacing: 2,
  },
  appTagline: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
    fontStyle: 'italic',
  },
  actionsSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  actionsGrid: {
    gap: 12,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  actionTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#e3f2fd',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#1a237e',
    marginBottom: 20,
  },
  infoContent: {
    flex: 1,
    marginLeft: 12,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a237e',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
  },
});
