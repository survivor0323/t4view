import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { downloadFile, getFileMetadata } from '@/lib/google-drive';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ fileId: string }> }
) {
    try {
        // 인증 확인
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json(
                { error: '인증이 필요합니다.' },
                { status: 401 }
            );
        }

        const { fileId } = await params;

        // 파일 메타데이터 조회
        const metadata = await getFileMetadata(fileId);

        // 파일 다운로드
        const fileBuffer = await downloadFile(fileId);

        // Range 요청 처리 (비디오 스트리밍용)
        const range = request.headers.get('range');

        if (range) {
            const parts = range.replace(/bytes=/, '').split('-');
            const start = parseInt(parts[0], 10);
            const end = parts[1] ? parseInt(parts[1], 10) : fileBuffer.length - 1;
            const chunkSize = end - start + 1;
            const chunk = fileBuffer.slice(start, end + 1);

            return new NextResponse(new Uint8Array(chunk), {
                status: 206,
                headers: {
                    'Content-Range': `bytes ${start}-${end}/${fileBuffer.length}`,
                    'Accept-Ranges': 'bytes',
                    'Content-Length': chunkSize.toString(),
                    'Content-Type': metadata.mimeType,
                    'Cache-Control': 'no-store, no-cache, must-revalidate',
                },
            });
        }

        // 일반 응답
        return new NextResponse(new Uint8Array(fileBuffer), {
            headers: {
                'Content-Type': metadata.mimeType,
                'Content-Length': fileBuffer.length.toString(),
                'Cache-Control': 'no-store, no-cache, must-revalidate',
                'Content-Disposition': 'inline',
            },
        });
    } catch (error) {
        console.error('파일 스트리밍 오류:', error);
        return NextResponse.json(
            { error: '파일을 가져올 수 없습니다.' },
            { status: 500 }
        );
    }
}
