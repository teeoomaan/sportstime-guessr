import React, { useState, useEffect } from 'react';
import Landing from './components/Landing';
import Lobby from './components/Lobby'; 
import Game from './components/Game';
import { db } from './firebase'; 
import { doc, setDoc, getDoc, updateDoc, onSnapshot } from 'firebase/firestore';
import { ALL_QUESTIONS } from './data/questions'; 

export default function App() {
  const [step, setStep] = useState('landing'); 
  const [language, setLanguage] = useState('tr');
  const [playerName, setPlayerName] = useState('');
  
  const [roomCode, setRoomCode] = useState(null);
  const [roomData, setRoomData] = useState(null);
  const [isHost, setIsHost] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null); 

  const handleSinglePlayer = (category) => {
    setSelectedCategory(category);
    setStep('playing');
  };

  const handleCreateRoom = async (category) => {
    const code = Math.random().toString(36).substring(2, 6).toUpperCase();
    
    await setDoc(doc(db, "rooms", code), {
      host: playerName,
      category: category,
      status: "lobby", 
      players: {
        [playerName]: { score: 0, finished: false }
      },
      createdAt: new Date()
    });

    setRoomCode(code);
    setIsHost(true);
    setSelectedCategory(category);
  };

  const handleJoinRoom = async (code) => {
    if (!code) return;
    const roomRef = doc(db, "rooms", code);
    const roomSnap = await getDoc(roomRef);

    if (roomSnap.exists()) {
      const data = roomSnap.data();
      
      await updateDoc(roomRef, {
        [`players.${playerName}`]: { score: 0, finished: false }
      });

      setRoomCode(code);
      setIsHost(false);
      setSelectedCategory(data.category); 
    } else {
      alert(language === 'tr' ? "Hatalı kod! Oda bulunamadı." : "Invalid code! Room not found.");
    }
  };

  useEffect(() => {
    if (roomCode) {
      const unsub = onSnapshot(doc(db, "rooms", roomCode), (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          setRoomData(data);
          
          if (data.status === 'playing' && step === 'lobby') {
            setStep('playing');
          }
        }
      });
      return () => unsub(); 
    }
  }, [roomCode, step]);

  const handleStartGame = async () => {
    if (roomCode && isHost) {
      let filteredPool = ALL_QUESTIONS;
      let isMixed = false;

      if (selectedCategory === 'football') {
        filteredPool = ALL_QUESTIONS.filter(q => (q.sport?.en || "") === "Football" || (q.sport?.tr || "") === "Futbol");
      } else if (selectedCategory === 'basketball') {
        filteredPool = ALL_QUESTIONS.filter(q => (q.sport?.en || "") === "Basketball" || (q.sport?.tr || "") === "Basketbol");
      } else {
        isMixed = true;
      }

      let selected = [];
      if (isMixed || filteredPool.length === 0) {
        let fCount = 0; let bCount = 0;
        const shuffled = [...ALL_QUESTIONS].sort(() => 0.5 - Math.random());
        for (const q of shuffled) {
          if (selected.length === 5) break;
          const s = q.sport?.en || "";
          if (s === "Football" && fCount >= 2) continue;
          if (s === "Basketball" && bCount >= 2) continue;
          selected.push(q);
          if (s === "Football") fCount++;
          if (s === "Basketball") bCount++;
        }
      } else {
        selected = [...filteredPool].sort(() => 0.5 - Math.random()).slice(0, 5);
      }

      // 🎯 KURTARICI HAMLE: undefined olan her şeyi silip tertemiz bir obje yapıyoruz!
      const safeQuestions = JSON.parse(JSON.stringify(selected));

      await updateDoc(doc(db, "rooms", roomCode), {
        status: "playing",
        questions: safeQuestions
      });
    }
  };

  const handleBack = () => {
    if (roomCode) {
      setRoomCode(null);
      setRoomData(null);
      setIsHost(false);
    } else {
      setStep('landing');
    }
  };

  if (step === 'landing') {
    return <Landing language={language} setLanguage={setLanguage} onProceed={(name) => { setPlayerName(name); setStep('lobby'); }} />;
  }

  if (step === 'lobby') {
    return (
      <Lobby 
        playerName={playerName} language={language}
        onSinglePlayer={handleSinglePlayer} onCreateRoom={handleCreateRoom} onJoinRoom={handleJoinRoom}
        roomCode={roomCode} roomData={roomData} isHost={isHost}
        onStartGame={handleStartGame} onBack={handleBack}
      />
    );
  }

  if (step === 'playing') {
    return (
      <Game 
        playerName={playerName} language={language} selectedCategory={selectedCategory}
        roomCode={roomCode} isHost={isHost}
        roomData={roomData} // 🎯 Tüm oda verisini direkt gönderiyoruz
        onBackToLobby={() => { setStep('lobby'); setRoomCode(null); setRoomData(null); }} 
      />
    );
  }
}