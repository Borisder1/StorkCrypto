
import React, { useEffect, useRef, useState } from 'react';
import { useStore } from '../store';
import { getTranslation } from '../utils/translations';

// ⚡ Клас для частинок енергії, які летять від літер до прогрес-бару
class EnergyParticle {
  x: number;
  y: number;
  tx: number;
  ty: number;
  size: number;
  speed: number;
  lifespan: number;
  opacity: number;

  constructor(x: number, y: number, targetX: number, targetY: number) {
    this.x = x;
    this.y = y;
    this.tx = targetX;
    this.ty = targetY;
    this.size = Math.random() * 2 + 1;
    this.speed = Math.random() * 0.05 + 0.05;
    this.lifespan = 1;
    this.opacity = 1;
  }

  update() {
    this.lifespan -= 0.02;
    this.opacity = Math.max(0, this.lifespan);
    const dx = this.tx - this.x;
    const dy = this.ty - this.y;
    this.x += dx * this.speed;
    this.y += dy * this.speed;
    if (Math.abs(dx) < 5 && Math.abs(dy) < 5) {
      this.lifespan = 0;
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = `rgba(0, 217, 255, ${this.opacity})`;
    ctx.shadowColor = '#00d9ff';
    ctx.shadowBlur = 10;
    ctx.fillRect(this.x, this.y, this.size, this.size);
    ctx.shadowBlur = 0;
  }
}

export function LoadingScreen({ onComplete }: { onComplete?: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const lettersWrapperRef = useRef<HTMLDivElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const scannerLineRef = useRef<HTMLDivElement>(null);
  const progressContainerRef = useRef<HTMLDivElement>(null);

  const [progress, setProgress] = useState(0);
  const [scannerVisible, setScannerVisible] = useState(false);
  const [progressVisible, setProgressVisible] = useState(false);
  const [showSkip, setShowSkip] = useState(false);

  const [isExiting, setIsExiting] = useState(false);
  const { settings } = useStore();

  const handleComplete = () => {
    setIsExiting(true);
    // Instant transition as requested
    if (onComplete) onComplete();
  };

  useEffect(() => {
    // Show Skip button after 2s
    const skipTimer = setTimeout(() => setShowSkip(true), 2000);
    return () => clearTimeout(skipTimer);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles: EnergyParticle[] = [];
    let animationFrameId: number | null = null;

    const word = 'STORKCRYPTO';
    const letterElements: Array<{
      element: HTMLDivElement;
      revealed: boolean;
    }> = [];

    // 📝 Створюємо літери динамічно
    const lettersWrapper = lettersWrapperRef.current;
    if (lettersWrapper) {
      lettersWrapper.innerHTML = '';
      // VERTICAL LAYOUT
      lettersWrapper.style.display = 'flex';
      lettersWrapper.style.flexDirection = 'column';
      lettersWrapper.style.alignItems = 'center';
      lettersWrapper.style.justifyContent = 'center';
      lettersWrapper.style.gap = '1vh';

      word.split('').forEach((char) => {
        const container = document.createElement('div');
        container.className = 'letter-container';
        // Make letters responsive but large enough vertically
        container.style.fontSize = 'min(6vh, 8vw)';
        container.style.lineHeight = '1';
        container.style.fontWeight = '900';

        const inner = document.createElement('div');
        inner.className = 'letter-inner';

        const finalFace = document.createElement('div');
        finalFace.className = 'letter-face final-face';
        finalFace.textContent = char;

        const scramblerFace = document.createElement('div');
        scramblerFace.className = 'letter-face scrambler-face';
        scramblerFace.textContent = '?';

        inner.appendChild(finalFace);
        inner.appendChild(scramblerFace);
        container.appendChild(inner);
        lettersWrapper.appendChild(container);

        letterElements.push({ element: container, revealed: false });
      });
    }

    // 🎬 Анімація частинок
    function animateParticles() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p, index) => {
        p.draw(ctx);
        p.update();
        if (p.lifespan <= 0) {
          particles.splice(index, 1);
        }
      });

      if (particles.length > 0 || animationFrameId) {
        animationFrameId = requestAnimationFrame(animateParticles);
      }
    }

    function startAnimation() {
      if (!animationFrameId) {
        animateParticles();
      }
    }

    // 🚀 ГОЛОВНА ПОСЛІДОВНІСТЬ ЗАВАНТАЖЕННЯ
    async function startLoadingSequence() {
      const wrapperRect = lettersWrapper?.getBoundingClientRect();
      if (!wrapperRect || !scannerLineRef.current) return;

      // ⚡ ФАЗА 1: Сканування літер (2.5 секунди)
      setScannerVisible(true);
      scannerLineRef.current.style.top = `${wrapperRect.top}px`;
      // Ensure scanner is wide enough for the letters but not too wide
      const scannerWidth = Math.max(wrapperRect.width * 3, 150);
      scannerLineRef.current.style.width = `${scannerWidth}px`;

      let startTime = performance.now();

      function scan(time: number) {
        const elapsed = time - startTime;
        const scanDuration = 2500;
        const progress = Math.min(elapsed / scanDuration, 1);
        const currentY = wrapperRect.top + wrapperRect.height * progress;

        if (scannerLineRef.current) {
          scannerLineRef.current.style.transform = `translateX(-50%) translateY(${currentY - wrapperRect.top}px)`;
        }

        // Розкриваємо літери коли сканер проходить через них
        letterElements.forEach((el) => {
          const letterRect = el.element.getBoundingClientRect();
          if (currentY > letterRect.top && !el.revealed) {
            el.element.classList.add('revealed');
            el.revealed = true;
          }
        });

        if (progress < 1) {
          requestAnimationFrame(scan);
        } else {
          setScannerVisible(false);
          startEnergyTransfer();
        }
      }
      requestAnimationFrame(scan);

      // ⚡ ФАЗА 2: Передача енергії до прогрес-бару (3.5 секунди)
      async function startEnergyTransfer() {
        await new Promise((resolve) => setTimeout(resolve, 500));
        setProgressVisible(true);
        letterElements.forEach((el) => el.element.classList.add('draining'));

        const chargeDuration = 3500;
        const chargeInterval = setInterval(() => {
          const textRect = lettersWrapper?.getBoundingClientRect();
          const barRect = progressContainerRef.current?.getBoundingClientRect();
          const progressBarWidth = progressBarRef.current?.offsetWidth || 0;

          if (textRect && barRect) {
            // Генеруємо 5 частинок кожні 50мс
            for (let i = 0; i < 5; i++) {
              const x = textRect.left + Math.random() * textRect.width;
              const y = textRect.top + Math.random() * textRect.height;
              const targetX = barRect.left + progressBarWidth;
              const targetY = barRect.top + barRect.height / 2;
              particles.push(new EnergyParticle(x, y, targetX, targetY));
            }
            startAnimation();
          }
        }, 50);

        let transferStartTime = Date.now();

        function updateProgressBar() {
          const elapsed = Date.now() - transferStartTime;
          const currentProgress = Math.min(elapsed / chargeDuration, 1);
          setProgress(currentProgress * 100);
          if (currentProgress < 1) {
            requestAnimationFrame(updateProgressBar);
          }
        }
        updateProgressBar();

        await new Promise((resolve) => setTimeout(resolve, chargeDuration));
        clearInterval(chargeInterval);
      }
    }

    const handleResize = () => {
      if (canvasRef.current) {
        canvasRef.current.width = window.innerWidth;
        canvasRef.current.height = window.innerHeight;
      }
    };

    window.addEventListener('resize', handleResize);

    const timer = setTimeout(() => {
      startLoadingSequence();
    }, 100);

    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timer);
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, []);

  return (
    <div className={`fixed inset-0 z-[9999] bg-[#0a0a14] flex flex-col items-center justify-center overflow-hidden ${isExiting ? 'loading-screen-exit' : ''}`}>
      {/* 🎨 Анімований фоновий грід */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(90deg, #00d9ff 1px, transparent 1px),
            linear-gradient(0deg, #00d9ff 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
          animation: 'gridMove 20s linear infinite'
        }} />
      </div>

      <style>{`
        @keyframes gridMove {
          0% { transform: translate(0, 0); }
          100% { transform: translate(50px, 50px); }
        }

        .letter-container {
          position: relative;
          margin: clamp(0px, 0.1vh, 2px) 0;
          font-family: 'Orbitron', monospace;
          font-size: clamp(20px, 4.5vh, 32px);
          font-weight: 900;
          width: 1.2em;
          height: 1.5em;
          display: flex;
          justify-content: center;
          align-items: center;
          color: #00d9ff;
          text-shadow: 0 0 20px rgba(0, 217, 255, 0.8), 0 0 40px rgba(0, 217, 255, 0.4);
          transition: color 1s, text-shadow 1s, opacity 0.5s;
          transform-style: preserve-3d;
          perspective: 300px;
        }




        .letter-inner {
          position: relative;
          width: 100%;
          height: 100%;
          transform-style: preserve-3d;
          transform: rotateX(-90deg);
          transition: transform 0.6s cubic-bezier(0.6, 0, 0.2, 1);
        }

        .letter-container.revealed .letter-inner {
          transform: rotateX(0deg);
        }

        .letter-container.draining {
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0%, 100% {
            text-shadow: 0 0 20px rgba(0, 217, 255, 0.8), 0 0 40px rgba(0, 217, 255, 0.4);
          }
          50% {
            text-shadow: 0 0 30px rgba(0, 217, 255, 1), 0 0 60px rgba(0, 217, 255, 0.6), 0 0 80px rgba(255, 255, 255, 0.3);
          }
        }

        .letter-face {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
          backface-visibility: hidden;
        }

        .scrambler-face {
          transform: rotateX(90deg) translateZ(0.75em);
          color: #555;
        }

        .final-face {
          transform: translateZ(0.75em);
        }

        .scanner-line {
          position: absolute;
          top: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 300px;
          height: 3px;
          background: linear-gradient(90deg, transparent, #00d9ff 20%, #ffffff 50%, #00d9ff 80%, transparent);
          box-shadow: 0 0 20px #00d9ff, 0 0 40px #00d9ff, 0 0 60px #00d9ff;
          transition: opacity 0.5s;
        }

        .progress-container {
          width: clamp(280px, 70vw, 450px);
          height: 12px;
          background: rgba(0, 217, 255, 0.1);
          border-radius: 6px;
          overflow: hidden;
          transition: opacity 1s, transform 0.5s;
          position: relative;
          box-shadow: 0 0 20px rgba(0, 217, 255, 0.2), inset 0 0 10px rgba(0, 217, 255, 0.1);
        }

        .progress-bar {
          height: 100%;
          background: linear-gradient(90deg, #00d9ff, #00e5ff, #ffffff, #00e5ff, #00d9ff);
          background-size: 200% 100%;
          animation: progressGlow 2s ease-in-out infinite;
          transition: width 0.1s linear;
          box-shadow: 0 0 20px #00d9ff, 0 0 40px #00d9ff, 0 0 60px rgba(255, 255, 255, 0.5);
        }

        @keyframes progressGlow {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }

        .loading-screen-exit {
          opacity: 0;
          filter: blur(10px);
          transform: scale(1.1);
          transition: all 0.8s cubic-bezier(0.6, -0.28, 0.735, 0.045);
          pointer-events: none;
        }
      `}</style>

      {/* 🎨 Canvas для частинок */}
      <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-10" />

      {/* 📝 Контейнер з літерами STORKCRYPTO (ВЕРТИКАЛЬНИЙ) */}
      <div className="text-container mb-8 relative z-20" style={{ position: 'relative', width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '10px 0' }}>
        <div ref={lettersWrapperRef} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }} />
      </div>

      {/* 📊 Прогрес-бар */}
      <div
        ref={progressContainerRef}
        className="progress-container relative z-20"
        style={{ opacity: progressVisible ? 1 : 0 }}
      >
        <div
          ref={progressBarRef}
          className="progress-bar"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* ⚡ Лінія сканера */}
      <div
        ref={scannerLineRef}
        className="scanner-line z-20"
        style={{ opacity: scannerVisible ? 1 : 0 }}
      />

      {/* ⏭ SKIP / ПРОПУСТИТИ */}
      <button
        onClick={handleComplete}
        className={`fixed bottom-12 z-50 text-[10px] font-orbitron font-black tracking-[0.2em] uppercase text-brand-cyan/80 hover:text-white transition-all duration-700 border border-brand-cyan/30 px-6 py-2 rounded-full hover:bg-brand-cyan/10 backdrop-blur-sm group ${showSkip ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}
      >
        <span className="group-hover:text-brand-cyan transition-colors">{getTranslation(settings.language, 'loading.skip')}</span> &gt;&gt;
      </button>
    </div>
  );
}
