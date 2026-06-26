import React, { useState } from 'react';
import Landing from './components/Landing';
import Lobby from './components/Lobby';
import Game from './components/Game'; 

export default function App() {
  const [gameState, setGameState] = useState('landing'); // 'landing', 'lobby', 'playing'
  const [language, setLanguage] = useState('tr');
  const [playerName, setPlayerName] = useState('');

  // 1. EKSİK OLAN KABLO BURAYA EKLENDİ: Seçilen kategoriyi hafızada tutacak state
  const [selectedCategory, setSelectedCategory] = useState(null);

  // Lobi görsel testi için geçici state'ler
  const [roomCode, setRoomCode] = useState('');
  const [isHost, setIsHost] = useState(false);
  const [roomData, setRoomData] = useState(null);

  return (
    <>
      {/* 1. GİRİŞ EKRANI */}
      {gameState === 'landing' && (
        <Landing 
          language={language}
          setLanguage={setLanguage}
          onProceed={(name) => {
            setPlayerName(name);
            setGameState('lobby');
          }}
        />
      )}

      {/* 2. LOBİ EKRANI */}
      {gameState === 'lobby' && (
        <Lobby 
          playerName={playerName}
          language={language}
          roomCode={roomCode}
          roomData={roomData}
          isHost={isHost}
          onBack={() => {
            setGameState('landing');
            setRoomCode('');
          }}
          onSinglePlayer={(category) => {
            // 2. KABLO BAĞLANDI: Lobi'den gelen kategoriyi hafızaya alıyoruz
            setSelectedCategory(category);
            setGameState('playing'); 
          }}
          onCreateRoom={(category) => {
            // Çok oyunculuda da kurucu oda kurarken kategori seçiyorsa onu da kaydedelim
            setSelectedCategory(category); 
            setRoomCode('X7Q9'); 
            setIsHost(true);
            setRoomData({ host: playerName, players: { [playerName]: { score: 0 } } });
          }}
          onJoinRoom={(code) => {
            setRoomCode(code);
            setIsHost(false);
            setRoomData({ host: "FarklıBiri", players: { "FarklıBiri": { score: 0 }, [playerName]: { score: 0 } } });
          }}
          onStartGame={() => {
            setGameState('playing');
          }}
        />
      )}

      {/* 3. OYUN EKRANI */}
      {gameState === 'playing' && (
        <Game 
          playerName={playerName}
          language={language}
          // 3. FİŞ PRİZE TAKILDI: Hafızadaki kategoriyi Game'e yolluyoruz!
          category={selectedCategory} 
          onBackToLobby={() => setGameState('lobby')} 
        />
      )}
    </>
  );
}