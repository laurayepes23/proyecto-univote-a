import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import { AuthProvider } from './src/context/AuthContext';
import Login from './src/screens/Login';
import Dashboard from './src/screens/Dashboard';
import RegistroVotante from './src/screens/RegistroVotante';
import RegistroCandidato from './src/screens/RegistroCandidato';

export type RootStackParamList = {
  Login: undefined;
  Dashboard: undefined;
  RegistroVotante: undefined;
  RegistroCandidato: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <Stack.Navigator 
          initialRouteName="Login"
          screenOptions={{
            headerStyle: {
              backgroundColor: '#1a237e',
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
            headerTitleAlign: 'center',
          }}
        >
          <Stack.Screen 
            name="Login" 
            component={Login}
            options={{ 
              title: 'Iniciar Sesión',
              headerShown: false,
            }}
          />
          <Stack.Screen 
            name="Dashboard" 
            component={Dashboard}
            options={{ 
              title: 'Inicio',
              headerShown: false,
            }}
          />
          <Stack.Screen 
            name="RegistroVotante" 
            component={RegistroVotante}
            options={{ 
              title: 'Registro de Votante',
              headerBackTitle: 'Atrás'
            }}
          />
          <Stack.Screen 
            name="RegistroCandidato" 
            component={RegistroCandidato}
            options={{ 
              title: 'Registro de Candidato',
              headerBackTitle: 'Atrás'
            }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </AuthProvider>
  );
}