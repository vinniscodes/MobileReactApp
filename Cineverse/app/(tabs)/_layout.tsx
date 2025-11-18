import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: '#8E8E93',
        tabBarStyle: {
          backgroundColor: '#1C1C1E',
          borderTopColor: '#3A3A3C',
        },
        headerStyle: {
          backgroundColor: '#1C1C1E',
        },
        headerTitleStyle: {
          color: '#FFFFFF',
          fontFamily: 'Inter-Bold',
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Busca',
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="search" color={color} size={size} />
          ),
        }}
      />
      {/* --- NOVA ABA DE USUÁRIOS --- */}
      <Tabs.Screen
        name="users"
        options={{
          title: 'Usuários',
          headerTitleAlign: 'center',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="people" color={color} size={size} />
          ),
        }}
      />
      {/* --- FIM DA NOVA ABA --- */}
      <Tabs.Screen
        name="saved"
        options={{
          title: 'Salvos',
          headerTitleAlign: 'center',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="bookmark" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Meu Perfil',
          headerTitleAlign: 'center',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-circle" color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}