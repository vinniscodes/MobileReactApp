import React, { useState } from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useMovieStatus } from '../lib/MovieStatusContext';
import { ReviewModal } from './ReviewModal';
import { useRouter } from 'expo-router'; // Importamos o Router

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
  const { movieStatus, toggleLikeMovie, toggleDislikeMovie, toggleSaveMovie } =
    useMovieStatus();
    
  const router = useRouter(); // Hook de navegação

  // Estado para controlar se o Modal está visível ou não
  const [modalVisible, setModalVisible] = useState(false);

  const status = movieStatus[movie.id] || {
    liked: false,
    disliked: false,
    saved: false,
  };

  // Função para navegar para os detalhes
  const goToDetails = () => {
    router.push({
      pathname: '/movie/[id]',
      params: { id: movie.id }
    });
  };

  return (
    <View style={styles.cardContainer}>
      {/* --- MUDANÇA AQUI --- */}
      {/* Envolvemos o Poster e o Título em um botão para navegar */}
      <TouchableOpacity onPress={goToDetails} activeOpacity={0.9}>
        <Image source={{ uri: movie.posterUrl }} style={styles.poster} />
        <View style={styles.infoContainer}>
          <Text style={styles.titulo} numberOfLines={2}>
            {movie.titulo}
          </Text>
          <Text style={styles.descricao} numberOfLines={3}>
            {movie.descricao}
          </Text>
        </View>
      </TouchableOpacity>
      {/* --- FIM DA MUDANÇA --- */}

      <View style={styles.botoesContainer}>
        {/* Botão Dislike */}
        <TouchableOpacity
          onPress={() => toggleDislikeMovie(movie)}
          style={styles.botao}
          activeOpacity={0.7}
        >
          <Ionicons
            name={status.disliked ? 'thumbs-down' : 'thumbs-down-outline'}
            size={28}
            color={status.disliked ? '#FF3B30' : '#FFFFFF'}
          />
        </TouchableOpacity>

        {/* Botão Salvar */}
        <TouchableOpacity
          onPress={() => toggleSaveMovie(movie)}
          style={styles.botao}
          activeOpacity={0.7}
        >
          <Ionicons
            name={status.saved ? 'bookmark' : 'bookmark-outline'}
            size={28}
            color={status.saved ? '#34C759' : '#FFFFFF'}
          />
        </TouchableOpacity>

        {/* Botão Like */}
        <TouchableOpacity
          onPress={() => toggleLikeMovie(movie)}
          style={styles.botao}
          activeOpacity={0.7}
        >
          <Ionicons
            name={status.liked ? 'heart' : 'heart-outline'}
            size={28}
            color={status.liked ? '#007AFF' : '#FFFFFF'}
          />
        </TouchableOpacity>

        {/* Botão de Avaliar (Estrela) */}
        <TouchableOpacity
          onPress={() => setModalVisible(true)}
          style={styles.botao}
          activeOpacity={0.7}
        >
          <Ionicons
            name="star"
            size={28}
            color="#FFD700" // Dourado
          />
        </TouchableOpacity>
      </View>

      {/* O Modal de Review */}
      <ReviewModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        movie={movie}
      />
    </View>
  );
};

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
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  descricao: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
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
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
});