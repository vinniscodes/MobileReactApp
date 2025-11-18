import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView, // Adicionado para telas menores
} from 'react-native';
import { supabase } from '../lib/supabase';
import { Ionicons } from '@expo/vector-icons';

export default function AuthScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // --- NOVO CAMPO ---
  const [username, setUsername] = useState('');
  // --- FIM NOVO CAMPO ---

  const [loading, setLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);

  async function signInWithEmail() {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) Alert.alert('Erro no Login', error.message);
    setLoading(false);
  }

  async function signUpWithEmail() {
    if (username.length < 3) {
      Alert.alert('Erro no Cadastro', 'O nome de usuário deve ter pelo menos 3 caracteres.');
      return;
    }
    
    setLoading(true);
    // --- MUDANÇA AQUI ---
    // Passamos o 'username' para o Supabase
    // O Gatilho (Trigger) que criamos no SQL vai usar isso
    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: password,
      options: {
        data: {
          username: username, // Isso será pego pelo gatilho SQL
        },
      },
    });
    // --- FIM DA MUDANÇA ---

    if (error) {
      Alert.alert('Erro no Cadastro', error.message);
    } else {
      Alert.alert('Sucesso!', 'Verifique seu e-mail para confirmar a conta.');
      // O gatilho no Supabase cuidou de criar o perfil
    }
    setLoading(false);
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Ionicons name="film" size={80} color="#007AFF" />
        <Text style={styles.title}>Cineverse</Text>

        {/* --- NOVO CAMPO VISÍVEL --- */}
        {!isLogin && (
          <TextInput
            style={styles.input}
            placeholder="Nome de Usuário (público)"
            placeholderTextColor="#8E8E93"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
          />
        )}
        {/* --- FIM NOVO CAMPO --- */}

        <TextInput
          style={styles.input}
          placeholder="E-mail"
          placeholderTextColor="#8E8E93"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <TextInput
          style={styles.input}
          placeholder="Senha"
          placeholderTextColor="#8E8E93"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        {loading ? (
          <ActivityIndicator size="large" color="#FFFFFF" style={styles.button} />
        ) : (
          <TouchableOpacity
            style={styles.button}
            onPress={isLogin ? signInWithEmail : signUpWithEmail}>
            <Text style={styles.buttonText}>
              {isLogin ? 'Entrar' : 'Cadastrar'}
            </Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          onPress={() => {
            setIsLogin(!isLogin);
            // Limpa os campos ao alternar
            setUsername('');
            setEmail('');
            setPassword('');
          }}
          style={styles.toggleButton}>
          <Text style={styles.toggleButtonText}>
            {isLogin
              ? 'Não tem uma conta? Cadastre-se'
              : 'Já tem uma conta? Faça login'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#1C1C1E',
  },
  container: {
    flexGrow: 1, // Permite o ScrollView funcionar
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  title: {
    fontFamily: 'Inter-Bold',
    fontSize: 40,
    color: '#FFFFFF',
    marginBottom: 40,
    marginTop: 10,
  },
  input: {
    width: '100%',
    height: 50,
    backgroundColor: '#2C2C2E',
    borderRadius: 10,
    paddingHorizontal: 15,
    color: '#FFFFFF',
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    marginBottom: 15,
  },
  button: {
    width: '100%',
    height: 50,
    backgroundColor: '#007AFF',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#FFFFFF',
    fontFamily: 'Inter-Bold',
    fontSize: 16,
  },
  toggleButton: {
    marginTop: 20,
  },
  toggleButtonText: {
    color: '#8E8E93',
    fontFamily: 'Inter-Regular',
    fontSize: 14,
  },
});