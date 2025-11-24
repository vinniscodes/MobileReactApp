import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';
import { StarRating } from '../../components/StarRating';

const API_KEY = 'f0f837126ad3f38f1d78d397c936a14d';

interface Review {
  id: number;
  rating: number;
  comment: string;
  created_at: string;
  user_id: string;
  profiles: {
    username: string;
    avatar_url: string | null;
  };
}

interface MovieDetails {
  id: number;
  title: string;
  overview: string;
  poster_path: string;
  backdrop_path: string;
  vote_average: number;
  release_date: string;
}

export default function MovieDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  
  const [movie, setMovie] = useState<MovieDetails | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const movieRes = await fetch(
          `https://api.themoviedb.org/3/movie/${id}?api_key=${API_KEY}&language=pt-BR`
        );
        const movieData = await movieRes.json();
        setMovie(movieData);

        const { data, error } = await supabase
          .from('reviews')
          .select('*, profiles(username, avatar_url)')
          .eq('movie_id', id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setReviews(data as any); 
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading || !movie) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FFFFFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: 'Detalhes', 
          headerStyle: { backgroundColor: '#1C1C1E' },
          headerTitleStyle: { color: '#FFFFFF', fontFamily: 'Inter-Bold' },
          headerTintColor: '#007AFF'
        }} 
      />
      
      <FlatList
        data={reviews}
        keyExtractor={(item) => item.id.toString()}
        ListHeaderComponent={() => (
          <View>
            <Image
              source={{ uri: `https://image.tmdb.org/t/p/w500${movie.backdrop_path || movie.poster_path}` }}
              style={styles.backdrop}
            />
            
            <View style={styles.infoContainer}>
              <Text style={styles.title}>{movie.title}</Text>
              <View style={styles.metaRow}>
                <Ionicons name="calendar" size={16} color="#8E8E93" />
                <Text style={styles.metaText}>{movie.release_date?.split('-')[0]}</Text>
                <View style={{ width: 16 }} />
                <Ionicons name="star" size={16} color="#FFD700" />
                <Text style={styles.metaText}>{movie.vote_average?.toFixed(1)} (TMDB)</Text>
              </View>
              <Text style={styles.overview}>{movie.overview}</Text>
            </View>

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Reviews da Comunidade</Text>
              <Text style={styles.reviewCount}>{reviews.length}</Text>
            </View>
          </View>
        )}
        renderItem={({ item }) => (
          <View style={styles.reviewItem}>
            <View style={styles.reviewHeader}>
              
              {/* BOTÃO CLICÁVEL COM NOME AZUL */}
              <TouchableOpacity 
                style={styles.userInfo}
                onPress={() => {
                  console.log("Clicou no usuario:", item.user_id); // Debug
                  router.push({
                    pathname: '/user/[id]',
                    params: { id: item.user_id }
                  });
                }}
              >
                 {item.profiles?.avatar_url ? (
                    <Image source={{ uri: item.profiles.avatar_url }} style={styles.avatar} />
                 ) : (
                    <Ionicons name="person-circle" size={32} color="#8E8E93" />
                 )}
                 {/* MUDANÇA VISUAL: Cor Azul */}
                 <Text style={[styles.username, { color: '#007AFF' }]}>
                   @{item.profiles?.username || 'Usuário'}
                 </Text>
              </TouchableOpacity>

              <StarRating rating={item.rating} size={14} />
            </View>
            {item.comment && <Text style={styles.comment}>{item.comment}</Text>}
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Seja o primeiro a avaliar!</Text>
        }
        contentContainerStyle={{ paddingBottom: 40 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1C1C1E' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#1C1C1E' },
  backdrop: { width: '100%', height: 250, resizeMode: 'cover', opacity: 0.8 },
  infoContainer: { padding: 20 },
  title: { fontFamily: 'Inter-Bold', fontSize: 24, color: '#FFFFFF', marginBottom: 8 },
  metaRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  metaText: { color: '#8E8E93', marginLeft: 4, fontFamily: 'Inter-Regular' },
  overview: { color: '#E5E5EA', fontFamily: 'Inter-Regular', lineHeight: 22, fontSize: 15 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginTop: 10, marginBottom: 16, borderTopWidth: 1, borderTopColor: '#2C2C2E', paddingTop: 20 },
  sectionTitle: { fontFamily: 'Inter-Bold', fontSize: 18, color: '#FFFFFF' },
  reviewCount: { color: '#8E8E93', fontFamily: 'Inter-Regular' },
  reviewItem: { backgroundColor: '#2C2C2E', padding: 16, marginHorizontal: 20, marginBottom: 12, borderRadius: 12 },
  reviewHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  userInfo: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 32, height: 32, borderRadius: 16, marginRight: 8, backgroundColor: '#3A3A3C' },
  username: { fontFamily: 'Inter-Bold', marginLeft: 4 }, // A cor vem inline agora
  comment: { color: '#E5E5EA', fontFamily: 'Inter-Regular', lineHeight: 20 },
  emptyText: { color: '#8E8E93', textAlign: 'center', marginTop: 20, fontStyle: 'italic' },
});