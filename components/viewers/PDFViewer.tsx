'use client';

import { useState, useEffect, useRef } from 'react';
import { WatermarkOverlay } from '../watermark/WatermarkOverlay';

interface PDFViewerProps {
    fileId: string;
    fileName: string;
}

export function PDFViewer({ fileId, fileName }: PDFViewerProps) {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string>('');
    const [numPages, setNumPages] = useState<number>(0);
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRefs = useRef<(HTMLCanvasElement | null)[]>([]);
    const [pdfjs, setPdfjs] = useState<any>(null);

    const pdfUrl = `/api/files/${fileId}/stream`;

    useEffect(() => {
        // 클라이언트 사이드에서만 pdfjs-dist 로드
        const initPdfJS = async () => {
            try {
                const pdfjsLib = await import('pdfjs-dist');
                const version = pdfjsLib.version;
                pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${version}/build/pdf.worker.mjs`;
                setPdfjs(pdfjsLib);
            } catch (err) {
                console.error('PDF 엔진 로드 실패:', err);
                setError('PDF 엔진을 로드할 수 없습니다.');
                setLoading(false);
            }
        };
        initPdfJS();
    }, []);

    useEffect(() => {
        const loadPDF = async () => {
            if (!pdfjs) return;

            try {
                setLoading(true);
                const loadingTask = (pdfjs as any).getDocument(pdfUrl);
                const pdf = await loadingTask.promise;
                setNumPages(pdf.numPages);

                // 각 페이지 렌더링
                // 캔버스 레프가 마운트될 시간을 확보하기 위해 잠시 대기하거나 numPages 상태 업데이트 후 처리
            } catch (err: any) {
                console.error('PDF 로딩 오류:', err);
                setError(`PDF를 로드할 수 없습니다: ${err.message || '알 수 없는 오류'}`);
                setLoading(false);
            }
        };

        if (fileId && pdfjs) {
            loadPDF();
        }
    }, [fileId, pdfUrl, pdfjs]);

    // numPages가 업데이트된 후 캔버스에 렌더링
    useEffect(() => {
        const renderPages = async () => {
            if (!pdfjs || numPages === 0) return;

            try {
                const loadingTask = (pdfjs as any).getDocument(pdfUrl);
                const pdf = await loadingTask.promise;

                for (let i = 1; i <= numPages; i++) {
                    const page = await pdf.getPage(i);
                    const viewport = page.getViewport({ scale: 1.5 });
                    const canvas = canvasRefs.current[i - 1];
                    if (canvas) {
                        const context = canvas.getContext('2d');
                        if (context) {
                            canvas.height = viewport.height;
                            canvas.width = viewport.width;
                            const renderContext = {
                                canvasContext: context,
                                viewport: viewport,
                            };
                            await page.render(renderContext as any).promise;
                        }
                    }
                }
                setLoading(false);
            } catch (err) {
                console.error('페이지 렌더링 오류:', err);
            }
        };

        renderPages();
    }, [numPages, pdfjs, pdfUrl]);

    // 우클릭 및 터치 차단용 오버레이 핸들러
    const handleContextMenu = (e: React.MouseEvent) => e.preventDefault();
    const handleTouchStart = (e: React.TouchEvent) => {
        if (e.touches.length > 1) e.preventDefault();
    };

    return (
        <div
            className="relative w-full h-full bg-slate-950 overflow-y-auto scroll-smooth"
            onContextMenu={handleContextMenu}
            onTouchStart={handleTouchStart}
            ref={containerRef}
        >
            <div className="flex flex-col items-center gap-6 py-12 min-h-full">
                {Array.from({ length: numPages }, (_, i) => (
                    <div key={`page-wrapper-${i + 1}`} className="page-container glass-card rounded-sm shadow-2xl overflow-hidden animate-fade-in" style={{ animationDelay: `${i * 0.1}s` }}>
                        <canvas
                            ref={(el) => { canvasRefs.current[i] = el; }}
                            className="max-w-full h-auto block"
                        />
                    </div>
                ))}
            </div>

            {(loading || !pdfjs) && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/80 backdrop-blur-sm z-50">
                    <div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin mb-4 shadow-[0_0_15px_var(--accent)]"></div>
                    <div className="text-slate-400 font-medium">문서 보안 렌더링 중...</div>
                </div>
            )}

            {error && (
                <div className="absolute inset-0 flex items-center justify-center bg-slate-950 z-50">
                    <div className="glass-card p-6 rounded-2xl border border-red-500/20 text-red-400 flex items-center gap-3">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        {error}
                    </div>
                </div>
            )}

            <WatermarkOverlay className="z-40" />

            <style jsx global>{`
                .page-container {
                    transition: transform 0.3s ease;
                }
                .page-container:hover {
                    transform: scale(1.01);
                }
                canvas {
                    user-select: none;
                    -webkit-user-drag: none;
                }
            `}</style>
        </div>
    );
}
