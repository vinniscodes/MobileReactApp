import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  SafeAreaView,
  TextInput,
} from 'react-native';
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { MovieCard } from '../../components/MovieCard';
import { SkeletonCard } from '../../components/SkeletonCard';
// --- MUDANÇA AQUI ---
import { useMovieStatus } from '../../lib/MovieStatusContext';
// --- FIM DA MUDANÇA ---

const API_KEY = 'f0f837126ad3f38f1d78d397c936a14d';
const API_BASE_URL = 'https://api.themoviedb.org/3';
const POSTER_BASE_URL = 'https://image.tmdb.org/t/p/w500';

interface Movie {
  id: string;
  titulo: string;
  descricao: string;
  posterUrl: string;
}
const skeletonData = Array(5)
  .fill(0)
  .map((_, index) => ({ id: `skeleton-${index}` }));

export default function HomeScreen() {
  const { loading: contextLoading } = useMovieStatus();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  useEffect(() => {
    const fetchMovies = async () => {
      setLoading(true);
      setError(null);
      let url = '';
      if (debouncedQuery) {
        url = `${API_BASE_URL}/search/movie?api_key=${API_KEY}&language=pt-BR&query=${debouncedQuery}`;
      } else {
        url = `${API_BASE_URL}/movie/popular?api_key=${API_KEY}&language=pt-BR&page=1`;
      }
      try {
        const response = await fetch(url);
        const data = await response.json();
        const formattedMovies = data.results
          .filter((movie: any) => movie.poster_path)
          .map((movie: any) => ({
            id: movie.id.toString(),
            titulo: movie.title,
            descricao: movie.overview,
            posterUrl: `${POSTER_BASE_URL}${movie.poster_path}`,
          }));
        setMovies(formattedMovies);
      } catch (err: any) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    if (!contextLoading) {
      fetchMovies();
    }
  }, [debouncedQuery, contextLoading]);

  const renderSkeletonList = () => (
    <FlatList
      data={skeletonData}
      keyExtractor={(item) => item.id}
      renderItem={() => <SkeletonCard />}
      contentContainerStyle={styles.lista}
    />
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen
        options={{
          title: 'Buscar Filmes',
          headerTitleAlign: 'center',
          headerStyle: { backgroundColor: '#1C1C1E' },
          headerTitleStyle: { color: '#FFFFFF', fontFamily: 'Inter-Bold' },
        }}
      />
      <View style={styles.searchContainer}>
        <Ionicons
          name="search"
          size={20}
          color="#8E8E93"
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar filmes..."
          placeholderTextColor="#8E8E93"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>
      {contextLoading || (loading && movies.length === 0) ? (
        renderSkeletonList()
      ) : error ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.errorText}>Erro ao buscar dados.</Text>
        </View>
      ) : movies.length === 0 && debouncedQuery ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.errorText}>
            Nenhum filme encontrado para "{debouncedQuery}"
          </Text>
        </View>
      ) : (
        <FlatList
          data={movies}
          keyExtractor={(item) => item.id.toString()}
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: '#FF3B30',
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    backgroundColor: '#2C2C2E',
    borderRadius: 10,
    margin: 16,
    paddingHorizontal: 10,
    alignItems: 'center',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    color: '#FFFFFF',
    fontFamily: 'Inter-Regular',
    fontSize: 16,
  },
  lista: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
});