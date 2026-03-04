import React, { useCallback, useEffect, useState } from 'react';
import { Animated as RNAnimated, StyleSheet, View } from 'react-native';

interface Particle {
  id: number;
  x: number;
  y: number;
  emoji: string;
  scale: number;
  rotation: number;
}

interface ParticleEffectProps {
  trigger: boolean | number;
  centerX: number;
  centerY: number;
  particleCount?: number;
  emojis?: string[];
  onComplete?: () => void;
}

const DEFAULT_EMOJIS = ['⭐', '✨', '💩', '🎉', '🔥', '💫'];

export function ParticleEffect({
  trigger,
  centerX,
  centerY,
  particleCount = 12,
  emojis = DEFAULT_EMOJIS,
  onComplete,
}: ParticleEffectProps) {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [animations, setAnimations] = useState<{ [key: number]: RNAnimated.Value[] }>({});

  const createParticles = useCallback(() => {
    const newParticles: Particle[] = [];
    const newAnimations: { [key: number]: RNAnimated.Value[] } = {};

    for (let i = 0; i < particleCount; i++) {
      const angle = (i / particleCount) * 2 * Math.PI;
      const distance = 80 + Math.random() * 60;
      const particle: Particle = {
        id: Date.now() + i,
        x: centerX + Math.cos(angle) * distance,
        y: centerY + Math.sin(angle) * distance,
        emoji: emojis[Math.floor(Math.random() * emojis.length)],
        scale: 0.5 + Math.random() * 0.8,
        rotation: Math.random() * 360,
      };

      newParticles.push(particle);
      newAnimations[particle.id] = [
        new RNAnimated.Value(0), // translateX
        new RNAnimated.Value(0), // translateY
        new RNAnimated.Value(1), // opacity
        new RNAnimated.Value(0.5), // scale
      ];
    }

    setParticles(newParticles);
    setAnimations(newAnimations);

    // Animate particles
    Object.keys(newAnimations).forEach((id, index) => {
      const anims = newAnimations[Number(id)];
      const particle = newParticles[index];

      RNAnimated.parallel([
        RNAnimated.spring(anims[0], {
          toValue: particle.x - centerX,
          useNativeDriver: true,
          friction: 6,
          tension: 40,
        }),
        RNAnimated.spring(anims[1], {
          toValue: particle.y - centerY,
          useNativeDriver: true,
          friction: 6,
          tension: 40,
        }),
        RNAnimated.timing(anims[2], {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
          delay: 300,
        }),
        RNAnimated.spring(anims[3], {
          toValue: particle.scale,
          useNativeDriver: true,
          friction: 5,
          tension: 100,
        }),
      ]).start(() => {
        if (index === particleCount - 1 && onComplete) {
          onComplete();
        }
      });
    });
  }, [centerX, centerY, particleCount, emojis, onComplete]);

  useEffect(() => {
    if (trigger) {
      createParticles();
    }
  }, [trigger, createParticles]);

  if (particles.length === 0) return null;

  return (
    <View style={[StyleSheet.absoluteFill, styles.container]} pointerEvents="none">
      {particles.map((particle) => {
        const anims = animations[particle.id];
        if (!anims) return null;

        return (
          <RNAnimated.Text
            key={particle.id}
            style={[
              styles.particle,
              {
                left: centerX,
                top: centerY,
                transform: [
                  { translateX: anims[0] },
                  { translateY: anims[1] },
                  { scale: anims[3] },
                  { rotate: `${particle.rotation}deg` },
                ],
                opacity: anims[2],
              },
            ]}
          >
            {particle.emoji}
          </RNAnimated.Text>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    zIndex: 1000,
  },
  particle: {
    position: 'absolute',
    fontSize: 24,
  },
});
