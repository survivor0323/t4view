'use client';

import { useState, useEffect, useCallback } from 'react';
import { DriveFile } from '@/lib/google-drive';
import { FaFolder, FaFolderOpen, FaFile, FaFilePdf, FaFileVideo, FaFileWord, FaFilePowerpoint, FaChevronRight, FaChevronDown } from 'react-icons/fa';

interface SidebarProps {
    onFileSelect: (file: DriveFile) => void;
    selectedFile: DriveFile | null;
}

interface FileNode extends DriveFile {
    children?: FileNode[];
    isExpanded?: boolean;
    isLoading?: boolean;
}

export function Sidebar({ onFileSelect, selectedFile }: SidebarProps) {
    const [tree, setTree] = useState<FileNode[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string>('');

    const fetchFolderContents = useCallback(async (folderId: string): Promise<FileNode[]> => {
        const response = await fetch(`/api/files?folderId=${folderId}`);
        if (!response.ok) throw new Error('파일 목록을 가져올 수 없습니다.');
        const data = await response.json();
        return data.files as FileNode[];
    }, []);

    useEffect(() => {
        const initTree = async () => {
            try {
                setLoading(true);
                const rootFiles = await fetchFolderContents('root');
                setTree(rootFiles);
                setLoading(false);
            } catch (err) {
                console.error('초기 파일 로드 오류:', err);
                setError('파일 목록을 로드할 수 없습니다.');
                setLoading(false);
            }
        };
        initTree();
    }, [fetchFolderContents]);

    const toggleFolder = async (node: FileNode, path: number[]) => {
        if (node.mimeType !== 'application/vnd.google-apps.folder') return;

        // 트리를 복사하여 상태 업데이트
        const newTree = [...tree];
        let current: any = { children: newTree };
        for (const index of path) {
            current = current.children[index];
        }

        if (current.isExpanded) {
            current.isExpanded = false;
        } else {
            current.isExpanded = true;
            // 하위 항목이 아직 로드되지 않았다면 로드
            if (!current.children) {
                current.isLoading = true;
                setTree([...newTree]);
                try {
                    const children = await fetchFolderContents(current.id);
                    current.children = children;
                } catch (err) {
                    console.error('하위 폴더 로드 오류:', err);
                } finally {
                    current.isLoading = false;
                }
            }
        }
        setTree([...newTree]);
    };

    const renderTree = (nodes: FileNode[], path: number[] = [], level: number = 0) => {
        return nodes.map((node, index) => {
            const currentPath = [...path, index];
            const isFolder = node.mimeType === 'application/vnd.google-apps.folder';
            const isSelected = selectedFile?.id === node.id;
            const isExpanded = node.isExpanded || false;

            return (
                <div key={node.id} className="select-none">
                    <div
                        className={`flex items-center gap-3 p-2.5 my-0.5 rounded-xl transition-premium cursor-pointer group ${isSelected
                            ? 'bg-accent/20 text-accent border border-accent/30 shadow-[0_0_15px_rgba(56,189,248,0.1)]'
                            : 'text-slate-400 hover:bg-white/5 hover:text-slate-200 hover:translate-x-1'
                            }`}
                        style={{ paddingLeft: `${level * 16 + 12}px` }}
                        onClick={() => {
                            if (isFolder) {
                                toggleFolder(node, currentPath);
                            } else {
                                onFileSelect(node);
                            }
                        }}
                    >
                        <span className={`w-4 flex items-center justify-center text-[10px] transition-transform duration-300 ${isExpanded ? 'rotate-0' : '-rotate-90'}`}>
                            {isFolder ? <FaChevronDown className={isSelected ? 'text-accent' : 'text-slate-600'} /> : null}
                        </span>
                        <span className="text-lg flex items-center h-5">
                            {isFolder ? (
                                isExpanded ? <FaFolderOpen className="text-amber-400" /> : <FaFolder className="text-amber-500" />
                            ) : (
                                getFileIcon(node.mimeType)
                            )}
                        </span>
                        <span className={`flex-1 truncate text-[13px] font-medium ${isSelected ? 'font-bold' : ''}`}>
                            {node.name}
                        </span>
                        {(node as any).isLoading && <div className="w-3 h-3 border-2 border-accent border-t-transparent rounded-full animate-spin"></div>}
                    </div>
                    {isFolder && isExpanded && node.children && (
                        <div className="border-l border-white/5 ml-4 mt-1">
                            {renderTree(node.children, currentPath, level + 1)}
                        </div>
                    )}
                </div>
            );
        });
    };

    const getFileIcon = (mimeType: string) => {
        if (mimeType === 'application/pdf') return <FaFilePdf className="text-rose-500 drop-shadow-[0_0_5px_rgba(244,63,94,0.3)]" />;
        if (mimeType === 'video/mp4') return <FaFileVideo className="text-sky-400 drop-shadow-[0_0_5px_rgba(56,189,248,0.3)]" />;
        if (mimeType.includes('word')) return <FaFileWord className="text-indigo-400 drop-shadow-[0_0_5px_rgba(129,140,248,0.3)]" />;
        if (mimeType.includes('presentation')) return <FaFilePowerpoint className="text-orange-400 drop-shadow-[0_0_5px_rgba(251,146,60,0.3)]" />;
        return <FaFile className="text-slate-400" />;
    };

    if (loading && tree.length === 0) {
        return (
            <div className="w-80 bg-gray-800 border-r border-gray-700 p-4">
                <div className="text-gray-400">파일 시스템 로딩 중...</div>
            </div>
        );
    }

    return (
        <div className="w-80 glass border-r border-white/5 flex flex-col h-full overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/5">
                <h2 className="text-xl font-extrabold tracking-tight text-white flex items-center gap-2">
                    <span className="w-2 h-6 bg-accent rounded-full shadow-[0_0_10px_var(--accent)]"></span>
                    문서 보관소
                </h2>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-1">
                {error ? (
                    <div className="text-red-400 p-4 text-sm glass rounded-lg border-red-500/20">{error}</div>
                ) : (
                    <div className="animate-fade-in">
                        {renderTree(tree)}
                    </div>
                )}
            </div>
        </div>
    );
}

// Sidebar 내부 renderTree 내부의 아이템 스타일 업데이트를 위해 위쪽 코드도 일부 수정 필요
// 여기서는 return 부분 위주로 처리하고, 아이콘 색상을 위해 getFileIcon도 수정됨

