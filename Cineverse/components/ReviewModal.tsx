import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StarRating } from './StarRating';
import { useMovieStatus } from '../lib/MovieStatusContext';

interface Movie {
  id: string;
  titulo: string;
  descricao: string;
  posterUrl: string;
}

interface ReviewModalProps {
  visible: boolean;
  onClose: () => void;
  movie: Movie | null;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({
  visible,
  onClose,
  movie,
}) => {
  const { addReview, getMyReview } = useMovieStatus();
  
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Quando o modal abre, carrega o review existente (se houver)
  useEffect(() => {
    if (visible && movie) {
      setLoading(true);
      setRating(0);
      setComment('');
      
      getMyReview(movie.id).then((existingReview) => {
        if (existingReview) {
          setRating(existingReview.rating);
          setComment(existingReview.comment || '');
        }
        setLoading(false);
      });
    }
  }, [visible, movie]);

  const handleSubmit = async () => {
    if (!movie || rating === 0) return;

    setSubmitting(true);
    await addReview(movie, rating, comment);
    setSubmitting(false);
    onClose();
  };

  if (!movie) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.overlay}
      >
        <View style={styles.container}>
          {/* Cabeçalho */}
          <View style={styles.header}>
            <Text style={styles.title}>Avaliar Filme</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#8E8E93" />
            </TouchableOpacity>
          </View>

          <Text style={styles.movieTitle} numberOfLines={1}>
            {movie.titulo}
          </Text>

          {loading ? (
            <ActivityIndicator color="#FFFFFF" style={{ margin: 20 }} />
          ) : (
            <>
              {/* Estrelas */}
              <View style={styles.starsContainer}>
                <StarRating 
                  rating={rating} 
                  onRate={setRating} 
                  size={40} 
                />
                <Text style={styles.ratingText}>
                  {rating > 0 ? `${rating}/5` : 'Toque para avaliar'}
                </Text>
              </View>

              {/* Comentário */}
              <TextInput
                style={styles.input}
                placeholder="Escreva o que achou do filme..."
                placeholderTextColor="#8E8E93"
                multiline
                value={comment}
                onChangeText={setComment}
                maxLength={500}
              />

              {/* Botão Salvar */}
              <TouchableOpacity 
                style={[styles.submitButton, (rating === 0 || submitting) && styles.disabledButton]}
                onPress={handleSubmit}
                disabled={rating === 0 || submitting}
              >
                {submitting ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.submitText}>Salvar Avaliação</Text>
                )}
              </TouchableOpacity>
            </>
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    padding: 20,
  },
  container: {
    backgroundColor: '#2C2C2E',
    borderRadius: 16,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    color: '#FFFFFF',
    fontFamily: 'Inter-Bold',
    fontSize: 18,
  },
  movieTitle: {
    color: '#E5E5EA',
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    marginBottom: 24,
    textAlign: 'center',
  },
  starsContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  ratingText: {
    color: '#FFD700',
    marginTop: 8,
    fontFamily: 'Inter-Bold',
    fontSize: 16,
  },
  input: {
    backgroundColor: '#1C1C1E',
    borderRadius: 8,
    padding: 12,
    color: '#FFFFFF',
    height: 100,
    textAlignVertical: 'top',
    fontFamily: 'Inter-Regular',
    marginBottom: 24,
  },
  submitButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.5,
  },
  submitText: {
    color: '#FFFFFF',
    fontFamily: 'Inter-Bold',
    fontSize: 16,
  },
});