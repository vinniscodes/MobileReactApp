import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
// Importa o NOVO provider (esta é a correção)
import { MovieStatusProvider } from '../MovieStatusContext';
import { StatusBar } from 'react-native';

export default function AppLayout() {
  return (
    // Usa o NOVO provider (esta é a correção)
    <MovieStatusProvider>
      <StatusBar barStyle="light-content" />
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: '#007AFF', // Azul
          tabBarInactiveTintColor: '#8E8E93', // Cinza
          tabBarStyle: {
            backgroundColor: '#1C1C1E', // Fundo escuro
            borderTopColor: '#3A3A3C',
          },
          headerStyle: {
            backgroundColor: '#1C1C1E',
          },
          headerTitleStyle: {
            color: '#FFFFFF',
          },
        }}>
        <Tabs.Screen
          name="index" // app/(tabs)/index.tsx
          options={{
            title: 'Busca',
            headerShown: false,
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="search" color={color} size={size} />
            ),
          }}
        />
        <Tabs.Screen
          name="saved" // app/(tabs)/saved.tsx
          options={{
            title: 'Salvos',
            headerTitleAlign: 'center',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="bookmark" color={color} size={size} />
            ),
          }}
        />
        {/* --- NOVA ABA AQUI --- */}
        <Tabs.Screen
          name="profile" // app/(tabs)/profile.tsx
          options={{
            title: 'Meu Perfil',
            headerTitleAlign: 'center',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="person-circle" color={color} size={size} />
            ),
          }}
        />
      </Tabs>
    </MovieStatusProvider>
  );
}