import React, { useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SectionList,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { Stack } from 'expo-router';
// Corrigindo o caminho para subir dois níveis
import { MovieCard } from '../../components/MovieCard';
// Corrigindo o caminho para o contexto
import { useMovieStatus } from '../MovieStatusContext';

// --- Tipos ---
interface Movie {
  id: string;
  titulo: string;
  descricao: string;
  posterUrl: string;
}

interface Section {
  title: string;
  data: Movie[];
}

export default function ProfileScreen() {
  // Pega os dados brutos do contexto
  const { allMovies, movieStatus, loading } = useMovieStatus();

  // --- LÓGICA DE FILTRO CORRIGIDA ---
  // Filtra as listas de filmes usando 'useMemo' para otimização
  const likedMovies = useMemo(
    () => allMovies.filter((movie) => movieStatus[movie.id]?.liked),
    [allMovies, movieStatus]
  );

  const dislikedMovies = useMemo(
    () => allMovies.filter((movie) => movieStatus[movie.id]?.disliked),
    [allMovies, movieStatus]
  );

  const savedMovies = useMemo(
    () => allMovies.filter((movie) => movieStatus[movie.id]?.saved),
    [allMovies, movieStatus]
  );
  // --- FIM DA LÓGICA CORRIGIDA ---

  // Cria as seções para a SectionList
  const sections: Section[] = useMemo(
    () =>
      [
        { title: 'Filmes que Gostei', data: likedMovies },
        { title: 'Filmes que Não Gostei', data: dislikedMovies },
        { title: 'Salvos para Ver Depois', data: savedMovies },
      ].filter((section) => section.data.length > 0), // Remove seções vazias
    [likedMovies, dislikedMovies, savedMovies]
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FFFFFF" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen
        options={{
          title: 'Meu Perfil',
        }}
      />
      {sections.length === 0 ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.emptyText}>
            Suas listas estão vazias. Comece a avaliar filmes!
          </Text>
        </View>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <MovieCard movie={item} />}
          renderSectionHeader={({ section: { title } }) => (
            <Text style={styles.sectionHeader}>{title}</Text>
          )}
          contentContainerStyle={styles.lista}
        />
      )}
    </SafeAreaView>
  );
}

// --- Estilos ---
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#1C1C1E',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  emptyText: {
    color: '#8E8E93',
    fontSize: 16,
    textAlign: 'center',
  },
  lista: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 32,
  },
  sectionHeader: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    backgroundColor: '#1C1C1E',
    paddingTop: 24,
    paddingBottom: 12,
  },
});