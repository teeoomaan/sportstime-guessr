import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { ALL_QUESTIONS } from '../data/questions'; 

const neonIcon = new L.DivIcon({
  className: 'custom-neon-marker',
  html: `<div style="width: 20px; height: 20px; background-color: #22c55e; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 15px #22c55e, 0 0 30px rgba(34,197,94,0.8);"></div>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10]
});

const targetIcon = new L.DivIcon({
  className: 'target-marker',
  html: `<div style="width: 24px; height: 24px; background-color: #ef4444; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 15px #ef4444; display: flex; align-items: center; justify-content: center; font-size: 14px;">📍</div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12]
});

function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; 
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

function LocationPicker({ position, setPosition, hasGuessed }) {
  useMapEvents({ click(e) { if (!hasGuessed) setPosition(e.latlng); } });
  return position ? <Marker position={position} icon={neonIcon} /> : null;
}

// DİKKAT: Artık spesifik prop isimleri aramıyoruz, "props" nesnesinin tamamını alıyoruz!
export default function Game(props) {
  // Bize her zaman lazım olan temel fonksiyonları props içinden çekiyoruz
  const { playerName, language, onBackToLobby } = props;

  const [year, setYear] = useState(2000);
  const [selectedPosition, setSelectedPosition] = useState(null);
  const [currentRound, setCurrentRound] = useState(1);
  const [score, setScore] = useState(0);
  const [gameQuestions, setGameQuestions] = useState([]);
  const [hasGuessed, setHasGuessed] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const [roundResult, setRoundResult] = useState(null);
  const [roundHistory, setRoundHistory] = useState([]);
  const [isGameOver, setIsGameOver] = useState(false);
  const [playedCategoryName, setPlayedCategoryName] = useState("KARIŞIK MOD");

  // "KAÇIŞ YOK" KATEGORİ FİLTRESİ (PROP HUNTER ALGORİTMASI)
  useEffect(() => {
    if (ALL_QUESTIONS && ALL_QUESTIONS.length > 0) {
      // Game bileşenine gelen BÜTÜN verileri devasa bir string'e çevirip küçük harf yapıyoruz.
      // App.jsx'te değişkenin adını ne koyarsan koy, içindeki değeri %100 yakalayacak.
      const allIncomingData = JSON.stringify(props).toLowerCase();
      
      let filteredPool = ALL_QUESTIONS;
      let isMixedMode = false;

      if (allIncomingData.includes("fut") || allIncomingData.includes("foot")) {
        filteredPool = ALL_QUESTIONS.filter(q => (q.sport?.en || "") === "Football" || (q.sport?.tr || "") === "Futbol");
        setPlayedCategoryName("FUTBOL");
      } else if (allIncomingData.includes("bask")) {
        filteredPool = ALL_QUESTIONS.filter(q => (q.sport?.en || "") === "Basketball" || (q.sport?.tr || "") === "Basketbol");
        setPlayedCategoryName("BASKETBOL");
      } else if (allIncomingData.includes("vol")) {
        filteredPool = ALL_QUESTIONS.filter(q => (q.sport?.en || "").includes("Volley") || (q.sport?.tr || "").includes("Voley"));
        setPlayedCategoryName("VOLEYBOL");
      } else if (allIncomingData.includes("boks") || allIncomingData.includes("box")) {
        filteredPool = ALL_QUESTIONS.filter(q => (q.sport?.en || "").includes("Box") || (q.sport?.tr || "").includes("Boks"));
        setPlayedCategoryName("BOKS");
      } else {
        isMixedMode = true;
        setPlayedCategoryName("KARIŞIK MOD");
      }

      // Eğer seçilen branşta hiç soru yoksa veya Karışık Mod ise:
      if (isMixedMode || filteredPool.length === 0) {
        const shuffled = [...ALL_QUESTIONS].sort(() => 0.5 - Math.random());
        const selected = [];
        let fCount = 0; let bCount = 0;
        for (const q of shuffled) {
          if (selected.length === 5) break;
          const s = q.sport?.en || "";
          if (s === "Football" && fCount >= 2) continue;
          if (s === "Basketball" && bCount >= 2) continue;
          selected.push(q);
          if (s === "Football") fCount++;
          if (s === "Basketball") bCount++;
        }
        setGameQuestions(selected);
      } else {
        // Tek Branş Modu: O branştaki soruları karıştır ve 5 tane al
        const shuffledFiltered = [...filteredPool].sort(() => 0.5 - Math.random());
        setGameQuestions(shuffledFiltered.slice(0, 5));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Sadece ilk yüklendiğinde çalışsın

  const t = language === 'tr' ? {
    round: `RAUNT ${currentRound}/5`,
    scoreTitle: `SKOR: ${score}`,
    back: "LOBİYE DÖN",
    mapTarget: "KONUM SEÇ",
    timeline: "YILI BELİRLE",
    guess: "TAHMİN ET",
    next: "SONRAKİ RAUNT ➔",
    finish: "SONUÇLARI GÖR",
    missingGuess: "Lütfen önce haritadan bir konum seçin!",
    zoomHint: "🔍 Büyütmek için tıkla",
    resultDistance: "Mesafe Farkı",
    resultYear: "Yıl Farkı",
    resultPoints: "Kazanılan Puan",
    loading: "Efsane Anlar Yükleniyor...",
    gameOverTitle: "OYUN TAMAMLANDI",
    totalScore: "TOPLAM SKOR",
    share: "SKORU PAYLAŞ",
    copied: "Kopyalandı!"
  } : {
    round: `ROUND ${currentRound}/5`,
    scoreTitle: `SCORE: ${score}`,
    back: "BACK TO LOBBY",
    mapTarget: "PIN LOCATION",
    timeline: "SELECT YEAR",
    guess: "MAKE GUESS",
    next: "NEXT ROUND ➔",
    finish: "SEE RESULTS",
    missingGuess: "Please select a location on the map first!",
    zoomHint: "🔍 Click to zoom",
    resultDistance: "Distance",
    resultYear: "Year Difference",
    resultPoints: "Points Earned",
    loading: "Loading Epic Moments...",
    gameOverTitle: "GAME OVER",
    totalScore: "TOTAL SCORE",
    share: "SHARE SCORE",
    copied: "Copied!"
  };

  const [shareText, setShareText] = useState(t.share);

  if (gameQuestions.length === 0) {
    return (
      <div style={{ height: '100vh', backgroundColor: '#050508', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'system-ui', fontSize: '20px', fontWeight: 'bold' }}>
        <div style={{ textAlign: 'center' }}>⏳ {t.loading}</div>
      </div>
    );
  }

  const currentQ = gameQuestions[currentRound - 1];
  const currentTrivia = language === 'tr' ? currentQ?.trivia?.tr : currentQ?.trivia?.en;
  const currentSportLabel = language === 'tr' ? currentQ?.sport?.tr : currentQ?.sport?.en;

  const handleGuess = () => {
    if (!selectedPosition) { alert(t.missingGuess); return; }
    const distanceKm = getDistance(selectedPosition.lat, selectedPosition.lng, currentQ.lat, currentQ.lng);
    const yearDiff = Math.abs(currentQ.year - year);
    
    let points = 5000;
    points -= (distanceKm * 0.5); 
    points -= (yearDiff * 100);   
    if (points < 0) points = 0;
    points = Math.round(points);

    setRoundResult({ distance: distanceKm, yearDiff, points });
    setScore(prev => prev + points);
    setHasGuessed(true);
  };

  const handleNextRound = () => {
    setRoundHistory(prev => [...prev, {
      question: currentQ,
      distance: roundResult.distance,
      yearDiff: roundResult.yearDiff,
      points: roundResult.points
    }]);

    if (currentRound < gameQuestions.length) {
      setCurrentRound(prev => prev + 1);
      setSelectedPosition(null); 
      setYear(2000); 
      setHasGuessed(false);
      setRoundResult(null);
    } else {
      setIsGameOver(true);
    }
  };

  const handleShare = () => {
    const text = `Courtdinates 🌍\nKategori: ${playedCategoryName}\n${t.totalScore}: ${score} 🏆\nSen de spor tarihini test et!`;
    navigator.clipboard.writeText(text);
    setShareText(t.copied);
    setTimeout(() => setShareText(t.share), 2000);
  };

  // ---------------- OYUN BİTİŞ EKRANI (cillop gibi fixli) ----------------
  if (isGameOver) {
    return (
      <div style={{ width: '100%', minHeight: '100vh', backgroundColor: '#050508', color: 'white', fontFamily: 'system-ui', padding: '40px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', overflowY: 'auto' }}>
        <h1 style={{ fontSize: '36px', color: '#22c55e', fontWeight: '900', letterSpacing: '4px', marginBottom: '8px', textShadow: '0 0 20px rgba(34,197,94,0.4)' }}>{t.gameOverTitle}</h1>
        <div style={{ fontSize: '64px', fontWeight: '900', color: '#fbbf24', marginBottom: '40px', textShadow: '0 0 30px rgba(251,191,36,0.3)' }}>{score} <span style={{fontSize:'20px', color:'rgba(255,255,255,0.4)'}}>PT</span></div>
        
        <div style={{ width: '100%', maxWidth: '800px', display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '40px' }}>
          {roundHistory.map((rh, index) => (
            <div key={index} style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '16px', display: 'flex', alignItems: 'center', gap: '20px' }}>
              <img src={rh.question.localPhotoUrl} alt="" style={{ width: '120px', height: '80px', objectFit: 'cover', borderRadius: '8px' }} />
              <div style={{ flex: 1 }}>
                <h3 style={{ margin: '0 0 4px 0', fontSize: '18px', color: '#fff' }}>{rh.question.title}</h3>
                <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', display: 'flex', gap: '16px' }}>
                  <span>🎯 {t.resultDistance}: <strong style={{color:'#ef4444'}}>{rh.distance} km</strong></span>
                  <span>⏳ {t.resultYear}: <strong style={{color:'#ef4444'}}>{rh.yearDiff} Yıl</strong></span>
                </div>
              </div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#4ade80' }}>+{rh.points}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '16px', width: '100%', maxWidth: '800px' }}>
          <button onClick={handleShare} style={{ flex: 1, padding: '20px', fontSize: '16px', fontWeight: '900', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', letterSpacing: '1px' }}>
            📤 {shareText}
          </button>
          <button onClick={onBackToLobby} style={{ flex: 1, padding: '20px', fontSize: '16px', fontWeight: '900', background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '12px', cursor: 'pointer', letterSpacing: '1px' }}>
            {t.back}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', width: '100%', height: '100vh', backgroundColor: '#050508', overflow: 'hidden', color: 'white', fontFamily: 'system-ui, -apple-system, sans-serif', display: 'flex', flexDirection: 'column' }}>
      
      <style>{`
        .vignette-overlay { position: absolute; inset: 0; background: linear-gradient(to bottom, rgba(0,0,0,0.6) 0%, transparent 15%, transparent 70%, rgba(0,0,0,0.85) 100%); pointer-events: none; }
        .hud-glass { background: rgba(10, 10, 15, 0.55); backdrop-filter: blur(20px); border: 1px solid rgba(255, 255, 255, 0.1); }
      `}</style>

      <div style={{ position: 'absolute', inset: 0, zIndex: 0, backgroundImage: `url('${currentQ.localPhotoUrl}')`, backgroundSize: 'cover', backgroundPosition: 'center', filter: 'blur(50px) brightness(20%)', transform: 'scale(1.1)', transition: 'background-image 0.5s ease' }}></div>
      <div className="vignette-overlay"></div>

      <div className="hud-glass" style={{ position: 'relative', zIndex: 10, width: '95%', maxWidth: '1600px', margin: '16px auto 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 32px', borderRadius: '16px' }}>
        <button onClick={onBackToLobby} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', fontSize: '13px', fontWeight: '800', letterSpacing: '1px' }}>← {t.back}</button>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <span style={{ fontSize: '11px', color: '#4ade80', fontWeight: '900', letterSpacing: '3px' }}>{t.round}</span>
          <div style={{ display: 'flex', gap: '6px', marginTop: '6px' }}>
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} style={{ width: '40px', height: '4px', borderRadius: '2px', backgroundColor: i <= currentRound ? '#22c55e' : 'rgba(255,255,255,0.15)', boxShadow: i <= currentRound ? '0 0 10px rgba(34,197,94,0.5)' : 'none' }}></div>
            ))}
          </div>
        </div>
        <div style={{ fontSize: '22px', fontWeight: '900', letterSpacing: '1px', display: 'flex', gap: '8px' }}>
          <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px', alignSelf: 'center' }}>{t.scoreTitle.split(':')[0]}</span> 
          {t.scoreTitle.split(':')[1]}
        </div>
      </div>

      {/* STANDART BOYUTLU FOTOĞRAF ALANI */}
      <div style={{ position: 'relative', zIndex: 10, flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
        <div onClick={() => setIsZoomed(true)} style={{ 
          position: 'relative', width: '100%', height: '100%', maxHeight: '52vh', aspectRatio: '16/9',
          borderRadius: '16px', overflow: 'hidden', cursor: 'pointer', border: '1px solid rgba(255,255,255,0.15)', 
          boxShadow: '0 25px 50px rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center' 
        }}>
          <div style={{ position: 'absolute', inset: 0, backgroundImage: `url('${currentQ.localPhotoUrl}')`, backgroundSize: 'cover', backgroundPosition: 'center', filter: 'blur(20px) brightness(40%)', zIndex: 1 }}></div>
          <img src={currentQ.localPhotoUrl} alt={currentQ.title} style={{ position: 'relative', zIndex: 2, maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
          
          <div style={{ position: 'absolute', top: '16px', left: '16px', zIndex: 10, background: 'rgba(0,0,0,0.65)', border: '1px solid rgba(34,197,94,0.4)', padding: '6px 14px', borderRadius: '8px', color: '#4ade80', fontWeight: '800', fontSize: '11px', letterSpacing: '1px', backdropFilter: 'blur(5px)' }}>
            {currentSportLabel?.toUpperCase()}
          </div>
          
          <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: '0.2s', zIndex: 3 }} onMouseOver={(e) => e.currentTarget.style.opacity = 1} onMouseOut={(e) => e.currentTarget.style.opacity = 0}>
            <span style={{ backgroundColor: 'rgba(0,0,0,0.8)', padding: '10px 24px', borderRadius: '30px', fontWeight: '700', letterSpacing: '1px' }}>{t.zoomHint}</span>
          </div>
        </div>
      </div>

      <div className="hud-glass" style={{ position: 'relative', zIndex: 10, width: '95%', maxWidth: '1600px', margin: '0 auto 16px', display: 'flex', gap: '20px', padding: '16px', borderRadius: '20px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
        
        <div style={{ flex: '2', backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '8px 16px', backgroundColor: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: '11px', fontWeight: '800', letterSpacing: '2px', color: 'rgba(255,255,255,0.8)', zIndex: 400 }}>
            📍 {t.mapTarget}
          </div>
          <div style={{ flex: 1, minHeight: '240px', position: 'relative' }}>
            <MapContainer key={`map-${currentRound}`} center={[20, 0]} zoom={2} style={{ height: '100%', width: '100%' }} zoomControl={false}>
              <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
              <LocationPicker position={selectedPosition} setPosition={setSelectedPosition} hasGuessed={hasGuessed} />
              {hasGuessed && <Marker position={[currentQ.lat, currentQ.lng]} icon={targetIcon} />}
              {hasGuessed && selectedPosition && <Polyline positions={[selectedPosition, [currentQ.lat, currentQ.lng]]} color="#ef4444" dashArray="5, 10" weight={3} />}
            </MapContainer>
          </div>
        </div>

        <div style={{ flex: '1.2', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {!hasGuessed ? (
            <>
              <div style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', padding: '16px 20px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '24px' }}>
                  <div style={{ fontSize: '11px', fontWeight: '800', letterSpacing: '2px', color: 'rgba(255,255,255,0.6)' }}>⏳ {t.timeline}</div>
                  <div style={{ fontSize: '40px', fontWeight: '900', color: '#22c55e', textShadow: '0 0 30px rgba(34,197,94,0.4)', lineHeight: '1' }}>{year}</div>
                </div>
                <input type="range" min="1950" max="2026" value={year} onChange={(e) => setYear(Number(e.target.value))} style={{ WebkitAppearance: 'none', width: '100%', height: '6px', borderRadius: '3px', background: 'rgba(255,255,255,0.1)', outline: 'none', cursor: 'pointer' }} />
              </div>
              <button onClick={handleGuess} style={{ width: '100%', padding: '16px', fontSize: '15px', fontWeight: '900', background: 'linear-gradient(180deg, #22c55e 0%, #15803d 100%)', color: 'white', border: '1px solid #4ade80', borderRadius: '12px', cursor: 'pointer', boxShadow: '0 10px 25px rgba(21, 128, 61, 0.4)', letterSpacing: '2px' }}>
                {t.guess}
              </button>
            </>
          ) : (
            <>
              <div style={{ flex: 1, backgroundColor: 'rgba(34, 197, 94, 0.03)', borderRadius: '12px', border: '1px solid rgba(34, 197, 94, 0.2)', padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: '8px', overflowY: 'auto', maxHeight: '180px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                  <span style={{ color: 'rgba(255,255,255,0.5)' }}>{t.resultDistance}:</span>
                  <span style={{ fontWeight: 'bold', color: '#fff' }}>{roundResult.distance} km</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                  <span style={{ color: 'rgba(255,255,255,0.5)' }}>{t.resultYear}:</span>
                  <span style={{ fontWeight: 'bold', color: '#fff' }}>{roundResult.yearDiff} Yıl (Doğru: {currentQ.year})</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '6px', color: '#fbbf24', fontWeight: 'bold' }}>
                  <span>{t.resultPoints}:</span>
                  <span>+{roundResult.points} Puan</span>
                </div>
                <div style={{ fontSize: '11px', lineHeight: '1.4', color: 'rgba(255,255,255,0.8)' }}>
                  <strong style={{ color: '#3b82f6', display: 'block', marginBottom: '2px' }}>💡 BUNU BİLİYOR MUYDUNUZ?</strong>
                  {currentTrivia}
                </div>
              </div>
              <button onClick={handleNextRound} style={{ width: '100%', padding: '16px', fontSize: '15px', fontWeight: '900', background: 'linear-gradient(180deg, #3b82f6 0%, #1d4ed8 100%)', color: 'white', border: '1px solid #60a5fa', borderRadius: '12px', cursor: 'pointer', boxShadow: '0 10px 25px rgba(29, 78, 216, 0.4)', letterSpacing: '2px' }}>
                {currentRound < 5 ? t.next : t.finish}
              </button>
            </>
          )}
        </div>
      </div>

      {isZoomed && (
        <div onClick={() => setIsZoomed(false)} style={{ position: 'fixed', inset: 0, zIndex: 150, backgroundColor: 'rgba(0,0,0,0.92)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'zoom-out' }}>
          <img src={currentQ.localPhotoUrl} alt="Zoomed" style={{ maxWidth: '92vw', maxHeight: '92vh', objectFit: 'contain', borderRadius: '8px' }} />
          <div style={{ position: 'absolute', top: '24px', right: '32px', color: 'rgba(255,255,255,0.5)', fontSize: '32px', fontWeight: '300' }}>×</div>
        </div>
      )}
    </div>
  );
}