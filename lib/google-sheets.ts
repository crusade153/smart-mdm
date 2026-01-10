import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';

export async function getSheetDoc() {
  // 환경 변수 체크
  const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = process.env.GOOGLE_PRIVATE_KEY;
  const sheetId = process.env.GOOGLE_SHEET_ID;

  if (!serviceAccountEmail || !privateKey || !sheetId) {
    throw new Error('Google Sheets 환경 변수가 설정되지 않았습니다. (.env.local 확인)');
  }

  // 인증(Auth) 설정
  const auth = new JWT({
    email: serviceAccountEmail,
    key: privateKey.replace(/\\n/g, '\n'), // 이스케이프 문자 처리
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  // 문서 로드
  const doc = new GoogleSpreadsheet(sheetId, auth);
  await doc.loadInfo();
  
  return doc;
}

export async function getSheetByTitle(title: string) {
  const doc = await getSheetDoc();
  const sheet = doc.sheetsByTitle[title];
  
  if (!sheet) {
    throw new Error(`구글 시트에서 '${title}' 탭을 찾을 수 없습니다.`);
  }
  
  return sheet;
}