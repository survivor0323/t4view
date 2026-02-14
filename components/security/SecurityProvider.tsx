'use client';

import { useEffect } from 'react';

export function SecurityProvider({ children }: { children: React.ReactNode }) {
    useEffect(() => {
        // 우클릭 방지
        const preventContextMenu = (e: MouseEvent | TouchEvent) => {
            e.preventDefault();
            return false;
        };

        // 터치 제스처 보호 (두 손가락 터치 등 차단)
        const preventTouchContextMenu = (e: TouchEvent) => {
            if (e.touches.length > 1) {
                e.preventDefault();
                return false;
            }
        };

        // 키보드 단축키 차단 (기존 로직 유지)
        const preventKeyboardShortcuts = (e: KeyboardEvent) => {
            // F12 (개발자 도구)
            if (e.key === 'F12') {
                e.preventDefault();
                return false;
            }

            // Ctrl+Shift+I, J, C (개발자 도구 관련)
            if (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) {
                e.preventDefault();
                return false;
            }

            // Ctrl+U (소스 보기), Ctrl+S (저장), Ctrl+P (인쇄)
            if (e.ctrlKey && (e.key === 'u' || e.key === 's' || e.key === 'p')) {
                e.preventDefault();
                return false;
            }

            return true;
        };

        // 드래그 방지
        const preventDragStart = (e: DragEvent) => {
            e.preventDefault();
            return false;
        };

        // 선택 방지 (이미지, 비디오)
        const preventSelection = (e: Event) => {
            const target = e.target as HTMLElement;
            if (target.tagName === 'IMG' || target.tagName === 'VIDEO' || target.tagName === 'IFRAME') {
                e.preventDefault();
                return false;
            }
            return true;
        };

        // DevTools 열림 감지
        let devtoolsOpen = false;
        const detectDevTools = () => {
            const threshold = 160;
            const widthThreshold = window.outerWidth - window.innerWidth > threshold;
            const heightThreshold = window.outerHeight - window.innerHeight > threshold;

            if (widthThreshold || heightThreshold) {
                if (!devtoolsOpen) {
                    devtoolsOpen = true;
                }
            } else {
                devtoolsOpen = false;
            }
        };

        // 이벤트 리스너 등록
        document.addEventListener('contextmenu', preventContextMenu);
        document.addEventListener('touchstart', preventTouchContextMenu, { passive: false });
        document.addEventListener('keydown', preventKeyboardShortcuts);
        document.addEventListener('dragstart', preventDragStart);
        document.addEventListener('selectstart', preventSelection);

        // DevTools 감지 주기적 체크
        const devtoolsInterval = setInterval(detectDevTools, 1000);

        // 클린업
        return () => {
            document.removeEventListener('contextmenu', preventContextMenu);
            document.removeEventListener('touchstart', preventTouchContextMenu);
            document.removeEventListener('keydown', preventKeyboardShortcuts);
            document.removeEventListener('dragstart', preventDragStart);
            document.removeEventListener('selectstart', preventSelection);
            clearInterval(devtoolsInterval);
        };
    }, []);

    return <>{children}</>;
}
