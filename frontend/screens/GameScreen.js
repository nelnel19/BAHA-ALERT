import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Animated,
  ImageBackground,
  Modal,
  Dimensions,
  Easing,
  Image,
} from 'react-native';

const { width, height } = Dimensions.get('window');

const HouseRepairGame = () => {
  // Game state
  const [health, setHealth] = useState(100);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [resources, setResources] = useState(10);
  const [damageRate, setDamageRate] = useState(1);
  const [showRepairEffect, setShowRepairEffect] = useState(false);
  
  // Animations
  const shakeAnim = new Animated.Value(0);
  const repairAnim = new Animated.Value(0);
  const [particles, setParticles] = useState([]);

  // Generate repair particles
  const generateParticles = (x, y) => {
    const newParticles = [];
    for (let i = 0; i < 15; i++) {
      newParticles.push({
        id: Math.random().toString(36).substring(7),
        left: x - 50 + Math.random() * 100,
        top: y - 50 + Math.random() * 100,
        size: 5 + Math.random() * 10,
        color: `hsl(${Math.random() * 60 + 10}, 100%, 50%)`,
        life: 30 + Math.random() * 20,
        speedX: (Math.random() - 0.5) * 10,
        speedY: (Math.random() - 0.5) * 10,
      });
    }
    setParticles(prev => [...prev, ...newParticles]);
  };

  // Update particles
  useEffect(() => {
    if (gameOver || isPaused) return;
    
    const moveParticles = setInterval(() => {
      setParticles(prev => 
        prev.map(p => ({
          ...p,
          life: p.life - 1,
          left: p.left + p.speedX,
          top: p.top + p.speedY,
          opacity: p.life / 50
        })).filter(p => p.life > 0)
      );
    }, 50);

    return () => clearInterval(moveParticles);
  }, [gameOver, isPaused]);

  // Damage house over time
  useEffect(() => {
    if (gameOver || isPaused) return;
    
    const damageInterval = setInterval(() => {
      setHealth(prev => {
        const newHealth = prev - damageRate;
        if (newHealth <= 0) {
          setGameOver(true);
          return 0;
        }
        return newHealth;
      });
      
      // Visual feedback for damage
      if (Math.random() < 0.3) {
        Animated.sequence([
          Animated.timing(shakeAnim, {
            toValue: damageRate * (Math.random() > 0.5 ? 1 : -1),
            duration: 100,
            useNativeDriver: true,
            easing: Easing.linear,
          }),
          Animated.timing(shakeAnim, {
            toValue: 0,
            duration: 100,
            useNativeDriver: true,
            easing: Easing.linear,
          }),
        ]).start();
      }
    }, 1000);

    return () => clearInterval(damageInterval);
  }, [damageRate, gameOver, isPaused]);

  // Game loop - increase difficulty
  useEffect(() => {
    if (gameOver || isPaused) return;
    
    const gameLoop = setInterval(() => {
      setScore(prev => prev + 1);
      
      // Increase damage rate every 30 seconds
      if (score % 30 === 0) {
        setDamageRate(prev => Math.min(prev + 0.5, 10));
      }
      
      // Gain resources periodically
      if (score % 15 === 0) {
        setResources(prev => prev + 2);
      }
    }, 1000);

    return () => clearInterval(gameLoop);
  }, [score, gameOver, isPaused]);

  // Handle repair
  const repairHouse = () => {
    if (gameOver || isPaused || resources <= 0) return;
    
    // Deduct resource
    setResources(prev => prev - 1);
    
    // Health boost based on current damage rate
    const repairAmount = 15 - damageRate;
    setHealth(prev => Math.min(prev + repairAmount, 100));
    
    // Visual feedback
    generateParticles(width / 2, height / 2);
    setShowRepairEffect(true);
    setTimeout(() => setShowRepairEffect(false), 300);
    
    Animated.sequence([
      Animated.timing(repairAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(repairAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // Reset game
  const resetGame = () => {
    setHealth(100);
    setScore(0);
    setResources(10);
    setDamageRate(1);
    setGameOver(false);
    setParticles([]);
  };

  // Render particles
  const renderParticles = () => {
    return particles.map(particle => (
      <Animated.View
        key={particle.id}
        style={[
          styles.particle,
          {
            left: particle.left,
            top: particle.top,
            width: particle.size,
            height: particle.size,
            backgroundColor: particle.color,
            opacity: particle.opacity,
            borderRadius: particle.size / 2,
          },
        ]}
      />
    ));
  };

  // Repair animation interpolation
  const repairScale = repairAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.1],
  });

  return (
    <ImageBackground 
      source={require('../assets/stormy-sky.webp')} 
      style={styles.container}
      resizeMode="cover"
    >
      {/* Instruction Modal */}
      <Modal
        visible={showInstructions}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>House Repair Challenge</Text>
            <Text style={styles.modalText}>
              Your house is falling apart! Tap to repair it using your limited resources.
            </Text>
            <Text style={styles.modalText}>
              - House deteriorates over time (faster as game progresses)
            </Text>
            <Text style={styles.modalText}>
              - Tap the house to repair (costs 1 resource)
            </Text>
            <Text style={styles.modalText}>
              - Gain resources over time
            </Text>
            <Text style={styles.modalText}>
              - Keep the house standing as long as possible!
            </Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => setShowInstructions(false)}
            >
              <Text style={styles.modalButtonText}>Start Game</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Game Over Modal */}
      <Modal
        visible={gameOver}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>House Collapsed!</Text>
            <Text style={styles.modalText}>You kept your house standing for:</Text>
            <Text style={styles.scoreText}>{score} seconds</Text>
            <Text style={styles.modalText}>Maximum repair skill: {Math.round(15 - damageRate)}/repair</Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={resetGame}
            >
              <Text style={styles.modalButtonText}>Rebuild</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Game UI */}
      <View style={styles.uiContainer}>
        <View style={styles.uiItem}>
          <Text style={styles.uiLabel}>Health:</Text>
          <View style={styles.healthContainer}>
            <View style={[styles.healthBar, { width: `${health}%` }]} />
          </View>
        </View>
        
        <View style={styles.uiItem}>
          <Text style={styles.uiLabel}>Resources:</Text>
          <Text style={styles.resourceText}>{resources} 🔧</Text>
        </View>
        
        <View style={styles.uiItem}>
          <Text style={styles.uiLabel}>Score:</Text>
          <Text style={styles.scoreText}>{score}</Text>
        </View>
      </View>

      {/* Pause Button */}
      <TouchableOpacity
        style={styles.pauseButton}
        onPress={() => setIsPaused(!isPaused)}
      >
        <Text style={styles.pauseButtonText}>{isPaused ? '▶' : '⏸'}</Text>
      </TouchableOpacity>

      {/* Game Area */}
      <View style={styles.gameArea}>
        {/* Repair particles */}
        {renderParticles()}
        
        {/* House */}
        <TouchableOpacity onPress={repairHouse} activeOpacity={0.8}>
          <Animated.View style={[
            styles.houseContainer,
            { 
              transform: [
                { translateX: shakeAnim },
                { scale: repairScale }
              ] 
            }
          ]}>
            <Image 
              source={require('../assets/house.webp')} 
              style={[
                styles.houseImage,
                showRepairEffect && styles.repairEffect
              ]}
              resizeMode="contain"
            />
            
            {/* Repair cost indicator */}
            <View style={styles.repairCost}>
              <Text style={styles.repairCostText}>-1 🔧</Text>
            </View>
          </Animated.View>
        </TouchableOpacity>

        {/* Damage rate indicator */}
        <View style={styles.damageIndicator}>
          <Text style={styles.damageText}>Damage Rate: {damageRate.toFixed(1)}/sec</Text>
        </View>
      </View>
      
      {/* Tap hint */}
      {score < 5 && !gameOver && !isPaused && !showInstructions && (
        <View style={styles.tapHint}>
          <Text style={styles.tapHintText}>Tap the house to repair!</Text>
        </View>
      )}
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  modalContent: {
    backgroundColor: '#16213e',
    padding: 25,
    borderRadius: 15,
    width: '85%',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e94560',
  },
  modalTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#e94560',
    marginBottom: 15,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  modalText: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 10,
    textAlign: 'center',
    lineHeight: 22,
  },
  scoreText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginVertical: 10,
  },
  modalButton: {
    backgroundColor: '#e94560',
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
    width: '80%',
    alignItems: 'center',
    elevation: 5,
  },
  modalButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 20,
  },
  uiContainer: {
    position: 'absolute',
    top: 40,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 15,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderBottomWidth: 1,
    borderBottomColor: '#e94560',
  },
  uiItem: {
    alignItems: 'center',
  },
  uiLabel: {
    color: '#aaa',
    fontSize: 14,
    marginBottom: 5,
  },
  healthContainer: {
    width: 100,
    height: 10,
    backgroundColor: '#333',
    borderRadius: 5,
    overflow: 'hidden',
  },
  healthBar: {
    height: '100%',
    backgroundColor: '#4CAF50',
  },
  resourceText: {
    color: '#FFC107',
    fontSize: 18,
    fontWeight: 'bold',
  },
  pauseButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    backgroundColor: 'rgba(233, 69, 96, 0.7)',
    padding: 10,
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },
  pauseButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  gameArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  particle: {
    position: 'absolute',
  },
  houseContainer: {
    alignItems: 'center',
    marginBottom: 50,
  },
  houseImage: {
    width: 220,
    height: 220,
  },
  repairEffect: {
    shadowColor: '#FFC107',
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 20,
    shadowOpacity: 1,
  },
  repairCost: {
    position: 'absolute',
    top: -20,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 5,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FFC107',
  },
  repairCostText: {
    color: '#FFC107',
    fontWeight: 'bold',
  },
  damageIndicator: {
    position: 'absolute',
    bottom: 30,
    backgroundColor: 'rgba(233, 69, 96, 0.7)',
    padding: 10,
    borderRadius: 10,
  },
  damageText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  tapHint: {
    position: 'absolute',
    bottom: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 15,
    borderRadius: 10,
  },
  tapHintText: {
    color: '#e94560',
    fontWeight: 'bold',
    fontSize: 18,
  },
});

export default HouseRepairGame;