import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  AuthContextType, 
  UserRole, 
  VoterData, 
  CandidateData, 
  AdminData 
} from '../types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [userId, setUserId] = useState<number | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [userData, setUserData] = useState<VoterData | CandidateData | AdminData | null>(null);

  // Verificar autenticación al iniciar
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const role = await AsyncStorage.getItem('userRole');
      
      if (role) {
        setUserRole(role as UserRole);
        setIsAuthenticated(true);

        // Cargar datos según el rol
        if (role === 'voter') {
          const voterDataStr = await AsyncStorage.getItem('voterData');
          const voterIdStr = await AsyncStorage.getItem('voterId');
          const voterNameStr = await AsyncStorage.getItem('voterName');
          
          if (voterDataStr && voterIdStr) {
            setUserData(JSON.parse(voterDataStr));
            setUserId(parseInt(voterIdStr));
            setUserName(voterNameStr);
          }
        } else if (role === 'candidate') {
          const candidateDataStr = await AsyncStorage.getItem('candidateData');
          const candidateIdStr = await AsyncStorage.getItem('candidateId');
          const candidateNameStr = await AsyncStorage.getItem('candidateName');
          
          if (candidateDataStr && candidateIdStr) {
            setUserData(JSON.parse(candidateDataStr));
            setUserId(parseInt(candidateIdStr));
            setUserName(candidateNameStr);
          }
        } else if (role === 'admin') {
          const adminDataStr = await AsyncStorage.getItem('adminData');
          const adminIdStr = await AsyncStorage.getItem('adminId');
          const adminNameStr = await AsyncStorage.getItem('adminName');
          
          if (adminDataStr && adminIdStr) {
            setUserData(JSON.parse(adminDataStr));
            setUserId(parseInt(adminIdStr));
            setUserName(adminNameStr);
          }
        }
      }
    } catch (error) {
      console.error('Error al verificar autenticación:', error);
    }
  };

  const login = async (userData: any, role: UserRole) => {
    try {
      await AsyncStorage.setItem('userRole', role);
      
      if (role === 'voter') {
        const voterData = userData.voter || userData;
        await AsyncStorage.multiSet([
          ['voterData', JSON.stringify(voterData)],
          ['voterId', voterData.id_voter.toString()],
          ['voterName', `${voterData.nombre_voter} ${voterData.apellido_voter}`],
        ]);
        setUserData(voterData);
        setUserId(voterData.id_voter);
        setUserName(`${voterData.nombre_voter} ${voterData.apellido_voter}`);
      } else if (role === 'candidate') {
        await AsyncStorage.multiSet([
          ['candidateData', JSON.stringify(userData)],
          ['candidateId', userData.id_candidate.toString()],
          ['candidateName', `${userData.nombre_candidate} ${userData.apellido_candidate}`],
        ]);
        setUserData(userData);
        setUserId(userData.id_candidate);
        setUserName(`${userData.nombre_candidate} ${userData.apellido_candidate}`);
      } else if (role === 'admin') {
        await AsyncStorage.multiSet([
          ['adminData', JSON.stringify(userData)],
          ['adminId', userData.id_admin.toString()],
          ['adminName', `${userData.nombre_admin} ${userData.apellido_admin}`],
        ]);
        setUserData(userData);
        setUserId(userData.id_admin);
        setUserName(`${userData.nombre_admin} ${userData.apellido_admin}`);
      }

      setUserRole(role);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Error al guardar sesión:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.multiRemove([
        'userRole',
        'voterData', 'voterId', 'voterName',
        'candidateData', 'candidateId', 'candidateName',
        'adminData', 'adminId', 'adminName',
      ]);

      setIsAuthenticated(false);
      setUserRole(null);
      setUserId(null);
      setUserName(null);
      setUserData(null);
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        userRole,
        userId,
        userName,
        userData,
        login,
        logout,
        checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
};
