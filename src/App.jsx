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
  { id: 1, sport: {tr: "Futbol", en: "Football"}, title: "Agüerooooo!", year: 2012, lat: 53.4831, lng: -2.2004, locationName: {tr: "Etihad Stadyumu, Manchester", en: "Etihad Stadium, Manchester"}, localPhotoUrl: "/sports_photos/aguero.jpg" },
  { id: 2, sport: {tr: "Boks", en: "Boxing"}, title: "Ali vs Liston", year: 1965, lat: 44.1014, lng: -70.2148, locationName: {tr: "Lewiston, Maine, ABD", en: "Lewiston, Maine, USA"}, localPhotoUrl: "/sports_photos/ali.jpg" },
  { id: 3, sport: {tr: "Atletizm", en: "Athletics"}, title: "Bolt", year: 2016, lat: -22.8932, lng: -43.2923, locationName: {tr: "Olimpiyat Stadyumu, Rio", en: "Olympic Stadium, Rio"}, localPhotoUrl: "/sports_photos/bolt.jpg" },
  { id: 4, sport: {tr: "Tenis", en: "Tennis"}, title: "Wimbledon Final", year: 2008, lat: 51.4343, lng: -0.2145, locationName: {tr: "Wimbledon, Londra", en: "Wimbledon, London"}, localPhotoUrl: "/sports_photos/federer_nadal.jpg" },
  { id: 5, sport: {tr: "Futbol", en: "Football"}, title: "Istanbul Miracle", year: 2005, lat: 41.0744, lng: 28.7656, locationName: {tr: "Atatürk Olimpiyat Stadyumu, İstanbul", en: "Ataturk Olympic Stadium, Istanbul"}, localPhotoUrl: "/sports_photos/istanbul.jpg" },
  { id: 6, sport: {tr: "Basketbol", en: "Basketball"}, title: "The Last Shot", year: 1998, lat: 40.7683, lng: -111.8911, locationName: {tr: "Delta Center, Utah", en: "Delta Center, Utah"}, localPhotoUrl: "/sports_photos/jordan.jpg" },
  { id: 7, sport: {tr: "Basketbol", en: "Basketball"}, title: "Kobe 81 Points", year: 2006, lat: 34.0430, lng: -118.2673, locationName: {tr: "Staples Center, Los Angeles", en: "Staples Center, Los Angeles"}, localPhotoUrl: "/sports_photos/kobe.jpg" },
  { id: 8, sport: {tr: "Basketbol", en: "Basketball"}, title: "The Block", year: 2016, lat: 37.7503, lng: -122.2030, locationName: {tr: "Oracle Arena, Oakland", en: "Oracle Arena, Oakland"}, localPhotoUrl: "/sports_photos/lebron.jpg" },
  { id: 9, sport: {tr: "Futbol", en: "Football"}, title: "Hand of God", year: 1986, lat: 19.3031, lng: -99.1506, locationName: {tr: "Estadio Azteca, Meksika", en: "Estadio Azteca, Mexico"}, localPhotoUrl: "/sports_photos/maradona.jpg" },
  { id: 10, sport: {tr: "Futbol", en: "Football"}, title: "Messi World Cup", year: 2022, lat: 25.4208, lng: 51.4903, locationName: {tr: "Lusail Stadyumu, Katar", en: "Lusail Stadium, Qatar"}, localPhotoUrl: "/sports_photos/messi_worldcup.jpg" },
  { id: 11, sport: {tr: "Tenis", en: "Tennis"}, title: "King of Clay", year: 2022, lat: 48.8471, lng: 2.2476, locationName: {tr: "Roland Garros, Paris", en: "Roland Garros, Paris"}, localPhotoUrl: "/sports_photos/nadal.jpg" },
  { id: 12, sport: {tr: "Futbol", en: "Football"}, title: "Pelé 1970", year: 1970, lat: 19.3031, lng: -99.1506, locationName: {tr: "Estadio Azteca, Meksika", en: "Estadio Azteca, Mexico"}, localPhotoUrl: "/sports_photos/pele_1970.jpg" },
  { id: 13, sport: {tr: "Yüzme", en: "Swimming"}, title: "Phelps 8 Gold", year: 2008, lat: 39.9913, lng: 116.3861, locationName: {tr: "Water Cube, Pekin", en: "Water Cube, Beijing"}, localPhotoUrl: "/sports_photos/phelps.jpg" },
  { id: 14, sport: {tr: "Basketbol", en: "Basketball"}, title: "Ray Allen 3PT", year: 2013, lat: 25.7814, lng: -80.1870, locationName: {tr: "American Airlines Arena, Miami", en: "American Airlines Arena, Miami"}, localPhotoUrl: "/sports_photos/ray_allen.jpg" },
  { id: 15, sport: {tr: "Futbol", en: "Football"}, title: "Ronaldo Bicycle", year: 2018, lat: 45.1095, lng: 7.6413, locationName: {tr: "Allianz Stadyumu, Torino", en: "Allianz Stadium, Turin"}, localPhotoUrl: "/sports_photos/ronaldo_bicycle.jpg" },
  { id: 16, sport: {tr: "Formula 1", en: "Formula 1"}, title: "Schumacher Era", year: 2000, lat: 34.8431, lng: 136.5411, locationName: {tr: "Suzuka Pisti, Japonya", en: "Suzuka Circuit, Japan"}, localPhotoUrl: "/sports_photos/schumacher.jpg" },
  { id: 17, sport: {tr: "Formula 1", en: "Formula 1"}, title: "Senna Last Race", year: 1994, lat: 44.3439, lng: 11.7167, locationName: {tr: "Imola Pisti, İtalya", en: "Imola Circuit, Italy"}, localPhotoUrl: "/sports_photos/senna.jpg" },
  { id: 18, sport: {tr: "Golf", en: "Golf"}, title: "Tiger Woods Return", year: 2019, lat: 33.5033, lng: -82.0223, locationName: {tr: "Augusta National, Georgia", en: "Augusta National, Georgia"}, localPhotoUrl: "/sports_photos/tiger_woods.jpg" },
  { id: 19, sport: {tr: "Am. Futbolu", en: "Am. Football"}, title: "Tom Brady 28-3", year: 2017, lat: 29.6847, lng: -95.4107, locationName: {tr: "NRG Stadyumu, Houston", en: "NRG Stadium, Houston"}, localPhotoUrl: "/sports_photos/tom_brady.jpg" },
  { id: 20, sport: {tr: "Formula 1", en: "Formula 1"}, title: "Verstappen Last Lap", year: 2021, lat: 24.4672, lng: 54.6031, locationName: {tr: "Yas Marina, Abu Dabi", en: "Yas Marina, Abu Dhabi"}, localPhotoUrl: "/sports_photos/verstappen.jpg" },
  { id: 21, sport: {tr: "Futbol", en: "Football"}, title: "Zidane Volley", year: 2002, lat: 55.8257, lng: -4.2520, locationName: {tr: "Hampden Park, Glasgow", en: "Hampden Park, Glasgow"}, localPhotoUrl: "/sports_photos/zidane.jpg" },
  { id: 22, sport: {tr: "Futbol", en: "Football"}, title: "Zidane Headbutt", year: 2006, lat: 52.5147, lng: 13.2397, locationName: {tr: "Olympiastadion, Berlin", en: "Olympiastadion, Berlin"}, localPhotoUrl: "/sports_photos/GettyImages-503368718.jpg.webp" },
  { id: 23, sport: {tr: "Boks", en: "Boxing"}, title: "Tyson Bite", year: 1997, lat: 36.1147, lng: -115.1728, locationName: {tr: "MGM Grand, Las Vegas", en: "MGM Grand, Las Vegas"}, localPhotoUrl: "/sports_photos/b109f80f-4e20-4115-b4c6-0f57c67ea0bf_1140x641.jpg" },
  { id: 24, sport: {tr: "Futbol", en: "Football"}, title: "Suarez Bite", year: 2014, lat: -5.7833, lng: -35.2167, locationName: {tr: "Arena das Dunas, Natal, Brezilya", en: "Arena das Dunas, Natal, Brazil"}, localPhotoUrl: "/sports_photos/3751.webp" }
];

function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; 
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function getRank(totalScore, lang) {
  if (totalScore >= 22000) return { title: "Global Elite 👑", desc: lang === 'en' ? "Flawless performance." : "Kusursuz performans." };
  if (totalScore >= 15000) return { title: "Master 💎", desc: lang === 'en' ? "Great observation skills." : "Harika gözlem yeteneği." };
  if (totalScore >= 7000) return { title: "Pro 🎯", desc: lang === 'en' ? "Good effort." : "İyi mücadele." };
  return { title: lang === 'en' ? "Rookie 🐣" : "Çaylak 🐣", desc: lang === 'en' ? "More practice needed." : "Daha fazla pratik gerekli." };
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
  
  // DİL (LANGUAGE) STATE'İ
  const [lang, setLang] = useState('tr'); 
  const t = (trText, enText) => lang === 'en' ? enText : trText;

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
      // Sessiz hata
    }
  };

  useEffect(() => {
    if (!roomCode) return;
    const unsubscribe = onSnapshot(doc(db, "rooms", roomCode), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setRoomData(data);
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
    if (!playerName.trim()) return setShowWarning(t("Lütfen bir kullanıcı adı belirleyin.", "Please enter a username."));
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
    if (!playerName.trim()) return setShowWarning(t("Lütfen bir kullanıcı adı belirleyin.", "Please enter a username."));
    if (!joinCodeInput.trim()) return setShowWarning(t("Lütfen geçerli bir oda kodu girin.", "Please enter a valid room code."));
    const code = joinCodeInput.toUpperCase();
    const roomRef = doc(db, "rooms", code);
    const snap = await getDoc(roomRef);
    if (snap.exists() && snap.data().status === 'waiting') {
      await updateDoc(roomRef, { [`players.${playerName}`]: { score: 0, finished: false } });
      setRoomCode(code);
      setIsHost(false);
      setGameMode('lobby');
      playSynthSound(600, 'triangle', 0.2);
    } else {
      setShowWarning(t("Oda bulunamadı veya oyun başladı.", "Room not found or game already started."));
    }
  };

  const startMultiplayerGame = async () => {
    if (isHost && roomCode) {
      await updateDoc(doc(db, "rooms", roomCode), { status: "playing" });
    }
  };

  const startSinglePlayer = () => {
    if (!playerName.trim()) return setShowWarning(t("Lütfen bir kullanıcı adı belirleyin.", "Please enter a username."));
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
      setShowWarning(t("Harita üzerinden tahmini konumunuzu işaretleyin.", "Please mark your estimated location on the map."));
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
      <div style={{ backgroundColor: '#0f172a', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '16px', fontFamily: 'sans-serif', boxSizing: 'border-box', position: 'relative' }}>
        
        {/* DİL SEÇİM BUTONU (Language Toggle) */}
        <div style={{ position: 'absolute', top: '20px', right: '20px', display: 'flex', gap: '4px', backgroundColor: '#1e293b', padding: '4px', borderRadius: '12px', border: '1px solid #334155' }}>
          <button onClick={() => setLang('tr')} style={{ padding: '8px 14px', borderRadius: '8px', border: 'none', backgroundColor: lang === 'tr' ? '#38bdf8' : 'transparent', color: lang === 'tr' ? 'white' : '#94a3b8', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s', fontSize: '13px' }}>TR</button>
          <button onClick={() => setLang('en')} style={{ padding: '8px 14px', borderRadius: '8px', border: 'none', backgroundColor: lang === 'en' ? '#38bdf8' : 'transparent', color: lang === 'en' ? 'white' : '#94a3b8', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s', fontSize: '13px' }}>EN</button>
        </div>

        <div style={{ width: '100%', maxWidth: '500px', backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '28px', padding: '48px 36px', textAlign: 'center', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6)' }}>
          <div style={{ fontSize: '56px', marginBottom: '16px' }}>🏆</div>
          <h1 style={{ fontSize: '42px', fontWeight: '950', background: 'linear-gradient(to right, #f59e0b, #e11d48)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: '0 0 12px 0', letterSpacing: '-0.03em' }}>
            Mapletics
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '15px', marginBottom: '32px' }}>{t("Haritaya giriş yapmak için bir isim belirleyin.", "Enter a name to access the map.")}</p>
          
          <input 
            type="text" 
            placeholder={t("Kullanıcı Adı", "Username")} 
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            style={{ width: '100%', padding: '16px', fontSize: '18px', backgroundColor: '#0f172a', border: '2px solid #334155', borderRadius: '16px', color: 'white', marginBottom: '24px', textAlign: 'center', boxSizing: 'border-box', outline: 'none' }}
          />

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <button onClick={startSinglePlayer} style={{ padding: '16px', fontSize: '16px', fontWeight: 'bold', backgroundColor: '#334155', color: 'white', border: 'none', borderRadius: '16px', cursor: 'pointer', transition: 'all 0.2s' }}>
              👤 {t("Tek Oyunculu", "Single Player")}
            </button>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '10px 0' }}>
              <div style={{ flex: 1, height: '1px', backgroundColor: '#334155' }}></div>
              <span style={{ color: '#64748b', fontSize: '12px', fontWeight: 'bold', letterSpacing: '1px' }}>{t("ÇOK OYUNCULU MOD", "MULTIPLAYER MODE")}</span>
              <div style={{ flex: 1, height: '1px', backgroundColor: '#334155' }}></div>
            </div>

            <button onClick={handleCreateRoom} style={{ padding: '16px', fontSize: '16px', fontWeight: 'bold', background: 'linear-gradient(to right, #10b981, #059669)', color: 'white', border: 'none', borderRadius: '16px', cursor: 'pointer', boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)' }}>
              ⚔️ {t("Yeni Oda Oluştur", "Create New Room")}
            </button>
            
            <div style={{ display: 'flex', gap: '8px' }}>
              <input 
                type="text" 
                placeholder={t("Oda Kodu", "Room Code")} 
                value={joinCodeInput}
                onChange={(e) => setJoinCodeInput(e.target.value.toUpperCase())}
                style={{ flex: 1, padding: '16px', fontSize: '16px', backgroundColor: '#0f172a', border: '2px solid #334155', borderRadius: '16px', color: 'white', textAlign: 'center', textTransform: 'uppercase', outline: 'none' }}
                maxLength={4}
              />
              <button onClick={handleJoinRoom} style={{ padding: '16px 24px', fontSize: '16px', fontWeight: 'bold', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '16px', cursor: 'pointer' }}>
                {t("Katıl", "Join")}
              </button>
            </div>
          </div>
        </div>

        {showWarning && (
          <div style={{ position: 'fixed', bottom: '24px', backgroundColor: '#ef4444', color: 'white', padding: '12px 24px', borderRadius: '12px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '12px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.3)', zIndex: 5000 }}>
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
          <h2 style={{ fontSize: '24px', color: '#94a3b8', margin: '0 0 16px 0' }}>{t("Oda Kodu", "Room Code")}</h2>
          <div style={{ fontSize: '56px', fontWeight: '950', letterSpacing: '8px', color: '#f59e0b', marginBottom: '32px', backgroundColor: '#0f172a', padding: '16px', borderRadius: '16px', border: '2px dashed #475569' }}>
            {roomCode}
          </div>
          
          <h3 style={{ color: '#f8fafc', fontSize: '18px', marginBottom: '16px', textAlign: 'left' }}>{t("Lobideki Oyuncular:", "Players in Lobby:")}</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '32px' }}>
            {roomData?.players && Object.keys(roomData.players).map((p, i) => (
              <div key={i} style={{ backgroundColor: p === playerName ? 'rgba(16, 185, 129, 0.2)' : '#0f172a', border: p === playerName ? '1px solid #10b981' : '1px solid #334155', padding: '14px', borderRadius: '12px', color: 'white', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span>{p === roomData.host ? "👑" : "🎮"}</span>
                <span>{p} {p === playerName && t("(Sen)", "(You)")}</span>
              </div>
            ))}
          </div>

          {isHost ? (
            <button onClick={startMultiplayerGame} style={{ width: '100%', padding: '18px', fontSize: '18px', fontWeight: 'bold', background: 'linear-gradient(to right, #f59e0b, #e11d48)', color: 'white', border: 'none', borderRadius: '16px', cursor: 'pointer', boxShadow: '0 4px 15px rgba(225, 29, 72, 0.3)' }}>
              {t("Oyunu Başlat", "Start Game")}
            </button>
          ) : (
            <div style={{ padding: '18px', backgroundColor: 'rgba(56, 189, 248, 0.1)', border: '1px solid #38bdf8', borderRadius: '16px', color: '#38bdf8', fontWeight: 'bold', fontSize: '16px', animation: 'pulse 2s infinite' }}>
              {t("Oda sahibinin başlatması bekleniyor...", "Waiting for host to start...")}
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
            {roomCode && <span style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', padding: '4px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold' }}>{t("Oda:", "Room:")} {roomCode}</span>}
            <span style={{ backgroundColor: '#1e293b', border: '1px solid #334155', padding: '6px 16px', borderRadius: '9999px', fontSize: '13px', fontWeight: '850', color: '#38bdf8' }}>
              ROUND: {currentQuestionIndex + 1} / 5
            </span>
          </div>
        </div>

        <div style={{ width: '100%', maxWidth: '1000px', backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '24px', padding: '20px', display: 'flex', flexWrap: 'wrap', gap: '20px', boxSizing: 'border-box' }}>
          
          <div style={{ flex: '1 1 420px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ padding: '5px 12px', backgroundColor: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', border: '1px solid rgba(245, 158, 11, 0.2)', borderRadius: '9999px', fontSize: '11px', fontWeight: '750' }}>
                🎯 {currentQuestion.sport[lang]}
              </span>
            </div>
            <div onClick={() => setIsZoomed(true)} style={{ overflow: 'hidden', borderRadius: '16px', border: '2px solid #475569', height: '340px', position: 'relative', cursor: 'zoom-in', backgroundColor: '#0f172a' }}>
              <img src={currentQuestion.localPhotoUrl} alt="İpucu" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          </div>

          <div style={{ flex: '1 1 450px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ width: '100%', height: '280px', borderRadius: '18px', overflow: 'hidden', border: '2px solid #475569', position: 'relative' }}>
              <button onClick={() => setSatelliteMode(!satelliteMode)} style={{ position: 'absolute', top: '10px', right: '10px', zIndex: 1000, backgroundColor: '#1e293b', border: '1px solid #475569', color: 'white', padding: '6px 12px', borderRadius: '8px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}>
                🗺️ {satelliteMode ? t("Karanlık Tema", "Dark Map") : t("Uydu Görünümü", "Satellite")}
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
                <span style={{ fontSize: '13px', color: '#94a3b8', fontWeight: '700' }}>{t("Yıl Tahmini:", "Year Guess:")}</span>
                <span style={{ fontSize: '18px', color: '#38bdf8', fontWeight: '900' }}>{selectedYear}</span>
              </div>
              <input type="range" min="1900" max="2026" value={selectedYear} disabled={showAnswer} onChange={(e) => setSelectedYear(Number(e.target.value))} style={{ width: '100%', accentColor: '#38bdf8' }} />
              {showAnswer && (
                <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px dashed #334155', fontSize: '13px', color: '#94a3b8' }}>
                  {t("Doğru Yıl:", "Correct Year:")} <strong style={{ color: '#10b981' }}>{currentQuestion.year}</strong> | {t("Doğru Konum:", "Correct Location:")} {currentQuestion.locationName[lang]}
                </div>
              )}
            </div>
          </div>
        </div>

        <div style={{ width: '100%', maxWidth: '1000px', backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '20px', padding: '16px', marginTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <div style={{ backgroundColor: '#0f172a', padding: '8px 16px', borderRadius: '12px', border: '1px solid #334155', textAlign: 'center' }}>
              <span style={{ color: '#64748b', fontSize: '10px', display: 'block', fontWeight: '700', letterSpacing: '1px' }}>{t("SKOR", "SCORE")}</span>
              <span style={{ fontSize: '22px', fontWeight: '950', color: '#10b981' }}>{score}</span>
            </div>
            {showAnswer && (
              <div style={{ fontSize: '12px', color: '#cbd5e1' }}>
                📍 +{geoPoints} {t("Puan", "Pts")} <br/> ⏳ +{timePoints} {t("Puan", "Pts")}
              </div>
            )}
          </div>
          <div>
            {!showAnswer ? (
              <button onClick={handleGuess} style={{ padding: '12px 28px', fontSize: '15px', fontWeight: '900', color: 'white', background: 'linear-gradient(to right, #10b981, #059669)', border: 'none', borderRadius: '14px', cursor: 'pointer', boxShadow: '0 4px 15px rgba(16, 185, 129, 0.2)' }}>{t("Onayla", "Confirm")}</button>
            ) : (
              <button onClick={handleNext} style={{ padding: '12px 28px', fontSize: '15px', fontWeight: '900', color: 'white', backgroundColor: '#3b82f6', border: 'none', borderRadius: '14px', cursor: 'pointer', boxShadow: '0 4px 15px rgba(59, 130, 246, 0.2)' }}>{currentQuestionIndex === 4 ? t("Sonuçları Gör", "See Results") : t("Sıradaki Konum ➔", "Next Location ➔")}</button>
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
          <h2 style={{ fontSize: '28px', fontWeight: '950', color: '#10b981', margin: '12px 0 24px 0' }}>{t("Oyun Tamamlandı", "Game Completed")}</h2>
          
          {roomCode && roomData?.players ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
              <h3 style={{ color: '#94a3b8', fontSize: '14px', margin: 0, textAlign: 'left', paddingLeft: '8px' }}>{t("Maç Sonucu (Oda: ", "Match Result (Room: ")}{roomCode})</h3>
              {Object.entries(roomData.players)
                .sort(([, a], [, b]) => b.score - a.score) 
                .map(([pName, pData], index) => (
                  <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: pName === playerName ? 'rgba(56, 189, 248, 0.15)' : '#0f172a', padding: '16px', borderRadius: '16px', border: pName === playerName ? '1px solid #38bdf8' : '1px solid #334155' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ fontSize: '20px', fontWeight: '900', color: index === 0 ? '#f59e0b' : '#64748b' }}>#{index + 1}</span>
                      <span style={{ color: 'white', fontWeight: 'bold', fontSize: '16px' }}>{pName} {pName === playerName && t("(Sen)", "(You)")}</span>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ display: 'block', fontSize: '20px', fontWeight: '950', color: '#10b981' }}>{pData.score}</span>
                      <span style={{ fontSize: '10px', color: pData.finished ? '#10b981' : '#ef4444', fontWeight: 'bold' }}>{pData.finished ? t("Tamamladı", "Finished") : t("Oynuyor...", "Playing...")}</span>
                    </div>
                  </div>
              ))}
            </div>
          ) : (
            <div style={{ backgroundColor: '#0f172a', borderRadius: '16px', padding: '24px', marginBottom: '24px', border: '1px solid #334155' }}>
              <span style={{ color: '#64748b', fontSize: '12px', fontWeight: '700', display: 'block', marginBottom: '8px', letterSpacing: '1px' }}>{t("TOPLAM SKOR", "TOTAL SCORE")}</span>
              <span style={{ fontSize: '48px', fontWeight: '950', color: '#f59e0b' }}>{score}</span>
              <p style={{ color: '#38bdf8', fontSize: '14px', fontWeight: 'bold', marginTop: '12px' }}>{t("Klasman:", "Rank:")} {getRank(score, lang).title}</p>
            </div>
          )}

          <button onClick={() => { setGameMode('menu'); setRoomCode(''); }} style={{ width: '100%', padding: '16px', fontSize: '16px', fontWeight: 'bold', backgroundColor: '#334155', color: 'white', border: 'none', borderRadius: '16px', cursor: 'pointer', transition: 'all 0.2s' }}>
            {t("Ana Menüye Dön", "Return to Main Menu")}
          </button>
        </div>
      </div>
    );
  }

  return null;
}