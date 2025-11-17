import React, { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { MovieStatusProvider, useMovieStatus } from '../lib/MovieStatusContext';
import { StatusBar, View, ActivityIndicator } from 'react-native';
import { useFonts, Inter_400Regular, Inter_700Bold } from '@expo-google-fonts/inter';
import * as SplashScreen from 'expo-splash-screen';

SplashScreen.preventAutoHideAsync();

// Componente Interno que decide a navegação
const AppRoot = () => {
  const { session, loading } = useMovieStatus();
  const segments = useSegments();
  const router = useRouter();

  const [fontsLoaded] = useFonts({
    'Inter-Regular': Inter_400Regular,
    'Inter-Bold': Inter_700Bold,
  });

  useEffect(() => {
    if (!fontsLoaded || loading) {
      // Se fontes ou a sessão (do context) ainda estão carregando, não faz nada
      return;
    }
    
    SplashScreen.hideAsync(); // Esconde o splash screen

    const inApp = segments[0] === '(tabs)';

    if (session && !inApp) {
      // Se tem sessão E não está na área logada, manda para as tabs
      // --- MUDANÇA AQUI ---
      router.replace('/(tabs)'); // Navega para o grupo, não para o arquivo index
      // --- FIM DA MUDANÇA ---
    } else if (!session && inApp) {
      // Se não tem sessão E está na área logada, manda para o login
      router.replace('/auth');
    } else if (!session && !inApp) {
      // Se não tem sessão E não está na área logada (ex: está na tela /auth), manda para o auth
      router.replace('/auth');
    }

  }, [session, loading, fontsLoaded, segments, router]);

  // Mostra um loading central enquanto as fontes ou a sessão carregam
  if (!fontsLoaded || loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#1C1C1E' }}>
        <ActivityIndicator size="large" color="#FFFFFF" />
      </View>
    );
  }

  // A navegação principal agora é um Stack
  // Isso permite que a tela de "auth" e as "(tabs)" vivam no mesmo nível
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="auth" />
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
};

// O Layout principal agora SÓ provê o Contexto e o Statusbar
export default function AppLayout() {
  return (
    <MovieStatusProvider>
      <StatusBar barStyle="light-content" />
      <AppRoot />
    </MovieStatusProvider>
  );
}