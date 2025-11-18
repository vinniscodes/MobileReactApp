import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface StarRatingProps {
  rating: number;          // A nota atual (0 a 5)
  onRate?: (rate: number) => void; // Função opcional: se existir, o componente é clicável
  size?: number;           // Tamanho do ícone (padrão 24)
  color?: string;          // Cor da estrela (padrão Dourado)
}

export const StarRating: React.FC<StarRatingProps> = ({
  rating,
  onRate,
  size = 24,
  color = '#FFD700', // Dourado
}) => {
  // Cria um array [1, 2, 3, 4, 5] para gerar as 5 estrelas
  const stars = [1, 2, 3, 4, 5];

  return (
    <View style={styles.container}>
      {stars.map((starValue) => {
        // Lógica do Ícone: Cheia, Meia ou Vazia
        let iconName: keyof typeof Ionicons.glyphMap = 'star-outline';

        if (rating >= starValue) {
          iconName = 'star'; // Cheia
        } else if (rating >= starValue - 0.5) {
          iconName = 'star-half'; // Meia (útil para médias, ex: 3.5)
        }

        // Se tiver função 'onRate', usamos TouchableOpacity (botão)
        // Se não, usamos View (apenas visualização)
        if (onRate) {
          return (
            <TouchableOpacity
              key={starValue}
              onPress={() => onRate(starValue)}
              activeOpacity={0.7}
            >
              <Ionicons name={iconName} size={size} color={color} style={styles.star} />
            </TouchableOpacity>
          );
        } else {
          return (
            <Ionicons
              key={starValue}
              name={iconName}
              size={size}
              color={color}
              style={styles.star}
            />
          );
        }
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  star: {
    marginRight: 2, // Pequeno espaço entre as estrelas
  },
});