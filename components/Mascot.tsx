import { Colors, FontFamily } from '@/components/ui';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type MascotMood = 'idle' | 'happy' | 'excited' | 'sleepy' | 'encouraging';

interface MascotProps {
  mood?: MascotMood;
  message?: string;
  streak?: number;
  onPress?: () => void;
  visible?: boolean;
}

const MESSAGES = {
  idle: ['嗨！准备好记录了吗？', '今天也要加油哦！', '🚽 在等待你~'],
  happy: ['太棒了！', '你真厉害！', '继续保持！'],
  excited: ['🔥 连胜不断！', '你是最棒的！', '不可思议！'],
  sleepy: ['夜深了，早点休息哦', '晚安~', '熬夜对身体不好呢'],
  encouraging: ['别忘了记录哦', '今天还没来报到呢', '我在等你哟~'],
};

export function Mascot({ mood = 'idle', message, streak = 0, onPress, visible = true }: MascotProps) {
  const bounceAnim = useRef(new Animated.Value(0)).current;
  const blinkAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(-150)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const [displayMessage, setDisplayMessage] = useState(message);

  // 自动生成消息
  useEffect(() => {
    if (message) {
      setDisplayMessage(message);
    } else {
      const msgs = MESSAGES[mood];
      setDisplayMessage(msgs[Math.floor(Math.random() * msgs.length)]);
    }
  }, [mood, message]);

  // 入场动画
  useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        friction: 8,
        tension: 60,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: -150,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  // 持续弹跳动画
  useEffect(() => {
    const bounce = Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: -8,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
      ])
    );
    bounce.start();
    return () => bounce.stop();
  }, []);

  // 眨眼动画
  useEffect(() => {
    const blink = Animated.loop(
      Animated.sequence([
        Animated.delay(2000 + Math.random() * 2000),
        Animated.timing(blinkAnim, {
          toValue: 0.1,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(blinkAnim, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ])
    );
    blink.start();
    return () => blink.stop();
  }, []);

  // 摇摆动画（兴奋时）
  useEffect(() => {
    if (mood === 'excited') {
      const wiggle = Animated.loop(
        Animated.sequence([
          Animated.timing(rotateAnim, {
            toValue: -10,
            duration: 150,
            useNativeDriver: true,
          }),
          Animated.timing(rotateAnim, {
            toValue: 10,
            duration: 150,
            useNativeDriver: true,
          }),
          Animated.timing(rotateAnim, {
            toValue: 0,
            duration: 150,
            useNativeDriver: true,
          }),
        ])
      );
      wiggle.start();
      return () => wiggle.stop();
    } else {
      rotateAnim.setValue(0);
    }
  }, [mood]);

  const handlePress = useCallback(() => {
    // 被点击时的反应动画
    Animated.sequence([
      Animated.spring(bounceAnim, {
        toValue: -30,
        useNativeDriver: true,
        friction: 4,
        tension: 200,
      }),
      Animated.spring(bounceAnim, {
        toValue: 0,
        useNativeDriver: true,
        friction: 6,
        tension: 100,
      }),
    ]).start();
    onPress?.();
  }, [onPress, bounceAnim]);


  // 根据情绪显示不同颜色的背景
  const getBubbleColor = () => {
    switch (mood) {
      case 'excited':
        return Colors.yellow;
      case 'happy':
        return Colors.mintLight;
      case 'sleepy':
        return Colors.skyLight;
      case 'encouraging':
        return Colors.orange;
      default:
        return Colors.yellow;
    }
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [
            { translateX: slideAnim },
          ],
        },
      ]}
    >
      {/* 吉祥物主体：卫生纸卷 */}
      <TouchableOpacity onPress={handlePress} activeOpacity={0.8}>
        <Animated.View
          style={[
            styles.mascotContainer,
            {
              transform: [
                { translateY: bounceAnim },
                { rotate: rotateAnim.interpolate({
                  inputRange: [-10, 10],
                  outputRange: ['-10deg', '10deg'],
                }) },
              ],
            },
          ]}
        >
          {/* 身体: 卫生纸的主体圈 */}
          <View style={styles.body}>
            {/* 顶部的卫生纸纸筒洞孔 */}
            <View style={styles.rollHole}>
              <View style={styles.rollInner} />
            </View>

            {/* 悬垂的纸巾 */}
            <View style={styles.paperTrailing}>
               <View style={styles.paperLine1} />
               <View style={styles.paperLine2} />
               <View style={styles.paperLine3} />
            </View>

            {/* 眼睛 */}
            <View style={styles.eyesContainer}>
              <Animated.View style={[styles.eye, { opacity: blinkAnim }]}>
                <View style={styles.eyeDot} />
              </Animated.View>
              <Animated.View style={[styles.eye, { opacity: blinkAnim }]}>
                <View style={styles.eyeDot} />
              </Animated.View>
            </View>

            {/* 嘴巴 */}
            {mood === 'sleepy' ? (
               <View style={styles.sleepyMouth} />
            ) : (
               <View style={[styles.mouth, mood === 'happy' || mood === 'excited' ? styles.mouthOpen : null]} />
            )}

            {/* 腮红 */}
            {(mood === 'happy' || mood === 'excited') && (
              <>
                <View style={[styles.blush, styles.blushLeft]} />
                <View style={[styles.blush, styles.blushRight]} />
              </>
            )}
          </View>

          {/* 连胜火焰 */}
          {streak >= 3 && (
            <View style={styles.streakBadge}>
              <Text style={styles.streakText}>🔥{streak}</Text>
            </View>
          )}
        </Animated.View>
      </TouchableOpacity>

      {/* 对话气泡 - 在吉祥物右侧 */}
      <View style={styles.bubbleWrapper}>
        {/* 左指箭头 */}
        <View style={styles.bubbleArrowLeft} />
        <View style={styles.bubbleArrowLeftInner} />
        <View style={[styles.speechBubble, { backgroundColor: getBubbleColor() }]}>
          <Text style={styles.messageText}>{displayMessage}</Text>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    paddingLeft: 4,
  },
  bubbleWrapper: {
    position: 'relative',
    marginLeft: 8,
    flexShrink: 1,
  },
  speechBubble: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
    borderWidth: 2.5,
    borderColor: Colors.sketch.dark,
    maxWidth: 180,
  },
  bubbleArrowLeft: {
    position: 'absolute',
    left: -10,
    top: 14,
    width: 0,
    height: 0,
    borderTopWidth: 8,
    borderTopColor: 'transparent',
    borderBottomWidth: 8,
    borderBottomColor: 'transparent',
    borderRightWidth: 10,
    borderRightColor: Colors.sketch.dark,
    zIndex: 1,
  },
  bubbleArrowLeftInner: {
    position: 'absolute',
    left: -6,
    top: 15,
    width: 0,
    height: 0,
    borderTopWidth: 7,
    borderTopColor: 'transparent',
    borderBottomWidth: 7,
    borderBottomColor: 'transparent',
    borderRightWidth: 8,
    borderRightColor: Colors.yellow, // default, overridden by getBubbleColor via inline
    zIndex: 2,
  },
  messageText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.primary,
    fontFamily: FontFamily.regular,
    lineHeight: 20,
  },
  mascotContainer: {
    width: 140,
    height: 140,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    width: 120,
    height: 110,
    borderRadius: 30,
    backgroundColor: '#FFFFFF', // 卫生纸白色
    alignItems: 'center',
    borderWidth: 5,
    borderColor: Colors.sketch.dark,
    alignSelf: 'center',
    ...{
      shadowColor: '#000',
      shadowOffset: { width: 4, height: 8 },
      shadowOpacity: 0.2,
      shadowRadius: 0,
      elevation: 6,
    },
  },
  rollHole: {
    position: 'absolute',
    top: -24,
    width: 60,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#FFFFFF',
    borderWidth: 5,
    borderColor: Colors.sketch.dark,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: -1,
  },
  rollInner: {
    width: 30,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#D1D5DB', // 纸筒内圈灰色
    borderWidth: 3,
    borderColor: Colors.sketch.dark,
  },
  paperTrailing: {
    position: 'absolute',
    bottom: -30,
    right: 15,
    width: 30,
    height: 50,
    backgroundColor: '#FFFFFF',
    borderWidth: 4,
    borderTopWidth: 0,
    borderColor: Colors.sketch.dark,
    borderBottomLeftRadius: 5,
    borderBottomRightRadius: 5,
    zIndex: -1,
  },
  paperLine1: { width: '100%', borderBottomWidth: 3, borderBottomColor: Colors.sketch.dark, borderStyle: 'dotted', position: 'absolute', top: 15 },
  paperLine2: { width: '100%', borderBottomWidth: 3, borderBottomColor: Colors.sketch.dark, borderStyle: 'dotted', position: 'absolute', top: 30 },
  paperLine3: { width: '100%', borderBottomWidth: 3, borderBottomColor: Colors.sketch.dark, borderStyle: 'dotted', position: 'absolute', top: 45 },
  eyesContainer: {
    position: 'absolute',
    top: 40,
    flexDirection: 'row',
    gap: 20,
  },
  eye: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: Colors.sketch.dark,
    justifyContent: 'center',
    alignItems: 'center',
  },
  eyeDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#FFF',
    transform: [{ translateX: 1 }, { translateY: -2 }],
  },
  mouth: {
    position: 'absolute',
    bottom: 25,
    width: 24,
    height: 12,
    borderBottomWidth: 4,
    borderBottomColor: Colors.sketch.dark,
    borderLeftWidth: 4,
    borderLeftColor: Colors.sketch.dark,
    borderRightWidth: 4,
    borderRightColor: Colors.sketch.dark,
    borderRadius: 12,
    backgroundColor: 'transparent',
  },
  mouthOpen: {
    backgroundColor: Colors.pink,
    height: 18,
  },
  sleepyMouth: {
    position: 'absolute',
    bottom: 30,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.sketch.dark,
  },
  blush: {
    position: 'absolute',
    width: 16,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.pink,
    opacity: 0.6,
    top: 45,
  },
  blushLeft: {
    left: 15,
  },
  blushRight: {
    right: 15,
  },
  streakBadge: {
    position: 'absolute',
    top: -5,
    right: 5,
    backgroundColor: Colors.orange,
    borderRadius: 16,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 3,
    borderColor: Colors.sketch.dark,
  },
  streakText: {
    fontSize: 16,
    fontWeight: '700',
    fontFamily: FontFamily.regular,
  },
});
