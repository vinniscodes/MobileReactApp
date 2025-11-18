import 'react-native-url-polyfill/auto';
// --- ESTA É A CORREÇÃO ---
// Importamos as funções diretamente em vez de "import *"
import {
  setItemAsync,
  getItemAsync,
  deleteItemAsync,
} from 'expo-secure-store';
// --- FIM DA CORREÇÃO ---
import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';

// O adaptador de armazenamento Nativo
const SupabaseStorage = {
  async setItem(key: string, value: string) {
    // Usamos a função direta
    await setItemAsync(key, value);
  },
  async getItem(key: string) {
    // Usamos a função direta
    // Esta é a linha que estava dando o TypeError
    return await getItemAsync(key);
  },
  async removeItem(key: string) {
    // Usamos a função direta
    await deleteItemAsync(key);
  },
};

const supabaseUrl = 'https://khczcgsgohsiufxvqxnq.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtoY3pjZ3Nnb2hzaXVmeHZxeG5xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg4NTYyNzUsImV4cCI6MjA3NDQzMjI3NX0.I1znbJISTennQ8d3-C2_Ri6dxJQlXrJczDG6hllk9S8';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // SÓ usamos o SupabaseStorage se NÃO for web.
    storage: Platform.OS === 'web' ? undefined : SupabaseStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});