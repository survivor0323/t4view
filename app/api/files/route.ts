import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { listFiles } from '@/lib/google-drive';

export async function GET(request: NextRequest) {
    try {
        // 인증 확인
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json(
                { error: '인증이 필요합니다.' },
                { status: 401 }
            );
        }

        // 쿼리 파라미터에서 folderId 가져오기
        const { searchParams } = new URL(request.url);
        const folderId = searchParams.get('folderId') || 'root';

        // 파일 목록 조회
        const files = await listFiles(folderId);

        return NextResponse.json({ files });
    } catch (error) {
        console.error('파일 목록 조회 오류:', error);
        return NextResponse.json(
            { error: '파일 목록을 가져올 수 없습니다.' },
            { status: 500 }
        );
    }
}
