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
  
  const [lang, setLang] = useState('tr'); 
  const t = (trText, enText) => lang === 'en' ? enText : trText;

  const [roomCode, setRoomCode] = useState('');
  const [joinCodeInput, setJoinCodeInput] = useState('');
  const [roomData, setRoomData] = useState(null);
  const [isHost, setIsHost] = useState(false);

  const [activeQuestions, setActiveQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [selectedYear, setSelectedYear] = useState(1960);
  const [showAnswer, setShowAnswer] = useState(false);
  const [currentDistance, setCurrentDistance] = useState(null);
  const [geoPoints, setGeoPoints] = useState(0);
  const [timePoints, setTimePoints] = useState(0);

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

  const theme = {
    bg: '#121212',          // Zifiri Karanlık Ana Arka Plan
    cardBg: '#1e1e1e',      // Mat Kart Arka Planı
    border: '#2c2c2c',      // İnce Çizgiler (Çok mat)
    text: '#ffffff',        // Ana Metin (Parlak beyaz)
    textMuted: '#9ca3af',   // Soluk Gri Metin
    accent: '#10b981',      // Zümrüt Yeşili (Başarı/Aksiyon)
    primary: '#3b82f6',     // Canlı Mavi (Bilgi/İleri)
    font: 'system-ui, -apple-system, sans-serif'
  };

  if (gameMode === 'menu') {
    return (
      <div style={{ backgroundColor: theme.bg, minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px', fontFamily: theme.font, position: 'relative' }}>
        
        <div style={{ position: 'absolute', top: '24px', right: '24px', display: 'flex', gap: '4px', backgroundColor: theme.cardBg, padding: '4px', borderRadius: '8px', border: `1px solid ${theme.border}` }}>
          <button onClick={() => setLang('tr')} style={{ padding: '6px 12px', borderRadius: '6px', border: 'none', backgroundColor: lang === 'tr' ? theme.border : 'transparent', color: lang === 'tr' ? theme.text : theme.textMuted, fontWeight: '600', cursor: 'pointer', fontSize: '13px' }}>TR</button>
          <button onClick={() => setLang('en')} style={{ padding: '6px 12px', borderRadius: '6px', border: 'none', backgroundColor: lang === 'en' ? theme.border : 'transparent', color: lang === 'en' ? theme.text : theme.textMuted, fontWeight: '600', cursor: 'pointer', fontSize: '13px' }}>EN</button>
        </div>

        <div style={{ width: '100%', maxWidth: '440px', backgroundColor: theme.cardBg, border: `1px solid ${theme.border}`, borderRadius: '16px', padding: '40px', boxSizing: 'border-box' }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <span style={{ fontSize: '48px', display: 'block', marginBottom: '12px' }}>📍</span>
            <h1 style={{ fontSize: '32px', fontWeight: '800', color: theme.text, margin: '0 0 8px 0', letterSpacing: '-1px' }}>Courtdinates</h1>
            <p style={{ color: theme.textMuted, fontSize: '14px', margin: 0 }}>{t("Tarihi spor anlarını haritada bul.", "Locate historic sports moments on the map.")}</p>
          </div>
          
          <input 
            type="text" 
            placeholder={t("Kullanıcı Adı", "Username")} 
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            style={{ width: '100%', padding: '14px 16px', fontSize: '16px', backgroundColor: '#2a2a2a', border: `1px solid ${theme.border}`, borderRadius: '8px', color: theme.text, marginBottom: '24px', boxSizing: 'border-box', outline: 'none', transition: 'border-color 0.2s' }}
          />

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <button onClick={startSinglePlayer} style={{ padding: '14px', fontSize: '16px', fontWeight: '600', backgroundColor: theme.text, color: theme.bg, border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
              {t("Tek Oyunculu Oyna", "Play Single Player")}
            </button>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '16px 0' }}>
              <div style={{ flex: 1, height: '1px', backgroundColor: theme.border }}></div>
              <span style={{ color: theme.textMuted, fontSize: '12px', fontWeight: '600' }}>{t("ÇOK OYUNCULU", "MULTIPLAYER")}</span>
              <div style={{ flex: 1, height: '1px', backgroundColor: theme.border }}></div>
            </div>

            <button onClick={handleCreateRoom} style={{ padding: '14px', fontSize: '16px', fontWeight: '600', backgroundColor: theme.accent, color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
              {t("Yeni Oda Kur", "Create Room")}
            </button>
            
            <div style={{ display: 'flex', gap: '8px' }}>
              <input 
                type="text" 
                placeholder={t("Oda Kodu", "Code")} 
                value={joinCodeInput}
                onChange={(e) => setJoinCodeInput(e.target.value.toUpperCase())}
                style={{ flex: 1, padding: '14px', fontSize: '16px', backgroundColor: '#2a2a2a', border: `1px solid ${theme.border}`, borderRadius: '8px', color: theme.text, textAlign: 'center', textTransform: 'uppercase', outline: 'none' }}
                maxLength={4}
              />
              <button onClick={handleJoinRoom} style={{ padding: '14px 24px', fontSize: '16px', fontWeight: '600', backgroundColor: '#2a2a2a', color: theme.text, border: `1px solid ${theme.border}`, borderRadius: '8px', cursor: 'pointer' }}>
                {t("Katıl", "Join")}
              </button>
            </div>
          </div>
        </div>

        {showWarning && (
          <div style={{ position: 'fixed', bottom: '24px', backgroundColor: '#ef4444', color: 'white', padding: '12px 24px', borderRadius: '8px', fontSize: '14px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
            <span>{showWarning}</span>
            <button onClick={() => setShowWarning(null)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontWeight: 'bold' }}>✕</button>
          </div>
        )}
      </div>
    );
  }

  if (gameMode === 'lobby') {
    return (
      <div style={{ backgroundColor: theme.bg, minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px', fontFamily: theme.font }}>
        <div style={{ width: '100%', maxWidth: '440px', backgroundColor: theme.cardBg, border: `1px solid ${theme.border}`, borderRadius: '16px', padding: '40px', textAlign: 'center', boxSizing: 'border-box' }}>
          <h2 style={{ fontSize: '16px', color: theme.textMuted, margin: '0 0 12px 0', fontWeight: '600', textTransform: 'uppercase' }}>{t("Oda Kodu", "Room Code")}</h2>
          <div style={{ fontSize: '48px', fontWeight: '800', letterSpacing: '4px', color: theme.text, marginBottom: '32px' }}>
            {roomCode}
          </div>
          
          <div style={{ backgroundColor: '#2a2a2a', borderRadius: '8px', padding: '16px', marginBottom: '32px' }}>
            <h3 style={{ color: theme.textMuted, fontSize: '14px', margin: '0 0 16px 0', textAlign: 'left', fontWeight: '600' }}>{t("Oyuncular", "Players")}</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {roomData?.players && Object.keys(roomData.players).map((p, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: theme.text, fontSize: '15px', fontWeight: '500' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: theme.accent }}></div>
                    {p} {p === playerName && t("(Sen)", "(You)")}
                  </div>
                  {p === roomData.host && <span style={{ fontSize: '12px', color: theme.textMuted }}>HOST</span>}
                </div>
              ))}
            </div>
          </div>

          {isHost ? (
            <button onClick={startMultiplayerGame} style={{ width: '100%', padding: '16px', fontSize: '16px', fontWeight: '700', backgroundColor: theme.accent, color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
              {t("Oyunu Başlat", "Start Game")}
            </button>
          ) : (
            <div style={{ padding: '16px', color: theme.textMuted, fontSize: '15px', fontWeight: '500' }}>
              {t("Kurucunun başlatması bekleniyor...", "Waiting for host to start...")}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (gameMode === 'playing') {
    return (
      <div style={{ backgroundColor: theme.bg, color: theme.text, minHeight: '100vh', display: 'flex', flexDirection: 'column', fontFamily: theme.font }}>
        
        {/* ÜST BİLGİ ÇUBUĞU (HEADER) */}
        <div style={{ height: '60px', borderBottom: `1px solid ${theme.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 24px', backgroundColor: theme.cardBg }}>
          <h2 style={{ fontSize: '20px', fontWeight: '800', margin: 0, letterSpacing: '-0.5px' }}>Courtdinates</h2>
          <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
              <span style={{ fontSize: '11px', color: theme.textMuted, fontWeight: '600', letterSpacing: '1px' }}>{t("TUR", "ROUND")}</span>
              <span style={{ fontSize: '16px', fontWeight: '700' }}>{currentQuestionIndex + 1} / 5</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
              <span style={{ fontSize: '11px', color: theme.textMuted, fontWeight: '600', letterSpacing: '1px' }}>{t("SKOR", "SCORE")}</span>
              <span style={{ fontSize: '16px', fontWeight: '700', color: theme.accent }}>{score}</span>
            </div>
          </div>
        </div>

        {/* ANA OYUN ALANI (BÖLÜNMÜŞ EKRAN) */}
        <div style={{ display: 'flex', flexWrap: 'wrap', flex: 1, padding: '24px', gap: '24px', boxSizing: 'border-box', maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
          
          {/* SOL TARAF: FOTOĞRAF ALANI */}
          <div style={{ flex: '1 1 500px', display: 'flex', flexDirection: 'column' }}>
            <div onClick={() => setIsZoomed(true)} style={{ flex: 1, minHeight: '400px', backgroundColor: theme.cardBg, border: `1px solid ${theme.border}`, borderRadius: '12px', overflow: 'hidden', position: 'relative', cursor: 'zoom-in' }}>
              <img src={currentQuestion.localPhotoUrl} alt="Moment" style={{ width: '100%', height: '100%', objectFit: 'contain', backgroundColor: '#000' }} />
              <div style={{ position: 'absolute', top: '16px', left: '16px', backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', padding: '6px 12px', borderRadius: '6px', fontSize: '13px', fontWeight: '600', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' }}>
                {currentQuestion.sport[lang]}
              </div>
            </div>
          </div>

          {/* SAĞ TARAF: HARİTA VE KONTROLLER */}
          <div style={{ flex: '1 1 400px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* HARİTA */}
            <div style={{ height: '320px', backgroundColor: theme.cardBg, border: `1px solid ${theme.border}`, borderRadius: '12px', overflow: 'hidden', position: 'relative' }}>
              <button onClick={() => setSatelliteMode(!satelliteMode)} style={{ position: 'absolute', top: '12px', right: '12px', zIndex: 1000, backgroundColor: theme.cardBg, border: `1px solid ${theme.border}`, color: theme.text, padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
                🗺️ {satelliteMode ? t("Karanlık", "Dark") : t("Uydu", "Satellite")}
              </button>
              <MapContainer center={[25, 0]} zoom={1} style={{ width: '100%', height: '100%', backgroundColor: '#0f172a' }} worldCopyJump={true} zoomControl={false}>
                <TileLayer url={satelliteMode ? 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}' : 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'} />
                {selectedLocation && <Marker position={selectedLocation} icon={customMarkerIcon}></Marker>}
                {showAnswer && selectedLocation && (
                  <>
                    <Polyline positions={[selectedLocation, actualLocation]} color={theme.text} weight={2} dashArray="4, 6" />
                    <Circle center={actualLocation} radius={250000} pathOptions={{ color: theme.accent, fillColor: theme.accent, fillOpacity: 0.2 }} />
                  </>
                )}
                <MapClickHandler />
                <MapController selected={selectedLocation} actual={actualLocation} show={showAnswer} />
              </MapContainer>
            </div>

            {/* YIL ÇİZELGESİ (TIMELINE) */}
            <div style={{ backgroundColor: theme.cardBg, border: `1px solid ${theme.border}`, borderRadius: '12px', padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '16px' }}>
                <span style={{ fontSize: '13px', color: theme.textMuted, fontWeight: '600', textTransform: 'uppercase' }}>{t("Yıl Tahmini", "Guess the Year")}</span>
                <span style={{ fontSize: '28px', fontWeight: '800', color: theme.text, lineHeight: '1' }}>{selectedYear}</span>
              </div>
              <input 
                type="range" min="1900" max="2026" value={selectedYear} disabled={showAnswer} 
                onChange={(e) => setSelectedYear(Number(e.target.value))} 
                style={{ width: '100%', height: '6px', backgroundColor: '#333', borderRadius: '4px', outline: 'none', accentColor: theme.text, cursor: showAnswer ? 'default' : 'pointer' }} 
              />
              
              {/* SONUÇ BİLGİLERİ (CEVAP VERİLDİKTEN SONRA AÇILIR) */}
              {showAnswer && (
                <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: `1px solid ${theme.border}`, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                    <span style={{ color: theme.textMuted }}>{t("Doğru Konum:", "Actual Location:")}</span>
                    <strong style={{ textAlign: 'right' }}>{currentQuestion.locationName[lang]}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                    <span style={{ color: theme.textMuted }}>{t("Doğru Yıl:", "Actual Year:")}</span>
                    <strong>{currentQuestion.year}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: theme.accent, fontWeight: '700', marginTop: '4px' }}>
                    <span>{t("Kazanılan Puan:", "Points Earned:")}</span>
                    <span>+{geoPoints + timePoints}</span>
                  </div>
                </div>
              )}
            </div>

            {/* AKSİYON BUTONU */}
            {!showAnswer ? (
              <button onClick={handleGuess} style={{ width: '100%', padding: '18px', fontSize: '16px', fontWeight: '700', backgroundColor: theme.text, color: theme.bg, border: 'none', borderRadius: '12px', cursor: 'pointer', transition: 'opacity 0.2s' }}>
                {t("Tahmini Onayla", "Make Guess")}
              </button>
            ) : (
              <button onClick={handleNext} style={{ width: '100%', padding: '18px', fontSize: '16px', fontWeight: '700', backgroundColor: theme.primary, color: '#fff', border: 'none', borderRadius: '12px', cursor: 'pointer' }}>
                {currentQuestionIndex === 4 ? t("Sonuçları Gör", "View Summary") : t("Sıradaki Tur", "Next Round")}
              </button>
            )}

          </div>
        </div>

        {/* FOTOĞRAF ZOOM MODALI */}
        {isZoomed && (
          <div onClick={() => setIsZoomed(false)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.9)', zIndex: 3000, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '24px' }}>
            <img src={currentQuestion.localPhotoUrl} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}/>
            <div style={{ position: 'absolute', top: '24px', right: '24px', color: '#fff', fontSize: '14px', fontWeight: '600', backgroundColor: 'rgba(255,255,255,0.2)', padding: '8px 16px', borderRadius: '20px', cursor: 'pointer' }}>
              {t("Kapat", "Close")}
            </div>
          </div>
        )}
      </div>
    );
  }

  if (gameMode === 'result') {
    return (
      <div style={{ backgroundColor: theme.bg, minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px', fontFamily: theme.font }}>
        <div style={{ width: '100%', maxWidth: '500px', backgroundColor: theme.cardBg, border: `1px solid ${theme.border}`, borderRadius: '16px', padding: '40px', boxSizing: 'border-box' }}>
          
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <h2 style={{ fontSize: '20px', color: theme.textMuted, fontWeight: '600', margin: '0 0 8px 0', textTransform: 'uppercase' }}>{t("Oyun Özeti", "Game Summary")}</h2>
            <div style={{ fontSize: '56px', fontWeight: '800', color: theme.accent, lineHeight: '1' }}>{score}</div>
            <p style={{ color: theme.text, fontSize: '16px', fontWeight: '500', marginTop: '12px' }}>{t("Klasman:", "Rank:")} {getRank(score, lang).title}</p>
          </div>
          
          {roomCode && roomData?.players && (
            <div style={{ marginBottom: '32px' }}>
              <h3 style={{ color: theme.textMuted, fontSize: '13px', margin: '0 0 12px 0', textTransform: 'uppercase', fontWeight: '600' }}>{t("Sıralama", "Leaderboard")}</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {Object.entries(roomData.players)
                  .sort(([, a], [, b]) => b.score - a.score) 
                  .map(([pName, pData], index) => (
                    <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: pName === playerName ? '#2a2a2a' : 'transparent', padding: '12px 16px', borderRadius: '8px', border: `1px solid ${pName === playerName ? theme.border : 'transparent'}` }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: theme.text, fontWeight: '600' }}>
                        <span style={{ color: index === 0 ? theme.accent : theme.textMuted }}>#{index + 1}</span>
                        <span>{pName}</span>
                      </div>
                      <span style={{ fontWeight: '700', color: theme.text }}>{pData.score}</span>
                    </div>
                ))}
              </div>
            </div>
          )}

          <button onClick={() => { setGameMode('menu'); setRoomCode(''); }} style={{ width: '100%', padding: '16px', fontSize: '16px', fontWeight: '600', backgroundColor: '#2a2a2a', color: theme.text, border: `1px solid ${theme.border}`, borderRadius: '8px', cursor: 'pointer' }}>
            {t("Ana Menüye Dön", "Return to Main Menu")}
          </button>
        </div>
      </div>
    );
  }

  return null;
}