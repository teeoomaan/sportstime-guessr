import React, { useState, useEffect, useRef } from 'react';
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

// --- HELPER FUNCTION: DISTANCE ---
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
  const [roundResult, setRoundResult] = useState(null); // { distance, pts, waiting: boolean }
  const [gameOver, setGameOver] = useState(false);

  // Firestore Listener
  useEffect(() => {
    if (!roomCode) return;
    const unsub = onSnapshot(doc(db, "rooms", roomCode), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        
        // Opponent check
        if (isHost && data.player2) setOpponent(data.player2.name);
        if (!isHost && data.player1) setOpponent(data.player1.name);

        // Start game
        if (data.status === 'playing' && !gameStarted) {
          setGameStarted(true);
        }

        // Sync round
        if (data.currentRound !== currentRound) {
          setCurrentRound(data.currentRound);
          setMyGuess(null);
          setRoundResult(null);
        }

        // Sync scores
        if (isHost) {
          setMyScore(data.player1.score);
          if (data.player2) setOpponentScore(data.player2.score);
        } else {
          setMyScore(data.player2.score);
          setOpponentScore(data.player1.score);
        }

        // End Game check
        if (data.status === 'finished') {
          setGameOver(true);
        }

        // Round Result check (both guessed)
        if (data.player1.hasGuessed && data.player2?.hasGuessed && !roundResult?.pointsShowed) {
           calculateAndShowResult(data);
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
      status: 'waiting',
      currentRound: 0,
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
      await updateDoc(roomRef, {
        player2: { name: playerName, score: 0, hasGuessed: false, lastGuess: null }
      });
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
    const updateData = isHost ? {
      "player1.hasGuessed": true,
      "player1.lastGuess": myGuess,
      "player1.score": myScore + pts
    } : {
      "player2.hasGuessed": true,
      "player2.lastGuess": myGuess,
      "player2.score": myScore + pts
    };

    setRoundResult({ distance, pts, waiting: true, pointsShowed: false });
    await updateDoc(roomRef, updateData);
  };

  const calculateAndShowResult = async (data) => {
    setRoundResult(prev => ({...prev, waiting: false, pointsShowed: true}));
  };

  const handleNextRound = async () => {
    if (!isHost) return;
    const roomRef = doc(db, "rooms", roomCode);
    if (currentRound >= questionsData.length - 1) {
      await updateDoc(roomRef, { status: 'finished' });
    } else {
      await updateDoc(roomRef, {
        currentRound: currentRound + 1,
        "player1.hasGuessed": false,
        "player2.hasGuessed": false,
        "player1.lastGuess": null,
        "player2.lastGuess": null,
      });
    }
  };

  const handleLeave = () => {
    setRoomCode(null);
    setGameStarted(false);
    setGameOver(false);
    setRoundResult(null);
    setMyScore(0);
    setOpponentScore(0);
    setOpponent(null);
    setIsHost(false);
  };

  // --- UI COMPONENTS ---

  const MapClickHandler = () => {
    useMapEvents({
      click(e) {
        if (!roundResult?.waiting && !roundResult?.pointsShowed) {
          setMyGuess(e.latlng);
        }
      },
    });
    return myGuess ? <Marker position={myGuess} icon={customIcon} /> : null;
  };

  const currentQ = questionsData[currentRound];

  // SILICON VALLEY THEME (Dark, Sleek, Minimalist)
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-neutral-200 font-sans selection:bg-neutral-800 relative overflow-hidden" 
         style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #1f1f1f 1px, transparent 0)', backgroundSize: '32px 32px' }}>
      
      {/* Top Navbar */}
      <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-center z-50">
        <h1 className="text-2xl font-black tracking-tighter text-white">
          MAPLETICS<span className="text-neutral-600">.</span>
        </h1>
        <button 
          onClick={toggleLang} 
          className="bg-neutral-900 border border-neutral-800 text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full hover:bg-white hover:text-black transition-colors duration-300"
        >
          {lang === 'tr' ? 'EN' : 'TR'}
        </button>
      </div>

      {/* LOBBY SCREEN */}
      {!roomCode && (
        <div className="flex items-center justify-center min-h-screen p-4">
          <div className="bg-[#111] border border-neutral-800 rounded-2xl p-10 max-w-md w-full shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-neutral-800 via-white to-neutral-800"></div>
            
            <div className="mb-10 text-center mt-4">
              <h2 className="text-3xl font-bold text-white tracking-tight mb-2">{t.appTitle}</h2>
              <p className="text-neutral-500 text-sm">{t.appSubtitle}</p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-2">{t.username}</label>
                <input 
                  type="text" 
                  value={playerName} 
                  onChange={(e) => setPlayerName(e.target.value)}
                  placeholder={t.enterUsername}
                  className="w-full bg-black border border-neutral-800 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-all placeholder:text-neutral-700"
                />
              </div>

              <div className="pt-2">
                <button onClick={handleCreateRoom} className="w-full bg-white text-black font-semibold py-3 rounded-lg hover:bg-neutral-200 transition-colors">
                  {t.createRoom}
                </button>
              </div>

              <div className="relative flex items-center py-2">
                <div className="flex-grow border-t border-neutral-800"></div>
                <span className="flex-shrink-0 mx-4 text-neutral-600 text-xs uppercase">OR</span>
                <div className="flex-grow border-t border-neutral-800"></div>
              </div>

              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={joinCode} 
                  onChange={(e) => setJoinCode(e.target.value)}
                  placeholder={t.enterRoomCode}
                  maxLength={4}
                  className="w-2/3 bg-black border border-neutral-800 text-white rounded-lg px-4 py-3 text-center uppercase tracking-widest focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-all placeholder:text-neutral-700 placeholder:tracking-normal"
                />
                <button onClick={handleJoinRoom} className="w-1/3 bg-neutral-900 border border-neutral-700 text-white font-medium rounded-lg hover:bg-neutral-800 transition-colors">
                  {t.joinRoom}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* WAITING ROOM (Host waiting for player) */}
      {roomCode && !gameStarted && (
        <div className="flex items-center justify-center min-h-screen p-4">
          <div className="bg-[#111] border border-neutral-800 rounded-2xl p-10 max-w-md w-full text-center shadow-2xl">
            <h2 className="text-xl font-semibold text-white mb-2">{t.waitingHost}</h2>
            <p className="text-neutral-500 text-sm mb-8">{t.shareCode}</p>
            
            <div className="bg-black border border-neutral-800 rounded-xl p-6 mb-8 inline-block">
              <span className="text-5xl font-black tracking-widest text-white">{roomCode}</span>
            </div>

            {opponent ? (
              <div className="animate-fade-in-up">
                <p className="text-green-400 font-medium mb-6">✓ {opponent} {t.opponentJoined}</p>
                {isHost && (
                  <button onClick={startGame} className="w-full bg-white text-black font-semibold py-3 rounded-lg hover:bg-neutral-200 transition-colors">
                    {t.startMatch}
                  </button>
                )}
              </div>
            ) : (
              <div className="flex justify-center items-center space-x-2">
                <div className="w-2 h-2 bg-neutral-600 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-neutral-600 rounded-full animate-bounce delay-100"></div>
                <div className="w-2 h-2 bg-neutral-600 rounded-full animate-bounce delay-200"></div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* GAME SCREEN */}
      {gameStarted && !gameOver && (
        <div className="h-screen flex flex-col pt-20 pb-6 px-6">
          
          {/* Game Header */}
          <div className="flex justify-between items-end mb-6">
            <div>
              <p className="text-neutral-500 text-xs uppercase tracking-widest font-bold">{t.round} {currentRound + 1} / {questionsData.length}</p>
              <h2 className="text-2xl font-semibold text-white mt-1">{currentQ[lang].event}</h2>
              <p className="text-neutral-400 text-sm">{currentQ[lang].branch}</p>
            </div>
            
            <div className="flex gap-6 bg-[#111] border border-neutral-800 rounded-xl px-6 py-3">
              <div className="text-center">
                <p className="text-[10px] text-neutral-500 uppercase font-bold">{playerName}</p>
                <p className="text-xl font-black text-white">{myScore}</p>
              </div>
              <div className="w-px bg-neutral-800"></div>
              <div className="text-center">
                <p className="text-[10px] text-neutral-500 uppercase font-bold">{opponent}</p>
                <p className="text-xl font-black text-white">{opponentScore}</p>
              </div>
            </div>
          </div>

          {/* Game Layout (Split Screen) */}
          <div className="flex-1 flex flex-col md:flex-row gap-6 min-h-0">
            
            {/* Image Viewer */}
            <div className="flex-1 bg-[#111] border border-neutral-800 rounded-2xl p-2 relative overflow-hidden flex items-center justify-center group">
              <img 
                src={currentQ.image} 
                alt={currentQ[lang].event}
                className="max-h-full max-w-full object-contain rounded-xl transition-transform duration-700 group-hover:scale-[1.02]"
                onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?q=80&w=1000&auto=format&fit=crop"; }}
              />
            </div>

            {/* Map & Controls */}
            <div className="w-full md:w-1/3 flex flex-col gap-4">
              <div className="flex-1 bg-[#111] border border-neutral-800 rounded-2xl overflow-hidden relative">
                <MapContainer center={[20, 0]} zoom={2} className="h-full w-full" style={{ filter: 'grayscale(0.1) contrast(1.05)' }}>
                  <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />
                  <MapClickHandler />
                  
                  {roundResult?.pointsShowed && (
                    <>
                      <Marker position={currentQ.coords} icon={correctIcon} />
                      {myGuess && (
                        <Polyline positions={[myGuess, currentQ.coords]} color="#22c55e" dashArray="5, 10" weight={2} />
                      )}
                    </>
                  )}
                </MapContainer>
              </div>

              {/* Action Area */}
              <div className="bg-[#111] border border-neutral-800 rounded-2xl p-5">
                {!roundResult ? (
                   <button 
                    onClick={handleGuessSubmit} 
                    disabled={!myGuess}
                    className={`w-full py-4 rounded-xl font-bold transition-all ${
                      myGuess 
                        ? 'bg-white text-black hover:bg-neutral-200' 
                        : 'bg-neutral-900 text-neutral-600 cursor-not-allowed'
                    }`}
                  >
                    {t.guessBtn}
                  </button>
                ) : roundResult.waiting ? (
                  <div className="text-center py-3">
                    <p className="text-neutral-400 font-medium animate-pulse">{t.waitingOpponent}</p>
                  </div>
                ) : (
                  <div className="text-center animate-fade-in">
                    <div className="flex justify-between items-center mb-4 border-b border-neutral-800 pb-4">
                      <div>
                        <p className="text-xs text-neutral-500 uppercase">{t.distance}</p>
                        <p className="text-lg font-bold text-white">{Math.round(roundResult.distance)} km</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-neutral-500 uppercase">{t.points}</p>
                        <p className="text-lg font-bold text-green-400">+{roundResult.pts}</p>
                      </div>
                    </div>
                    {isHost && (
                      <button onClick={handleNextRound} className="w-full bg-white text-black py-3 rounded-xl font-bold hover:bg-neutral-200 transition-colors">
                        {t.nextRound}
                      </button>
                    )}
                    {!isHost && <p className="text-xs text-neutral-500 mt-2">Kurucunun turu başlatması bekleniyor...</p>}
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* GAME OVER SCREEN */}
      {gameOver && (
        <div className="flex items-center justify-center min-h-screen p-4 bg-black/80 backdrop-blur-sm z-50 absolute inset-0">
          <div className="bg-[#111] border border-neutral-800 rounded-2xl p-12 max-w-lg w-full text-center shadow-2xl relative overflow-hidden">
            
            {/* Winner Glow */}
            {myScore > opponentScore && <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-green-500/10 blur-[100px] pointer-events-none"></div>}
            
            <p className="text-sm text-neutral-500 font-bold uppercase tracking-widest mb-2">{t.gameOver}</p>
            <h2 className={`text-4xl font-black mb-10 ${
              myScore > opponentScore ? 'text-green-400' : myScore < opponentScore ? 'text-red-500' : 'text-white'
            }`}>
              {myScore > opponentScore ? t.youWon : myScore < opponentScore ? t.youLost : t.draw}
            </h2>

            <div className="flex justify-between items-center bg-black border border-neutral-800 rounded-xl p-6 mb-10">
              <div className="text-center w-1/3">
                <p className="text-xs text-neutral-500 uppercase truncate px-2">{playerName}</p>
                <p className={`text-3xl font-black ${myScore >= opponentScore ? 'text-white' : 'text-neutral-600'}`}>{myScore}</p>
              </div>
              <div className="text-neutral-700 text-xl font-light">-</div>
              <div className="text-center w-1/3">
                <p className="text-xs text-neutral-500 uppercase truncate px-2">{opponent}</p>
                <p className={`text-3xl font-black ${opponentScore >= myScore ? 'text-white' : 'text-neutral-600'}`}>{opponentScore}</p>
              </div>
            </div>

            <button onClick={handleLeave} className="w-full bg-white text-black font-semibold py-4 rounded-xl hover:bg-neutral-200 transition-colors">
              {t.backToMenu}
            </button>
          </div>
        </div>
      )}

    </div>
  );
}