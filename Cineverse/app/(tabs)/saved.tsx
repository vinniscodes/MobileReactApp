import React, { useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { Stack } from 'expo-router';
import { MovieCard } from '../../components/MovieCard';
// --- MUDANÇA AQUI ---
import { useMovieStatus } from '../../lib/MovieStatusContext';
// --- FIM DA MUDANÇA ---

export default function SavedScreen() {
  const { allMovies, movieStatus, loading } = useMovieStatus();

  const savedMovies = useMemo(
    () => allMovies.filter((movie) => movieStatus[movie.id]?.saved),
    [allMovies, movieStatus]
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
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    textAlign: 'center',
  },
  lista: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 32,
  },
});