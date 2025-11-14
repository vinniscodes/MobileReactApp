import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { Stack } from 'expo-router';
// Corrigindo o caminho para subir dois níveis
import { MovieCard } from '../../components/MovieCard';
// Corrigindo o caminho para o NOVO contexto
import { useMovieStatus } from '../MovieStatusContext';

export default function SavedScreen() {
  // Pega os filmes e o status de loading do NOVO contexto
  const { allMovies, movieStatus, loading } = useMovieStatus();

  // Filtra a lista de filmes para mostrar apenas os salvos
  const savedMovies = allMovies.filter(
    (movie) => movieStatus[movie.id]?.saved
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
          title: 'Filmes Salvos',
        }}
      />
      {savedMovies.length === 0 ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.emptyText}>
            Você ainda não salvou nenhum filme.
          </Text>
        </View>
      ) : (
        <FlatList
          data={savedMovies}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <MovieCard movie={item} />}
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
});