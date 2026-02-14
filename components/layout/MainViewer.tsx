'use client';

import { DriveFile } from '@/lib/google-drive';
import { VideoViewer } from '../viewers/VideoViewer';
import { DocumentViewer } from '../viewers/DocumentViewer';
import dynamic from 'next/dynamic';

const PDFViewer = dynamic(() => import('../viewers/PDFViewer').then(mod => mod.PDFViewer), {
    ssr: false,
    loading: () => (
        <div className="flex items-center justify-center h-full bg-gray-900">
            <div className="text-gray-400">PDF 엔진 로드 중...</div>
        </div>
    )
});

interface MainViewerProps {
    selectedFile: DriveFile | null;
}

export function MainViewer({ selectedFile }: MainViewerProps) {
    if (!selectedFile) {
        return (
            <div className="flex-1 bg-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-gray-400 text-xl mb-2">문서를 선택하세요</div>
                    <div className="text-gray-500 text-sm">
                        왼쪽 사이드바에서 보고 싶은 파일을 선택해주세요
                    </div>
                </div>
            </div>
        );
    }

    const renderViewer = () => {
        const { mimeType, id, name } = selectedFile;

        if (mimeType === 'video/mp4') {
            return <VideoViewer fileId={id} fileName={name} />;
        } else if (mimeType === 'application/pdf') {
            return <PDFViewer fileId={id} fileName={name} />;
        } else if (
            mimeType.includes('word') ||
            mimeType.includes('presentation') ||
            mimeType.includes('msword') ||
            mimeType.includes('ms-powerpoint')
        ) {
            return <DocumentViewer fileId={id} fileName={name} mimeType={mimeType} />;
        }

        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-gray-400">지원하지 않는 파일 형식입니다.</div>
            </div>
        );
    };

    return (
        <div className="flex-1 bg-transparent flex flex-col h-full overflow-hidden">
            {/* 파일 정보 헤더 */}
            <div className="glass shadow-lg border-b border-white/5 p-6 z-20">
                <div className="max-w-4xl mx-auto flex flex-col">
                    <h3 className="text-2xl font-black text-white tracking-tight truncate flex items-center gap-3">
                        <span className="w-1.5 h-6 bg-accent rounded-full hidden md:block"></span>
                        {selectedFile.name}
                    </h3>
                    <div className="flex items-center gap-4 mt-2">
                        <div className="px-2.5 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-[11px] font-bold uppercase tracking-wider">
                            {selectedFile.mimeType.split('/').pop()}
                        </div>
                        <div className="text-slate-400 text-xs flex items-center gap-4 font-medium">
                            {selectedFile.size && (
                                <span className="flex items-center gap-1.5">
                                    <span className="w-1 h-1 bg-slate-600 rounded-full"></span>
                                    크기: {(parseInt(selectedFile.size) / 1024 / 1024).toFixed(2)} MB
                                </span>
                            )}
                            {selectedFile.modifiedTime && (
                                <span className="flex items-center gap-1.5">
                                    <span className="w-1 h-1 bg-slate-600 rounded-full"></span>
                                    수정일: {new Date(selectedFile.modifiedTime).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* 뷰어 영역 */}
            <div className="flex-1 relative overflow-hidden animate-fade-in">
                <div className="absolute inset-0 bg-slate-950/20 backdrop-blur-[2px]"></div>
                <div className="relative z-10 w-full h-full shadow-[inset_0_0_100px_rgba(0,0,0,0.5)]">
                    {renderViewer()}
                </div>
            </div>
        </div>
    );
}
