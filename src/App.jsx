import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, Circle, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css'; 
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, getDoc, updateDoc, onSnapshot } from 'firebase/firestore';

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

const customMarkerIcon = L.divIcon({
  html: `<div style="background-color: #ef4444; width: 14px; height: 14px; border-radius: 50%; border: 2.5px solid white; box-shadow: 0 0 12px #ef4444; position: relative; animation: pulse 1.5s infinite;"></div>
         <style>
           @keyframes pulse {
             0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }
             70% { transform: scale(1.1); box-shadow: 0 0 0 10px rgba(239, 68, 68, 0); }
             100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
           }
         </style>`,
  className: 'custom-pin',
  iconSize: [14, 14],
  iconAnchor: [7, 7]
});

const ICONIC_MOMENTS = [
  { id: 1, sport: "Futbol", title: "Agüerooooo!", year: 2012, lat: 53.4831, lng: -2.2004, locationName: "Etihad Stadyumu, Manchester", localPhotoUrl: "/sports_photos/aguero.jpg" },
  { id: 2, sport: "Boks", title: "Ali vs Liston", year: 1965, lat: 44.1014, lng: -70.2148, locationName: "Lewiston, Maine, ABD", localPhotoUrl: "/sports_photos/ali.jpg" },
  { id: 3, sport: "Atletizm", title: "Bolt'un Gülümsemesi", year: 2016, lat: -22.8932, lng: -43.2923, locationName: "Olimpiyat Stadyumu, Rio", localPhotoUrl: "/sports_photos/bolt.jpg" },
  { id: 4, sport: "Tenis", title: "Wimbledon Epik Finali", year: 2008, lat: 51.4343, lng: -0.2145, locationName: "Wimbledon, Londra", localPhotoUrl: "/sports_photos/federer_nadal.jpg" },
  { id: 5, sport: "Futbol", title: "İstanbul Mucizesi", year: 2005, lat: 41.0744, lng: 28.7656, locationName: "Atatürk Olimpiyat Stadyumu, İstanbul", localPhotoUrl: "/sports_photos/istanbul.jpg" },
  { id: 6, sport: "Basketbol", title: "The Last Shot", year: 1998, lat: 40.7683, lng: -111.8911, locationName: "Delta Center, Utah", localPhotoUrl: "/sports_photos/jordan.jpg" },
  { id: 7, sport: "Basketbol", title: "Kobe 81 Sayı", year: 2006, lat: 34.0430, lng: -118.2673, locationName: "Staples Center, Los Angeles", localPhotoUrl: "/sports_photos/kobe.jpg" },
  { id: 8, sport: "Basketbol", title: "LeBron'un Bloğu", year: 2016, lat: 37.7503, lng: -122.2030, locationName: "Oracle Arena, Oakland", localPhotoUrl: "/sports_photos/lebron.jpg" },
  { id: 9, sport: "Futbol", title: "Tanrı'nın Eli", year: 1986, lat: 19.3031, lng: -99.1506, locationName: "Estadio Azteca, Meksika", localPhotoUrl: "/sports_photos/maradona.jpg" },
  { id: 10, sport: "Futbol", title: "Messi'nin Rüyası", year: 2022, lat: 25.4208, lng: 51.4903, locationName: "Lusail Stadyumu, Katar", localPhotoUrl: "/sports_photos/messi_worldcup.jpg" },
  { id: 11, sport: "Tenis", title: "Toprak Kortun Kralı", year: 2022, lat: 48.8471, lng: 2.2476, locationName: "Roland Garros, Paris", localPhotoUrl: "/sports_photos/nadal.jpg" },
  { id: 12, sport: "Futbol", title: "Pelé 1970", year: 1970, lat: 19.3031, lng: -99.1506, locationName: "Estadio Azteca, Meksika", localPhotoUrl: "/sports_photos/pele_1970.jpg" },
  { id: 13, sport: "Yüzme", title: "Phelps'in 8 Altını", year: 2008, lat: 39.9913, lng: 116.3861, locationName: "Water Cube, Pekin", localPhotoUrl: "/sports_photos/phelps.jpg" },
  { id: 14, sport: "Basketbol", title: "Ray Allen'ın Üçlüğü", year: 2013, lat: 25.7814, lng: -80.1870, locationName: "American Airlines Arena, Miami", localPhotoUrl: "/sports_photos/ray_allen.jpg" },
  { id: 15, sport: "Futbol", title: "Ronaldo'nun Rövaşatası", year: 2018, lat: 45.1095, lng: 7.6413, locationName: "Allianz Stadyumu, Torino", localPhotoUrl: "/sports_photos/ronaldo_bicycle.jpg" },
  { id: 16, sport: "Formula 1", title: "Schumacher'in Dönemi", year: 2000, lat: 34.8431, lng: 136.5411, locationName: "Suzuka Pisti, Japonya", localPhotoUrl: "/sports_photos/schumacher.jpg" },
  { id: 17, sport: "Formula 1", title: "Senna'nın Son Yarışı", year: 1994, lat: 44.3439, lng: 11.7167, locationName: "Imola Pisti, İtalya", localPhotoUrl: "/sports_photos/senna.jpg" },
  { id: 18, sport: "Golf", title: "Tiger Woods Dönüşü", year: 2019, lat: 33.5033, lng: -82.0223, locationName: "Augusta National, Georgia", localPhotoUrl: "/sports_photos/tiger_woods.jpg" },
  { id: 19, sport: "Amerikan Futbolu", title: "Tom Brady 28-3", year: 2017, lat: 29.6847, lng: -95.4107, locationName: "NRG Stadyumu, Houston", localPhotoUrl: "/sports_photos/tom_brady.jpg" },
  { id: 20, sport: "Formula 1", title: "Verstappen Son Tur", year: 2021, lat: 24.4672, lng: 54.6031, locationName: "Yas Marina, Abu Dabi", localPhotoUrl: "/sports_photos/verstappen.jpg" },
  { id: 21, sport: "Futbol", title: "Zidane'ın Volesi", year: 2002, lat: 55.8257, lng: -4.2520, locationName: "Hampden Park, Glasgow", localPhotoUrl: "/sports_photos/zidane.jpg" },
  { id: 22, sport: "Futbol", title: "Zidane'ın Kafa Atışı", year: 2006, lat: 52.5147, lng: 13.2397, locationName: "Olympiastadion, Berlin", localPhotoUrl: "/sports_photos/GettyImages-503368718.jpg.webp" },
  { id: 23, sport: "Boks", title: "Tyson'ın Isırığı", year: 1997, lat: 36.1147, lng: -115.1728, locationName: "MGM Grand, Las Vegas", localPhotoUrl: "/sports_photos/b109f80f-4e20-4115-b4c6-0f57c67ea0bf_1140x641.jpg" },
  { id: 24, sport: "Futbol", title: "Suarez'in Isırığı", year: 2014, lat: -5.7833, lng: -35.2167, locationName: "Arena das Dunas, Natal, Brezilya", localPhotoUrl: "/sports_photos/3751.webp" }
];

function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; 
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function getRank(totalScore) {
  if (totalScore >= 22000) return { title: "Global Elite 👑", desc: "Kusursuz performans." };
  if (totalScore >= 15000) return { title: "Master 💎", desc: "Harika gözlem yeteneği." };
  if (totalScore >= 7000) return { title: "Pro 🎯", desc: "İyi mücadele." };
  return { title: "Çaylak 🐣", desc: "Daha fazla pratik gerekli." };
}

function MapController({ selected, actual, show }) {
  const map = useMap();
  useEffect(() => {
    if (show && selected && actual) {
      map.fitBounds([selected, actual], { padding: [50, 50], maxZoom: 6, animate: true, duration: 1.5 });
    } else if (!show) {
      map.setView([25, 0], 1, { animate: true });
    }
  }, [show, selected, actual, map]);
  return null;
}

export default function App() {
  const [gameMode, setGameMode] = useState('menu'); // menu, lobby, playing, result
  const [playerName, setPlayerName] = useState('');
  
  // Multiplayer State'leri
  const [roomCode, setRoomCode] = useState('');
  const [joinCodeInput, setJoinCodeInput] = useState('');
  const [roomData, setRoomData] = useState(null);
  const [isHost, setIsHost] = useState(false);

  // Oyun İçi State'ler
  const [activeQuestions, setActiveQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [selectedYear, setSelectedYear] = useState(1960);
  const [showAnswer, setShowAnswer] = useState(false);
  const [currentDistance, setCurrentDistance] = useState(null);
  const [geoPoints, setGeoPoints] = useState(0);
  const [timePoints, setTimePoints] = useState(0);

  // UI State'leri
  const [isZoomed, setIsZoomed] = useState(false);
  const [showWarning, setShowWarning] = useState(null);
  const [satelliteMode, setSatelliteMode] = useState(false);

  const playSynthSound = (frequency, type = 'sine', duration = 0.15) => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      oscillator.type = type;
      oscillator.frequency.value = frequency;
      gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration);
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + duration);
    } catch (e) {
      // Sessiz hata yakalama
    }
  };

  useEffect(() => {
    if (!roomCode) return;
    
    // Veritabanındaki odayı saniye saniye canlı dinle
    const unsubscribe = onSnapshot(doc(db, "rooms", roomCode), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setRoomData(data);
        
        // Host oyunu başlattıysa diğer oyuncuyu da "playing" ekranına al
        if (data.status === 'playing' && gameMode === 'lobby') {
          setActiveQuestions(data.questions);
          setGameMode('playing');
        }
      }
    });
    
    return () => unsubscribe();
  }, [roomCode, gameMode]);

  const generateCode = () => Math.random().toString(36).substring(2, 6).toUpperCase();

  const handleCreateRoom = async () => {
    if (!playerName.trim()) return setShowWarning("Lütfen bir kullanıcı adı belirleyin.");
    
    const code = generateCode();
    const shuffled = [...ICONIC_MOMENTS].sort(() => 0.5 - Math.random()).slice(0, 5);
    
    await setDoc(doc(db, "rooms", code), {
      host: playerName,
      status: "waiting",
      questions: shuffled,
      players: { [playerName]: { score: 0, finished: false } }
    });
    
    setRoomCode(code);
    setIsHost(true);
    setGameMode('lobby');
    playSynthSound(600, 'triangle', 0.2);
  };

  const handleJoinRoom = async () => {
    if (!playerName.trim()) return setShowWarning("Lütfen bir kullanıcı adı belirleyin.");
    if (!joinCodeInput.trim()) return setShowWarning("Lütfen geçerli bir oda kodu girin.");
    
    const code = joinCodeInput.toUpperCase();
    const roomRef = doc(db, "rooms", code);
    const snap = await getDoc(roomRef);
    
    if (snap.exists() && snap.data().status === 'waiting') {
      await updateDoc(roomRef, {
        [`players.${playerName}`]: { score: 0, finished: false }
      });
      setRoomCode(code);
      setIsHost(false);
      setGameMode('lobby');
      playSynthSound(600, 'triangle', 0.2);
    } else {
      setShowWarning("Oda bulunamadı veya oyun başladı.");
    }
  };

  const startMultiplayerGame = async () => {
    if (isHost && roomCode) {
      await updateDoc(doc(db, "rooms", roomCode), {
        status: "playing"
      });
    }
  };

  const startSinglePlayer = () => {
    const shuffled = [...ICONIC_MOMENTS].sort(() => 0.5 - Math.random()).slice(0, 5);
    setActiveQuestions(shuffled);
    setRoomCode(''); 
    setGameMode('playing');
    setCurrentQuestionIndex(0);
    setScore(0);
    playSynthSound(600, 'triangle', 0.4);
  };

  const currentQuestion = activeQuestions[currentQuestionIndex] || ICONIC_MOMENTS[0];
  const actualLocation = [currentQuestion.lat || 0, currentQuestion.lng || 0];

  function MapClickHandler() {
    useMapEvents({
      click(e) {
        if (!showAnswer) {
          playSynthSound(440, 'sine', 0.08);
          setSelectedLocation([e.latlng.lat, e.latlng.lng]);
        }
      },
    });
    return null;
  }

  const handleGuess = () => {
    if (!selectedLocation) {
      setShowWarning("Harita üzerinden tahmini konumunuzu işaretleyin.");
      return;
    }

    const distance = calculateDistance(selectedLocation[0], selectedLocation[1], actualLocation[0], actualLocation[1]);
    const gPoints = Math.max(0, Math.round(2500 - distance));
    const yearDifference = Math.abs(selectedYear - (currentQuestion.year || 2000));
    const tPoints = Math.max(0, 2500 - (yearDifference * 150));

    setScore(prev => prev + gPoints + tPoints);
    setCurrentDistance(Math.round(distance));
    setGeoPoints(gPoints);
    setTimePoints(tPoints);
    setShowAnswer(true);
    playSynthSound(330, 'triangle', 0.15);
    setTimeout(() => playSynthSound(495, 'triangle', 0.2), 150);
  };

  const handleNext = async () => {
    setShowAnswer(false);
    setSelectedLocation(null);
    setSelectedYear(1960);
    
    if (currentQuestionIndex < 4) {
      setCurrentQuestionIndex(prev => prev + 1);
      playSynthSound(523.25, 'sine', 0.15);
    } else {
      if (roomCode) {
        await updateDoc(doc(db, "rooms", roomCode), {
          [`players.${playerName}.finished`]: true,
          [`players.${playerName}.score`]: score + geoPoints + timePoints 
        });
      }
      setGameMode('result');
      playSynthSound(587.33, 'triangle', 0.2);
      setTimeout(() => playSynthSound(880, 'sine', 0.4), 180);
    }
  };

  if (gameMode === 'menu') {
    return (
      <div style={{ backgroundColor: '#0f172a', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '16px', fontFamily: 'sans-serif', boxSizing: 'border-box' }}>
        <div style={{ width: '100%', maxWidth: '500px', backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '28px', padding: '48px 36px', textAlign: 'center', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6)' }}>
          <div style={{ fontSize: '56px', marginBottom: '16px' }}>🏆</div>
          <h1 style={{ fontSize: '42px', fontWeight: '950', background: 'linear-gradient(to right, #f59e0b, #e11d48)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: '0 0 12px 0', letterSpacing: '-0.03em' }}>
            Mapletics
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '15px', marginBottom: '32px' }}>Haritaya giriş yapmak için bir isim belirleyin.</p>
          
          <input 
            type="text" 
            placeholder="Kullanıcı Adı" 
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            style={{ width: '100%', padding: '16px', fontSize: '18px', backgroundColor: '#0f172a', border: '2px solid #334155', borderRadius: '16px', color: 'white', marginBottom: '24px', textAlign: 'center', boxSizing: 'border-box', outline: 'none' }}
          />

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <button onClick={startSinglePlayer} style={{ padding: '16px', fontSize: '16px', fontWeight: 'bold', backgroundColor: '#334155', color: 'white', border: 'none', borderRadius: '16px', cursor: 'pointer', transition: 'all 0.2s' }}>
              👤 Tek Oyunculu
            </button>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '10px 0' }}>
              <div style={{ flex: 1, height: '1px', backgroundColor: '#334155' }}></div>
              <span style={{ color: '#64748b', fontSize: '12px', fontWeight: 'bold', letterSpacing: '1px' }}>ÇOK OYUNCULU MOD</span>
              <div style={{ flex: 1, height: '1px', backgroundColor: '#334155' }}></div>
            </div>

            <button onClick={handleCreateRoom} style={{ padding: '16px', fontSize: '16px', fontWeight: 'bold', background: 'linear-gradient(to right, #10b981, #059669)', color: 'white', border: 'none', borderRadius: '16px', cursor: 'pointer', boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)' }}>
              ⚔️ Yeni Oda Oluştur
            </button>
            
            <div style={{ display: 'flex', gap: '8px' }}>
              <input 
                type="text" 
                placeholder="Oda Kodu" 
                value={joinCodeInput}
                onChange={(e) => setJoinCodeInput(e.target.value.toUpperCase())}
                style={{ flex: 1, padding: '16px', fontSize: '16px', backgroundColor: '#0f172a', border: '2px solid #334155', borderRadius: '16px', color: 'white', textAlign: 'center', textTransform: 'uppercase', outline: 'none' }}
                maxLength={4}
              />
              <button onClick={handleJoinRoom} style={{ padding: '16px 24px', fontSize: '16px', fontWeight: 'bold', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '16px', cursor: 'pointer' }}>
                Katıl
              </button>
            </div>
          </div>
        </div>

        {showWarning && (
          <div style={{ position: 'fixed', bottom: '24px', backgroundColor: '#ef4444', color: 'white', padding: '12px 24px', borderRadius: '12px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '12px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.3)' }}>
            <span>⚠️ {showWarning}</span>
            <button onClick={() => setShowWarning(null)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontWeight: 'bold' }}>X</button>
          </div>
        )}
      </div>
    );
  }

  if (gameMode === 'lobby') {
    return (
      <div style={{ backgroundColor: '#0f172a', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '16px', fontFamily: 'sans-serif' }}>
        <div style={{ width: '100%', maxWidth: '500px', backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '28px', padding: '48px 36px', textAlign: 'center' }}>
          <h2 style={{ fontSize: '24px', color: '#94a3b8', margin: '0 0 16px 0' }}>Oda Kodu</h2>
          <div style={{ fontSize: '56px', fontWeight: '950', letterSpacing: '8px', color: '#f59e0b', marginBottom: '32px', backgroundColor: '#0f172a', padding: '16px', borderRadius: '16px', border: '2px dashed #475569' }}>
            {roomCode}
          </div>
          
          <h3 style={{ color: '#f8fafc', fontSize: '18px', marginBottom: '16px', textAlign: 'left' }}>Lobideki Oyuncular:</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '32px' }}>
            {roomData?.players && Object.keys(roomData.players).map((p, i) => (
              <div key={i} style={{ backgroundColor: p === playerName ? 'rgba(16, 185, 129, 0.2)' : '#0f172a', border: p === playerName ? '1px solid #10b981' : '1px solid #334155', padding: '14px', borderRadius: '12px', color: 'white', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span>{p === roomData.host ? "👑" : "🎮"}</span>
                <span>{p} {p === playerName && "(Sen)"}</span>
              </div>
            ))}
          </div>

          {isHost ? (
            <button onClick={startMultiplayerGame} style={{ width: '100%', padding: '18px', fontSize: '18px', fontWeight: 'bold', background: 'linear-gradient(to right, #f59e0b, #e11d48)', color: 'white', border: 'none', borderRadius: '16px', cursor: 'pointer', boxShadow: '0 4px 15px rgba(225, 29, 72, 0.3)' }}>
              Oyunu Başlat
            </button>
          ) : (
            <div style={{ padding: '18px', backgroundColor: 'rgba(56, 189, 248, 0.1)', border: '1px solid #38bdf8', borderRadius: '16px', color: '#38bdf8', fontWeight: 'bold', fontSize: '16px', animation: 'pulse 2s infinite' }}>
              Oda sahibinin başlatması bekleniyor...
            </div>
          )}
        </div>
      </div>
    );
  }

  if (gameMode === 'playing') {
    return (
      <div style={{ backgroundColor: '#0f172a', color: '#f8fafc', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '24px 16px', fontFamily: 'sans-serif', boxSizing: 'border-box' }}>
        <div style={{ width: '100%', maxWidth: '1000px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: '950', background: 'linear-gradient(to right, #f59e0b, #e11d48)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0 }}>Mapletics</h2>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            {roomCode && <span style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', padding: '4px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold' }}>Oda: {roomCode}</span>}
            <span style={{ backgroundColor: '#1e293b', border: '1px solid #334155', padding: '6px 16px', borderRadius: '9999px', fontSize: '13px', fontWeight: '850', color: '#38bdf8' }}>
              ROUND: {currentQuestionIndex + 1} / 5
            </span>
          </div>
        </div>

        <div style={{ width: '100%', maxWidth: '1000px', backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '24px', padding: '20px', display: 'flex', flexWrap: 'wrap', gap: '20px', boxSizing: 'border-box' }}>
          
          <div style={{ flex: '1 1 420px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ padding: '5px 12px', backgroundColor: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', border: '1px solid rgba(245, 158, 11, 0.2)', borderRadius: '9999px', fontSize: '11px', fontWeight: '750' }}>
                🎯 {currentQuestion.sport || "Spor"}
              </span>
            </div>
            <div onClick={() => setIsZoomed(true)} style={{ overflow: 'hidden', borderRadius: '16px', border: '2px solid #475569', height: '340px', position: 'relative', cursor: 'zoom-in', backgroundColor: '#0f172a' }}>
              <img src={currentQuestion.localPhotoUrl} alt="İpucu" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          </div>

          <div style={{ flex: '1 1 450px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ width: '100%', height: '280px', borderRadius: '18px', overflow: 'hidden', border: '2px solid #475569', position: 'relative' }}>
              <button onClick={() => setSatelliteMode(!satelliteMode)} style={{ position: 'absolute', top: '10px', right: '10px', zIndex: 1000, backgroundColor: '#1e293b', border: '1px solid #475569', color: 'white', padding: '6px 12px', borderRadius: '8px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}>
                🗺️ {satelliteMode ? "Karanlık Tema" : "Uydu Görünümü"}
              </button>
              <MapContainer center={[25, 0]} zoom={1} style={{ width: '100%', height: '100%', backgroundColor: '#0f172a' }} worldCopyJump={true}>
                <TileLayer url={satelliteMode ? 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}' : 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'} />
                {selectedLocation && <Marker position={selectedLocation} icon={customMarkerIcon}></Marker>}
                {showAnswer && selectedLocation && (
                  <>
                    <Polyline positions={[selectedLocation, actualLocation]} color="#f59e0b" weight={4} dashArray="6, 8" />
                    <Circle center={actualLocation} radius={250000} pathOptions={{ color: '#10b981', fillColor: '#10b981', fillOpacity: 0.2 }} />
                  </>
                )}
                <MapClickHandler />
                <MapController selected={selectedLocation} actual={actualLocation} show={showAnswer} />
              </MapContainer>
            </div>

            <div style={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '18px', padding: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{ fontSize: '13px', color: '#94a3b8', fontWeight: '700' }}>Yıl Tahmini:</span>
                <span style={{ fontSize: '18px', color: '#38bdf8', fontWeight: '900' }}>{selectedYear}</span>
              </div>
              <input type="range" min="1900" max="2026" value={selectedYear} disabled={showAnswer} onChange={(e) => setSelectedYear(Number(e.target.value))} style={{ width: '100%', accentColor: '#38bdf8' }} />
              {showAnswer && (
                <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px dashed #334155', fontSize: '13px', color: '#94a3b8' }}>
                  Doğru Yıl: <strong style={{ color: '#10b981' }}>{currentQuestion.year}</strong> | Doğru Konum: {currentQuestion.locationName}
                </div>
              )}
            </div>
          </div>
        </div>

        <div style={{ width: '100%', maxWidth: '1000px', backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '20px', padding: '16px', marginTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <div style={{ backgroundColor: '#0f172a', padding: '8px 16px', borderRadius: '12px', border: '1px solid #334155', textAlign: 'center' }}>
              <span style={{ color: '#64748b', fontSize: '10px', display: 'block', fontWeight: '700', letterSpacing: '1px' }}>SKOR</span>
              <span style={{ fontSize: '22px', fontWeight: '950', color: '#10b981' }}>{score}</span>
            </div>
            {showAnswer && (
              <div style={{ fontSize: '12px', color: '#cbd5e1' }}>
                📍 +{geoPoints} Puan <br/> ⏳ +{timePoints} Puan
              </div>
            )}
          </div>
          <div>
            {!showAnswer ? (
              <button onClick={handleGuess} style={{ padding: '12px 28px', fontSize: '15px', fontWeight: '900', color: 'white', background: 'linear-gradient(to right, #10b981, #059669)', border: 'none', borderRadius: '14px', cursor: 'pointer', boxShadow: '0 4px 15px rgba(16, 185, 129, 0.2)' }}>Onayla</button>
            ) : (
              <button onClick={handleNext} style={{ padding: '12px 28px', fontSize: '15px', fontWeight: '900', color: 'white', backgroundColor: '#3b82f6', border: 'none', borderRadius: '14px', cursor: 'pointer', boxShadow: '0 4px 15px rgba(59, 130, 246, 0.2)' }}>{currentQuestionIndex === 4 ? "Sonuçları Gör" : "Sıradaki Konum ➔"}</button>
            )}
          </div>
        </div>

        {isZoomed && <div onClick={() => setIsZoomed(false)} style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(15, 23, 42, 0.96)', zIndex: 3000, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' }}><img src={currentQuestion.localPhotoUrl} style={{ maxWidth: '100%', maxHeight: '90%', borderRadius: '20px', border: '3px solid #475569', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}/></div>}
      </div>
    );
  }

  if (gameMode === 'result') {
    return (
      <div style={{ backgroundColor: '#0f172a', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '16px', fontFamily: 'sans-serif' }}>
        <div style={{ width: '100%', maxWidth: '500px', backgroundColor: '#1e293b', border: '2px solid #334155', borderRadius: '28px', padding: '36px 28px', textAlign: 'center', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}>
          <span style={{ fontSize: '64px' }}>🏆</span>
          <h2 style={{ fontSize: '28px', fontWeight: '950', color: '#10b981', margin: '12px 0 24px 0' }}>Oyun Tamamlandı</h2>
          
          {roomCode && roomData?.players ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
              <h3 style={{ color: '#94a3b8', fontSize: '14px', margin: 0, textAlign: 'left', paddingLeft: '8px' }}>Maç Sonucu (Oda: {roomCode})</h3>
              {Object.entries(roomData.players)
                .sort(([, a], [, b]) => b.score - a.score) 
                .map(([pName, pData], index) => (
                  <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: pName === playerName ? 'rgba(56, 189, 248, 0.15)' : '#0f172a', padding: '16px', borderRadius: '16px', border: pName === playerName ? '1px solid #38bdf8' : '1px solid #334155' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ fontSize: '20px', fontWeight: '900', color: index === 0 ? '#f59e0b' : '#64748b' }}>#{index + 1}</span>
                      <span style={{ color: 'white', fontWeight: 'bold', fontSize: '16px' }}>{pName} {pName === playerName && "(Sen)"}</span>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ display: 'block', fontSize: '20px', fontWeight: '950', color: '#10b981' }}>{pData.score}</span>
                      <span style={{ fontSize: '10px', color: pData.finished ? '#10b981' : '#ef4444', fontWeight: 'bold' }}>{pData.finished ? "Tamamladı" : "Oynuyor..."}</span>
                    </div>
                  </div>
              ))}
            </div>
          ) : (
            <div style={{ backgroundColor: '#0f172a', borderRadius: '16px', padding: '24px', marginBottom: '24px', border: '1px solid #334155' }}>
              <span style={{ color: '#64748b', fontSize: '12px', fontWeight: '700', display: 'block', marginBottom: '8px', letterSpacing: '1px' }}>TOPLAM SKOR</span>
              <span style={{ fontSize: '48px', fontWeight: '950', color: '#f59e0b' }}>{score}</span>
              <p style={{ color: '#38bdf8', fontSize: '14px', fontWeight: 'bold', marginTop: '12px' }}>Klasman: {getRank(score).title}</p>
            </div>
          )}

          <button onClick={() => { setGameMode('menu'); setRoomCode(''); }} style={{ width: '100%', padding: '16px', fontSize: '16px', fontWeight: 'bold', backgroundColor: '#334155', color: 'white', border: 'none', borderRadius: '16px', cursor: 'pointer', transition: 'all 0.2s' }}>
            Ana Menüye Dön
          </button>
        </div>
      </div>
    );
  }

  return null;
}