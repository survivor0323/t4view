import { google } from 'googleapis';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export interface DriveFile {
    id: string;
    name: string;
    mimeType: string;
    size?: string;
    modifiedTime?: string;
    webViewLink?: string;
    iconLink?: string;
}

export interface DriveFolder {
    id: string;
    name: string;
    children: (DriveFolder | DriveFile)[];
}

/**
 * Google Drive API 클라이언트 생성
 */
export async function getDriveClient() {
    const session = await getServerSession(authOptions);

    if (!session?.accessToken) {
        throw new Error('인증되지 않은 사용자입니다.');
    }

    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({
        access_token: session.accessToken as string,
    });

    return google.drive({ version: 'v3', auth: oauth2Client });
}

/**
 * 지원하는 파일 형식 필터
 */
const SUPPORTED_MIME_TYPES = [
    'video/mp4',
    'application/pdf',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

/**
 * 폴더 및 지원하는 파일 목록 가져오기
 */
export async function listFiles(folderId: string = 'root'): Promise<DriveFile[]> {
    const drive = await getDriveClient();

    const response = await drive.files.list({
        q: `'${folderId}' in parents and trashed=false`,
        fields: 'files(id, name, mimeType, size, modifiedTime, webViewLink, iconLink)',
        orderBy: 'folder,name',
    });

    const files = response.data.files || [];

    // 지원하는 파일 형식만 필터링 (폴더는 항상 포함)
    return files
        .filter(file =>
            file.mimeType === 'application/vnd.google-apps.folder' ||
            SUPPORTED_MIME_TYPES.includes(file.mimeType || '')
        )
        .map(file => ({
            id: file.id!,
            name: file.name!,
            mimeType: file.mimeType!,
            size: file.size || undefined,
            modifiedTime: file.modifiedTime || undefined,
            webViewLink: file.webViewLink || undefined,
            iconLink: file.iconLink || undefined,
        }));
}

/**
 * 폴더 트리 구조 가져오기
 */
export async function getFolderTree(folderId: string = 'root'): Promise<DriveFolder> {
    const drive = await getDriveClient();

    // 현재 폴더 정보
    const folderResponse = await drive.files.get({
        fileId: folderId,
        fields: 'id, name',
    });

    const folder: DriveFolder = {
        id: folderResponse.data.id!,
        name: folderResponse.data.name!,
        children: [],
    };

    // 하위 항목 가져오기
    const files = await listFiles(folderId);

    for (const file of files) {
        if (file.mimeType === 'application/vnd.google-apps.folder') {
            // 재귀적으로 하위 폴더 탐색
            const subFolder = await getFolderTree(file.id);
            folder.children.push(subFolder);
        } else {
            folder.children.push(file);
        }
    }

    return folder;
}

/**
 * 파일 스트림 다운로드
 */
export async function downloadFile(fileId: string): Promise<Buffer> {
    const drive = await getDriveClient();

    const response = await drive.files.get(
        {
            fileId: fileId,
            alt: 'media',
        },
        { responseType: 'arraybuffer' }
    );

    return Buffer.from(response.data as ArrayBuffer);
}

/**
 * 파일 메타데이터 가져오기
 */
export async function getFileMetadata(fileId: string): Promise<DriveFile> {
    const drive = await getDriveClient();

    const response = await drive.files.get({
        fileId: fileId,
        fields: 'id, name, mimeType, size, modifiedTime, webViewLink, iconLink',
    });

    return {
        id: response.data.id!,
        name: response.data.name!,
        mimeType: response.data.mimeType!,
        size: response.data.size || undefined,
        modifiedTime: response.data.modifiedTime || undefined,
        webViewLink: response.data.webViewLink || undefined,
        iconLink: response.data.iconLink || undefined,
    };
}
