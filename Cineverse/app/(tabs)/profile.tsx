import React, { useMemo, useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  SafeAreaView,
  ActivityIndicator,
  TouchableOpacity,
  Image,
  Alert,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { MovieCard } from '../../components/MovieCard';
import { useMovieStatus } from '../../lib/MovieStatusContext';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../../lib/supabase';
import { StarRating } from '../../components/StarRating';

interface Movie {
  id: string;
  titulo: string;
  descricao: string;
  posterUrl: string;
}

interface ReviewItem {
  id: number;
  rating: number;
  comment: string;
  created_at: string;
  movies: {
    id: number;
    title: string;
    poster_url: string;
  };
}

type ActiveTab = 'liked' | 'saved' | 'disliked' | 'reviews';

export default function ProfileScreen() {
  const { allMovies, movieStatus, loading, profile, session, signOut, updateAvatar, updateUsername } =
    useMovieStatus();
  
  const [activeTab, setActiveTab] = useState<ActiveTab>('liked');
  const [uploading, setUploading] = useState(false);
  const [myReviews, setMyReviews] = useState<ReviewItem[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(false);

  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState('');
  const [savingName, setSavingName] = useState(false);

  const router = useRouter();

  useEffect(() => {
    if (session?.user?.id) {
      const fetchReviews = async () => {
        setLoadingReviews(true);
        try {
          const { data, error } = await supabase
            .from('reviews')
            .select('*, movies(id, title, poster_url)')
            .eq('user_id', session.user.id)
            .order('created_at', { ascending: false });

          if (error) throw error;
          if (data) setMyReviews(data as any);
        } catch (e) {
          console.error('Erro ao buscar reviews:', e);
        } finally {
          setLoadingReviews(false);
        }
      };
      fetchReviews();
    }
  }, [session, activeTab]);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Desculpe, precisamos de permissão para acessar sua galeria.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      // --- CORREÇÃO DO ERRO DE CRASH ---
      // Usamos MediaTypeOptions.Images que é garantido de funcionar
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      // ---------------------------------
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
      base64: true,
    });

    if (result.canceled || !result.assets || !result.assets[0].base64) {
      return;
    }

    setUploading(true);
    await updateAvatar(result.assets[0].base64);
    setUploading(false);
  };

  const handleSaveName = async () => {
    if (!newName.trim()) return;
    setSavingName(true);
    const success = await updateUsername(newName.trim());
    setSavingName(false);
    if (success) {
      setIsEditingName(false);
      setNewName('');
    }
  };

  const likedMovies = useMemo(() => allMovies.filter((movie) => movieStatus[movie.id]?.liked), [allMovies, movieStatus]);
  const dislikedMovies = useMemo(() => allMovies.filter((movie) => movieStatus[movie.id]?.disliked), [allMovies, movieStatus]);
  const savedMovies = useMemo(() => allMovies.filter((movie) => movieStatus[movie.id]?.saved), [allMovies, movieStatus]);

  const getEmptyMessage = () => {
    switch (activeTab) {
      case 'liked': return 'Você ainda não curtiu nenhum filme.';
      case 'saved': return 'Sua lista de filmes salvos está vazia.';
      case 'disliked': return 'Você ainda não deu dislike em nenhum filme.';
      case 'reviews': return 'Você ainda não escreveu nenhuma avaliação.';
    }
  };

  if (loading || !profile) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FFFFFF" />
        </View>
      </SafeAreaView>
    );
  }

  const renderReviewItem = ({ item }: { item: ReviewItem }) => (
    <TouchableOpacity 
      style={styles.reviewCard}
      onPress={() => router.push({ pathname: '/movie/[id]', params: { id: item.movies?.id } })}
    >
      <Image source={{ uri: item.movies?.poster_url }} style={styles.reviewPoster} />
      <View style={styles.reviewContent}>
        <Text style={styles.reviewMovieTitle} numberOfLines={1}>{item.movies?.title}</Text>
        <View style={styles.reviewStars}>
          <StarRating rating={item.rating} size={14} />
          <Text style={styles.reviewDate}>{new Date(item.created_at).toLocaleDateString()}</Text>
        </View>
        {item.comment && <Text style={styles.reviewComment} numberOfLines={3}>"{item.comment}"</Text>}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen options={{ title: 'Meu Perfil' }} />

      <View style={styles.headerContainer}>
        <TouchableOpacity style={styles.avatarContainer} onPress={pickImage} disabled={uploading}>
          {profile.avatar_url ? (
            <Image source={{ uri: profile.avatar_url }} style={styles.avatarImage} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Ionicons name="person" size={60} color="#1C1C1E" />
            </View>
          )}
          <View style={styles.editIcon}>
            {uploading ? <ActivityIndicator size="small" color="#FFFFFF" /> : <Ionicons name="camera" size={18} color="#FFFFFF" />}
          </View>
        </TouchableOpacity>
        
        <View style={styles.usernameRow}>
          <Text style={styles.usernameText}>@{profile.username}</Text>
          <TouchableOpacity 
            style={styles.editNameButton} 
            onPress={() => {
              setNewName(profile.username);
              setIsEditingName(true);
            }}
          >
            <Ionicons name="pencil" size={18} color="#007AFF" />
          </TouchableOpacity>
        </View>

        <Text style={styles.emailText}>{session?.user?.email}</Text>
        <TouchableOpacity style={styles.signOutButton} onPress={signOut}>
          <Ionicons name="log-out-outline" size={20} color="#FF3B30" />
          <Text style={styles.signOutText}>Sair</Text>
        </TouchableOpacity>
      </View>

      <View>
        <FlatList 
          horizontal
          showsHorizontalScrollIndicator={false}
          data={['liked', 'saved', 'reviews', 'disliked']}
          contentContainerStyle={styles.tabsContainer}
          keyExtractor={(item) => item}
          renderItem={({ item }) => {
            const tabKey = item as ActiveTab;
            let label = '';
            let count = 0;
            if (tabKey === 'liked') { label = 'Gostei'; count = likedMovies.length; }
            else if (tabKey === 'saved') { label = 'Salvos'; count = savedMovies.length; }
            else if (tabKey === 'reviews') { label = 'Reviews'; count = myReviews.length; }
            else if (tabKey === 'disliked') { label = 'Não Gostei'; count = dislikedMovies.length; }
            return (
              <TouchableOpacity
                style={[styles.segmentButton, activeTab === tabKey && styles.segmentButtonActive]}
                onPress={() => setActiveTab(tabKey)}
              >
                <Text style={[styles.segmentText, activeTab === tabKey && styles.segmentTextActive]}>
                  {label} ({count})
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {activeTab === 'reviews' ? (
        loadingReviews ? (
          <ActivityIndicator style={{ marginTop: 20 }} color="#fff" />
        ) : (
          <FlatList
            data={myReviews}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderReviewItem}
            contentContainerStyle={styles.lista}
            ListEmptyComponent={<View style={styles.emptyContainer}><Text style={styles.emptyText}>{getEmptyMessage()}</Text></View>}
          />
        )
      ) : (
        <FlatList
          data={activeTab === 'liked' ? likedMovies : activeTab === 'saved' ? savedMovies : dislikedMovies}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <MovieCard movie={item} />}
          contentContainerStyle={styles.lista}
          ListEmptyComponent={<View style={styles.emptyContainer}><Text style={styles.emptyText}>{getEmptyMessage()}</Text></View>}
        />
      )}

      <Modal visible={isEditingName} transparent animationType="fade">
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Alterar Nome de Usuário</Text>
            <TextInput
              style={styles.modalInput}
              value={newName}
              onChangeText={setNewName}
              placeholder="Novo nome..."
              placeholderTextColor="#8E8E93"
              autoCapitalize="none"
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={[styles.modalButton, styles.cancelButton]} onPress={() => setIsEditingName(false)}>
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalButton, styles.saveButton]} onPress={handleSaveName} disabled={savingName}>
                {savingName ? <ActivityIndicator color="#FFF" /> : <Text style={styles.saveButtonText}>Salvar</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#1C1C1E' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 },
  emptyContainer: { padding: 40, alignItems: 'center' },
  emptyText: { color: '#8E8E93', fontFamily: 'Inter-Regular', fontSize: 16, textAlign: 'center' },
  lista: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 32 },
  headerContainer: { paddingVertical: 24, paddingHorizontal: 16, alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#3A3A3C' },
  avatarContainer: { marginBottom: 16, position: 'relative' },
  avatarImage: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#3A3A3C' },
  avatarPlaceholder: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#E5E5EA', justifyContent: 'center', alignItems: 'center' },
  editIcon: { position: 'absolute', bottom: 0, right: 0, backgroundColor: '#007AFF', borderRadius: 15, padding: 6, borderWidth: 2, borderColor: '#1C1C1E' },
  usernameRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  usernameText: { fontFamily: 'Inter-Bold', color: '#FFFFFF', fontSize: 26 },
  editNameButton: { marginLeft: 8, padding: 4 },
  emailText: { fontFamily: 'Inter-Regular', color: '#8E8E93', fontSize: 14, marginBottom: 16 },
  signOutButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#2C2C2E', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8 },
  signOutText: { color: '#FF3B30', fontFamily: 'Inter-Bold', fontSize: 16, marginLeft: 8 },
  tabsContainer: { paddingHorizontal: 16, paddingVertical: 10, height: 60 },
  segmentButton: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, backgroundColor: '#2C2C2E', marginRight: 8, justifyContent: 'center' },
  segmentButtonActive: { backgroundColor: '#007AFF' },
  segmentText: { fontFamily: 'Inter-Regular', color: '#FFFFFF', fontSize: 13 },
  segmentTextActive: { fontFamily: 'Inter-Bold', color: '#FFFFFF' },
  reviewCard: { flexDirection: 'row', backgroundColor: '#2C2C2E', borderRadius: 12, padding: 12, marginBottom: 12 },
  reviewPoster: { width: 60, height: 90, borderRadius: 8, backgroundColor: '#3A3A3C' },
  reviewContent: { flex: 1, marginLeft: 12, justifyContent: 'flex-start' },
  reviewMovieTitle: { fontFamily: 'Inter-Bold', color: '#FFFFFF', fontSize: 16, marginBottom: 4 },
  reviewStars: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  reviewDate: { fontFamily: 'Inter-Regular', color: '#8E8E93', fontSize: 12 },
  reviewComment: { fontFamily: 'Inter-Regular', color: '#E5E5EA', fontSize: 14, fontStyle: 'italic' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: '#2C2C2E', borderRadius: 16, padding: 20 },
  modalTitle: { fontFamily: 'Inter-Bold', fontSize: 18, color: '#FFFFFF', marginBottom: 16, textAlign: 'center' },
  modalInput: { backgroundColor: '#1C1C1E', borderRadius: 8, padding: 12, color: '#FFFFFF', fontFamily: 'Inter-Regular', marginBottom: 20, borderWidth: 1, borderColor: '#3A3A3C' },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between' },
  modalButton: { flex: 1, paddingVertical: 12, borderRadius: 8, alignItems: 'center', marginHorizontal: 5 },
  cancelButton: { backgroundColor: '#3A3A3C' },
  saveButton: { backgroundColor: '#007AFF' },
  cancelButtonText: { color: '#FFFFFF', fontFamily: 'Inter-Bold' },
  saveButtonText: { color: '#FFFFFF', fontFamily: 'Inter-Bold' },
});