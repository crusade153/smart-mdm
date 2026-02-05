// src/lib/mock-data.ts

// 🗑️ MOCK_HIERARCHY 삭제됨 (실제 데이터는 구글 시트 '제품계층구조' 탭에서 실시간 연동)

export const MOCK_MAT_GROUP = [
  { code: '101010', name: '계육' }, { code: '101011', name: '돈육' }, { code: '101012', name: '우육' }, { code: '101013', name: '기타 축산물' },
  { code: '101110', name: '수산물' }, { code: '101210', name: '양곡' }, { code: '101310', name: '기타원료' },
  { code: '201010', name: '농산물' }, { code: '201110', name: '엑기스류' }, { code: '201111', name: '당류' }, { code: '201112', name: '장류' },
  { code: '201113', name: '색소,향,첨가제' }, { code: '201114', name: '곡류가공품,전분' }, { code: '201115', name: '조미소재류' }, { code: '201116', name: '라면부재료' },
  { code: '201210', name: '소스류' }, { code: '201310', name: '유 류' }, { code: '201410', name: '기타부재료' },
  { code: '301010', name: 'K1 포장지' }, { code: '301011', name: 'K2 포장지' }, { code: '301012', name: 'K3 포장지' },
  { code: '301110', name: 'K1 종이박스' }, { code: '301111', name: 'K2 종이박스' }, { code: '301112', name: 'K3 종이박스' },
  { code: '301210', name: '트레이' }, { code: '301211', name: 'K3 종이컵' }, { code: '301212', name: '물류부자재' },
  { code: '301310', name: '스티커' }, { code: '301810', name: '기타포장재' }, { code: '301910', name: '금형 및 동판' },
  { code: '401010', name: '의약품' }, { code: '401110', name: '판촉물' }, { code: '401310', name: '전산용품' }, { code: '401410', name: '사무용품' },
  { code: '501010', name: '피복류' }, { code: '501011', name: '세척 및 소독제' }, { code: '501012', name: '생산소모품' },
  { code: '601010', name: '전기자재' }, { code: '601110', name: '배관자재(일반)' }, { code: '601210', name: '모터/펌프류' },
  { code: '700000', name: '반제품' },
  { code: '801010', name: '(제)만두류' }, { code: '801011', name: '(제)냉동밥류' }, { code: '801012', name: '(제)튀김류' },
  { code: '802010', name: '(제)즉석조리식품' }, { code: '803010', name: '(제)복합 세트' },
  { code: '804010', name: '(제)라면' }, { code: '804011', name: '(제)밥' }, { code: '805012', name: '(제)소스&양념' },
  { code: '900000', name: '상품' }, { code: '901010', name: '미식마켓' }, { code: '902010', name: 'OEM/ODM' }
];

export const MOCK_REF_DATA = {
  mrp: [
    { code: 'M01', name: '냉동밥' }, { code: 'M02', name: '주먹밥' }, { code: 'M03', name: '냉동만두' },
    { code: 'M04', name: '튀김' }, { code: 'M05', name: '핫도그' }, { code: 'M06', name: '추출/농축' },
    { code: 'M07', name: 'HMI' }, { code: 'M08', name: '소스' }, { code: 'M09', name: '분말' },
    { code: 'M10', name: '냉장만두' }, { code: 'M11', name: '건면봉지' }, { code: 'M12', name: '유탕봉지' },
    { code: 'M13', name: '전처리' }, { code: 'M14', name: '건면컵' }, { code: 'M15', name: '유탕컵' },
    { code: 'M16', name: '요리봉지' }, { code: 'M17', name: '요리컵' }, { code: 'M19', name: '분말스프' },
    { code: 'M30', name: '즉석밥' }, { code: 'M31', name: 'FD' },
    // 💡 추가 요청 반영
    { code: 'H01', name: '상품관리자' },
    { code: 'M32', name: '선물세트' },
    { code: 'M33', name: '물류재포장' }
  ],
  epLoc: [
    { code: '2101', name: '제품냉동자동창고' }, { code: '2102', name: '제품냉장자동창고' }, { code: '2103', name: '제품상온자동창고' },
    { code: '2111', name: '조미식품재공품(HMR)' }, { code: '2112', name: '조리냉동재공품' },
    { code: '2121', name: '원료냉동자동창고' }, { code: '2122', name: '원료냉장창고' }, { code: '2123', name: '원료상온자동창고' },
    { code: '2124', name: '납미고(쌀)' }, { code: '2125', name: '분말원료창고' }, { code: '2126', name: '내포장창고' },
    { code: '2200', name: '생산실적창고*' },
    { code: '2801', name: '물류냉동자동창고' }, { code: '2802', name: '물류냉동수동창고' }, { code: '2803', name: '물류상온자동창고' },
    { code: '2901', name: 'FBH임시제품창고' }, { code: '2905', name: '외주(풀필먼트)' }, { code: '9000', name: '설비자재(정산용)' }
  ],
  supervisor: [
    // 💡 P01 설명 수정 (물류센터 추가)
    { code: 'P01', name: '조리냉동, K3, 물류센터' }, { code: 'P02', name: '조미식품' }, { code: 'P03', name: '건면' },
    { code: 'P04', name: '유탕면' }, { code: 'P05', name: '건조야채' }, { code: 'P06', name: '즉석밥' },
    { code: 'P07', name: '분말스프' }
  ],
  temp: [
    // 💡 코드 2자리로 변경 (01, 02, 03)
    { code: '01', name: '상온' }, { code: '02', name: '냉장' }, { code: '03', name: '냉동' }, { code: 'ZZ', name: '기타' }
  ],
  storage: [
    // 💡 코드 2자리로 변경 (01 ~ 07)
    { code: '01', name: '상온제품' }, { code: '02', name: '냉장제품' }, { code: '03', name: '냉동제품' },
    { code: '04', name: '반제품' }, { code: '05', name: '상온원료' }, { code: '06', name: '냉장원료' }, { code: '07', name: '냉동원료' }
  ]
};