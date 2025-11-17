import React, { useEffect } from 'react';
// --- MUDANÇA AQUI ---
// Trocamos 'Dimensions' por 'useWindowDimensions'
import { View, StyleSheet, useWindowDimensions } from 'react-native';
// --- FIM DA MUDANÇA ---
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  interpolate,
} from 'react-native-reanimated';

const ShimmerPlaceholder: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // --- MUDANÇA AQUI ---
  // Pegamos a largura da tela usando o hook
  const { width: windowWidth } = useWindowDimensions();
  // --- FIM DA MUDANÇA ---
  
  const sharedValue = useSharedValue(0);

  useEffect(() => {
    sharedValue.value = withRepeat(
      withTiming(1, { duration: 1000 }),
      -1,
      false
    );
  }, [sharedValue]);

  const animatedStyle = useAnimatedStyle(() => {
    // --- MUDANÇA AQUI ---
    // Usamos a variável 'windowWidth' em vez de Dimensions.get()
    const translateX = interpolate(
      sharedValue.value,
      [0, 1],
      [-windowWidth, windowWidth]
    );
    // --- FIM DA MUDANÇA ---
    return {
      transform: [{ translateX }],
    };
  });

  return (
    <View style={styles.shimmerContainer}>
      {children}
      <Animated.View style={[styles.shimmerOverlay, animatedStyle]}>
        <LinearGradient
          colors={['transparent', 'rgba(255,255,255,0.05)', 'transparent']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFillObject}
        />
      </Animated.View>
    </View>
  );
};

export const SkeletonCard = () => {
  return (
    <View style={styles.cardContainer}>
      <ShimmerPlaceholder>
        <View style={styles.poster} />
      </ShimmerPlaceholder>
      <View style={styles.infoContainer}>
        <ShimmerPlaceholder>
          <View style={styles.titlePlaceholder} />
        </ShimmerPlaceholder>
        <View style={{ height: 8 }} />
        <ShimmerPlaceholder>
          <View style={styles.descPlaceholder} />
        </ShimmerPlaceholder>
        <View style={{ height: 4 }} />
        <ShimmerPlaceholder>
          <View style={styles.descPlaceholder} />
        </ShimmerPlaceholder>
      </View>
      <View style={styles.botoesContainer}>
        <View style={styles.iconPlaceholder} />
        <View style={styles.iconPlaceholder} />
        <View style={styles.iconPlaceholder} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  // --- Shimmer ---
  shimmerContainer: {
    backgroundColor: '#3A3A3C', // Cor de fundo do placeholder
    borderRadius: 8,
    overflow: 'hidden',
  },
  shimmerOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  
  // --- Layout ---
  cardContainer: {
    backgroundColor: '#2C2C2E',
    borderRadius: 12,
    marginVertical: 8,
    overflow: 'hidden',
  },
  poster: {
    width: '100%',
    height: 450,
    backgroundColor: '#3A3A3C',
  },
  infoContainer: {
    padding: 16,
  },
  titlePlaceholder: {
    height: 22,
    width: '70%',
    backgroundColor: '#3A3A3C',
    borderRadius: 8,
  },
  descPlaceholder: {
    height: 14,
    width: '90%',
    backgroundColor: '#3A3A3C',
    borderRadius: 8,
  },
  botoesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#3A3A3C',
  },
  iconPlaceholder: {
    width: 28,
    height: 28,
    backgroundColor: '#3A3A3C',
    borderRadius: 14,
  },
});