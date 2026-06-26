import React, { useState, useEffect } from 'react';

export default function Landing({ language, setLanguage, onProceed }) {
  const [localName, setLocalName] = useState('');
  const [bgIndex, setBgIndex] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false); // YENİ: Zoom animasyonunu başlatacak şalter
  const [showGuide, setShowGuide] = useState(false);

  const backgrounds = [
    "/bg_kobe.jpg", "/bg_ali.jpg", "/bg_messi.jpg", "/bg_nadal.jpg", "/bg_bolt.jpg"
  ];

  useEffect(() => {
    // Sayfa açıldıktan 50 milisaniye sonra şalteri açıyoruz ki Kobe de zoomlanarak gelsin
    setTimeout(() => setIsLoaded(true), 50);

    const timer = setInterval(() => {
      setBgIndex((prev) => (prev + 1) % backgrounds.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const t = language === 'tr' ? {
    title: "ZAMANI\nYAKALA",
    subtitle: "Spor tarihinin en ikonik anlarının yaşandığı o koordinatları bul. Zamanı tahmin et, arkadaşlarına meydan oku ve kendi efsaneni yarat.",
    playBtn: "HEMEN OYNA",
    placeholder: "Kullanıcı Adı Girin...",
    guideTitle: "Nasıl Oynanır?",
    guideSteps: ["Konumu Haritada İşaretle", "Yılı Tahmin Et", "Skorunu Paylaş"],
    guideDesc: "Fotoğraftaki efsanevi anın yaşandığı stadyumu veya şehri haritada bul. Zaman çizelgesinden olayın gerçekleştiği yılı seç. Doğru konuma ve yıla ne kadar yaklaşırsan o kadar çok puan kazanırsın!",
    badges: ["ÇOK OYUNCULU", "KÜRESEL HARİTA", "ZAMANDA YOLCULUK", "SPOR HAFIZASI"]
  } : {
    title: "FREEZE\nTHE TIME",
    subtitle: "Find the exact coordinates where the most iconic moments in sports history took place. Guess the time, challenge your friends, and create your own legend.",
    playBtn: "PLAY NOW",
    placeholder: "Enter Username...",
    guideTitle: "How to Play?",
    guideSteps: ["Pinpoint the Location", "Guess the Year", "Share Your Score"],
    guideDesc: "Locate the stadium or city on the map where the legendary moment happened. Select the year from the timeline. The closer you are, the higher your score!",
    badges: ["MULTIPLAYER", "GLOBAL MAP", "TIME TRAVEL", "SPORTS MEMORY"]
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100vh', backgroundColor: 'black', overflow: 'hidden', fontFamily: 'system-ui, sans-serif', color: 'white' }}>
      
      {backgrounds.map((bg, index) => (
        <img 
          key={index} 
          src={bg} 
          alt="bg" 
          style={{ 
            position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', 
            opacity: index === bgIndex ? 0.8 : 0, 
            // YENİ: isLoaded şalteri açık değilse Kobe de büyük (scale 1.1) bekliyor, açılınca animasyon başlıyor.
            transform: (index === bgIndex && isLoaded) ? 'scale(1)' : 'scale(1.1)', 
            transition: 'opacity 1.5s ease-in-out, transform 8s linear' 
          }} 
        />
      ))}
      <div className="neon-flow" style={{ zIndex: 20 }}></div>
      <div className="vignette" style={{ zIndex: 30 }}></div>

      <div style={{ position: 'relative', zIndex: 50, display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between', paddingBottom: '48px' }}>
        
        {/* HEADER: NASIL OYNANIR (SOL) + BAYRAKLAR (SAĞ) */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px 40px' }}>
          <div onClick={() => setShowGuide(true)} style={{ cursor: 'pointer', fontWeight: 'bold', fontSize: '15px', display: 'flex', alignItems: 'center', gap: '8px', color: 'rgba(255,255,255,0.7)', transition: '0.2s', padding: '10px 20px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.2)' }}>
            ℹ️ <span style={{ textDecoration: 'underline' }}>{t.guideTitle}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <span onClick={() => setLanguage('tr')} style={{ cursor: 'pointer', fontWeight: 'bold', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: language === 'tr' ? 'white' : 'rgba(255,255,255,0.5)' }}>
              <img src="https://flagcdn.com/w40/tr.png" width="24" alt="TR" style={{ borderRadius: '2px', filter: language === 'tr' ? 'none' : 'grayscale(100%) opacity(50%)' }} /> TR
            </span>
            <span onClick={() => setLanguage('en')} style={{ cursor: 'pointer', fontWeight: 'bold', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: language === 'en' ? 'white' : 'rgba(255,255,255,0.5)' }}>
              <img src="https://flagcdn.com/w40/gb.png" width="24" alt="EN" style={{ borderRadius: '2px', filter: language === 'en' ? 'none' : 'grayscale(100%) opacity(50%)' }} /> EN
            </span>
          </div>
        </div>

        {/* ORTA KISIM */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', transform: 'translateY(-5vh)' }}>
          <h1 style={{ fontSize: '6.5rem', fontWeight: '900', fontStyle: 'italic', margin: 0, lineHeight: '0.9', letterSpacing: '-2px', textShadow: '0 10px 30px rgba(0,0,0,0.8)' }}>
            {t.title.split('\n').map((line, i) => <div key={i}>{line}</div>)}
          </h1>
          <p style={{ color: '#e2e8f0', fontSize: '1.25rem', maxWidth: '650px', marginTop: '24px', fontWeight: '500' }}>{t.subtitle}</p>
        </div>

        {/* ROZETLER VE BUTON */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '40px', marginBottom: '40px', borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: '32px', justifyContent: 'center' }}>
            {t.badges.map((b, i) => (
              <div key={i} style={{ textAlign: 'center' }}><div style={{ fontSize: '24px', marginBottom: '8px' }}>{['⚔️','🌍','⏳','🧠'][i]}</div><div style={{ fontSize: '11px', fontWeight: 'bold', color: 'rgba(255,255,255,0.7)' }}>{b}</div></div>
            ))}
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <input type="text" placeholder={t.placeholder} value={localName} onChange={(e) => setLocalName(e.target.value)} style={{ width: '280px', padding: '16px 24px', backgroundColor: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '30px', color: 'white', textAlign: 'center', backdropFilter: 'blur(10px)' }} />
            <button onClick={() => { if(localName.trim()) onProceed(localName); else alert(language === 'tr' ? 'Lütfen bir isim girin!' : 'Please enter a name!'); }} style={{ background: 'linear-gradient(180deg, #22c55e 0%, #15803d 100%)', color: 'white', fontSize: '1.5rem', fontWeight: '900', padding: '22px 100px', borderRadius: '60px', border: '1px solid #4ade80', cursor: 'pointer', boxShadow: '0 10px 30px rgba(21, 128, 61, 0.6)' }}>{t.playBtn}</button>
          </div>
        </div>
      </div>

      {/* NASIL OYNANIR MODAL */}
      {showGuide && (
        <div onClick={() => setShowGuide(false)} style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)', zIndex: 100, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div onClick={(e) => e.stopPropagation()} style={{ backgroundColor: '#1a1a1a', padding: '40px', borderRadius: '20px', maxWidth: '400px', border: '1px solid #333' }}>
            <h2 style={{ fontSize: '24px', marginBottom: '20px' }}>{t.guideTitle}</h2>
            <p style={{ color: '#ccc', lineHeight: '1.6', marginBottom: '20px' }}>{t.guideDesc}</p>
            <button onClick={() => setShowGuide(false)} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: 'none', background: '#333', color: 'white', cursor: 'pointer' }}>Tamam</button>
          </div>
        </div>
      )}
    </div>
  );
}