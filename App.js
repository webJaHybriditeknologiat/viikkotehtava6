import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Alert, Image, TouchableOpacity } from 'react-native';
import axios from 'axios';

const API_URL = 'https://www.deckofcardsapi.com/api/deck';

const cardValues = {
  '2': 2,
  '3': 3,
  '4': 4,
  '5': 5,
  '6': 6,
  '7': 7,
  '8': 8,
  '9': 9,
  '10': 10,
  'JACK': 11,
  'QUEEN': 12,
  'KING': 13,
  'ACE': 14
};

export default function App() {
  const [deckId, setDeckId] = useState(null);
  const [card, setCard] = useState(null);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [guessResult, setGuessResult] = useState('Kerää pisteitä\narvaamalla oikein');

  useEffect(() => {
    const createDeck = async () => {
      const response = await axios.get(`${API_URL}/new/shuffle/?deck_count=1`);
      setDeckId(response.data.deck_id);
    };
    createDeck();
  }, []);

  const drawCard = async () => {
    if (!deckId || gameOver) return;

    const response = await axios.get(`${API_URL}/${deckId}/draw/?count=1`);
    if (response.data.remaining === 0) {
      Alert.alert('Ei enää kortteja!', 'Peli on päättynyt.');
      setGameOver(true);
      return;
    }

    const drawnCard = response.data.cards[0];
    setCard(drawnCard);
    return drawnCard;
  };

  const returnCardToDeck = async () => {
    if (!deckId || !card) return;

    await axios.get(`${API_URL}/${deckId}/return/?cards=${card.code}`);
    await axios.get(`${API_URL}/${deckId}/shuffle/`);
  };

  const makeGuess = async (guess) => {
    if (!deckId) return;

    const drawnCard = await drawCard();
    if (!drawnCard) return;

    const cardValue = cardValues[drawnCard.value];
    let points = 0;

    if (guess === 'kasi') {
      points = (cardValue === 8) ? 8 : -2;
      setGuessResult(points > 0 ? 'OIKEIN!\nSait 8 pistettä' : 'VÄÄRIN!\nMenetit 2 pistettä');
    } else if (guess === 'suurempi') {
      points = (cardValue > 8) ? 1 : -1;
      setGuessResult(points > 0 ? 'OKEIN!\nSait pisteen' : 'VÄÄRIN!\nMenetit pisteen');
    } else if (guess === 'pienempi') {
      points = (cardValue < 8) ? 1 : -1;
      setGuessResult(points > 0 ? 'OIKEIN!\nSait pisteen' : 'VÄÄRIN!\nMenetit pisteen');
    }

    setScore(prevScore => {
      const newScore = prevScore + points;

      if (newScore > highScore) {
        setHighScore(newScore);
      }

      if (newScore < 0) {
        setGameOver(true);
      }
      
      return newScore;
    });

    await returnCardToDeck();
  };

  const resetGame = async () => {
    setScore(0);
    setGameOver(false);
    setCard(null);
    setGuessResult('Kerää pisteitä\narvaamalla oikein');
    const createDeck = async () => {
      const response = await axios.get(`${API_URL}/new/shuffle/?deck_count=1`);
      setDeckId(response.data.deck_id);
    };
    createDeck();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title1}>PASIN KASIT</Text>
      <Text style={styles.title2}>Arvaa kortti!</Text>
      {!card && (
        <View style={styles.cardContainer}>
          <View style={styles.cardImageBorder}>
            <Image source={{ uri: 'https://deckofcardsapi.com/static/img/8S.png' }} style={styles.cardImage} />
          </View>
          <View style={styles.cardImageBorder}>
            <Image source={{ uri: 'https://deckofcardsapi.com/static/img/8H.png' }} style={styles.cardImage} />
          </View>
          <View style={styles.cardImageBorder}>
            <Image source={{ uri: 'https://deckofcardsapi.com/static/img/8C.png' }} style={styles.cardImage} />
          </View>
          <View style={styles.cardImageBorder}>
            <Image source={{ uri: 'https://deckofcardsapi.com/static/img/8D.png' }} style={styles.cardImage} />
          </View>
        </View>
      )}
      {card && (
        <View style={styles.cardContainer}>
          <View style={styles.cardImageBorder}>
            <Image source={{ uri: card.image }} style={styles.cardImage} />
          </View>
        </View>
      )}
      <View style={styles.quessButtonContainer}>
        <TouchableOpacity style={styles.quessButton} onPress={() => { makeGuess('pienempi'); }} disabled={gameOver}>
          <Text style={styles.buttonText}>PIENEMPI</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.quessButton} onPress={() => { makeGuess('kasi'); }} disabled={gameOver}>
          <Text style={styles.buttonText}>KASI</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.quessButton} onPress={() => { makeGuess('suurempi'); }} disabled={gameOver}>
          <Text style={styles.buttonText}>SUUREMPI</Text>
        </TouchableOpacity>
      </View>
      
      {guessResult && (
        <Text style={styles.guessResult}>{guessResult}</Text>
      )}

      <Text style={styles.score}>Pisteet: {score}</Text>
      <Text style={styles.highScore}>Ennätys: {highScore}</Text>
      {!gameOver && (
        <Text style={styles.resetText}>Aloita uusi peli painamalla RESET</Text>
      )}
      {gameOver && (
        <Text style={styles.resetText}>HÄVISIT! Aloita uusi peli painamalla RESET</Text>
      )}
      <TouchableOpacity style={styles.resetButton} onPress={resetGame}>
        <Text style={styles.buttonText}>RESET</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  title1: {
    fontSize: 40,
    fontWeight: 'bold',
    marginBottom: 60,
  },
  title2: {
    fontSize: 30,
    marginBottom: 20,
  },
  guessResult: {
    fontSize: 20,
    marginTop: 20,
    marginBottom: 10,
    textAlign: 'center',
  },
  score: {
    fontSize: 24,
    marginTop: 10,
    marginBottom: 10,
    fontWeight: 'bold',
  },
  highScore: {
    fontSize: 24,
    marginTop: 10,
    marginBottom: 10,
    fontWeight: 'bold',
    color: '#15d100',
  },
  cardContainer: {
    alignItems: 'center',
    marginVertical: 20,
    marginBottom: 50,
    flexDirection: 'row',
  },
  cardImage: {
    width: 100,
    height: 150,
    marginHorizontal: 3,
    marginVertical: -1,
  },
  cardImageBorder: {
    borderColor: 'black',
    borderWidth: 1,
    borderRadius: 5,
    marginHorizontal: 3,
  },
  quessButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '80%',
  },
  quessButton: {
    flex: 1,
    marginHorizontal: 5,
    backgroundColor: '#2196F3',
    paddingVertical: 10,
    paddingHorizontal: 5,
    borderRadius: 5,
  },
  resetText: {
    fontSize: 18,
    marginTop: 40,
    marginBottom: 10,
  },
  resetButton: {
    width: '60%',
    backgroundColor: '#F44336',
    paddingVertical: 10,
    borderRadius: 5,
    marginTop: 20,
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 18,
  },
});