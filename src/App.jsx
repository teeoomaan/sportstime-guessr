import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, Circle, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css'; // VERCEL'DE ÇÖKMEYİ VE HARİTA BOZUKLUĞUNU ÖNLEYEN HAYAT KURTARICI KOD!

// Harita marker'ının kırılmasını önleyen özel parıldayan kırmızı nokta tasarımı
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

// 24 ADET KUSURSUZ EFSANE SPOR ANI (MASTER LIST)
const ICONIC_MOMENTS = [
  { id: 1, sport: "Futbol", title: "Agüerooooo!", hint: "93:20'de gelen tarihi şampiyonluk golü.", localPhotoUrl: "/sports_photos/aguero.jpg", fallbackPhotoUrl: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=1200", lat: 53.4831, lng: -2.2004, year: 2012, locationName: "Etihad Stadyumu, Manchester" },
  { id: 2, sport: "Boks", title: "Ali vs Liston", hint: "Ringin üzerinde yıkılan rakibine bağıran şampiyon.", localPhotoUrl: "/sports_photos/ali.jpg", fallbackPhotoUrl: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=1200", lat: 44.1014, lng: -70.2148, year: 1965, locationName: "Lewiston, Maine, ABD" },
  { id: 3, sport: "Atletizm", title: "Bolt'un Gülümsemesi", hint: "Rakiplerine fark atıp bitiş çizgisine bakarak gülümsediği an.", localPhotoUrl: "/sports_photos/bolt.jpg", fallbackPhotoUrl: "https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=1200", lat: -22.8932, lng: -43.2923, year: 2016, locationName: "Olimpiyat Stadyumu, Rio" },
  { id: 4, sport: "Tenis", title: "Wimbledon Epik Finali", hint: "Karanlık çökerken biten o inanılmaz maç.", localPhotoUrl: "/sports_photos/federer_nadal.jpg", fallbackPhotoUrl: "https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=1200", lat: 51.4343, lng: -0.2145, year: 2008, locationName: "Wimbledon, Londra" },
  { id: 5, sport: "Futbol", title: "İstanbul Mucizesi", hint: "Liverpool'un 3-0'dan geri döndüğü gece.", localPhotoUrl: "/sports_photos/istanbul.jpg", fallbackPhotoUrl: "https://images.unsplash.com/photo-1543351611-58f69d7c1781?w=1200", lat: 41.0744, lng: 28.7656, year: 2005, locationName: "Atatürk Olimpiyat Stadyumu, İstanbul" },
  { id: 6, sport: "Basketbol", title: "The Last Shot", hint: "Jordan'ın şut attığı andaki pota arkası tepkilerine bak.", localPhotoUrl: "/sports_photos/jordan.jpg", fallbackPhotoUrl: "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=1200", lat: 40.7683, lng: -111.8911, year: 1998, locationName: "Delta Center, Utah" },
  { id: 7, sport: "Basketbol", title: "Kobe 81 Sayı", hint: "Tarihin en büyük ikinci skor performansının yaşandığı gece.", localPhotoUrl: "/sports_photos/kobe.jpg", fallbackPhotoUrl: "https://images.unsplash.com/photo-1519766304817-4f37bda74a27?w=1200", lat: 34.0430, lng: -118.2673, year: 2006, locationName: "Staples Center, Los Angeles" },
  { id: 8, sport: "Basketbol", title: "LeBron'un Bloğu", hint: "Finaller 7. maçında yapılan o efsanevi blok.", localPhotoUrl: "/sports_photos/lebron.jpg", fallbackPhotoUrl: "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=1200", lat: 37.7503, lng: -122.2030, year: 2016, locationName: "Oracle Arena, Oakland" },
  { id: 9, sport: "Futbol", title: "Tanrı'nın Eli", hint: "İngiltere'ye elle atılan o tartışmalı tarihi gol.", localPhotoUrl: "/sports_photos/maradona.jpg", fallbackPhotoUrl: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=1200", lat: 19.3031, lng: -99.1506, year: 1986, locationName: "Estadio Azteca, Meksika" },
  { id: 10, sport: "Futbol", title: "Messi'nin Rüyası", hint: "Messi'nin nihayet Dünya Kupası'nı kaldırdığı Katar gecesi.", localPhotoUrl: "/sports_photos/messi_worldcup.jpg", fallbackPhotoUrl: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=1200", lat: 25.4208, lng: 51.4903, year: 2022, locationName: "Lusail Stadyumu, Katar" },
  { id: 11, sport: "Tenis", title: "Toprak Kortun Kralı", hint: "Nadal'ın evi olarak bilinen ve kupaları domine ettiği yer.", localPhotoUrl: "/sports_photos/nadal.jpg", fallbackPhotoUrl: "https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=1200", lat: 48.8471, lng: 2.2476, year: 2022, locationName: "Roland Garros, Paris" },
  { id: 12, sport: "Futbol", title: "Pelé 1970", hint: "Brezilya'nın futbol tarihine geçen ikonik dünya kupası zaferi.", localPhotoUrl: "/sports_photos/pele_1970.jpg", fallbackPhotoUrl: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=1200", lat: 19.3031, lng: -99.1506, year: 1970, locationName: "Estadio Azteca, Meksika" },
  { id: 13, sport: "Yüzme", title: "Phelps'in 8 Altını", hint: "Tek olimpiyatta kırılan o ulaşılamaz altın madalya rekoru.", localPhotoUrl: "/sports_photos/phelps.jpg", fallbackPhotoUrl: "https://images.unsplash.com/photo-1530549388964-5a02e5d070b4?w=1200", lat: 39.9913, lng: 116.3861, year: 2008, locationName: "Water Cube, Pekin" },
  { id: 14, sport: "Basketbol", title: "Ray Allen'ın Üçlüğü", hint: "Finaller 6. maçında, Miami'yi ipten alan meşhur köşe üçlüğü.", localPhotoUrl: "/sports_photos/ray_allen.jpg", fallbackPhotoUrl: "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=1200", lat: 25.7814, lng: -80.1870, year: 2013, locationName: "American Airlines Arena, Miami" },
  { id: 15, sport: "Futbol", title: "Ronaldo'nun Rövaşatası", hint: "Rakip taraftarların bile ayakta alkışladığı inanılmaz sıçrama.", localPhotoUrl: "/sports_photos/ronaldo_bicycle.jpg", fallbackPhotoUrl: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=1200", lat: 45.1095, lng: 7.6413, year: 2018, locationName: "Allianz Stadyumu, Torino" },
  { id: 16, sport: "Formula 1", title: "Schumacher'in Dönemi", hint: "Ferrari efsanesinin altın yıllarında Japonya'da kazandığı kupa.", localPhotoUrl: "/sports_photos/schumacher.jpg", fallbackPhotoUrl: "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=1200", lat: 34.8431, lng: 136.5411, year: 2000, locationName: "Suzuka Pisti, Japonya" },
  { id: 17, sport: "Formula 1", title: "Senna'nın Son Yarışı", hint: "F1 tarihinin en hüzünlü pisti.", localPhotoUrl: "/sports_photos/senna.jpg", fallbackPhotoUrl: "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=1200", lat: 44.3439, lng: 11.7167, year: 1994, locationName: "Imola Pisti, İtalya" },
  { id: 18, sport: "Golf", title: "Tiger Woods Dönüşü", hint: "Yıllar süren sakatlıklardan sonra gelen o mucizevi zafer.", localPhotoUrl: "/sports_photos/tiger_woods.jpg", fallbackPhotoUrl: "https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=1200", lat: 33.5033, lng: -82.0223, year: 2019, locationName: "Augusta National, Georgia" },
  { id: 19, sport: "Amerikan Futbolu", title: "Tom Brady 28-3", hint: "Süper Bowl tarihinin en büyük geri dönüşü.", localPhotoUrl: "/sports_photos/tom_brady.jpg", fallbackPhotoUrl: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=1200", lat: 29.6847, lng: -95.4107, year: 2017, locationName: "NRG Stadyumu, Houston" },
  { id: 20, sport: "Formula 1", title: "Verstappen Son Tur", hint: "Son virajında kazanılan o çılgın şampiyonluk.", localPhotoUrl: "/sports_photos/verstappen.jpg", fallbackPhotoUrl: "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=1200", lat: 24.4672, lng: 54.6031, year: 2021, locationName: "Yas Marina, Abu Dabi" },
  { id: 21, sport: "Futbol", title: "Zidane'ın Volesi", hint: "Şampiyonlar Ligi finalinde gelişine vurulan kusursuz sol ayak.", localPhotoUrl: "/sports_photos/zidane.jpg", fallbackPhotoUrl: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=1200", lat: 55.8257, lng: -4.2520, year: 2002, locationName: "Hampden Park, Glasgow" },
  { id: 22, sport: "Futbol", title: "Zidane'ın Kafa Atışı", hint: "Dünya Kupası finalinde kariyerini bitiren o olaylı an.", localPhotoUrl: "/sports_photos/GettyImages-503368718.jpg.webp", fallbackPhotoUrl: "https://images.unsplash.com/photo-1522778119020-d0118817730c?w=1200", lat: 52.5147, lng: 13.2397, year: 2006, locationName: "Olympiastadion, Berlin" },
  { id: 23, sport: "Boks", title: "Tyson'ın Isırığı", hint: "Ringde Holyfield'ın kulağını ısırdığı o çılgın gece.", localPhotoUrl: "/sports_photos/b109f80f-4e20-4115-b4c6-0f57c67ea0bf_1140x641.jpg", fallbackPhotoUrl: "https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=1200", lat: 36.1147, lng: -115.1728, year: 1997, locationName: "MGM Grand, Las Vegas" },
  { id: 24, sport: "Futbol", title: "Suarez'in Isırığı", hint: "Savunmacı Chiellini'yi omuzundan ısırdığı o tuhaf an.", localPhotoUrl: "/sports_photos/3751.webp", fallbackPhotoUrl: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=1200", lat: -5.7833, lng: -35.2167, year: 2014, locationName: "Arena das Dunas, Natal, Brezilya" }
];

// Dünya haritası için Haversine formülü
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; 
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Oyuncu rütbesini hesaplayan akıllı algoritma
function getRank(totalScore) {
  if (totalScore >= 22000) return { title: "Haritanın Efendisi (Mapletics Lord) 👑", desc: "Tebrikler! Spor tarihini saniyesi ve koordinatıyla ezbere biliyorsunuz. Kusursuz bir gözlem yeteneği." };
  if (totalScore >= 15000) return { title: "Efsane Dedektif (Master Detective) 🕵️‍♂️", desc: "Harika bir performans! Görsel detayları yakalama konusunda üst düzey bir yeteneğe sahipsiniz." };
  if (totalScore >= 7000) return { title: "Yetenekli Gözlemci (Scout) 🎤", desc: "Başarılı bir mücadele. Detaylara hakimsiniz ancak mesafe tahminlerinde küçük sapmalar yaşadınız." };
  return { title: "Çaylak Dedektif (Rookie) 🔍", desc: "Daha fazla pratiğe ihtiyacınız var. Fotoğraflardaki mimari ve dönemsel ipuçlarına daha dikkatli odaklanmalısınız." };
}

// Haritayı tahminden sonra otomatik odaklayan modül
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
  const [activeQuestions, setActiveQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [score, setScore] = useState(0);

  // Tahmin & Sonuç State'leri
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [selectedYear, setSelectedYear] = useState(1960);
  const [showAnswer, setShowAnswer] = useState(false);
  const [currentDistance, setCurrentDistance] = useState(null);
  const [geoPoints, setGeoPoints] = useState(0);
  const [timePoints, setTimePoints] = useState(0);

  // Arayüz Modalları
  const [isZoomed, setIsZoomed] = useState(false);
  const [showWarning, setShowWarning] = useState(null);
  const [showFinalModal, setShowFinalModal] = useState(false);

  // Harita Katmanı
  const [satelliteMode, setSatelliteMode] = useState(false);

  // Sesi başlatan Web Audio API
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
      console.log("Audio not supported yet.");
    }
  };

  const startNewGame = () => {
    const shuffled = [...ICONIC_MOMENTS].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 5); 
    setActiveQuestions(selected);
    setCurrentQuestionIndex(0);
    setScore(0);
    setSelectedLocation(null);
    setSelectedYear(1960);
    setShowAnswer(false);
    setShowFinalModal(false);
    setGameStarted(true);
    playSynthSound(600, 'triangle', 0.4);
  };

  // Güvenli Soru Çekme Yapısı
  const currentQuestion = activeQuestions[currentQuestionIndex] || ICONIC_MOMENTS[0];
  const actualLocation = [currentQuestion.lat || 0, currentQuestion.lng || 0];

  const [imgSrc, setImgSrc] = useState("");
  const [usingFallback, setUsingFallback] = useState(false);

  useEffect(() => {
    if (currentQuestion.localPhotoUrl) {
      setImgSrc(currentQuestion.localPhotoUrl);
      setUsingFallback(false);
    }
  }, [currentQuestionIndex, currentQuestion]);

  const handleImageError = () => {
    if (!usingFallback && currentQuestion.fallbackPhotoUrl) {
      setImgSrc(currentQuestion.fallbackPhotoUrl);
      setUsingFallback(true);
    }
  };

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
      setShowWarning("Lütfen önce harita üzerinden tahmini konumunuzu işaretleyiniz.");
      playSynthSound(220, 'sawtooth', 0.25);
      return;
    }

    const distance = calculateDistance(
      selectedLocation[0], selectedLocation[1], actualLocation[0], actualLocation[1]
    );
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

  const handleNext = () => {
    setShowAnswer(false);
    setSelectedLocation(null);
    setSelectedYear(1960);
    setCurrentDistance(null);
    setGeoPoints(0);
    setTimePoints(0);

    if (currentQuestionIndex < 4) {
      setCurrentQuestionIndex(prev => prev + 1);
      playSynthSound(523.25, 'sine', 0.15);
    } else {
      setShowFinalModal(true);
      playSynthSound(587.33, 'triangle', 0.2);
      setTimeout(() => playSynthSound(880, 'sine', 0.4), 180);
    }
  };

  const handleRestartGame = () => {
    setShowFinalModal(false);
    setCurrentQuestionIndex(0);
    setScore(0);
    setGameStarted(false);
  };

  if (!gameStarted) {
    return (
      <div style={{ backgroundColor: '#0f172a', color: '#f8fafc', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '16px', fontFamily: 'sans-serif', boxSizing: 'border-box' }}>
        <div style={{ width: '100%', maxWidth: '580px', backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '28px', padding: '48px 36px', textAlign: 'center', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6)' }}>
          <div style={{ fontSize: '56px', marginBottom: '16px' }}>🕵️‍♂️🏆</div>
          <h1 style={{ fontSize: '38px', fontWeight: '950', background: 'linear-gradient(to right, #f59e0b, #e11d48)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: '0 0 12px 0', letterSpacing: '-0.03em' }}>
            Mapletics
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '15px', fontWeight: '500', margin: '0 0 36px 0', lineHeight: '1.6' }}>
            Açıklama veya ipucu bulunmamaktadır. Yalnızca görseldeki detayları analiz ederek stadyumu ve yılı tahmin ediniz.
          </p>

          <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '22px', marginBottom: '44px', backgroundColor: '#0f172a', padding: '24px', borderRadius: '18px', border: '1px solid #334155' }}>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              <span style={{ fontSize: '28px' }}>🔍</span>
              <div>
                <h3 style={{ margin: '0 0 2px 0', fontSize: '15px', fontWeight: '700', color: '#f8fafc' }}>Görsel Analizi (Tıklayarak Büyütün)</h3>
                <p style={{ margin: 0, fontSize: '13px', color: '#94a3b8' }}>Forma tasarımları, tribün mimarisi ve seyirciler; dönemi ve konumu belirlemenizi sağlayacaktır.</p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              <span style={{ fontSize: '28px' }}>📍</span>
              <div>
                <h3 style={{ margin: '0 0 2px 0', fontSize: '15px', fontWeight: '700', color: '#f59e0b' }}>Mekan Seçimi (Maks. 2500 Puan)</h3>
                <p style={{ margin: 0, fontSize: '13px', color: '#94a3b8' }}>Harita üzerinden stadyumun tam konumunu işaretleyiniz.</p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              <span style={{ fontSize: '28px' }}>⏳</span>
              <div>
                <h3 style={{ margin: '0 0 2px 0', fontSize: '15px', fontWeight: '700', color: '#3b82f6' }}>Yıl Tahmini (Maks. 2500 Puan)</h3>
                <p style={{ margin: 0, fontSize: '13px', color: '#94a3b8' }}>Zaman çizelgesini kullanarak olayın gerçekleştiği yılı belirleyiniz.</p>
              </div>
            </div>
          </div>

          <button onClick={startNewGame} style={{ width: '100%', padding: '18px 32px', fontSize: '18px', fontWeight: '800', color: 'white', background: 'linear-gradient(to right, #f59e0b, #e11d48)', border: 'none', borderRadius: '20px', cursor: 'pointer', boxShadow: '0 10px 20px -3px rgba(245, 158, 11, 0.3)' }}>
            Mücadeleyi Başlat (5 Round) ➔
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#0f172a', color: '#f8fafc', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '24px 16px', fontFamily: 'sans-serif', boxSizing: 'border-box' }}>
      
      {/* Üst Bilgi Barı */}
      <div style={{ width: '100%', maxWidth: '1000px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '950', background: 'linear-gradient(to right, #f59e0b, #e11d48)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0 }}>Mapletics</h2>
        <span style={{ backgroundColor: '#1e293b', border: '1px solid #334155', padding: '6px 16px', borderRadius: '9999px', fontSize: '13px', fontWeight: '850', color: '#38bdf8' }}>
          ROUND: {currentQuestionIndex + 1} / 5
        </span>
      </div>

      {/* Oyun Kartı */}
      <div style={{ width: '100%', maxWidth: '1000px', backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '24px', padding: '20px', display: 'flex', flexWrap: 'wrap', gap: '20px', boxSizing: 'border-box' }}>
        
        {/* Sol Sütun: Fotoğraf İnceleme Paneli */}
        <div style={{ flex: '1 1 420px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ padding: '5px 12px', backgroundColor: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', border: '1px solid rgba(245, 158, 11, 0.2)', borderRadius: '9999px', fontSize: '11px', fontWeight: '750' }}>
              ⚽ {currentQuestion.sport || "Spor"}
            </span>
            <span style={{ fontSize: '11px', color: '#64748b' }}>🔍 İncelemek için fotoğrafa tıklayınız</span>
          </div>

          <div 
            onClick={() => setIsZoomed(true)}
            style={{ overflow: 'hidden', borderRadius: '16px', border: '2px solid #475569', height: '340px', position: 'relative', cursor: 'zoom-in', backgroundColor: '#0f172a', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.5)' }}
          >
            <img src={imgSrc} alt="İpucu" onError={handleImageError} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <div style={{ position: 'absolute', bottom: '12px', right: '12px', backgroundColor: 'rgba(15, 23, 42, 0.8)', padding: '8px', borderRadius: '50%', color: '#f8fafc' }}>🔍</div>
          </div>
        </div>

        {/* Sağ Sütun: Harita & Zaman Çizelgesi */}
        <div style={{ flex: '1 1 450px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div style={{ width: '100%', height: '280px', borderRadius: '18px', overflow: 'hidden', border: '2px solid #475569', position: 'relative', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.5)' }}>
            <button 
              onClick={() => { setSatelliteMode(prev => !prev); playSynthSound(500, 'sine', 0.1); }}
              style={{ position: 'absolute', top: '10px', right: '10px', zIndex: 1000, backgroundColor: '#1e293b', border: '1px solid #475569', color: 'white', padding: '6px 12px', borderRadius: '8px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}
            >
              🗺️ {satelliteMode ? "Karanlık Tema" : "Uydu Görünümü"}
            </button>
            <MapContainer center={[25, 0]} zoom={1} style={{ width: '100%', height: '100%', backgroundColor: '#0f172a' }} worldCopyJump={true}>
              <TileLayer
                url={satelliteMode ? 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}' : 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'}
                attribution={satelliteMode ? 'Esri' : 'CartoDB'}
              />
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <span style={{ fontSize: '13px', color: '#94a3b8', fontWeight: '700' }}>Tahmin Ettiğiniz Yıl:</span>
              <span style={{ fontSize: '18px', color: '#38bdf8', fontWeight: '900', backgroundColor: 'rgba(56, 189, 248, 0.15)', padding: '2px 10px', borderRadius: '6px' }}>{selectedYear}</span>
            </div>

            <input 
              type="range" min="1900" max="2026" value={selectedYear} disabled={showAnswer}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              style={{ width: '100%', accentColor: '#38bdf8', cursor: 'pointer' }}
            />

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#475569', marginTop: '6px', fontWeight: '700' }}>
              <span>1900</span><span>1930</span><span>1960</span><span>1990</span><span>2020</span><span>2026</span>
            </div>

            {showAnswer && (
              <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px dashed #334155', display: 'flex', justifyContent: 'space-between', fontSize: '13px', alignItems: 'center' }}>
                <span style={{ color: '#94a3b8' }}>Doğru Yıl: <strong style={{ color: '#10b981' }}>{currentQuestion.year}</strong></span>
                <span style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '2px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '750' }}>
                  Sapma: {Math.abs(selectedYear - (currentQuestion.year || 2000))} Yıl
                </span>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Alt Kontrol ve Puan Tablosu */}
      <div style={{ width: '100%', maxWidth: '1000px', backgroundColor: 'rgba(30, 41, 59, 0.8)', border: '1px solid #334155', borderRadius: '20px', padding: '16px', marginTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', boxSizing: 'border-box' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ backgroundColor: '#0f172a', padding: '8px 16px', borderRadius: '12px', border: '1px solid #334155', textAlign: 'center' }}>
            <span style={{ color: '#64748b', fontSize: '10px', display: 'block', fontWeight: '700' }}>TOPLAM PUAN</span>
            <span style={{ fontSize: '22px', fontWeight: '950', color: '#10b981' }}>{score}</span>
          </div>

          {showAnswer && (
            <div style={{ fontSize: '12px', borderLeft: '1px solid #334155', paddingLeft: '16px', display: 'flex', flexDirection: 'column', gap: '3px' }}>
              <p style={{ color: '#cbd5e1', margin: 0 }}>📍 Konum Puanı: <span style={{ color: '#10b981', fontWeight: 'bold' }}>+{geoPoints}</span> <span style={{ color: '#64748b' }}>({currentDistance} km sapma)</span></p>
              <p style={{ color: '#cbd5e1', margin: 0 }}>⏳ Zaman Puanı: <span style={{ color: '#38bdf8', fontWeight: 'bold' }}>+{timePoints}</span></p>
              <p style={{ color: '#94a3b8', margin: 0, fontSize: '11px', fontStyle: 'italic' }}>Doğru Konum: {currentQuestion.locationName}</p>
            </div>
          )}
        </div>

        <div>
          {!showAnswer ? (
            <button onClick={handleGuess} style={{ padding: '12px 28px', fontSize: '15px', fontWeight: '900', color: 'white', background: 'linear-gradient(to right, #10b981, #059669)', border: 'none', borderRadius: '14px', cursor: 'pointer', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.25)' }}>
              Tahmini Onayla
            </button>
          ) : (
            <button onClick={handleNext} style={{ padding: '12px 28px', fontSize: '15px', fontWeight: '900', color: 'white', backgroundColor: '#3b82f6', border: 'none', borderRadius: '14px', cursor: 'pointer', boxShadow: '0 4px 12px rgba(59, 130, 246, 0.25)' }}>
              {currentQuestionIndex === 4 ? "Sonucu Görüntüle" : "Sonraki Round ➔"}
            </button>
          )}
        </div>
      </div>

      {/* BÜYÜTEÇ MODALI */}
      {isZoomed && (
        <div onClick={() => setIsZoomed(false)} style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(15, 23, 42, 0.96)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 3000, cursor: 'zoom-out', padding: '16px' }}>
          <div style={{ maxWidth: '90%', maxHeight: '82%', overflow: 'hidden', borderRadius: '20px', border: '3px solid #475569' }}>
            <img src={imgSrc} alt="Büyütülmüş Görsel" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </div>
          <p style={{ color: '#64748b', marginTop: '16px', fontSize: '13px', fontWeight: '600' }}>Kapatmak için ekrana tıklayınız.</p>
        </div>
      )}

      {/* UYARI TOAST PANELİ */}
      {showWarning && (
        <div style={{ position: 'fixed', bottom: '24px', left: '50%', transform: 'translateX(-50%)', backgroundColor: '#ef4444', color: 'white', padding: '10px 20px', borderRadius: '10px', fontWeight: 'bold', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.3)', zIndex: 4000, display: 'flex', gap: '10px', alignItems: 'center' }}>
          <span>⚠️ {showWarning}</span>
          <button onClick={() => setShowWarning(null)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' }}>×</button>
        </div>
      )}

      {/* OYUN BİTTİ MODERN SKOR KARTI MODALI */}
      {showFinalModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(15, 23, 42, 0.97)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 5000, padding: '16px' }}>
          <div style={{ width: '100%', maxWidth: '460px', backgroundColor: '#1e293b', border: '2px solid #334155', borderRadius: '24px', padding: '36px 28px', textAlign: 'center', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8)' }}>
            <span style={{ fontSize: '64px' }}>🏆</span>
            <h2 style={{ fontSize: '28px', fontWeight: '950', color: '#10b981', margin: '12px 0 6px 0' }}>Mücadele Tamamlandı!</h2>
            <p style={{ color: '#94a3b8', fontSize: '14px', margin: '0 0 20px 0' }}>Spor tarihinin en efsanevi 5 anını başarıyla analiz ettiniz.</p>
            <div style={{ backgroundColor: '#0f172a', borderRadius: '16px', padding: '20px', marginBottom: '20px', border: '1px solid #334155' }}>
              <span style={{ color: '#64748b', fontSize: '12px', fontWeight: '700', display: 'block', marginBottom: '4px' }}>ELDE EDİLEN SKOR</span>
              <span style={{ fontSize: '42px', fontWeight: '950', color: '#f59e0b', textShadow: '0 0 8px rgba(245, 158, 11, 0.25)' }}>{score}</span>
            </div>
            <div style={{ backgroundColor: 'rgba(56, 189, 248, 0.05)', border: '1px solid rgba(56, 189, 248, 0.2)', borderRadius: '16px', padding: '16px', marginBottom: '28px', textAlign: 'left' }}>
              <span style={{ color: '#38bdf8', fontSize: '12px', fontWeight: '850', display: 'block', marginBottom: '4px' }}>DEDEKTİF RÜTBESİ</span>
              <h4 style={{ color: 'white', fontSize: '16px', fontWeight: '800', margin: '0 0 4px 0' }}>{getRank(score).title}</h4>
              <p style={{ color: '#94a3b8', fontSize: '12px', margin: 0, lineHeight: '1.4' }}>{getRank(score).desc}</p>
            </div>
            <button onClick={handleRestartGame} style={{ width: '100%', padding: '14px 24px', fontSize: '15px', fontWeight: '800', color: 'white', background: 'linear-gradient(to right, #10b981, #059669)', border: 'none', borderRadius: '12px', cursor: 'pointer', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)' }}>
              Tekrar Oyna ➔
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
