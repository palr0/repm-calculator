import { useState, useEffect, useRef } from 'react';
import Head from 'next/head';

// 보스 데이터
const bossData = {
  teragon: {
    name: "테라곤",
    normal: {
      title: "대지의 지배자, 테라곤 (노말)",
      hp: 880000,
      time: 600
    },
    hard: {
      title: "월광의 찬탈자, 테라곤 (하드)",
      hp: 2500000,
      time: 600
    }
  },
  exonia: {
    name: "엑소니아",
    normal: {
      title: "이계의 침략자, 엑소니아 (노말)",
      hp: 3500000,
      time: 900
    },
    hard: {
      title: "광륜의 초월자, 엑소니아 (하드)",
      hp: 7600000,
      time: 900
    }
  },
  volterion: {
    name: "볼테리온",
    normal: {
      title: "볼테리온 (노말)",
      hp: 0,
      time: 0
    },
    hard: {
      title: "볼테리온 (하드)",
      hp: 0,
      time: 0
    }
  },
  hydra: {
    name: "하이드라",
    normal: {
      title: "하이드라 (노말)",
      hp: 0,
      time: 0
    },
    hard: {
      title: "하이드라 (하드)",
      hp: 0,
      time: 0
    }
  }
};

export default function Home({ initialWeapons }) {
  // 상태 관리
  const [weapons, setWeapons] = useState(Array(9).fill(null));
  const [searchTerms, setSearchTerms] = useState(Array(9).fill(''));
  const [filteredWeapons, setFilteredWeapons] = useState(Array(9).fill([]));
  const [damageValues, setDamageValues] = useState({
  dps: 0, // 추가
  oneMinute: 0,
  threeMinutes: 0,
  fiveMinutes: 0,
  fifteenMinutes: 0
});
  const [selectedWeaponDetail, setSelectedWeaponDetail] = useState(null);
  const [weaponDatabase, setWeaponDatabase] = useState(initialWeapons);
  const [focusedIndex, setFocusedIndex] = useState(null);
  const [isComplete, setIsComplete] = useState(Array(9).fill(false));
  const [weaponImages, setWeaponImages] = useState(Array(9).fill(null));
  const [selectedBoss, setSelectedBoss] = useState(null);
  const [bossMode, setBossMode] = useState(null);
  const [bossInfo, setBossInfo] = useState(null);
  const inputRefs = useRef(Array(9).fill(null));
  const dropdownRefs = useRef(Array(9).fill(null));

  // 보스 버튼 클릭 핸들러
  const handleBossClick = (bossKey) => {
    setSelectedBoss(bossKey);
    setBossMode(null);
    setBossInfo(null);
  };

  // 보스 모드 선택 핸들러
  const handleBossModeSelect = (mode) => {
  if (!selectedBoss) return;
  
  const boss = bossData[selectedBoss][mode];
  setBossInfo({
    ...boss,
    name: bossData[selectedBoss].name,
    key: selectedBoss,
    mode: mode,
    timeToKill: 0,          // 초기값 추가
    remainingTimePercent: 0  // 초기값 추가
  });
};

  // 보스 체력 계산 useEffect 수정
useEffect(() => {
  if (bossInfo && bossInfo.hp > 0 && damageValues.oneMinute > 0) {
    try {
      const timeToKill = (bossInfo.hp / damageValues.oneMinute) * 60; // 초 단위로 변환
      const remainingTimePercent = ((bossInfo.time - timeToKill) / bossInfo.time) * 100;
      
      setBossInfo(prev => ({
        ...prev,
        timeToKill: timeToKill > 0 ? timeToKill : 0,
        remainingTimePercent: remainingTimePercent > 0 ? remainingTimePercent : 0
      }));
    } catch (error) {
      console.error("보스 체력 계산 중 오류 발생:", error);
      setBossInfo(prev => ({
        ...prev,
        timeToKill: 0,
        remainingTimePercent: 0
      }));
    }
  }
}, [damageValues.oneMinute, bossInfo]);


  // 로고 클릭 핸들러 - 새로고침 및 초기화 (글자만 클릭 가능하도록 변경)
  const handleLogoClick = () => {
    if (confirm('모든 입력을 초기화하고 페이지를 새로고침하시겠습니까?')) {
      setWeapons(Array(9).fill(null));
      setSearchTerms(Array(9).fill(''));
      setFilteredWeapons(Array(9).fill([]));
      setDamageValues({
        oneMinute: 0,
        threeMinutes: 0,
        fiveMinutes: 0,
        fifteenMinutes: 0
      });
      setSelectedWeaponDetail(null);
      setIsComplete(Array(9).fill(false));
      setWeaponImages(Array(9).fill(null));
      window.location.reload();
    }
  };

  // 무기 이미지 가져오기 함수 (weaponsData에 있는 이미지 링크 사용)
  const fetchWeaponImage = (weaponName, index) => {
    if (!weaponName) return;
    
    // weaponsData에서 해당 무기 찾기
    const weapon = weaponDatabase.find(w => w.name === weaponName);
    if (!weapon || !weapon.imageUrl) {
      const newImages = [...weaponImages];
      newImages[index] = null;
      setWeaponImages(newImages);
      return;
    }
    
    // 이미지 URL이 있는 경우 설정
    const newImages = [...weaponImages];
    newImages[index] = weapon.imageUrl;
    setWeaponImages(newImages);
  };

  // 검색어 변경 핸들러
  const handleSearchChange = (index, value) => {
    const newTerms = [...searchTerms];
    newTerms[index] = value;
    setSearchTerms(newTerms);

    const newComplete = [...isComplete];
    newComplete[index] = false;
    setIsComplete(newComplete);

    if (value === '') {
      const newFiltered = [...filteredWeapons];
      newFiltered[index] = [];
      setFilteredWeapons(newFiltered);
      return;
    }

    // 이름과 설명 모두에서 검색
  const suggestions = weaponDatabase.filter(weapon => 
    weapon.name.toLowerCase().includes(value.toLowerCase()) ||
    (weapon.description && weapon.description.toLowerCase().includes(value.toLowerCase()))
  );

    const newFiltered = [...filteredWeapons];
    newFiltered[index] = suggestions;
    setFilteredWeapons(newFiltered);
  };

  // 포커스 핸들러
  const handleInputFocus = (index) => {
    setFocusedIndex(index);
  };

  // 무기 선택 핸들러
  const handleWeaponSelect = (index, weapon) => {
    const newWeapons = [...weapons];
    newWeapons[index] = weapon;
    setWeapons(newWeapons);
    setFocusedIndex(null);
    setSelectedWeaponDetail(weapon);
    
    const newTerms = [...searchTerms];
    newTerms[index] = weapon.name;
    setSearchTerms(newTerms);

    const newComplete = [...isComplete];
    newComplete[index] = true;
    setIsComplete(newComplete);

    // 무기 이미지 가져오기
    fetchWeaponImage(weapon.name, index);
  };

  // 키보드 이벤트 핸들러
  const handleKeyDown = (index, event) => {
    if (event.key === 'Escape') {
      setFocusedIndex(null);
      return;
    }

    if (event.key === 'Enter' && focusedIndex === index && filteredWeapons[index]?.length > 0) {
      handleWeaponSelect(index, filteredWeapons[index][0]);
      return;
    }

    if ((event.key === 'Backspace' || event.key === 'Delete') && isComplete[index]) {
      const newWeapons = [...weapons];
      newWeapons[index] = null;
      setWeapons(newWeapons);
      
      const newTerms = [...searchTerms];
      newTerms[index] = '';
      setSearchTerms(newTerms);
      
      const newComplete = [...isComplete];
      newComplete[index] = false;
      setIsComplete(newComplete);
      
      const newImages = [...weaponImages];
      newImages[index] = null;
      setWeaponImages(newImages);
      
      inputRefs.current[index]?.focus();
      return;
    }

    if (focusedIndex === index && !isComplete[index] && 
        (event.key === 'ArrowDown' || event.key === 'ArrowUp')) {
      event.preventDefault();
      
      const items = dropdownRefs.current[index]?.querySelectorAll('.weapon-item');
      if (!items || items.length === 0) return;
      
      const currentActive = dropdownRefs.current[index]?.querySelector('.active');
      let nextIndex = 0;
      
      if (event.key === 'ArrowDown') {
        nextIndex = currentActive ? 
          (Array.from(items).indexOf(currentActive) + 1) % items.length : 0;
      } else {
        nextIndex = currentActive ? 
          (Array.from(items).indexOf(currentActive) - 1) : items.length - 1;
        if (nextIndex < 0) nextIndex = items.length - 1;
      }
      
      items.forEach(item => item.classList.remove('active'));
      items[nextIndex].classList.add('active');
      items[nextIndex].scrollIntoView({ block: 'nearest' });
    }

    if (event.key === 'Enter' && focusedIndex === index && !isComplete[index]) {
      const activeItem = dropdownRefs.current[index]?.querySelector('.weapon-item.active');
      if (activeItem) {
        const selectedIndex = Array.from(
          dropdownRefs.current[index]?.querySelectorAll('.weapon-item') || []
        ).indexOf(activeItem);
        
        if (selectedIndex >= 0 && filteredWeapons[index]?.[selectedIndex]) {
          handleWeaponSelect(index, filteredWeapons[index][selectedIndex]);
        }
      }
    }
  };

  // 데미지 계산
  useEffect(() => {
  let totalDpm = 0;
  weapons.forEach(weapon => {
    if (weapon) {
      totalDpm += (60 / weapon.cooldown) * weapon.damage;
    }
  });

  setDamageValues({
    dps: Math.round(totalDpm / 60), // DPS 계산 추가
    oneMinute: Math.round(totalDpm),
    threeMinutes: Math.round(totalDpm * 3),
    fiveMinutes: Math.round(totalDpm * 5),
    fifteenMinutes: Math.round(totalDpm * 15)
  });
}, [weapons]);


  // 외부 클릭 감지
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleClickOutside = (event) => {
      if (focusedIndex !== null && 
          dropdownRefs.current[focusedIndex] && 
          !dropdownRefs.current[focusedIndex].contains(event.target)) {
        setFocusedIndex(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [focusedIndex]);

  return (
    <div className="container">
      <Head>
        <title>REPM 무기 계산기</title>
        <meta name="description" content="REPM 무기 DPM 계산기" />
        <link rel="icon" href="/favicon.ico" />
        <meta property="og:title" content="REPM 무기 계산기" />
        <meta property="og:description" content="REPM 무기 DPM 계산기" />
        <meta property="og:type" content="website" />
      </Head>

      <main>
        {/* 로고 클릭 범위를 글자만으로 제한 */}
        <div className="logo-container">
          <div className="logo" onClick={handleLogoClick} style={{ cursor: 'pointer' }}>REPM</div>
          <div className="title" onClick={handleLogoClick} style={{ cursor: 'pointer' }}>레피엠</div>
        </div>

        {/* 무기 선택 그리드 */}
        <div className="horizontal-weapons-grid">
          {Array.from({ length: 9 }).map((_, index) => (
            <div key={index} className="weapon-slot-container">
              <div className="weapon-slot">
                <div className="slot-number">{index + 1}번 무기</div>
                <div className="search-container" ref={el => dropdownRefs.current[index] = el}>
                  <input
                    ref={el => inputRefs.current[index] = el}
                    type="text"
                    placeholder="무기 검색..."
                    value={searchTerms[index]}
                    onChange={(e) => handleSearchChange(index, e.target.value)}
                    onFocus={() => handleInputFocus(index)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className="search_input"
                    readOnly={isComplete[index]}
                    style={isComplete[index] ? { backgroundColor: '#cacaca' } : {}}
                  />
                  
                  {(focusedIndex === index && !isComplete[index]) && (
                    <div id="autoMaker">
                      {filteredWeapons[index]?.length > 0 ? (
                        filteredWeapons[index].map(weapon => (
                          <div 
                            key={weapon.key}
                            onClick={() => handleWeaponSelect(index, weapon)}
                            className="weapon-item"
                          >
                            {weapon.name}
                          </div>
                        ))
                      ) : searchTerms[index] ? (
                        <div className="no-results">결과 없음</div>
                      ) : null}
                    </div>
                  )}
                </div>
                
                {weapons[index] && (
                  <div className="selected-weapon">
                    {weaponImages[index] ? (
                      <img 
                        src={weaponImages[index]} 
                        alt={weapons[index].name}
                        style={{ 
                          maxWidth: '100%', 
                          maxHeight: '60px', 
                          marginBottom: '5px',
                          borderRadius: '4px'
                        }}
                      />
                    ) : (
                      <div style={{ 
                        height: '60px', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        color: '#999',
                        fontSize: '12px',
                        marginBottom: '5px'
                      }}>
                        이미지 없음
                      </div>
                    )}
                    <span>{weapons[index].name}</span>
                    <button 
                      className="clear-button"
                      onClick={(e) => {
                        e.stopPropagation();
                        const newWeapons = [...weapons];
                        newWeapons[index] = null;
                        setWeapons(newWeapons);
                        
                        const newTerms = [...searchTerms];
                        newTerms[index] = '';
                        setSearchTerms(newTerms);
                        
                        const newComplete = [...isComplete];
                        newComplete[index] = false;
                        setIsComplete(newComplete);
                        
                        const newImages = [...weaponImages];
                        newImages[index] = null;
                        setWeaponImages(newImages);
                        
                        inputRefs.current[index]?.focus();
                      }}
                    >
                      ×
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        

        {/* 데미지 계산 결과 */}
        <div className="damage-results">
          <div>1분 딜량: {damageValues.oneMinute.toLocaleString()}</div>
          <div>3분 딜량: {damageValues.threeMinutes.toLocaleString()}</div>
          <div>5분 딜량: {damageValues.fiveMinutes.toLocaleString()}</div>
          <div>15분 딜량: {damageValues.fifteenMinutes.toLocaleString()}</div>
        </div>

        {/* 보스 선택 버튼들 */}
        <div className="boss-buttons-container">
          <button 
            className={`boss-button ${selectedBoss === 'teragon' ? 'active' : ''}`}
            onClick={() => handleBossClick('teragon')}
          >
            테라곤
          </button>
          <button 
            className={`boss-button ${selectedBoss === 'exonia' ? 'active' : ''}`}
            onClick={() => handleBossClick('exonia')}
          >
            엑소니아
          </button>
          <button 
            className={`boss-button ${selectedBoss === 'volterion' ? 'active' : ''}`}
            onClick={() => handleBossClick('volterion')}
          >
            볼테리온
          </button>
          <button 
            className={`boss-button ${selectedBoss === 'hydra' ? 'active' : ''}`}
            onClick={() => handleBossClick('hydra')}
          >
            하이드라
          </button>
        </div>

        {/* 보스 모드 선택 (보스 선택 후 나타남) */}
        {selectedBoss && !bossMode && (
          <div className="boss-mode-buttons">
            <button 
              className="boss-mode-button"
              onClick={() => handleBossModeSelect('normal')}
            >
              노말
            </button>
            <button 
              className="boss-mode-button"
              onClick={() => handleBossModeSelect('hard')}
            >
              하드
            </button>
          </div>
        )}

        {/* 보스 정보 표시 (모드 선택 후 나타남) */}
        {bossInfo && (
  <div className="boss-info">
    <h3>{bossInfo.title || "보스 정보"}</h3>
    {bossInfo.hp > 0 ? (
      <>
        <div>남은 HP: {(bossInfo.hp || 0).toLocaleString()}</div>
        <div>남은 시간: {Math.floor((bossInfo.time || 0) / 60)}분 ({(bossInfo.time || 0)}초)</div>
        
        {(damageValues.oneMinute > 0 && bossInfo.timeToKill !== undefined) && (
      <div className="boss-calc">
        <div>1분 딜량으로 계산한 결과:</div>
        <div>초당 데미지(DPS): {damageValues.dps.toLocaleString()}</div>
        <div>처치 예상 시간: {(bossInfo.timeToKill || 0).toFixed(2)}초</div>
        <div>남은 시간 대비: {(bossInfo.remainingTimePercent || 0).toFixed(2)}%</div>
        <div>
          처치 가능 여부: 
          <span style={{ 
            color: bossInfo.timeToKill <= bossInfo.time ? 'green' : 'red',
            fontWeight: 'bold'
          }}>
            {bossInfo.timeToKill <= bossInfo.time ? '가능' : '불가능'}
          </span>
        </div>
        <div>(본 데이터는 실제 측정과 다름을 알립니다.)</div>
          </div>
        )}
      </>
    ) : (
      <div>체력 정보 없음</div>
    )}
  </div>
)}


      {/* 무기 상세 정보 모달 */}
        {selectedWeaponDetail && (
          <div className="modal-overlay" onClick={() => setSelectedWeaponDetail(null)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h3>{selectedWeaponDetail.name}</h3>
              {weaponImages[weapons.findIndex(w => w?.key === selectedWeaponDetail.key)] && (
                <img 
                  src={weaponImages[weapons.findIndex(w => w?.key === selectedWeaponDetail.key)]}
                  alt={selectedWeaponDetail.name}
                  style={{ 
                    maxWidth: '200px', 
                    maxHeight: '200px',
                    margin: '10px auto',
                    display: 'block',
                    borderRadius: '8px'
                  }}
                />
              )}
              <div>key: {selectedWeaponDetail.key}</div>
              <div>데미지: {selectedWeaponDetail.damage}</div>
              <div>DPM: {selectedWeaponDetail.dpm.toLocaleString()}</div>
              <div>쿨타임: {selectedWeaponDetail.cooldown}초</div>
              <div className="weapon-description">{selectedWeaponDetail.description}</div>
              <button className="close-button" onClick={() => setSelectedWeaponDetail(null)}>
                닫기
              </button>
            </div>
          </div>
        )}
      </main>

      <style jsx global>{`
        * { 
          box-sizing: border-box; 
          margin: 0;
          padding: 0;
        }
        body { 
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }
      `}</style>

      <style jsx>{`
        .container {
          min-height: 100vh;
          padding: 20px;
          max-width: 1200px;
          margin: 0 auto;
        }
        
        .logo-container {
          text-align: center;
          margin: 40px 0;
        }
        
        .logo {
          font-size: 72px;
          font-weight: bold;
          color: #0070f3;
          background: linear-gradient(45deg, #0070f3, #00c6fb);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          display: inline-block;
        }
        
        .title {
          font-size: 24px;
          margin-top: 10px;
          color: #333;
          display: inline-block;
        }
        
        .horizontal-weapons-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          padding-bottom: 10px;
          margin-bottom: 20px;
          width: 100%;
          justify-content: center;
        }

        .weapon-slot-container {
          min-width: 100px;
          flex: 1 1 auto;
          max-width: 120px;
        }

        .weapon-slot {
          height: 100%;
          display: flex;
          flex-direction: column;
        }
        
        .slot-number {
          font-weight: bold;
          margin-bottom: 10px;
          text-align: center;
          color: #333;
        }
        
        .search-container {
          position: relative;
          margin-bottom: 10px;
        }
        
        .search_input {
          width: 100%;
          padding: 8px 12px;
          border: 1px solid #dfe1e5;
          border-radius: 24px;
          font-size: 14px;
          outline: none;
          transition: all 0.2s ease;
        }
        
        .search_input:focus {
          box-shadow: 0 1px 6px rgba(32,33,36,0.28);
          border-color: rgba(223,225,229,0);
        }
        
        #autoMaker {
          position: absolute;
          width: 100%;
          background: white;
          margin-top: 3px;
          z-index: 100;
          max-height: 300px;
          overflow-y: auto;
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
          border-radius: 8px;
          border: 1px solid #eee;
        }
        
        .weapon-item {
          padding: 8px 16px;
          cursor: pointer;
          font-size: 14px;
          transition: background-color 0.2s ease;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        
        .weapon-item:hover {
          background-color: #e6d1ff;
        }
        
        .no-results {
          padding: 16px;
          text-align: center;
          color: #70757a;
        }
        
        .selected-weapon {
          position: relative;
          padding: 10px;
          background: #f0f8ff;
          border-radius: 4px;
          margin-top: 10px;
          font-size: 14px;
          word-break: break-all;
          white-space: normal;
          overflow: visible;
          text-align: center;
        }
        
        .clear-button {
          position: absolute;
          right: 5px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          color: #666;
          font-size: 16px;
        }
        
        .damage-results {
          display: flex;
          justify-content: center;
          gap: 30px;
          margin-top: 40px;
          font-weight: bold;
          flex-wrap: wrap;
        }
        
        .damage-results div {
          background: #f5f5f5;
          padding: 10px 20px;
          border-radius: 8px;
          min-width: 150px;
          text-align: center;
          white-space: nowrap;
          overflow: visible;
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }

        .modal-content {
          background: white;
          padding: 20px;
          border-radius: 8px;
          max-width: 500px;
          width: 90%;
          max-height: 90vh;
          overflow-y: auto;
        }

        .close-button {
          margin-top: 20px;
          padding: 8px 16px;
          background: #0070f3;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }

        .weapon-description {
          margin-top: 10px;
          padding: 10px;
          background: #f5f5f5;
          border-radius: 4px;
        }

        .boss-buttons-container {
          display: flex;
          justify-content: center;
          gap: 10px;
          margin-top: 30px;
          flex-wrap: wrap;
        }
        
        .boss-button {
          padding: 10px 20px;
          border: none;
          border-radius: 8px;
          background-color: #f0f0f0;
          cursor: pointer;
          font-weight: bold;
          transition: all 0.2s ease;
        }
        
        .boss-button:hover {
          background-color: #e0e0e0;
        }
        
        .boss-button.active {
          background-color: #0070f3;
          color: white;
        }
        
        /* 보스 모드 버튼 스타일 */
        .boss-mode-buttons {
          display: flex;
          justify-content: center;
          gap: 20px;
          margin-top: 20px;
        }
        
        .boss-mode-button {
          padding: 10px 30px;
          border: none;
          border-radius: 8px;
          background-color: #e6f0ff;
          cursor: pointer;
          font-weight: bold;
          transition: all 0.2s ease;
        }
        
        .boss-mode-button:hover {
          background-color: #d0e0ff;
        }
        
        /* 보스 정보 스타일 */
        .boss-info {
          margin-top: 20px;
          padding: 20px;
          background-color: #f8f8f8;
          border-radius: 8px;
          text-align: center;
        }
        
        .boss-info h3 {
          margin-bottom: 15px;
          color: #333;
        }
        
        .boss-calc {
          margin-top: 15px;
          padding-top: 15px;
          border-top: 1px solid #eee;
        }
        
        .boss-progress {
          width: 100%;
          height: 20px;
          background-color: #e0e0e0;
          border-radius: 10px;
          margin-top: 10px;
          overflow: hidden;
        }
        
        .boss-progress-bar {
          height: 100%;
          background-color: #0070f3;
          transition: width 0.3s ease;
        }

        /* 모바일 대응 */
        @media (max-width: 1200px) {
          .weapon-slot-container {
            min-width: 160px;
          }
        }

        @media (max-width: 900px) {
          .weapon-slot-container {
            min-width: 140px;
          }
        }

        @media (max-width: 600px) {
  .weapon-slot-container {
    min-width: calc(33% - 10px);
  }
}
      `}</style>
    </div>
  );
}

// getStaticProps 함수 수정
const weaponsData = [
    {
      "key": 1,
      "name": "올림푸스 +1",
      "damage": 300,
      "cooldown": 2.5,
      "manaCost": 50,
      "dpm": 7200,
      "description": "올림푸스 +1 무기",
      "imageUrl": "https://github.com/palr0/repm-calculator/blob/main/wpimgs/olympus1.png?raw=true"
    },
    {
      "key": 2,
      "name": "올림푸스 +2",
      "damage": 375,
      "cooldown": 2.5,
      "manaCost": 60,
      "dpm": 9000,
      "description": "올림푸스 +2 무기",
      "imageUrl": "https://github.com/palr0/repm-calculator/blob/main/wpimgs/olympus2.png?raw=true"
    },
    {
      "key": 3,
      "name": "스톰브링거 +1",
      "damage": 550,
      "cooldown": 3.0,
      "manaCost": 45,
      "dpm": 11000,
      "description": "스톰브링거 +1 무기",
      "imageUrl": "https://github.com/palr0/repm-calculator/blob/main/wpimgs/stormbringer1.png?raw=true"
    }
  // ... 기타 무기 데이터 (각 무기에 imageUrl 추가 필요)
];

export async function getStaticProps() {
  return {
    props: {
      initialWeapons: weaponsData
    },
    revalidate: 3600
  };
}