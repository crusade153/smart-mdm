import { NextResponse } from 'next/server';
import { getSheetDoc } from '@/lib/google-sheets';

export async function GET() { // 👈 여기가 반드시 GET 이어야 합니다!
  try {
    const doc = await getSheetDoc();
    const sheetTitle = doc.title;
    
    // 시트 목록 가져오기
    const sheets = doc.sheetsByIndex.map(sheet => sheet.title);

    return NextResponse.json({
      status: 'Success',
      message: '🎉 구글 시트 연결 성공!',
      docTitle: sheetTitle,
      sheets: sheets 
    });
  } catch (error: any) {
    console.error("DB 연결 에러:", error);
    return NextResponse.json({
      status: 'Error',
      message: '연결 실패...',
      error: error.message
    }, { status: 500 });
  }
}