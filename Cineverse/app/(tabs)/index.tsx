import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  SafeAreaView,
  ActivityIndicator,
  TextInput, // Campo de busca
} from 'react-native';
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
// Corrigindo o caminho para subir dois níveis
import { MovieCard } from '../../components/MovieCard';
// Corrigindo o caminho para o novo contexto
import { useMovieStatus } from '../MovieStatusContext';

// --- Configuração da API ---
const API_KEY = 'f0f837126ad3f38f1d78d397c936a14d';
const API_BASE_URL = 'https://api.themoviedb.org/3';
const POSTER_BASE_URL = 'https://image.tmdb.org/t/p/w500';

// --- Tipos ---
interface Movie {
  id: string;
  titulo: string;
  descricao: string;
  posterUrl: string;
}

export default function HomeScreen() {
  // Pega o status de carregamento do NOVO Contexto
  const { loading: contextLoading } = useMovieStatus();

  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Estado para a barra de busca
  const [searchQuery, setSearchQuery] = useState('');
  // Estado para a busca "atrasada" (debounce)
  const [debouncedQuery, setDebouncedQuery] = useState('');

  // Debounce: Espera 500ms após o usuário parar de digitar
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 500);
    // Limpa o timeout se o usuário digitar novamente
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Efeito que busca os filmes na API
  useEffect(() => {
    const fetchMovies = async () => {
      setLoading(true);
      setError(null);
      let url = '';

      if (debouncedQuery) {
        // Se há texto na busca, pesquisa
        url = `${API_BASE_URL}/search/movie?api_key=${API_KEY}&language=pt-BR&query=${debouncedQuery}`;
      } else {
        // Se não, mostra os populares
        url = `${API_BASE_URL}/movie/popular?api_key=${API_KEY}&language=pt-BR&page=1`;
      }

      try {
        const response = await fetch(url);
        const data = await response.json();

        // Formata os dados da API para o nosso formato
        const formattedMovies = data.results
          .filter((movie: any) => movie.poster_path) // Filtra filmes sem poster
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

    fetchMovies();
  }, [debouncedQuery]); // Roda sempre que a busca "atrasada" mudar

  // Espera o AsyncStorage carregar os filmes salvos
  if (contextLoading) {
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
          title: 'Buscar Filmes',
          headerTitleAlign: 'center',
        }}
      />

      {/* Barra de Busca */}
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

      {/* Renderização condicional da lista */}
      {loading && movies.length === 0 ? (
        // Loading inicial
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FFFFFF" />
        </View>
      ) : error ? (
        // Erro
        <View style={styles.loadingContainer}>
          <Text style={styles.errorText}>Erro ao buscar dados.</Text>
        </View>
      ) : movies.length === 0 && debouncedQuery ? (
        // Nenhum resultado encontrado
        <View style={styles.loadingContainer}>
          <Text style={styles.errorText}>
            Nenhum filme encontrado para "{debouncedQuery}"
          </Text>
        </View>
      ) : (
        // Lista de filmes
        <FlatList
          data={movies}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <MovieCard movie={item} />}
          contentContainerStyle={styles.lista}
          ListFooterComponent={
            loading ? ( // Loading "inline" ao buscar mais
              <ActivityIndicator
                size="small"
                color="#FFFFFF"
                style={{ marginVertical: 20 }}
              />
            ) : null
          }
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
  },
  errorText: {
    color: '#FF3B30',
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
    fontSize: 16,
  },
  lista: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
});