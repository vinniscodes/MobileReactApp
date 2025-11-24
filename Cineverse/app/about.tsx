import React from 'react';
import { StyleSheet, Text, View, ScrollView, Image } from 'react-native';
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function AboutScreen() {
  const team = [
    {
      name: 'Malu de Faria Neves Bezerra',
      role: 'Integração de API',
      icon: 'cloud-download-outline' as const,
    },
    {
      name: 'Vinicius Anderson Cavalcanti Silva',
      role: 'Banco de Dados & Backend',
      icon: 'server-outline' as const,
    },
    {
      name: 'Pedro Victor Gomes de Araújo',
      role: 'Front-End (Navegação & Layout)',
      icon: 'phone-portrait-outline' as const,
    },
    {
      name: 'Leandro Lima da Silva',
      role: 'Front-End (Componentes & Interação)',
      icon: 'color-palette-outline' as const,
    },
  ];

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: 'Sobre a Equipe', 
          headerStyle: { backgroundColor: '#1C1C1E' },
          headerTitleStyle: { color: '#FFFFFF', fontFamily: 'Inter-Bold' },
          headerTintColor: '#007AFF',
          headerBackTitle: 'Voltar'
        }} 
      />
      
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.logoContainer}>
          <View style={styles.iconCircle}>
            <Ionicons name="film" size={60} color="#007AFF" />
          </View>
          <Text style={styles.appName}>Cineverse</Text>
          <Text style={styles.version}>Versão Final - 2º GQ</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>O Projeto</Text>
          <Text style={styles.description}>
            Uma rede social completa para amantes de cinema. 
            Desenvolvido com React Native, Expo e Supabase.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Desenvolvedores</Text>
          {team.map((member, index) => (
            <View key={index} style={styles.memberCard}>
              <View style={styles.memberIcon}>
                <Ionicons name={member.icon} size={24} color="#FFFFFF" />
              </View>
              <View style={styles.memberInfo}>
                <Text style={styles.memberName}>{member.name}</Text>
                <Text style={styles.memberRole}>{member.role}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Novembro de 2025</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1C1C1E' },
  content: { padding: 24, paddingBottom: 50 },
  logoContainer: { alignItems: 'center', marginBottom: 40, marginTop: 20 },
  iconCircle: {
    width: 100, height: 100, borderRadius: 50, backgroundColor: '#2C2C2E',
    justifyContent: 'center', alignItems: 'center', marginBottom: 16
  },
  appName: { fontSize: 32, fontFamily: 'Inter-Bold', color: '#FFFFFF' },
  version: { fontSize: 14, fontFamily: 'Inter-Regular', color: '#8E8E93', marginTop: 5 },
  
  section: { marginBottom: 30 },
  sectionTitle: { fontSize: 18, fontFamily: 'Inter-Bold', color: '#007AFF', marginBottom: 16 },
  description: { fontSize: 16, fontFamily: 'Inter-Regular', color: '#E5E5EA', lineHeight: 24 },
  
  memberCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#2C2C2E',
    padding: 16, borderRadius: 12, marginBottom: 12
  },
  memberIcon: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: '#007AFF',
    justifyContent: 'center', alignItems: 'center', marginRight: 12
  },
  memberInfo: { flex: 1 },
  memberName: { fontSize: 15, fontFamily: 'Inter-Bold', color: '#FFFFFF', marginBottom: 4 },
  memberRole: { fontSize: 13, fontFamily: 'Inter-Regular', color: '#8E8E93' },
  
  footer: { alignItems: 'center', marginTop: 10, borderTopWidth: 1, borderTopColor: '#2C2C2E', paddingTop: 20 },
  footerText: { fontSize: 12, fontFamily: 'Inter-Regular', color: '#555' },
});