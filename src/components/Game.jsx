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

export default function Game(props) {
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

  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [customAlert, setCustomAlert] = useState(null);

  useEffect(() => {
    if (ALL_QUESTIONS && ALL_QUESTIONS.length > 0) {
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
        const shuffledFiltered = [...filteredPool].sort(() => 0.5 - Math.random());
        setGameQuestions(shuffledFiltered.slice(0, 5));
      }
    }
  }, []);

  const t = language === 'tr' ? {
    round: `RAUNT ${currentRound}/5`,
    scoreTitle: `SKOR: ${score}`,
    back: "LOBİYE DÖN",
    mapTarget: "KONUM SEÇ",
    timeline: "YILI BELİRLE",
    guess: "TAHMİNİ ONAYLA",
    next: "SONRAKİ RAUNT ➔",
    finish: "SONUÇLARI GÖR",
    missingGuess: "Lütfen önce haritadan bir konum seçin!",
    zoomHint: "🔍 Büyütmek için tıkla",
    resultDistance: "Mesafe",
    resultYear: "Yıl Farkı",
    resultPoints: "Kazanılan Puan",
    loading: "Efsane Anlar Yükleniyor...",
    gameOverTitle: "OYUN TAMAMLANDI",
    totalScore: "TOPLAM SKOR",
    share: "SKORU PAYLAŞ",
    copied: "Kopyalandı!",
    openMap: "🗺️ HARİTAYI AÇ",
    mapSelected: "📍 KONUM SEÇİLDİ",
    closeMap: "KAPAT",
    confirmLocation: "KONUMU ONAYLA",
  } : {
    round: `ROUND ${currentRound}/5`,
    scoreTitle: `SCORE: ${score}`,
    back: "BACK TO LOBBY",
    mapTarget: "PIN LOCATION",
    timeline: "SELECT YEAR",
    guess: "CONFIRM GUESS",
    next: "NEXT ROUND ➔",
    finish: "SEE RESULTS",
    missingGuess: "Please select a location on the map first!",
    zoomHint: "🔍 Click to zoom",
    resultDistance: "Distance",
    resultYear: "Year Diff",
    resultPoints: "Points Earned",
    loading: "Loading Epic Moments...",
    gameOverTitle: "GAME OVER",
    totalScore: "TOTAL SCORE",
    share: "SHARE SCORE",
    copied: "Copied!",
    openMap: "🗺️ OPEN MAP",
    mapSelected: "📍 LOCATION PINNED",
    closeMap: "CLOSE",
    confirmLocation: "CONFIRM LOCATION",
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
    if (!selectedPosition) { 
      setCustomAlert(t.missingGuess);
      setTimeout(() => setCustomAlert(null), 3000); 
      return; 
    }
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
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100%', backgroundColor: '#050508', overflow: 'hidden', color: 'white', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      
      {/* --- MÜKEMMEL CSS (BUTONLAR VE 50/50 LAYOUT) --- */}
      <style>{`
        /* Kaydırma çubuğunu gizle ama kaydırmaya izin ver */
        ::-webkit-scrollbar { width: 0px; background: transparent; }
        
        .vignette-overlay { position: absolute; inset: 0; background: linear-gradient(to bottom, rgba(0,0,0,0.6) 0%, transparent 15%, transparent 70%, rgba(0,0,0,0.9) 100%); pointer-events: none; z-index: 1; }
        .hud-glass { background: rgba(10, 10, 15, 0.65); backdrop-filter: blur(20px); border: 1px solid rgba(255, 255, 255, 0.08); }
        @keyframes slideDown { from { top: -50px; opacity: 0; } to { top: 20px; opacity: 1; } }
        
        /* PREMIUM BUTONLAR */
        .btn-primary {
          background: linear-gradient(135deg, rgba(34,197,94,0.2) 0%, rgba(21,128,61,0.5) 100%);
          border: 1px solid #4ade80;
          color: #fff;
          font-weight: 900;
          letter-spacing: 2px;
          text-transform: uppercase;
          padding: 16px 20px;
          border-radius: 12px;
          cursor: pointer;
          box-shadow: 0 4px 20px rgba(34,197,94,0.2);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          display: flex; justify-content: center; align-items: center; text-align: center;
        }
        .btn-primary:hover {
          box-shadow: 0 6px 30px rgba(34,197,94,0.4);
          transform: translateY(-2px);
          background: linear-gradient(135deg, rgba(34,197,94,0.3) 0%, rgba(21,128,61,0.7) 100%);
        }

        .btn-secondary {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.2);
          color: white;
          font-weight: 800;
          letter-spacing: 1px;
          padding: 16px 20px;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex; justify-content: center; align-items: center; text-align: center;
        }
        .btn-secondary:hover {
          background: rgba(255,255,255,0.1);
          border-color: rgba(255,255,255,0.4);
        }
        .btn-secondary.selected {
          background: rgba(251, 191, 36, 0.15); /* Theme Gold */
          border-color: #f59e0b;
          color: #fcd34d;
        }

        /* DİNAMİK 50/50 BÖLÜNME LAYOUT'U */
        .main-content {
          flex: 1; display: flex; flex-direction: column; width: 95%; max-width: 1400px; margin: 0 auto; gap: 16px; min-height: 0; padding-bottom: 16px; position: relative; z-index: 10;
        }
        
        .split-layout { display: flex; flex-direction: column; gap: 16px; flex: 1; min-height: 0; }
        .split-half { flex: 1; display: flex; flex-direction: column; gap: 16px; min-height: 0; }
        
        /* Bilgisayarda yan yana %50 %50 yap */
        @media (min-width: 900px) {
          .split-layout { flex-direction: row; }
          .split-half { width: 50%; }
        }
      `}</style>

      {/* ⚠️ MODERN UYARI BİLDİRİMİ (TOAST) */}
      {customAlert && (
        <div style={{ position: 'fixed', top: '20px', left: '50%', transform: 'translateX(-50%)', zIndex: 300, backgroundColor: 'rgba(220,38,38,0.95)', color: 'white', padding: '12px 24px', borderRadius: '30px', fontWeight: 'bold', boxShadow: '0 10px 25px rgba(220,38,38,0.5)', border: '1px solid #f87171', animation: 'slideDown 0.3s ease-out', backdropFilter: 'blur(10px)', letterSpacing: '1px' }}>
          ⚠️ {customAlert}
        </div>
      )}

      {/* Arka Plan Flu Foto */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 0, backgroundImage: `url('${currentQ.localPhotoUrl}')`, backgroundSize: 'cover', backgroundPosition: 'center', filter: 'blur(50px) brightness(20%)', transform: 'scale(1.1)', transition: 'background-image 0.5s ease' }}></div>
      <div className="vignette-overlay"></div>

      {/* Üst Bar (HUD) */}
      <div className="hud-glass" style={{ position: 'relative', zIndex: 10, width: '95%', maxWidth: '1400px', margin: '16px auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 24px', borderRadius: '16px', flexShrink: 0 }}>
        <button onClick={onBackToLobby} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', fontSize: '13px', fontWeight: '800', letterSpacing: '1px', transition: 'color 0.2s' }} onMouseOver={(e)=>e.target.style.color='white'} onMouseOut={(e)=>e.target.style.color='rgba(255,255,255,0.6)'}>← {t.back}</button>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <span style={{ fontSize: '11px', color: '#4ade80', fontWeight: '900', letterSpacing: '3px' }}>{t.round}</span>
          <div style={{ display: 'flex', gap: '6px', marginTop: '6px' }}>
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} style={{ width: '30px', height: '4px', borderRadius: '2px', backgroundColor: i <= currentRound ? '#22c55e' : 'rgba(255,255,255,0.15)', boxShadow: i <= currentRound ? '0 0 10px rgba(34,197,94,0.5)' : 'none' }}></div>
            ))}
          </div>
        </div>
        <div style={{ fontSize: '20px', fontWeight: '900', letterSpacing: '1px', display: 'flex', gap: '8px', color: '#fbbf24' }}>
          <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', alignSelf: 'center' }}>{t.scoreTitle.split(':')[0]}</span> 
          {t.scoreTitle.split(':')[1]}
        </div>
      </div>

      {/* ANA İÇERİK ALANI (Taşmayı engelleyen kapsayıcı) */}
      <div className="main-content">
        
        {!hasGuessed ? (
          // DURUM 1: TAHMİN ÖNCESİ (Büyük Fotoğraf + Alt Kontroller)
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '16px', minHeight: 0 }}>
            {/* Fotoğraf Alanı */}
            <div onClick={() => setIsZoomed(true)} style={{ flex: 1, minHeight: 0, borderRadius: '20px', overflow: 'hidden', cursor: 'pointer', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 20px 40px rgba(0,0,0,0.5)', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ position: 'absolute', inset: 0, backgroundImage: `url('${currentQ.localPhotoUrl}')`, backgroundSize: 'cover', backgroundPosition: 'center', filter: 'blur(15px) brightness(40%)', zIndex: 1 }}></div>
              <img src={currentQ.localPhotoUrl} alt={currentQ.title} style={{ position: 'relative', zIndex: 2, maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
              <div style={{ position: 'absolute', top: '16px', left: '16px', zIndex: 10, background: 'rgba(0,0,0,0.65)', border: '1px solid rgba(34,197,94,0.4)', padding: '6px 14px', borderRadius: '8px', color: '#4ade80', fontWeight: '800', fontSize: '11px', letterSpacing: '1px', backdropFilter: 'blur(5px)' }}>{currentSportLabel?.toUpperCase()}</div>
              <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: '0.2s', zIndex: 3 }} onMouseOver={(e) => e.currentTarget.style.opacity = 1} onMouseOut={(e) => e.currentTarget.style.opacity = 0}>
                <span style={{ backgroundColor: 'rgba(0,0,0,0.8)', padding: '10px 24px', borderRadius: '30px', fontWeight: '700', letterSpacing: '1px' }}>{t.zoomHint}</span>
              </div>
            </div>

            {/* Alt Kontrol Paneli */}
            <div className="hud-glass" style={{ padding: '20px 24px', borderRadius: '20px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Yıl Slider */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                  <div style={{ fontSize: '12px', fontWeight: '800', letterSpacing: '2px', color: 'rgba(255,255,255,0.6)' }}>⏳ {t.timeline}</div>
                  <div style={{ fontSize: '36px', fontWeight: '900', color: '#22c55e', textShadow: '0 0 20px rgba(34,197,94,0.4)', lineHeight: '1' }}>{year}</div>
                </div>
                <input type="range" min="1950" max="2026" value={year} onChange={(e) => setYear(Number(e.target.value))} style={{ WebkitAppearance: 'none', width: '100%', height: '6px', borderRadius: '3px', background: 'rgba(255,255,255,0.2)', outline: 'none', cursor: 'pointer' }} />
              </div>
              {/* Aksiyon Butonları */}
              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                <button onClick={() => setIsMapModalOpen(true)} className={`btn-secondary ${selectedPosition ? 'selected' : ''}`} style={{ flex: '1 1 200px' }}>
                  {selectedPosition ? t.mapSelected : t.openMap}
                </button>
                <button onClick={handleGuess} className="btn-primary" style={{ flex: '1 1 200px' }}>
                  {t.guess}
                </button>
              </div>
            </div>
          </div>
        ) : (
          // DURUM 2: TAHMİN SONRASI (50/50 SPLIT SCREEN)
          <div className="split-layout">
            
            {/* SOL YARI: FOTOĞRAF VE BİLGİ KUTUSU */}
            <div className="split-half">
              <div style={{ flex: 1, minHeight: 0, borderRadius: '20px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.5)' }}>
                <img src={currentQ.localPhotoUrl} alt="" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
              </div>
              
              <div className="hud-glass" style={{ padding: '20px', borderRadius: '20px', flexShrink: 0, border: '1px solid rgba(34,197,94,0.3)', background: 'rgba(21,128,61,0.05)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '12px', marginBottom: '12px' }}>
                  <div>
                    <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', marginBottom: '4px' }}>{t.resultDistance}: <strong style={{color:'#fff'}}>{roundResult.distance} km</strong></div>
                    <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)' }}>{t.resultYear}: <strong style={{color:'#fff'}}>{roundResult.yearDiff} Yıl <span style={{fontSize:'11px', opacity:0.6}}>(Doğru: {currentQ.year})</span></strong></div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '11px', color: '#fbbf24', letterSpacing: '1px', fontWeight: 'bold' }}>{t.resultPoints}</div>
                    <div style={{ fontSize: '24px', fontWeight: '900', color: '#f59e0b', textShadow: '0 0 15px rgba(245,158,11,0.3)' }}>+{roundResult.points}</div>
                  </div>
                </div>
                <div style={{ fontSize: '13px', lineHeight: '1.6', color: 'rgba(255,255,255,0.85)' }}>
                  <strong style={{ color: '#4ade80', display: 'block', marginBottom: '4px', letterSpacing: '1px' }}>💡 BUNU BİLİYOR MUYDUNUZ?</strong>
                  {currentTrivia}
                </div>
              </div>
            </div>

            {/* SAĞ YARI: HARİTA VE SONRAKİ RAUNT BUTONU */}
            <div className="split-half">
              <div style={{ flex: 1, minHeight: 0, borderRadius: '20px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)', position: 'relative' }}>
                <MapContainer key={`result-map-${currentRound}`} center={[currentQ.lat, currentQ.lng]} zoom={3} style={{ height: '100%', width: '100%' }} zoomControl={true}>
                  <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
                  {selectedPosition && <Marker position={selectedPosition} icon={neonIcon} />}
                  <Marker position={[currentQ.lat, currentQ.lng]} icon={targetIcon} />
                  {selectedPosition && <Polyline positions={[selectedPosition, [currentQ.lat, currentQ.lng]]} color="#ef4444" dashArray="5, 10" weight={3} />}
                </MapContainer>
              </div>
              
              <button onClick={handleNextRound} className="btn-primary" style={{ flexShrink: 0, padding: '20px', fontSize: '16px' }}>
                {currentRound < 5 ? t.next : t.finish}
              </button>
            </div>
            
          </div>
        )}
      </div>

      {/* 🗺️ HARİTA MODALI (SADECE TAHMİN YAPARKEN AÇILIR) */}
      {isMapModalOpen && !hasGuessed && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 200, backgroundColor: 'rgba(0,0,0,0.95)', backdropFilter: 'blur(10px)', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)', backgroundColor: '#050508' }}>
            <div style={{ color: '#4ade80', fontWeight: '900', letterSpacing: '2px', fontSize: '16px' }}>{t.mapTarget}</div>
            <button onClick={() => setIsMapModalOpen(false)} className="btn-secondary" style={{ padding: '8px 16px', borderRadius: '8px', fontSize: '13px' }}>✕ {t.closeMap}</button>
          </div>
          <div style={{ flex: 1, position: 'relative' }}>
            <MapContainer key={`modal-map-${currentRound}`} center={selectedPosition || [20, 0]} zoom={2} style={{ height: '100%', width: '100%' }} zoomControl={false}>
              <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
              <LocationPicker position={selectedPosition} setPosition={setSelectedPosition} hasGuessed={hasGuessed} />
            </MapContainer>
          </div>
          <div style={{ padding: '24px', borderTop: '1px solid rgba(255,255,255,0.1)', backgroundColor: '#050508' }}>
            <button onClick={() => setIsMapModalOpen(false)} className="btn-primary" style={{ width: '100%' }}>
              {t.confirmLocation}
            </button>
          </div>
        </div>
      )}

      {/* 🔍 FOTOĞRAF ZOOM MODALI */}
      {isZoomed && (
        <div onClick={() => setIsZoomed(false)} style={{ position: 'fixed', inset: 0, zIndex: 250, backgroundColor: 'rgba(0,0,0,0.95)', backdropFilter: 'blur(15px)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'zoom-out' }}>
          <img src={currentQ.localPhotoUrl} alt="Zoomed" style={{ maxWidth: '95vw', maxHeight: '95vh', objectFit: 'contain', borderRadius: '12px' }} />
          <div style={{ position: 'absolute', top: '24px', right: '32px', color: 'rgba(255,255,255,0.5)', fontSize: '40px', fontWeight: '300' }}>×</div>
        </div>
      )}
      
    </div>
  );
}