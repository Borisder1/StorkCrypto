import React, { useEffect, useRef, useState } from 'react';
import { triggerHaptic } from '../utils/haptics';

interface LoadingScreenProps {
  onSkip?: () => void;
}

// ⚡ Клас для часток кібер-енергії, які летять від літер до прогрес-бару
class EnergyParticle {
  x: number;
  y: number;
  tx: number;
  ty: number;
  size: number;
  speed: number;
  lifespan: number;
  opacity: number;
  color: string;

  constructor(x: number, y: number, targetX: number, targetY: number) {
    this.x = x;
    this.y = y;
    this.tx = targetX;
    this.ty = targetY;
    this.size = Math.random() * 2.5 + 1;
    this.speed = Math.random() * 0.06 + 0.04;
    this.lifespan = 1;
    this.opacity = 1;
    this.color = Math.random() > 0.3 ? '#00d9ff' : '#00ff9d';
  }

  update() {
    this.lifespan -= 0.018;
    this.opacity = Math.max(0, this.lifespan);
    const dx = this.tx - this.x;
    const dy = this.ty - this.y;
    this.x += dx * this.speed;
    this.y += dy * this.speed;
    if (Math.abs(dx) < 6 && Math.abs(dy) < 6) {
      this.lifespan = 0;
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = this.color === '#00d9ff'
      ? `rgba(0, 217, 255, ${this.opacity})`
      : `rgba(0, 255, 157, ${this.opacity})`;
    ctx.shadowColor = this.color;
    ctx.shadowBlur = 8;
    ctx.fillRect(this.x, this.y, this.size, this.size);
    ctx.shadowBlur = 0;
  }
}

const LETTERS = ['S', 'T', 'O', 'R', 'K', 'C', 'R', 'Y', 'P', 'T', 'O'];

export function LoadingScreen({ onSkip }: LoadingScreenProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const lettersWrapperRef = useRef<HTMLDivElement>(null);
  const letterRefs = useRef<(HTMLDivElement | null)[]>([]);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const scannerLineRef = useRef<HTMLDivElement>(null);
  const progressContainerRef = useRef<HTMLDivElement>(null);

  const [progress, setProgress] = useState(0);
  const [scannerVisible, setScannerVisible] = useState(false);
  const [progressVisible, setProgressVisible] = useState(false);

  // Зберігаємо колбек у ref, щоб уникнути зайвих перезапусків useEffect
  const onSkipRef = useRef(onSkip);
  useEffect(() => {
    onSkipRef.current = onSkip;
  }, [onSkip]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const updateCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    updateCanvasSize();

    const particles: EnergyParticle[] = [];
    let animationFrameId: number | null = null;
    let isCleanedUp = false;

    // 🎬 Анімаційний цикл часток на Canvas
    function animateParticles() {
      if (isCleanedUp || !ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.draw(ctx);
        p.update();
        if (p.lifespan <= 0) {
          particles.splice(i, 1);
        }
      }

      animationFrameId = requestAnimationFrame(animateParticles);
    }
    animationFrameId = requestAnimationFrame(animateParticles);

    // 🚀 ГОЛОВНА 6.5-СЕКУНДНА ПОСЛІДОВНІСТЬ (За маніфестом)
    async function startLoadingSequence() {
      if (isCleanedUp) return;

      const lettersWrapper = lettersWrapperRef.current;
      const scannerLine = scannerLineRef.current;
      if (!lettersWrapper || !scannerLine) return;

      const wrapperRect = lettersWrapper.getBoundingClientRect();
      setScannerVisible(true);
      scannerLine.style.top = `${wrapperRect.top}px`;

      // ⚡ ФАЗА 1: Рух сканера зверху вниз та 3D-переворот літер (0 - 2.5с)
      const scanStartTime = performance.now();
      const scanDuration = 2500;
      const revealedIndices = new Set<number>();

      function scan(currentTime: number) {
        if (isCleanedUp) return;
        const elapsed = currentTime - scanStartTime;
        const scanProgress = Math.min(elapsed / scanDuration, 1);
        const currentY = wrapperRect.top + wrapperRect.height * scanProgress;

        if (scannerLineRef.current) {
          scannerLineRef.current.style.transform = `translateX(-50%) translateY(${currentY - wrapperRect.top}px)`;
        }

        // Перевіряємо положення кожної літери
        letterRefs.current.forEach((el, index) => {
          if (!el || revealedIndices.has(index)) return;
          const letterRect = el.getBoundingClientRect();
          if (currentY >= letterRect.top + letterRect.height * 0.3) {
            el.classList.add('revealed');
            revealedIndices.add(index);
            try { triggerHaptic('light'); } catch (_) {}
          }
        });

        if (scanProgress < 1) {
          requestAnimationFrame(scan);
        } else {
          // Завершення сканування
          setScannerVisible(false);
          startEnergyTransfer();
        }
      }
      requestAnimationFrame(scan);

      // ⚡ ФАЗА 2: Передача енергетичних часток до прогрес-бару (2.5 - 6.0с)
      async function startEnergyTransfer() {
        if (isCleanedUp) return;
        await new Promise((resolve) => setTimeout(resolve, 300));
        if (isCleanedUp) return;

        setProgressVisible(true);
        letterRefs.current.forEach((el) => el?.classList.add('draining'));

        const chargeDuration = 3200;
        const chargeStartTime = Date.now();

        // Генератор частинок
        const chargeInterval = setInterval(() => {
          if (isCleanedUp) {
            clearInterval(chargeInterval);
            return;
          }
          const textRect = lettersWrapperRef.current?.getBoundingClientRect();
          const barRect = progressContainerRef.current?.getBoundingClientRect();
          const progressBarWidth = progressBarRef.current?.offsetWidth || 0;

          if (textRect && barRect) {
            // Створюємо пучок частинок, що летять від випадкових літер до прогрес-бару
            for (let i = 0; i < 6; i++) {
              const x = textRect.left + (Math.random() * 0.8 + 0.1) * textRect.width;
              const y = textRect.top + Math.random() * textRect.height;
              const targetX = barRect.left + progressBarWidth + (Math.random() * 10 - 5);
              const targetY = barRect.top + barRect.height / 2;
              particles.push(new EnergyParticle(x, y, targetX, targetY));
            }
          }
        }, 40);

        function updateProgressBar() {
          if (isCleanedUp) return;
          const elapsed = Date.now() - chargeStartTime;
          const currentProgress = Math.min(elapsed / chargeDuration, 1);
          setProgress(Math.floor(currentProgress * 100));

          if (currentProgress < 1) {
            requestAnimationFrame(updateProgressBar);
          }
        }
        updateProgressBar();

        await new Promise((resolve) => setTimeout(resolve, chargeDuration));
        clearInterval(chargeInterval);

        // ⚡ ФАЗА 3: Фіналізація (6.0 - 6.5с)
        if (!isCleanedUp) {
          setProgress(100);
          try { triggerHaptic('success'); } catch (_) {}
          setTimeout(() => {
            if (!isCleanedUp && onSkipRef.current) {
              onSkipRef.current();
            }
          }, 500);
        }
      }
    }

    const resizeHandler = () => {
      updateCanvasSize();
    };
    window.addEventListener('resize', resizeHandler);

    const timer = setTimeout(() => {
      startLoadingSequence();
    }, 150);

    return () => {
      isCleanedUp = true;
      clearTimeout(timer);
      window.removeEventListener('resize', resizeHandler);
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 bg-[#020617] flex flex-col items-center justify-center overflow-hidden select-none"
      role="status"
      aria-live="polite"
    >
      {/* 🎨 Анімована кіберпанкова фонова сітка */}
      <div className="absolute inset-0 opacity-25 pointer-events-none">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(90deg, rgba(0, 217, 255, 0.4) 1px, transparent 1px),
              linear-gradient(0deg, rgba(0, 217, 255, 0.4) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px',
            animation: 'cyberGridMove 20s linear infinite'
          }}
        />
      </div>

      <style>{`
        @keyframes cyberGridMove {
          0% { transform: translate(0, 0); }
          100% { transform: translate(40px, 40px); }
        }

        .letter-container {
          position: relative;
          margin: clamp(0px, 0.15vh, 2px) 0;
          font-family: 'Orbitron', monospace;
          font-size: clamp(20px, 4.4vh, 32px);
          font-weight: 900;
          width: 1.2em;
          height: 1.45em;
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
          animation: cyberPulse 2s infinite;
        }

        @keyframes cyberPulse {
          0%, 100% {
            text-shadow: 0 0 20px rgba(0, 217, 255, 0.8), 0 0 40px rgba(0, 217, 255, 0.4);
          }
          50% {
            text-shadow: 0 0 30px rgba(0, 217, 255, 1), 0 0 60px rgba(0, 217, 255, 0.7), 0 0 80px rgba(0, 255, 157, 0.5);
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
          transform: rotateX(90deg) translateZ(0.72em);
          color: #334155;
          text-shadow: none;
        }

        .final-face {
          transform: translateZ(0.72em);
        }

        .scanner-line {
          position: absolute;
          top: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 280px;
          height: 3px;
          background: linear-gradient(90deg, transparent, #00d9ff 25%, #ffffff 50%, #00d9ff 75%, transparent);
          box-shadow: 0 0 20px #00d9ff, 0 0 40px #00d9ff, 0 0 60px #00d9ff;
          transition: opacity 0.4s;
          pointer-events: none;
        }

        .progress-container {
          width: clamp(260px, 75vw, 420px);
          height: 12px;
          background: rgba(0, 217, 255, 0.1);
          border: 1px solid rgba(0, 217, 255, 0.3);
          border-radius: 6px;
          overflow: hidden;
          transition: opacity 0.8s, transform 0.5s;
          position: relative;
          box-shadow: 0 0 20px rgba(0, 217, 255, 0.2), inset 0 0 10px rgba(0, 217, 255, 0.1);
        }

        .progress-bar {
          height: 100%;
          background: linear-gradient(90deg, #00d9ff, #00ff9d, #ffffff, #00d9ff);
          background-size: 200% 100%;
          animation: progressGlow 2s ease-in-out infinite;
          transition: width 0.1s linear;
          box-shadow: 0 0 20px #00d9ff, 0 0 40px #00ff9d, 0 0 60px rgba(255, 255, 255, 0.5);
        }

        @keyframes progressGlow {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
      `}</style>

      {/* 🎨 Canvas для частинок кібер-енергії */}
      <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-10" />

      {/* 📝 Контейнер з вертикальними літерами STORKCRYPTO */}
      <div
        className="text-container mb-6 relative z-20"
        style={{ position: 'relative', width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '10px 0' }}
      >
        <div ref={lettersWrapperRef} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {LETTERS.map((char, index) => (
            <div
              key={index}
              ref={(el) => { letterRefs.current[index] = el; }}
              className="letter-container"
            >
              <div className="letter-inner">
                <div className="letter-face final-face">{char}</div>
                <div className="letter-face scrambler-face">?</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 📊 Прогрес-бар з відсотками */}
      <div
        ref={progressContainerRef}
        className="progress-container relative z-20 mb-3"
        style={{ opacity: progressVisible ? 1 : 0 }}
      >
        <div
          ref={progressBarRef}
          className="progress-bar"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* ⚡ Лінія лазерного сканера */}
      <div
        ref={scannerLineRef}
        className="scanner-line z-20"
        style={{ opacity: scannerVisible ? 1 : 0 }}
      />

      {/* Кнопка швидкого входу (Skip) */}
      {onSkip && (
        <button
          onClick={onSkip}
          className="relative z-30 mt-3 px-4 py-1.5 rounded-xl border border-brand-cyan/30 bg-brand-cyan/10 hover:bg-brand-cyan/20 text-brand-cyan text-[10px] font-mono tracking-widest uppercase transition-all duration-200 backdrop-blur-md cursor-pointer active:scale-95 shadow-[0_0_15px_rgba(0,217,255,0.15)]"
        >
          ПРОПУСТИТИ &gt;&gt;
        </button>
      )}
    </div>
  );
}
