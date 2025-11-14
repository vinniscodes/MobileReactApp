import React from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useMovieStatus } from '../app/MovieStatusContext'; // Importa o novo hook

// --- Tipos ---
interface Movie {
  id: string;
  titulo: string;
  descricao: string;
  posterUrl: string;
}

interface MovieCardProps {
  movie: Movie;
}

export const MovieCard: React.FC<MovieCardProps> = ({ movie }) => {
  // Pega o status e as funções do novo contexto
  const { movieStatus, toggleLikeMovie, toggleDislikeMovie, toggleSaveMovie } =
    useMovieStatus();

  const status = movieStatus[movie.id] || {
    liked: false,
    disliked: false,
  saved: false,
  };

  return (
    <View style={styles.cardContainer}>
      <Image source={{ uri: movie.posterUrl }} style={styles.poster} />
      <View style={styles.infoContainer}>
        <Text style={styles.titulo} numberOfLines={2}>
          {movie.titulo}
        </Text>
        <Text style={styles.descricao} numberOfLines={3}>
          {movie.descricao}
        </Text>
      </View>

      {/* --- BOTÕES DE AÇÃO --- */}
      <View style={styles.botoesContainer}>
        {/* Botão Dislike */}
        <TouchableOpacity
          onPress={() => toggleDislikeMovie(movie)}
          style={styles.botao}>
          <Ionicons
            name={status.disliked ? 'thumbs-down' : 'thumbs-down-outline'}
            size={28}
            color={status.disliked ? '#FF3B30' : '#FFFFFF'} // Vermelho
          />
        </TouchableOpacity>

        {/* Botão Salvar */}
        <TouchableOpacity
          onPress={() => toggleSaveMovie(movie)}
          style={styles.botao}>
          <Ionicons
            name={status.saved ? 'bookmark' : 'bookmark-outline'}
            size={28}
            color={status.saved ? '#34C759' : '#FFFFFF'} // Verde
          />
        </TouchableOpacity>

        {/* Botão Like */}
        <TouchableOpacity
          onPress={() => toggleLikeMovie(movie)}
          style={styles.botao}>
          <Ionicons
            name={status.liked ? 'heart' : 'heart-outline'}
            size={28}
            color={status.liked ? '#007AFF' : '#FFFFFF'} // Azul
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

// --- Estilos ---
const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: '#2C2C2E',
    borderRadius: 12,
    marginVertical: 8,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  poster: {
    width: '100%',
    height: 450,
    resizeMode: 'cover',
    backgroundColor: '#3A3A3C',
  },
  infoContainer: {
    padding: 16,
  },
  titulo: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  descricao: {
    fontSize: 14,
    color: '#E5E5EA',
    lineHeight: 20,
  },
  botoesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#3A3A3C',
  },
  botao: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
});