'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

interface WatermarkOverlayProps {
  className?: string;
}

export function WatermarkOverlay({ className = '' }: WatermarkOverlayProps) {
  const { data: session } = useSession();
  const [watermarkText, setWatermarkText] = useState('');

  useEffect(() => {
    if (session?.user) {
      const email = session.user.email || 'user@example.com';
      const date = new Date().toLocaleString('ko-KR');
      setWatermarkText(`${email} | ${date}`);
    }
  }, [session]);

  if (!watermarkText) return null;

  return (
    <div className={`watermark-overlay ${className}`}>
      {/* 중앙 워터마크 */}
      <div className="watermark watermark-center">{watermarkText}</div>

      {/* 좌상단 워터마크 */}
      <div className="watermark watermark-top-left">{watermarkText}</div>

      {/* 우상단 워터마크 */}
      <div className="watermark watermark-top-right">{watermarkText}</div>

      {/* 좌하단 워터마크 */}
      <div className="watermark watermark-bottom-left">{watermarkText}</div>

      {/* 우하단 워터마크 */}
      <div className="watermark watermark-bottom-right">{watermarkText}</div>

      <style jsx>{`
        .watermark-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          pointer-events: none;
          z-index: 9999;
          overflow: hidden;
        }

        .watermark {
          position: absolute;
          color: rgba(255, 255, 255, 0.08);
          font-size: 13px;
          font-weight: 300;
          letter-spacing: 0.05em;
          white-space: nowrap;
          user-select: none;
          mix-blend-mode: overlay;
          animation: watermarkFlow 15s ease-in-out infinite alternate;
        }

        .watermark-center {
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%) rotate(-45deg);
          font-size: 16px;
          color: rgba(255, 255, 255, 0.12);
        }

        .watermark-top-left { top: 30px; left: 30px; }
        .watermark-top-right { top: 30px; right: 30px; }
        .watermark-bottom-left { bottom: 30px; left: 30px; }
        .watermark-bottom-right { bottom: 30px; right: 30px; }

        @keyframes watermarkFlow {
          0% { opacity: 0.05; transform: scale(0.98) translate(0, 0); }
          100% { opacity: 0.15; transform: scale(1) translate(2px, 2px); }
        }
      `}</style>
    </div>
  );
}
