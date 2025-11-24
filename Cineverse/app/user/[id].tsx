import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  Image,
} from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { Profile } from '../../lib/MovieStatusContext';
import { MovieCard } from '../../components/MovieCard';
import { Ionicons } from '@expo/vector-icons';

// Tipos locais
interface Movie {
  id: string;
  titulo: string;
  descricao: string;
  posterUrl: string;
}

export default function UserProfileScreen() {
  // Pega o 'id' do usuário da URL
  const { id } = useLocalSearchParams<{ id: string }>();

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [movies, setMovies] = useState<Movie[]>([]);

  useEffect(() => {
    if (!id) return;

    const loadData = async () => {
      setLoading(true);
      try {
        // 1. Pega o perfil público do usuário
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', id)
          .single();
        
        if (profileError) throw profileError;
        setProfile(profileData);

        // 2. Pega os filmes que ESSE usuário curtiu
        const { data: statusData, error: statusError } = await supabase
          .from('movie_status')
          .select('*, movies(*)')
          .eq('user_id', id)
          .eq('liked', true);

        if (statusError) throw statusError;

        if (statusData) {
          const formattedMovies = statusData
            .filter(row => row.movies)
            .map(row => ({
              // @ts-ignore
              id: row.movies.id.toString(),
              // @ts-ignore
              titulo: row.movies.title,
              // @ts-ignore
              descricao: row.movies.overview,
              // @ts-ignore
              posterUrl: row.movies.poster_url,
            }));
          setMovies(formattedMovies);
        }
      } catch (e) {
        console.error("Erro ao carregar perfil público", e);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id]);

  if (loading || !profile) {
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
      <Stack.Screen options={{ title: `@${profile.username}` }} />
      
      <FlatList
        data={movies}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <MovieCard movie={item} />}
        contentContainerStyle={styles.lista}
        ListHeaderComponent={
          <View style={styles.headerContainer}>
            {/* Avatar do Usuário */}
            {profile.avatar_url ? (
              <Image source={{ uri: profile.avatar_url }} style={styles.avatarImage} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Ionicons name="person" size={60} color="#1C1C1E" />
              </View>
            )}
            <Text style={styles.usernameText}>@{profile.username}</Text>
            <Text style={styles.sectionHeader}>
              Filmes Curtidos ({movies.length})
            </Text>
          </View>
        }
        ListEmptyComponent={
           <Text style={styles.emptyText}>
             Este usuário ainda não curtiu nenhum filme.
           </Text>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#1C1C1E' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  lista: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 32 },
  emptyText: { color: '#8E8E93', fontFamily: 'Inter-Regular', fontSize: 16, textAlign: 'center', marginTop: 20 },
  headerContainer: {
    paddingVertical: 24,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#3A3A3C',
    marginBottom: 10,
  },
  avatarImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#3A3A3C',
    marginBottom: 16,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#E5E5EA',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  usernameText: {
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
    fontSize: 26,
    marginBottom: 24,
  },
  sectionHeader: {
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
    fontSize: 20,
    alignSelf: 'flex-start',
  },
});