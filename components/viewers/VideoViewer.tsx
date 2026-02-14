'use client';

import { useEffect, useRef, useState } from 'react';
import { WatermarkOverlay } from '../watermark/WatermarkOverlay';

interface VideoViewerProps {
    fileId: string;
    fileName: string;
}

export function VideoViewer({ fileId, fileName }: VideoViewerProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [videoUrl, setVideoUrl] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string>('');

    useEffect(() => {
        let objectUrl: string;

        const loadVideo = async () => {
            try {
                setLoading(true);
                const response = await fetch(`/api/files/${fileId}/stream`);

                if (!response.ok) {
                    throw new Error('비디오를 로드할 수 없습니다.');
                }

                const blob = await response.blob();
                objectUrl = URL.createObjectURL(blob);
                setVideoUrl(objectUrl);
                setLoading(false);
            } catch (err) {
                console.error('비디오 로드 오류:', err);
                setError('비디오를 로드할 수 없습니다.');
                setLoading(false);
            }
        };

        loadVideo();

        // 클린업: Blob URL 해제
        return () => {
            if (objectUrl) {
                URL.revokeObjectURL(objectUrl);
            }
        };
    }, [fileId]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-gray-400">비디오 로딩 중...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-red-400">{error}</div>
            </div>
        );
    }

    return (
        <div className="relative w-full h-full bg-black flex items-center justify-center">
            <video
                ref={videoRef}
                src={videoUrl}
                controls
                controlsList="nodownload"
                disablePictureInPicture
                className="max-w-full max-h-full"
                onContextMenu={(e) => e.preventDefault()}
            >
                브라우저가 비디오 재생을 지원하지 않습니다.
            </video>
            <WatermarkOverlay />
        </div>
    );
}
