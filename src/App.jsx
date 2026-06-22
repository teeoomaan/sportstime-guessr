import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, onSnapshot, updateDoc, getDoc } from 'firebase/firestore';

// --- FIREBASE CONFIG ---
const firebaseConfig = {
  apiKey: "AIzaSyDqR_PnpJDyMwAq_JTR28jNCYMW3KRMuh8",
  authDomain: "mapletics-e1e53.firebaseapp.com",
  projectId: "mapletics-e1e53",
  storageBucket: "mapletics-e1e53.firebasestorage.app",
  messagingSenderId: "830981688983",
  appId: "1:830981688983:web:13e5136321aa01e81e23d2",
  measurementId: "G-LWVLJ2ZCP6"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// --- MARKER ICON ---
const customIcon = new L.DivIcon({
  className: 'custom-icon',
  html: `<div style="background-color: white; border: 3px solid black; width: 16px; height: 16px; border-radius: 50%; box-shadow: 0 0 10px rgba(255,255,255,0.5);"></div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8]
});

const correctIcon = new L.DivIcon({
  className: 'correct-icon',
  html: `<div style="background-color: #22c55e; border: 3px solid white; width: 16px; height: 16px; border-radius: 50%; box-shadow: 0 0 10px rgba(34,197,94,0.5);"></div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8]
});

// --- I18N (DİL ÇEVİRİLERİ) ---
const translations = {
  tr: {
    appTitle: "Mapletics",
    appSubtitle: "Spor tarihinin ikonik anlarını haritada bul.",
    username: "Kullanıcı Adı",
    enterUsername: "Adınızı girin...",
    createRoom: "Yeni Oda Kur",
    joinRoom: "Odaya Katıl",
    roomCode: "Oda Kodu",
    enterRoomCode: "4 Haneli Kod...",
    waitingHost: "Oda Kuruldu. Arkadaşın Bekleniyor...",
    shareCode: "Arkadaşına şu kodu gönder:",
    opponentJoined: "rakip lobiye katıldı!",
    startMatch: "Maçı Başlat",
    round: "Tur",
    score: "Skor",
    guessBtn: "Tahmin Et",
    distance: "Mesafe",
    points: "Puan",
    nextRound: "Sonraki Tur",
    waitingOpponent: "Rakibin tahmini bekleniyor...",
    gameOver: "Maç Bitti",
    youWon: "KAZANDIN",
    youLost: "KAYBETTİN",
    draw: "BERABERE",
    backToMenu: "Ana Menüye Dön",
    errName: "Lütfen bir kullanıcı adı belirleyin.",
    errRoomStr: "Oda kodu 4 haneli olmalıdır.",
    errRoomFind: "Oda bulunamadı veya dolu."
  },
  en: {
    appTitle: "Mapletics",
    appSubtitle: "Locate iconic moments in sports history.",
    username: "Username",
    enterUsername: "Enter your name...",
    createRoom: "Create Room",
    joinRoom: "Join Room",
    roomCode: "Room Code",
    enterRoomCode: "4-Digit Code...",
    waitingHost: "Room Created. Waiting for Opponent...",
    shareCode: "Share this code with your friend:",
    opponentJoined: "joined the lobby!",
    startMatch: "Start Match",
    round: "Round",
    score: "Score",
    guessBtn: "Make Guess",
    distance: "Distance",
    points: "Points",
    nextRound: "Next Round",
    waitingOpponent: "Waiting for opponent's guess...",
    gameOver: "Match Over",
    youWon: "YOU WON",
    youLost: "YOU LOST",
    draw: "DRAW",
    backToMenu: "Back to Menu",
    errName: "Please enter a username.",
    errRoomStr: "Room code must be 4 characters.",
    errRoomFind: "Room not found or full."
  }
};

// --- DATA ---
const questionsData = [
  {
    id: 1,
    image: "/images/jordan.jpg",
    coords: { lat: 40.7683, lng: -111.9011 },
    tr: { event: "The Last Shot", branch: "Basketbol", location: "Utah, ABD" },
    en: { event: "The Last Shot", branch: "Basketball", location: "Utah, USA" }
  },
  {
    id: 2,
    image: "/images/zidane.jpg",
    coords: { lat: 55.8257, lng: -4.2524 },
    tr: { event: "Şampiyonlar Ligi Volesi", branch: "Futbol", location: "Glasgow, İskoçya" },
    en: { event: "Champions League Volley", branch: "Football", location: "Glasgow, Scotland" }
  },
  {
    id: 3,
    image: "/images/senna.jpg",
    coords: { lat: 44.3439, lng: 11.7167 },
    tr: { event: "Son Bakış", branch: "Formula 1", location: "Imola, İtalya" },
    en: { event: "The Last Glance", branch: "Formula 1", location: "Imola, Italy" }
  },
  {
    id: 4,
    image: "/images/kobe.jpg",
    coords: { lat: 34.0430, lng: -118.2673 },
    tr: { event: "81 Sayılık Maç", branch: "Basketbol", location: "Los Angeles, ABD" },
    en: { event: "81-Point Game", branch: "Basketball", location: "Los Angeles, USA" }
  },
  {
    id: 5,
    image: "/images/istanbul.jpg",
    coords: { lat: 41.0745, lng: 28.7656 },
    tr: { event: "İstanbul Mucizesi", branch: "Futbol", location: "İstanbul, Türkiye" },
    en: { event: "Miracle of Istanbul", branch: "Football", location: "Istanbul, Turkey" }
  }
];

function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  const R = 6371; 
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); 
  return R * c; 
}

// --- SAF CSS (TAILWIND OLMADAN GARANTİLİ ÇALIŞAN TASARIM) ---
const premiumStyles = `
  body, html { margin: 0; padding: 0; background-color: #0a0a0a; }
  
  .mapletics-wrapper {
    background-color: #0a0a0a;
    color: #ededed;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }
  
  .top-nav { display: flex; justify-content: space-between; align-items: center; padding: 24px 32px; }
  .brand-title { font-size: 24px; font-weight: 900; letter-spacing: -1px; margin: 0; color: #fff; }
  .brand-dot { color: #555; }
  
  .lang-btn {
    background: #111; color: #ededed; border: 1px solid #333; padding: 8px 16px; 
    border-radius: 20px; font-size: 12px; font-weight: bold; cursor: pointer; transition: all 0.2s;
  }
  .lang-btn:hover { background: #fff; color: #000; }

  .center-container { flex: 1; display: flex; justify-content: center; align-items: center; padding: 20px; }
  
  .glass-card {
    background: #111; border: 1px solid #222; border-radius: 16px; padding: 40px; 
    width: 100%; max-width: 440px; box-shadow: 0 20px 40px rgba(0,0,0,0.5);
  }
  .card-title { font-size: 32px; font-weight: bold; margin: 0 0 8px 0; color: #fff; text-align: center; letter-spacing: -0.5px; }
  .card-subtitle { font-size: 14px; color: #888; text-align: center; margin-bottom: 32px; }

  .input-group { margin-bottom: 24px; }
  .input-label { display: block; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #888; margin-bottom: 8px; font-weight: 600; }
  .premium-input {
    width: 100%; background: #000; border: 1px solid #333; color: #fff; padding: 14px 16px; 
    border-radius: 8px; font-size: 15px; outline: none; transition: border-color 0.2s; box-sizing: border-box;
  }
  .premium-input:focus { border-color: #666; }

  .primary-btn {
    width: 100%; background: #fff; color: #000; border: none; padding: 16px; border-radius: 8px; 
    font-size: 15px; font-weight: 600; cursor: pointer; transition: background 0.2s;
  }
  .primary-btn:hover { background: #e5e5e5; }
  .primary-btn:disabled { background: #333; color: #666; cursor: not-allowed; }

  .divider { display: flex; align-items: center; margin: 24px 0; }
  .divider-line { flex: 1; height: 1px; background: #222; }
  .divider-text { color: #555; font-size: 11px; text-transform: uppercase; margin: 0 16px; letter-spacing: 1px; }

  .join-group { display: flex; gap: 12px; }
  .join-input { flex: 2; text-align: center; letter-spacing: 4px; font-size: 16px; text-transform: uppercase; }
  .secondary-btn { flex: 1; background: #1a1a1a; color: #fff; border: 1px solid #333; border-radius: 8px; font-weight: 600; cursor: pointer; transition: background 0.2s; }
  .secondary-btn:hover { background: #2a2a2a; }

  /* GAME LAYOUT */
  .game-container { display: flex; flex-direction: column; flex: 1; padding: 0 32px 32px 32px; height: calc(100vh - 80px); }
  .game-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 24px; flex-shrink: 0; }
  
  .round-info { font-size: 12px; color: #888; text-transform: uppercase; font-weight: bold; letter-spacing: 1px; margin: 0 0 4px 0; }
  .event-title { font-size: 24px; color: #fff; font-weight: bold; margin: 0 0 4px 0; }
  .event-branch { font-size: 14px; color: #666; margin: 0; }

  .scoreboard { display: flex; background: #111; border: 1px solid #222; border-radius: 12px; padding: 12px 24px; gap: 24px; }
  .score-block { text-align: center; }
  .score-name { font-size: 10px; color: #888; text-transform: uppercase; font-weight: bold; margin: 0 0 4px 0; }
  .score-val { font-size: 20px; color: #fff; font-weight: 900; margin: 0; }
  .score-divider { width: 1px; background: #222; }

  .game-body { display: flex; flex: 1; gap: 24px; min-height: 0; }
  
  .image-section {
    flex: 2; background: #111; border: 1px solid #222; border-radius: 16px; 
    display: flex; justify-content: center; align-items: center; overflow: hidden; padding: 16px;
  }
  .game-image { max-width: 100%; max-height: 100%; object-fit: contain; border-radius: 8px; }

  .map-section { flex: 1; display: flex; flex-direction: column; gap: 16px; min-width: 300px; }
  
  .map-wrapper { flex: 1; background: #111; border: 1px solid #222; border-radius: 16px; overflow: hidden; position: relative; }
  .action-panel { background: #111; border: 1px solid #222; border-radius: 16px; padding: 24px; flex-shrink: 0; }

  .waiting-text { color: #888; text-align: center; font-size: 14px; animation: pulse 1.5s infinite; }
  
  .result-box { display: flex; justify-content: space-between; border-bottom: 1px solid #222; padding-bottom: 16px; margin-bottom: 16px; }
  .result-label { font-size: 11px; color: #888; text-transform: uppercase; margin: 0 0 4px 0; }
  .result-val { font-size: 20px; color: #fff; font-weight: bold; margin: 0; }
  .result-pts { font-size: 20px; color: #22c55e; font-weight: bold; margin: 0; }

  .fade-in { animation: fadeIn 0.4s ease-out; }
  @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes pulse { 0% { opacity: 0.5; } 50% { opacity: 1; } 100% { opacity: 0.5; } }

  .overlay {
    position: fixed; top: 0; left: 0; right: 0; bottom: 0; 
    background: rgba(0,0,0,0.9); display: flex; justify-content: center; align-items: center; z-index: 1000;
  }
  .overlay-content { background: #111; border: 1px solid #222; border-radius: 16px; padding: 48px; width: 100%; max-width: 500px; text-align: center; }
  
  @media (max-width: 768px) {
    .game-body { flex-direction: column; }
    .image-section { flex: none; height: 300px; }
    .map-section { flex: none; height: 500px; }
    .game-container { padding: 0 16px 16px 16px; height: auto; }
  }
`;

export default function App() {
  const [lang, setLang] = useState('tr');
  const t = translations[lang];

  // Lobby States
  const [playerName, setPlayerName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [roomCode, setRoomCode] = useState(null);
  const [isHost, setIsHost] = useState(false);
  const [opponent, setOpponent] = useState(null);
  
  // Game States
  const [gameStarted, setGameStarted] = useState(false);
  const [currentRound, setCurrentRound] = useState(0);
  const [myScore, setMyScore] = useState(0);
  const [opponentScore, setOpponentScore] = useState(0);
  const [myGuess, setMyGuess] = useState(null);
  
  // Round/Result States
  const [roundResult, setRoundResult] = useState(null);
  const [gameOver, setGameOver] = useState(false);

  // Firestore Listener
  useEffect(() => {
    if (!roomCode) return;
    const unsub = onSnapshot(doc(db, "rooms", roomCode), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        
        if (isHost && data.player2) setOpponent(data.player2.name);
        if (!isHost && data.player1) setOpponent(data.player1.name);

        if (data.status === 'playing' && !gameStarted) setGameStarted(true);

        if (data.currentRound !== currentRound) {
          setCurrentRound(data.currentRound);
          setMyGuess(null);
          setRoundResult(null);
        }

        if (isHost) {
          setMyScore(data.player1.score);
          if (data.player2) setOpponentScore(data.player2.score);
        } else {
          setMyScore(data.player2.score);
          setOpponentScore(data.player1.score);
        }

        if (data.status === 'finished') setGameOver(true);

        if (data.player1.hasGuessed && data.player2?.hasGuessed && !roundResult?.pointsShowed) {
           setRoundResult(prev => ({...prev, waiting: false, pointsShowed: true}));
        }
      }
    });
    return () => unsub();
  }, [roomCode, isHost, gameStarted, currentRound]);

  const toggleLang = () => setLang(lang === 'tr' ? 'en' : 'tr');

  // --- MULTIPLAYER LOGIC ---
  const generateRoomCode = () => Math.random().toString(36).substring(2, 6).toUpperCase();

  const handleCreateRoom = async () => {
    if (!playerName.trim()) return alert(t.errName);
    const code = generateRoomCode();
    await setDoc(doc(db, "rooms", code), {
      status: 'waiting', currentRound: 0,
      player1: { name: playerName, score: 0, hasGuessed: false, lastGuess: null },
      player2: null
    });
    setRoomCode(code);
    setIsHost(true);
  };

  const handleJoinRoom = async () => {
    if (!playerName.trim()) return alert(t.errName);
    if (joinCode.length !== 4) return alert(t.errRoomStr);
    const roomRef = doc(db, "rooms", joinCode.toUpperCase());
    const roomSnap = await getDoc(roomRef);
    if (roomSnap.exists() && roomSnap.data().status === 'waiting') {
      await updateDoc(roomRef, { player2: { name: playerName, score: 0, hasGuessed: false, lastGuess: null } });
      setRoomCode(joinCode.toUpperCase());
      setIsHost(false);
    } else {
      alert(t.errRoomFind);
    }
  };

  const startGame = async () => {
    if (!isHost || !opponent) return;
    await updateDoc(doc(db, "rooms", roomCode), { status: 'playing' });
  };

  const handleGuessSubmit = async () => {
    if (!myGuess) return;
    const currentQ = questionsData[currentRound];
    const distance = getDistanceFromLatLonInKm(myGuess.lat, myGuess.lng, currentQ.coords.lat, currentQ.coords.lng);
    let pts = 0;
    if (distance < 50) pts = 5000;
    else if (distance < 500) pts = Math.floor(5000 - (distance * 5));
    else if (distance < 2000) pts = Math.floor(3000 - (distance));
    else pts = 0;
    if(pts < 0) pts = 0;

    const roomRef = doc(db, "rooms", roomCode);
    const updateData = isHost 
      ? { "player1.hasGuessed": true, "player1.lastGuess": myGuess, "player1.score": myScore + pts }
      : { "player2.hasGuessed": true, "player2.lastGuess": myGuess, "player2.score": myScore + pts };

    setRoundResult({ distance, pts, waiting: true, pointsShowed: false });
    await updateDoc(roomRef, updateData);
  };

  const handleNextRound = async () => {
    if (!isHost) return;
    const roomRef = doc(db, "rooms", roomCode);
    if (currentRound >= questionsData.length - 1) {
      await updateDoc(roomRef, { status: 'finished' });
    } else {
      await updateDoc(roomRef, {
        currentRound: currentRound + 1, "player1.hasGuessed": false, "player2.hasGuessed": false,
        "player1.lastGuess": null, "player2.lastGuess": null,
      });
    }
  };

  const handleLeave = () => {
    setRoomCode(null); setGameStarted(false); setGameOver(false); setRoundResult(null);
    setMyScore(0); setOpponentScore(0); setOpponent(null); setIsHost(false);
  };

  const MapClickHandler = () => {
    useMapEvents({
      click(e) { if (!roundResult?.waiting && !roundResult?.pointsShowed) setMyGuess(e.latlng); }
    });
    return myGuess ? <Marker position={myGuess} icon={customIcon} /> : null;
  };

  const currentQ = questionsData[currentRound];

  return (
    <>
      <style>{premiumStyles}</style>
      <div className="mapletics-wrapper">
        
        {/* Top Navbar */}
        <div className="top-nav">
          <h1 className="brand-title">MAPLETICS<span className="brand-dot">.</span></h1>
          <button onClick={toggleLang} className="lang-btn">{lang === 'tr' ? 'EN' : 'TR'}</button>
        </div>

        {/* LOBBY SCREEN */}
        {!roomCode && (
          <div className="center-container">
            <div className="glass-card">
              <h2 className="card-title">{t.appTitle}</h2>
              <p className="card-subtitle">{t.appSubtitle}</p>
              
              <div className="input-group">
                <label className="input-label">{t.username}</label>
                <input type="text" value={playerName} onChange={(e) => setPlayerName(e.target.value)} placeholder={t.enterUsername} className="premium-input" />
              </div>
              <button onClick={handleCreateRoom} className="primary-btn">{t.createRoom}</button>
              
              <div className="divider">
                <div className="divider-line"></div>
                <span className="divider-text">OR</span>
                <div className="divider-line"></div>
              </div>

              <div className="join-group">
                <input type="text" value={joinCode} onChange={(e) => setJoinCode(e.target.value)} placeholder={t.enterRoomCode} maxLength={4} className="premium-input join-input" />
                <button onClick={handleJoinRoom} className="secondary-btn">{t.joinRoom}</button>
              </div>
            </div>
          </div>
        )}

        {/* WAITING ROOM */}
        {roomCode && !gameStarted && (
          <div className="center-container">
            <div className="glass-card" style={{ textAlign: 'center' }}>
              <h2 style={{ color: '#fff', fontSize: '20px', marginBottom: '8px' }}>{t.waitingHost}</h2>
              <p style={{ color: '#888', fontSize: '14px', marginBottom: '32px' }}>{t.shareCode}</p>
              
              <div style={{ background: '#000', border: '1px solid #222', borderRadius: '12px', padding: '24px', marginBottom: '32px', display: 'inline-block' }}>
                <span style={{ fontSize: '48px', fontWeight: '900', letterSpacing: '8px', color: '#fff' }}>{roomCode}</span>
              </div>

              {opponent ? (
                <div className="fade-in">
                  <p style={{ color: '#22c55e', fontWeight: 'bold', marginBottom: '24px' }}>✓ {opponent} {t.opponentJoined}</p>
                  {isHost && <button onClick={startGame} className="primary-btn">{t.startMatch}</button>}
                </div>
              ) : (
                <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                  <div style={{ width: '8px', height: '8px', background: '#666', borderRadius: '50%', animation: 'pulse 1.5s infinite' }}></div>
                  <div style={{ width: '8px', height: '8px', background: '#666', borderRadius: '50%', animation: 'pulse 1.5s infinite 0.2s' }}></div>
                  <div style={{ width: '8px', height: '8px', background: '#666', borderRadius: '50%', animation: 'pulse 1.5s infinite 0.4s' }}></div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* GAME SCREEN */}
        {gameStarted && !gameOver && (
          <div className="game-container">
            <div className="game-header">
              <div>
                <p className="round-info">{t.round} {currentRound + 1} / {questionsData.length}</p>
                <h2 className="event-title">{currentQ[lang].event}</h2>
                <p className="event-branch">{currentQ[lang].branch}</p>
              </div>
              <div className="scoreboard">
                <div className="score-block">
                  <p className="score-name">{playerName}</p>
                  <p className="score-val">{myScore}</p>
                </div>
                <div className="score-divider"></div>
                <div className="score-block">
                  <p className="score-name">{opponent}</p>
                  <p className="score-val">{opponentScore}</p>
                </div>
              </div>
            </div>

            <div className="game-body">
              <div className="image-section">
                <img src={currentQ.image} alt={currentQ[lang].event} className="game-image" onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?q=80&w=1000&auto=format&fit=crop"; }} />
              </div>
              <div className="map-section">
                <div className="map-wrapper">
                  <MapContainer center={[20, 0]} zoom={2} style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, width: '100%', height: '100%', filter: 'grayscale(0.2) contrast(1.1)' }}>
                    <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />
                    <MapClickHandler />
                    {roundResult?.pointsShowed && (
                      <>
                        <Marker position={currentQ.coords} icon={correctIcon} />
                        {myGuess && <Polyline positions={[myGuess, currentQ.coords]} color="#22c55e" dashArray="5, 10" weight={2} />}
                      </>
                    )}
                  </MapContainer>
                </div>
                <div className="action-panel">
                  {!roundResult ? (
                    <button onClick={handleGuessSubmit} disabled={!myGuess} className="primary-btn">{t.guessBtn}</button>
                  ) : roundResult.waiting ? (
                    <p className="waiting-text">{t.waitingOpponent}</p>
                  ) : (
                    <div className="fade-in">
                      <div className="result-box">
                        <div>
                          <p className="result-label">{t.distance}</p>
                          <p className="result-val">{Math.round(roundResult.distance)} km</p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <p className="result-label">{t.points}</p>
                          <p className="result-pts">+{roundResult.pts}</p>
                        </div>
                      </div>
                      {isHost && <button onClick={handleNextRound} className="primary-btn">{t.nextRound}</button>}
                      {!isHost && <p style={{ fontSize: '11px', color: '#888', marginTop: '12px', textAlign: 'center' }}>Kurucunun turu başlatması bekleniyor...</p>}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* GAME OVER SCREEN */}
        {gameOver && (
          <div className="overlay fade-in">
            <div className="overlay-content">
              <p style={{ fontSize: '12px', color: '#888', fontWeight: 'bold', letterSpacing: '2px', margin: '0 0 16px 0' }}>{t.gameOver}</p>
              <h2 style={{ fontSize: '48px', fontWeight: '900', margin: '0 0 40px 0', color: myScore > opponentScore ? '#22c55e' : myScore < opponentScore ? '#ef4444' : '#fff' }}>
                {myScore > opponentScore ? t.youWon : myScore < opponentScore ? t.youLost : t.draw}
              </h2>
              <div style={{ display: 'flex', background: '#000', border: '1px solid #222', borderRadius: '12px', padding: '24px', marginBottom: '40px', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ textAlign: 'center', width: '40%' }}>
                  <p style={{ fontSize: '10px', color: '#888', textTransform: 'uppercase', fontWeight: 'bold', margin: '0 0 8px 0' }}>{playerName}</p>
                  <p style={{ fontSize: '32px', color: myScore >= opponentScore ? '#fff' : '#666', fontWeight: '900', margin: '0' }}>{myScore}</p>
                </div>
                <div style={{ color: '#333', fontSize: '24px' }}>-</div>
                <div style={{ textAlign: 'center', width: '40%' }}>
                  <p style={{ fontSize: '10px', color: '#888', textTransform: 'uppercase', fontWeight: 'bold', margin: '0 0 8px 0' }}>{opponent}</p>
                  <p style={{ fontSize: '32px', color: opponentScore >= myScore ? '#fff' : '#666', fontWeight: '900', margin: '0' }}>{opponentScore}</p>
                </div>
              </div>
              <button onClick={handleLeave} className="primary-btn">{t.backToMenu}</button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}