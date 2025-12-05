import React, { useEffect, useRef } from 'react';

interface Star {
  x: number;
  y: number;
  size: number;
  baseOpacity: number;
  opacity: number;
  speed: number;
  twinklePhase: number;
  twinkleSpeed: number;
}

interface ConstellationBackgroundProps {
  variant?: 'default' | 'dense' | 'subtle';
  animated?: boolean;
}

export const ConstellationBackground: React.FC<ConstellationBackgroundProps> = ({
  variant = 'default',
  animated = true,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const starsRef = useRef<Star[]>([]);
  const animationRef = useRef<number>();

  const starCount = variant === 'dense' ? 200 : variant === 'subtle' ? 50 : 100;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initStars();
    };

    const initStars = () => {
      starsRef.current = [];
      for (let i = 0; i < starCount; i++) {
        const baseOpacity = Math.random() * 0.6 + 0.4;
        starsRef.current.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 2 + 0.5,
          baseOpacity,
          opacity: baseOpacity,
          speed: Math.random() * 0.5 + 0.1,
          twinklePhase: Math.random() * Math.PI * 2,
          twinkleSpeed: Math.random() * 2 + 0.5,
        });
      }
    };

    const drawStars = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      starsRef.current.forEach((star, index) => {
        // Draw star
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`;
        ctx.fill();

        // Draw connections to nearby stars
        starsRef.current.slice(index + 1).forEach(otherStar => {
          const distance = Math.sqrt(
            Math.pow(star.x - otherStar.x, 2) + Math.pow(star.y - otherStar.y, 2)
          );
          if (distance < 150) {
            ctx.beginPath();
            ctx.moveTo(star.x, star.y);
            ctx.lineTo(otherStar.x, otherStar.y);
            ctx.strokeStyle = `rgba(14, 165, 233, ${0.1 * (1 - distance / 150)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        });

        // Animate star twinkle with visible pulsing effect
        if (animated) {
          const time = Date.now() * 0.001;
          // Create a noticeable twinkling effect using sine wave
          const twinkle = Math.sin(time * star.twinkleSpeed + star.twinklePhase);
          // Vary opacity between 0.2 and full brightness for visible twinkling
          star.opacity = star.baseOpacity * (0.4 + (twinkle + 1) * 0.3);
        }
      });
    };

    const animate = () => {
      drawStars();
      if (animated) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    resizeCanvas();
    animate();

    window.addEventListener('resize', resizeCanvas);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [starCount, animated]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ background: 'transparent' }}
    />
  );
};
