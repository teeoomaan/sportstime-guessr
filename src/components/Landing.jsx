import React, { useState, useEffect } from 'react';

export default function Landing({ language, setLanguage, onGoogleLogin, onGuestLogin }) {
  const [localName, setLocalName] = useState('');
  const [bgIndex, setBgIndex] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [showGuestInput, setShowGuestInput] = useState(false); // YENİ: Misafir inputunu açıp kapatan şalter

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
    badges: ["ÇOK OYUNCULU", "KÜRESEL HARİTA", "ZAMANDA YOLCULUK", "SPOR HAFIZASI"],
    googleBtn: "GOOGLE İLE GİRİŞ YAP",
    guestBtn: "MİSAFİR OLARAK GİR",
    cancelBtn: "İptal"
  } : {
    title: "FREEZE\nTHE TIME",
    subtitle: "Find the exact coordinates where the most iconic moments in sports history took place. Guess the time, challenge your friends, and create your own legend.",
    playBtn: "PLAY NOW",
    placeholder: "Enter Username...",
    guideTitle: "How to Play?",
    guideSteps: ["Pinpoint the Location", "Guess the Year", "Share Your Score"],
    guideDesc: "Locate the stadium or city on the map where the legendary moment happened. Select the year from the timeline. The closer you are, the higher your score!",
    badges: ["MULTIPLAYER", "GLOBAL MAP", "TIME TRAVEL", "SPORTS MEMORY"],
    googleBtn: "SIGN IN WITH GOOGLE",
    guestBtn: "PLAY AS GUEST",
    cancelBtn: "Cancel"
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
            transform: (index === bgIndex && isLoaded) ? 'scale(1)' : 'scale(1.1)', 
            transition: 'opacity 1.5s ease-in-out, transform 8s linear' 
          }} 
        />
      ))}
      <div className="neon-flow" style={{ zIndex: 20 }}></div>
      <div className="vignette" style={{ zIndex: 30 }}></div>

      <div style={{ position: 'relative', zIndex: 50, display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between', paddingBottom: '48px' }}>
        
        {/* HEADER: LOGO + NASIL OYNANIR (SOL) + BAYRAKLAR (SAĞ) */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px 40px' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            {/* YENİ: SOL ÜST LOGO */}
            <img src="/logo.png" alt="Courtdinates Logo" style={{ height: '45px', filter: 'drop-shadow(0 0 10px rgba(239,68,68,0.5))' }} />
            
            <div onClick={() => setShowGuide(true)} style={{ cursor: 'pointer', fontWeight: 'bold', fontSize: '15px', display: 'flex', alignItems: 'center', gap: '8px', color: 'rgba(255,255,255,0.7)', transition: '0.2s', padding: '10px 20px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.2)' }}>
              ℹ️ <span style={{ textDecoration: 'underline' }}>{t.guideTitle}</span>
            </div>
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

        {/* ROZETLER VE BUTONLAR */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '40px', marginBottom: '40px', borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: '32px', justifyContent: 'center' }}>
            {t.badges.map((b, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '24px', marginBottom: '8px' }}>{['⚔️','🌍','⏳','🧠'][i]}</div>
                <div style={{ fontSize: '11px', fontWeight: 'bold', color: 'rgba(255,255,255,0.7)' }}>{b}</div>
              </div>
            ))}
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center', width: '100%', maxWidth: '350px' }}>
            
            {!showGuestInput ? (
              <>
                {/* YENİ: GOOGLE BUTONU */}
                <button onClick={onGoogleLogin} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', width: '100%', background: 'white', color: 'black', fontSize: '15px', fontWeight: '900', padding: '16px', borderRadius: '40px', cursor: 'pointer', border: 'none', boxShadow: '0 5px 20px rgba(255,255,255,0.2)' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.56 12.25C22.56 11.47 22.49 10.72 22.36 10H12V14.26H17.92C17.67 15.63 16.89 16.79 15.72 17.57V20.34H19.28C21.36 18.42 22.56 15.6 22.56 12.25Z" fill="#4285F4"/>
                    <path d="M12 23C14.97 23 17.46 22.02 19.28 20.34L15.72 17.57C14.73 18.23 13.48 18.64 12 18.64C9.13 18.64 6.7 16.7 5.84 14.09H2.17V16.94C3.98 20.53 7.69 23 12 23Z" fill="#34A853"/>
                    <path d="M5.84 14.09C5.62 13.43 5.49 12.73 5.49 12C5.49 11.27 5.62 10.57 5.84 9.91V7.06H2.17C1.43 8.55 1 10.22 1 12C1 13.78 1.43 15.45 2.17 16.94L5.84 14.09Z" fill="#FBBC05"/>
                    <path d="M12 5.36C13.62 5.36 15.07 5.92 16.21 7.01L19.36 3.86C17.45 2.08 14.97 1 12 1C7.69 1 3.98 3.47 2.17 7.06L5.84 9.91C6.7 7.3 9.13 5.36 12 5.36Z" fill="#EA4335"/>
                  </svg>
                  {t.googleBtn}
                </button>
                
                {/* YENİ: MİSAFİR GİRİŞ BUTONU */}
                <button onClick={() => setShowGuestInput(true)} style={{ width: '100%', background: 'rgba(255,255,255,0.05)', color: 'white', fontSize: '13px', fontWeight: 'bold', padding: '16px', borderRadius: '40px', cursor: 'pointer', border: '1px solid rgba(255,255,255,0.2)', backdropFilter: 'blur(5px)' }}>
                  {t.guestBtn}
                </button>
              </>
            ) : (
              /* YENİ: MİSAFİR İSİM ALANI VE BUTONLARI (Eski tasarımın yapısına uygun) */
              <>
                <input type="text" placeholder={t.placeholder} value={localName} onChange={(e) => setLocalName(e.target.value)} onKeyDown={(e) => { if(e.key === 'Enter' && localName.trim()) onGuestLogin(localName); }} style={{ width: '100%', padding: '16px 24px', backgroundColor: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '30px', color: 'white', textAlign: 'center', backdropFilter: 'blur(10px)', boxSizing: 'border-box' }} />
                
                <div style={{ display: 'flex', gap: '12px', width: '100%' }}>
                  <button onClick={() => setShowGuestInput(false)} style={{ flex: 1, background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: 'white', fontWeight: 'bold', borderRadius: '30px', cursor: 'pointer' }}>
                    {t.cancelBtn}
                  </button>
                  <button onClick={() => { if(localName.trim()) onGuestLogin(localName); else alert(language === 'tr' ? 'Lütfen bir isim girin!' : 'Please enter a name!'); }} style={{ flex: 2, background: 'linear-gradient(180deg, #22c55e 0%, #15803d 100%)', color: 'white', fontSize: '1rem', fontWeight: '900', padding: '16px', borderRadius: '30px', border: '1px solid #4ade80', cursor: 'pointer', boxShadow: '0 5px 20px rgba(21, 128, 61, 0.4)' }}>
                    {t.playBtn}
                  </button>
                </div>
              </>
            )}

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