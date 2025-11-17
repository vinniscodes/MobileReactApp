import 'react-native-url-polyfill/auto';
import {
  setItemAsync,
  getItemAsync,
  deleteItemAsync,
} from 'expo-secure-store';
import { createClient } from '@supabase/supabase-js';
// --- MUDANÇA AQUI ---
// Importamos o Platform para checar se é Web ou Nativo
import { Platform } from 'react-native';

// O adaptador de armazenamento Nativo
const SupabaseStorage = {
  async setItem(key: string, value: string) {
    await setItemAsync(key, value);
  },
  async getItem(key: string) {
    return await getItemAsync(key);
  },
  async removeItem(key: string) {
    await deleteItemAsync(key);
  },
};

const supabaseUrl = 'https://khczcgsgohsiufxvqxnq.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtoY3pjZ3Nnb2hzaXVmeHZxeG5xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg4NTYyNzUsImV4cCI6MjA3NDQzMjI3NX0.I1znbJISTennQ8d3-C2_Ri6dxJQlXrJczDG6hllk9S8';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // --- MUDANÇA AQUI ---
    // SÓ usamos o SupabaseStorage se NÃO for web.
    // Se for web, passamos 'undefined' e o Supabase usa o localStorage (que é o correto).
    storage: Platform.OS === 'web' ? undefined : SupabaseStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});