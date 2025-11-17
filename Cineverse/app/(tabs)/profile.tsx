import React, { useMemo, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList, // Trocamos SectionList por FlatList
  SafeAreaView,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { Stack } from 'expo-router';
import { MovieCard } from '../../components/MovieCard';
import { useMovieStatus } from '../../lib/MovieStatusContext';
import { Ionicons } from '@expo/vector-icons';

// --- Tipos ---
interface Movie {
  id: string;
  titulo: string;
  descricao: string;
  posterUrl: string;
}

// Tipo para controlar a aba ativa
type ActiveTab = 'liked' | 'saved' | 'disliked';

export default function ProfileScreen() {
  const { allMovies, movieStatus, loading, session, signOut } = useMovieStatus();

  // --- NOVO ESTADO ---
  // Controla qual botão está ativo. Começa em 'liked'.
  const [activeTab, setActiveTab] = useState<ActiveTab>('liked');

  // --- LÓGICA DE FILTRO (Sem mudança) ---
  const likedMovies = useMemo(
    () => allMovies.filter((movie) => movieStatus[movie.id]?.liked),
    [allMovies, movieStatus]
  );
  const dislikedMovies = useMemo(
    () => allMovies.filter((movie) => movieStatus[movie.id]?.disliked),
    [allMovies, movieStatus]
  );
  const savedMovies = useMemo(
    () => allMovies.filter((movie) => movieStatus[movie.id]?.saved),
    [allMovies, movieStatus]
  );

  // --- NOVO ---
  // Decide qual lista mostrar baseado no estado 'activeTab'
  const displayedData = useMemo(() => {
    if (activeTab === 'liked') return likedMovies;
    if (activeTab === 'saved') return savedMovies;
    if (activeTab === 'disliked') return dislikedMovies;
    return [];
  }, [activeTab, likedMovies, dislikedMovies, savedMovies]);

  // Mensagem de "vazio" dinâmica
  const getEmptyMessage = () => {
    switch (activeTab) {
      case 'liked':
        return 'Você ainda não curtiu nenhum filme.';
      case 'saved':
        return 'Sua lista de filmes salvos está vazia.';
      case 'disliked':
        return 'Você ainda não deu dislike em nenhum filme.';
    }
  };

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
          title: 'Meu Perfil',
        }}
      />

      {/* --- CABEÇALHO (Movemos para fora da lista) --- */}
      <View style={styles.headerContainer}>
        <Text style={styles.emailText}>
          Logado como: {session?.user?.email}
        </Text>
        <TouchableOpacity style={styles.signOutButton} onPress={signOut}>
          <Ionicons name="log-out-outline" size={20} color="#FF3B30" />
          <Text style={styles.signOutText}>Sair</Text>
        </TouchableOpacity>
      </View>

      {/* --- NOVOS BOTÕES (Controle Segmentado) --- */}
      <View style={styles.segmentContainer}>
        <TouchableOpacity
          style={[
            styles.segmentButton,
            activeTab === 'liked' && styles.segmentButtonActive,
          ]}
          onPress={() => setActiveTab('liked')}>
          <Text
            style={[
              styles.segmentText,
              activeTab === 'liked' && styles.segmentTextActive,
            ]}>
            Gostei ({likedMovies.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.segmentButton,
            activeTab === 'saved' && styles.segmentButtonActive,
          ]}
          onPress={() => setActiveTab('saved')}>
          <Text
            style={[
              styles.segmentText,
              activeTab === 'saved' && styles.segmentTextActive,
            ]}>
            Salvos ({savedMovies.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.segmentButton,
            activeTab === 'disliked' && styles.segmentButtonActive,
          ]}
          onPress={() => setActiveTab('disliked')}>
          <Text
            style={[
              styles.segmentText,
              activeTab === 'disliked' && styles.segmentTextActive,
            ]}>
            Não Gostei ({dislikedMovies.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* --- LISTA DE FILMES (Agora é FlatList) --- */}
      {displayedData.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>{getEmptyMessage()}</Text>
        </View>
      ) : (
        <FlatList
          data={displayedData}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <MovieCard movie={item} />}
          contentContainerStyle={styles.lista}
        />
      )}
    </SafeAreaView>
  );
}

// --- ESTILOS ATUALIZADOS ---
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
  emptyContainer: {
    flex: 1, // Faz a mensagem de "vazio" preencher o espaço
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
  headerContainer: {
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#3A3A3C',
  },
  emailText: {
    fontFamily: 'Inter-Regular',
    color: '#E5E5EA',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 15,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2C2C2E',
    paddingVertical: 10,
    borderRadius: 8,
  },
  signOutText: {
    color: '#FF3B30',
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    marginLeft: 8,
  },
  // --- NOVOS ESTILOS PARA OS BOTÕES ---
  segmentContainer: {
    flexDirection: 'row',
    backgroundColor: '#2C2C2E',
    borderRadius: 8,
    margin: 16,
    padding: 2,
  },
  segmentButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 7,
  },
  segmentButtonActive: {
    backgroundColor: '#007AFF', // Azul
  },
  segmentText: {
    fontFamily: 'Inter-Regular',
    color: '#FFFFFF',
    fontSize: 13,
    textAlign: 'center',
  },
  segmentTextActive: {
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
  },
});