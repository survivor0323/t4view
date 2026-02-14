'use client';

import { useState } from 'react';
import { WatermarkOverlay } from '../watermark/WatermarkOverlay';

interface DocumentViewerProps {
    fileId: string;
    fileName: string;
    mimeType: string;
}

export function DocumentViewer({ fileId, fileName, mimeType }: DocumentViewerProps) {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string>('');

    // Google Docs Viewer 사용
    const viewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(
        `${window.location.origin}/api/files/${fileId}/stream`
    )}&embedded=true`;

    const handleContextMenu = (e: React.MouseEvent) => {
        e.preventDefault();
    };

    const handleTouchStart = (e: React.TouchEvent) => {
        if (e.touches.length > 1) {
            e.preventDefault();
        }
    };

    return (
        <div
            className="relative w-full h-full bg-gray-900 overflow-hidden"
            onContextMenu={handleContextMenu}
            onTouchStart={handleTouchStart}
        >
            <div className="w-full h-full flex items-center justify-center">
                <iframe
                    src={viewerUrl}
                    className="w-full h-full border-0"
                    onLoad={() => setLoading(false)}
                    onError={() => {
                        setError('문서를 로드할 수 없습니다.');
                        setLoading(false);
                    }}
                />
            </div>

            {/* 투명 보안 오버레이: iFrame에 대한 직접적인 우클릭/터치 접근 차단 */}
            <div className="absolute inset-0 z-10 bg-transparent" />

            {loading && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-900 z-20">
                    <div className="text-gray-400">문서 로딩 중...</div>
                </div>
            )}
            {error && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-900 z-20">
                    <div className="text-red-400">{error}</div>
                </div>
            )}
            <WatermarkOverlay className="z-30" />
        </div>
    );
}
