import React, { useState, useEffect } from 'react';

export default function Lobby({ 
  playerName, 
  language, 
  onSinglePlayer, 
  onCreateRoom, 
  onJoinRoom, 
  roomCode, 
  roomData, 
  isHost, 
  onStartGame, 
  onBack 
}) {
  const [joinCodeInput, setJoinCodeInput] = useState('');
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);

  const t = language === 'tr' ? {
    welcomeTitle: "LOBİYE HOŞ GELDİN",
    welcomeSub: `${playerName}, kendi efsaneni yaratmaya hazır mısın?`,
    cards: {
      solo: { title: "Tek Oyunculu", desc: "Tarihi anlarda dünya turuna çık, kendi skorunu ve hafızanı test et." },
      host: { title: "Oda Kur", desc: "Arkadaşlarını davet et, özel bir arena yarat ve rekabeti başlat." },
      join: { title: "Odaya Katıl", desc: "Arkadaşının oluşturduğu arenaya dahil olmak için kodu gir." }
    },
    codePlaceholder: "KOD...",
    roomCodeTitle: "GİZLİ ODA KODU",
    players: "LOBİDEKİ OYUNCULAR",
    you: "(Sen)",
    startGame: "OYUNU BAŞLAT 🚀",
    waiting: "Kurucunun maçı başlatması bekleniyor...",
    selectMode: "ARENAYI SEÇ",
    modeDesc: "Hangi modda kapışmak istiyorsun?",
    modes: {
      mixed: { title: "Dünya Turu (Karışık)", desc: "Tüm branşlar. En dengeli arena." },
      football: { title: "Sadece Futbol", desc: "Yeşil sahaların unutulmaz anları." },
      basketball: { title: "Sadece Basketbol", desc: "Parkenin efsaneleri ve son saniye şutları." },
      mainstream: { title: "Ana Akım Sporlar", desc: "Sadece Futbol, Basketbol ve Tenis." }
    },
    back: "← Geri Dön"
  } : {
    welcomeTitle: "WELCOME TO THE LOBBY",
    welcomeSub: `${playerName}, are you ready to create your own legend?`,
    cards: {
      solo: { title: "Single Player", desc: "Travel through historic moments, test your memory and set a high score." },
      host: { title: "Host Room", desc: "Invite your friends, create a private arena and start the rivalry." },
      join: { title: "Join Room", desc: "Enter the code to join an arena created by your friend." }
    },
    codePlaceholder: "CODE...",
    roomCodeTitle: "SECRET ROOM CODE",
    players: "PLAYERS IN LOBBY",
    you: "(You)",
    startGame: "START GAME 🚀",
    waiting: "Waiting for host to start the match...",
    selectMode: "SELECT ARENA",
    modeDesc: "Which mode do you want to compete in?",
    modes: {
      mixed: { title: "World Tour (Mixed)", desc: "All sports. The most balanced arena." },
      football: { title: "Football Only", desc: "Unforgettable moments from the pitch." },
      basketball: { title: "Basketball Only", desc: "Hardwood legends and buzzer beaters." },
      mainstream: { title: "Mainstream", desc: "Only Football, Basketball, and Tennis." }
    },
    back: "← Go Back"
  };

  const handleActionClick = (action) => {
    setPendingAction(action);
    setShowCategoryModal(true);
  };

  const handleModeSelect = (category) => {
    setShowCategoryModal(false);
    if (pendingAction === 'single') onSinglePlayer(category);
    if (pendingAction === 'multi') onCreateRoom(category);
  };

  return (
    <div style={{ position: 'relative', width: '100%', minHeight: '100vh', backgroundColor: '#050508', overflow: 'hidden', color: 'white', fontFamily: 'system-ui, -apple-system, sans-serif', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      
      {/* CSS ANIMASYONLARI İÇİN DAHİLİ STİL */}
      <style>{`
        .bg-cinema {
          position: absolute; inset: 0;
          background: radial-gradient(circle at center, #1a1a24 0%, #050508 100%);
          z-index: 1;
        }
        .neon-grid {
          position: absolute; inset: 0;
          background: radial-gradient(circle at 50% 0%, rgba(34, 197, 94, 0.15) 0%, transparent 60%);
          z-index: 2; pointer-events: none;
        }
        .action-card {
          position: relative; width: 340px; height: 220px;
          border-radius: 20px; overflow: hidden; cursor: pointer;
          box-shadow: 0 15px 35px rgba(0,0,0,0.5);
          border: 1px solid rgba(255, 255, 255, 0.1);
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
          background-color: white;
        }
        .card-bg {
          position: absolute; inset: 0; width: 100%; height: 100%;
          background-size: cover; background-position: top center; background-repeat: no-repeat;
          transition: transform 0.6s ease;
        }
        .action-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 25px 50px rgba(0,0,0,0.7), 0 0 20px rgba(34, 197, 94, 0.2);
          border-color: rgba(255, 255, 255, 0.3);
        }
        .action-card:hover .card-bg {
          transform: scale(1.05);
        }
        .card-gradient {
          position: absolute; inset: 0;
          background: linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.6) 40%, transparent 100%);
        }
        .card-content {
          position: absolute; bottom: 0; left: 0; width: 100%;
          padding: 24px; box-sizing: border-box;
          display: flex; flex-direction: column; justify-content: flex-end;
        }
        .join-input-group {
          display: flex; gap: 8px; margin-top: 12px;
          opacity: 0; transform: translateY(10px); transition: all 0.3s;
        }
        .action-card.join-card:hover .join-input-group {
          opacity: 1; transform: translateY(0);
        }
        .join-input {
          flex: 1; background: rgba(255,255,255,0.15); border: 1px solid rgba(255,255,255,0.3);
          padding: 10px 12px; border-radius: 8px; color: white; outline: none;
          font-family: inherit; font-size: 14px; text-transform: uppercase; letter-spacing: 2px;
          backdrop-filter: blur(5px);
        }
        .join-input::placeholder { color: rgba(255,255,255,0.5); letter-spacing: normal; }
        .join-btn {
          background: white; color: black; border: none; padding: 0 16px;
          border-radius: 8px; font-weight: 800; cursor: pointer; transition: 0.2s;
        }
        .join-btn:hover { background: #22c55e; color: white; }
      `}</style>

      {/* ARKA PLAN KATMANLARI */}
      <div className="bg-cinema"></div>
      <div className="neon-grid"></div>

      <div style={{ position: 'relative', zIndex: 10, width: '100%', maxWidth: '1100px', padding: '20px' }}>
        
        {!roomCode ? (
          // --- KARTLI SEÇİM EKRANI ---
          <>
            {/* YENİ EKLENEN PREMİUM GERİ DÖN BUTONU */}
            <button 
              onClick={onBack}
              style={{
                position: 'absolute',
                top: '0px',
                left: '20px',
                background: 'rgba(20, 20, 25, 0.6)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                color: 'rgba(255, 255, 255, 0.6)',
                padding: '12px 24px',
                borderRadius: '12px',
                fontSize: '13px',
                fontWeight: '800',
                letterSpacing: '2px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                zIndex: 100,
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                e.currentTarget.style.color = '#fff';
                e.currentTarget.style.transform = 'translateX(-6px)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                e.currentTarget.children[0].style.transform = 'translateX(-4px)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = 'rgba(20, 20, 25, 0.6)';
                e.currentTarget.style.color = 'rgba(255, 255, 255, 0.6)';
                e.currentTarget.style.transform = 'translateX(0)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                e.currentTarget.children[0].style.transform = 'translateX(0)';
              }}
            >
              <span style={{ fontSize: '18px', transition: 'transform 0.3s ease' }}>←</span> 
              {language === 'tr' ? 'GERİ DÖN' : 'GO BACK'}
            </button>

            <div style={{ textAlign: 'center', marginBottom: '60px', marginTop: '40px' }}>
              <h1 style={{ fontSize: '36px', fontWeight: '900', letterSpacing: '2px', margin: 0, textShadow: '0 10px 20px rgba(0,0,0,0.5)' }}>{t.welcomeTitle}</h1>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '16px', marginTop: '8px' }}>{t.welcomeSub}</p>
            </div>

            <div style={{ display: 'flex', gap: '24px', justifyContent: 'center', flexWrap: 'wrap' }}>
              
              {/* KART 1: TEK OYUNCULU */}
              <div className="action-card" onClick={() => handleActionClick('single')}>
                <div className="card-bg" style={{ backgroundImage: "url('/solo.png')" }}></div>
                <div className="card-gradient"></div>
                <div className="card-content">
                  <h2 style={{ fontSize: '24px', fontWeight: '800', margin: '0 0 6px 0', letterSpacing: '0.5px' }}>{t.cards.solo.title}</h2>
                  <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)', margin: 0, lineHeight: '1.4', fontWeight: '500' }}>{t.cards.solo.desc}</p>
                </div>
              </div>

              {/* KART 2: ODA KUR */}
              <div className="action-card" onClick={() => handleActionClick('multi')}>
                <div className="card-bg" style={{ backgroundImage: "url('/versus.png')", backgroundPosition: 'center 20%' }}></div>
                <div className="card-gradient"></div>
                <div className="card-content">
                  <h2 style={{ fontSize: '24px', fontWeight: '800', margin: '0 0 6px 0', letterSpacing: '0.5px', color: '#4ade80' }}>{t.cards.host.title}</h2>
                  <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)', margin: 0, lineHeight: '1.4', fontWeight: '500' }}>{t.cards.host.desc}</p>
                </div>
              </div>

              {/* KART 3: ODAYA KATIL */}
              <div className="action-card join-card">
                <div className="card-bg" style={{ backgroundImage: "url('/join.png')" }}></div>
                <div className="card-gradient"></div>
                <div className="card-content">
                  <h2 style={{ fontSize: '24px', fontWeight: '800', margin: '0 0 6px 0', letterSpacing: '0.5px' }}>{t.cards.join.title}</h2>
                  <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)', margin: 0, lineHeight: '1.4', fontWeight: '500' }}>{t.cards.join.desc}</p>
                  
                  <div className="join-input-group" onClick={(e) => e.stopPropagation()}>
                    <input 
                      type="text" 
                      className="join-input" 
                      placeholder={t.codePlaceholder} 
                      value={joinCodeInput}
                      onChange={(e) => setJoinCodeInput(e.target.value.toUpperCase())}
                      maxLength={4}
                    />
                    <button className="join-btn" onClick={() => onJoinRoom(joinCodeInput)}>→</button>
                  </div>
                </div>
              </div>

            </div>
          </>
        ) : (
          // --- BEKLEME SALONU (MULTIPLAYER) ---
          <div style={{ width: '100%', maxWidth: '480px', margin: '0 auto', backgroundColor: 'rgba(15, 15, 20, 0.6)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '24px', padding: '40px', backdropFilter: 'blur(24px)', boxShadow: '0 0 40px rgba(0,0,0,0.8)' }}>
            <button onClick={onBack} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: '20px', marginBottom: '20px' }}>←</button>
            
            <h2 style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', margin: '0 0 8px 0', fontWeight: '800', textTransform: 'uppercase', textAlign: 'center', letterSpacing: '3px' }}>{t.roomCodeTitle}</h2>
            <div style={{ fontSize: '64px', fontWeight: '900', letterSpacing: '12px', color: '#22c55e', textAlign: 'center', marginBottom: '32px', textShadow: '0 0 30px rgba(34,197,94,0.5)' }}>
              {roomCode}
            </div>
            
            <div style={{ backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: '16px', padding: '24px', marginBottom: '32px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <h3 style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', margin: '0 0 20px 0', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '2px' }}>{t.players}</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {roomData?.players && Object.keys(roomData.players).map((p, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'white', fontSize: '17px', fontWeight: '700' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: p === roomData.host ? '#22c55e' : '#3b82f6', boxShadow: `0 0 15px ${p === roomData.host ? '#22c55e' : '#3b82f6'}` }}></div>
                      {p} {p === playerName && <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '14px', fontWeight: '500' }}>{t.you}</span>}
                    </div>
                    {p === roomData.host && <span style={{ fontSize: '10px', backgroundColor: 'rgba(34,197,94,0.15)', color: '#4ade80', padding: '6px 10px', borderRadius: '6px', fontWeight: '900', letterSpacing: '1px' }}>HOST</span>}
                  </div>
                ))}
              </div>
            </div>

            {isHost ? (
              <button onClick={onStartGame} style={{ width: '100%', padding: '20px', fontSize: '16px', fontWeight: '900', background: 'linear-gradient(180deg, #22c55e 0%, #15803d 100%)', color: 'white', border: '1px solid #4ade80', borderRadius: '14px', cursor: 'pointer', boxShadow: '0 10px 25px rgba(21, 128, 61, 0.4)', letterSpacing: '1px' }}>
                {t.startGame}
              </button>
            ) : (
              <div style={{ padding: '20px', textAlign: 'center', color: 'rgba(255,255,255,0.6)', fontSize: '14px', fontWeight: '700', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: '14px', border: '1px dashed rgba(255,255,255,0.1)' }}>
                ⏳ {t.waiting}
              </div>
            )}
          </div>
        )}
      </div>

      {/* KATEGORİ SEÇİM MODALI */}
      {showCategoryModal && (
        <div onClick={() => setShowCategoryModal(false)} style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(15px)', zIndex: 100, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
          <div onClick={(e) => e.stopPropagation()} style={{ backgroundColor: '#0f0f13', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '24px', padding: '40px', width: '100%', maxWidth: '500px', boxShadow: '0 25px 50px rgba(0,0,0,0.5)' }}>
            <h2 style={{ fontSize: '26px', fontWeight: '900', margin: '0 0 8px 0', letterSpacing: '1px' }}>{t.selectMode}</h2>
            <p style={{ color: 'rgba(255,255,255,0.5)', margin: '0 0 32px 0', fontSize: '15px', fontWeight: '500' }}>{t.modeDesc}</p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <button onClick={() => handleModeSelect('mixed')} style={{ display: 'flex', alignItems: 'center', gap: '20px', padding: '20px', backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', cursor: 'pointer', textAlign: 'left', transition: 'transform 0.2s' }}>
                <div style={{ fontSize: '36px' }}>🌍</div>
                <div>
                  <h3 style={{ margin: '0 0 6px 0', fontSize: '17px', fontWeight: '800', color: 'white' }}>{t.modes.mixed.title}</h3>
                  <p style={{ margin: 0, fontSize: '13px', color: 'rgba(255,255,255,0.4)', fontWeight: '500' }}>{t.modes.mixed.desc}</p>
                </div>
              </button>

              <button onClick={() => handleModeSelect('football')} style={{ display: 'flex', alignItems: 'center', gap: '20px', padding: '20px', backgroundColor: 'rgba(34, 197, 94, 0.05)', border: '1px solid rgba(34, 197, 94, 0.3)', borderRadius: '16px', cursor: 'pointer', textAlign: 'left' }}>
                <div style={{ fontSize: '36px' }}>⚽</div>
                <div>
                  <h3 style={{ margin: '0 0 6px 0', fontSize: '17px', fontWeight: '800', color: '#4ade80' }}>{t.modes.football.title}</h3>
                  <p style={{ margin: 0, fontSize: '13px', color: 'rgba(255,255,255,0.4)', fontWeight: '500' }}>{t.modes.football.desc}</p>
                </div>
              </button>

              <button onClick={() => handleModeSelect('basketball')} style={{ display: 'flex', alignItems: 'center', gap: '20px', padding: '20px', backgroundColor: 'rgba(245, 158, 11, 0.05)', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '16px', cursor: 'pointer', textAlign: 'left' }}>
                <div style={{ fontSize: '36px' }}>🏀</div>
                <div>
                  <h3 style={{ margin: '0 0 6px 0', fontSize: '17px', fontWeight: '800', color: '#fbbf24' }}>{t.modes.basketball.title}</h3>
                  <p style={{ margin: 0, fontSize: '13px', color: 'rgba(255,255,255,0.4)', fontWeight: '500' }}>{t.modes.basketball.desc}</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}