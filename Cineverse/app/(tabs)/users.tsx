import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  TextInput,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Image, // Importamos o Image
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';
import { Profile } from '../../lib/MovieStatusContext'; // Reutilizamos o tipo

export default function UsersScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Profile[]>([]);
  const router = useRouter();

  // Debounce (sem mudança)
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Busca no Supabase (sem mudança)
  useEffect(() => {
    if (debouncedQuery.length < 2) {
      setResults([]);
      return;
    }
    const fetchUsers = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .ilike('username', `%${debouncedQuery}%`)
        .limit(20);
      
      if (error) {
        console.error('Erro ao buscar usuários:', error);
      }
      setResults(data || []);
      setLoading(false);
    };
    fetchUsers();
  }, [debouncedQuery]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen options={{ title: 'Buscar Usuários' }} />
      
      {/* Barra de Busca (sem mudança) */}
      <View style={styles.searchContainer}>
        <Ionicons
          name="search"
          size={20}
          color="#8E8E93"
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar por username..."
          placeholderTextColor="#8E8E93"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* --- LISTA DE RESULTADOS (ATUALIZADA) --- */}
      {loading ? (
        <ActivityIndicator size="large" color="#FFFFFF" style={{ marginTop: 20 }}/>
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={styles.userItem}
              onPress={() => router.push({
                pathname: '/user/[id]',
                params: { id: item.id }
              })}
            >
              {/* --- MUDANÇA AQUI --- */}
              {/* Mostra a imagem se ela existir, senão mostra o placeholder */}
              {item.avatar_url ? (
                <Image source={{ uri: item.avatar_url }} style={styles.avatarImage} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Ionicons name="person" size={20} color="#1C1C1E" />
                </View>
              )}
              {/* --- FIM DA MUDANÇA --- */}
              <Text style={styles.usernameText}>{item.username}</Text>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            debouncedQuery.length > 1 ? (
              <Text style={styles.emptyText}>Nenhum usuário encontrado.</Text>
            ) : (
              <Text style={styles.emptyText}>Digite ao menos 2 letras para buscar.</Text>
            )
          }
        />
      )}
    </SafeAreaView>
  );
}

// --- ESTILOS ATUALIZADOS ---
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#1C1C1E' },
  searchContainer: {
    flexDirection: 'row',
    backgroundColor: '#2C2C2E',
    borderRadius: 10,
    margin: 16,
    paddingHorizontal: 10,
    alignItems: 'center',
  },
  searchIcon: { marginRight: 8 },
  searchInput: {
    flex: 1,
    height: 40,
    color: '#FFFFFF',
    fontFamily: 'Inter-Regular',
    fontSize: 16,
  },
  emptyText: {
    color: '#8E8E93',
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 30,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#3A3A3C',
  },
  // --- NOVO ESTILO ---
  avatarImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#3A3A3C', // Fundo enquanto carrega
    marginRight: 12,
  },
  // --- FIM NOVO ESTILO ---
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E5E5EA',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  usernameText: {
    color: '#FFFFFF',
    fontFamily: 'Inter-Bold',
    fontSize: 18,
  },
});