import React from 'react';

export default function ManualPage() {
  const manualHtml = `
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Smart MDM 실무 매뉴얼</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Pretendard:wght@300;400;600;800&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <style>
        body { font-family: 'Pretendard', sans-serif; scroll-behavior: smooth; }
        .sidebar-link.active { background-color: #EEF2FF; color: #4F46E5; border-right: 3px solid #4F46E5; font-weight: 600; }
        .tip-box { background-color: #F0F9FF; border-left: 4px solid #0EA5E9; padding: 1rem; border-radius: 0 0.5rem 0.5rem 0; margin: 1rem 0; }
        .warn-box { background-color: #FFFBEB; border-left: 4px solid #F59E0B; padding: 1rem; border-radius: 0 0.5rem 0.5rem 0; margin: 1rem 0; }
        .feature-badge { display: inline-block; padding: 0.25rem 0.5rem; border-radius: 0.25rem; font-size: 0.75rem; font-weight: 700; margin-bottom: 0.5rem; }
        .step-num { display: inline-flex; width: 1.5rem; height: 1.5rem; background: #4F46E5; color: white; border-radius: 9999px; align-items: center; justify-content: center; font-size: 0.8rem; margin-right: 0.5rem; font-weight: bold; }
    </style>
</head>
<body class="bg-slate-50 text-slate-800 antialiased">

    <div class="flex h-screen overflow-hidden">
        
        <aside class="w-72 bg-white border-r border-slate-200 hidden md:flex flex-col flex-shrink-0 z-20 shadow-sm">
            <div class="h-16 flex items-center px-6 border-b border-slate-100 bg-white shrink-0 sticky top-0 z-10">
                <span class="font-bold text-lg text-slate-800"><i class="fa-solid fa-book-open mr-2 text-indigo-600"></i>사용자 매뉴얼</span>
            </div>
            
            <nav class="flex-1 py-6 overflow-y-auto">
                <ul class="space-y-1">
                    <li><a href="#dashboard" class="sidebar-link block px-6 py-3 text-sm text-slate-600 hover:bg-slate-50 transition-colors">1. 목록 조회 및 엑셀 다운로드</a></li>
                    <li><a href="#clone" class="sidebar-link block px-6 py-3 text-sm text-slate-600 hover:bg-slate-50 transition-colors font-semibold text-indigo-700">2. [핵심] 기존 자재 따라하기</a></li>
                    <li><a href="#input" class="sidebar-link block px-6 py-3 text-sm text-slate-600 hover:bg-slate-50 transition-colors">3. 상세 입력 및 검증</a></li>
                    <li><a href="#hierarchy" class="sidebar-link block px-6 py-3 text-sm text-slate-600 hover:bg-slate-50 transition-colors pl-10 text-slate-500">ㄴ 계층구조(L1~L4) 선택</a></li>
                    <li><a href="#history" class="sidebar-link block px-6 py-3 text-sm text-slate-600 hover:bg-slate-50 transition-colors">4. 이력 관리 및 채팅</a></li>
                    <li><a href="#coop" class="sidebar-link block px-6 py-3 text-sm text-slate-600 hover:bg-slate-50 transition-colors">5. 협조전 작성 (일괄 처리)</a></li>
                </ul>
            </nav>
        </aside>

        <main class="flex-1 overflow-y-auto scroll-smooth h-full bg-slate-50">
            <div class="max-w-5xl mx-auto px-10 py-12 space-y-20 pb-40">
                
                <section class="border-b border-slate-200 pb-6">
                    <h1 class="text-3xl font-extrabold text-slate-900 mb-2">Smart MDM 실무 가이드</h1>
                    <p class="text-slate-500">기준정보 생성부터 승인까지, 실무자가 가장 빠르고 정확하게 작업하는 방법을 안내합니다.</p>
                </section>

                <section id="dashboard">
                    <h2 class="text-2xl font-bold text-slate-800 mb-6 flex items-center">
                        <span class="step-num">1</span> 목록 조회 및 필터링
                    </h2>
                    
                    <div class="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
                        <h3 class="font-bold text-lg text-slate-700">🔍 스마트 검색</h3>
                        <p class="text-slate-600 text-sm">
                            상단 검색창 하나로 <strong>[요청번호 / 품명 / 작성자명]</strong>을 동시에 검색할 수 있습니다.<br>
                            예: "홍길동" 입력 시 홍길동이 작성한 모든 문서가, "라면" 입력 시 라면 관련 모든 문서가 조회됩니다.
                        </p>
                        
                        <div class="border-t border-slate-100 my-4"></div>

                        <h3 class="font-bold text-lg text-slate-700">📊 엑셀 다운로드 (SAP 업로드용)</h3>
                        <p class="text-slate-600 text-sm">
                            목록에서 원하는 항목들을 <strong>체크박스로 다중 선택</strong>한 후, 상단의 <span class="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold"><i class="fa-solid fa-file-excel"></i> 엑셀</span> 버튼을 누르세요.
                        </p>
                        <div class="tip-box text-sm">
                            <strong>💡 엑셀 시트 자동 분리</strong><br>
                            다운로드된 엑셀 파일은 <strong>[기본정보]</strong> 탭과 <strong>[환산단위]</strong> 탭으로 자동 분리되어 생성됩니다.<br>
                            이는 SAP 업로드(LSMW 등) 양식에 최적화된 형태입니다.
                        </div>
                    </div>
                </section>

                <section id="clone">
                    <span class="feature-badge bg-indigo-100 text-indigo-600">Killer Feature</span>
                    <h2 class="text-2xl font-bold text-slate-800 mb-6 flex items-center">
                        <span class="step-num">2</span> 기존 자재 불러오기 (따라하기)
                    </h2>

                    <div class="bg-white p-6 rounded-xl border border-indigo-200 shadow-md ring-1 ring-indigo-50">
                        <p class="text-slate-700 mb-4 font-medium">
                            가장 빠르고 정확하게 입력하는 방법은 <strong>"잘 만들어진 기존 자재를 복사"</strong>하는 것입니다.<br>
                            유사한 제품(예: 매운맛 → 순한맛)을 만들 때 입력 시간을 90% 이상 단축할 수 있습니다.
                        </p>

                        <div class="space-y-4">
                            <div class="flex gap-4 items-start">
                                <div class="bg-slate-100 px-3 py-1 rounded font-bold text-slate-600 text-sm whitespace-nowrap">Step 1</div>
                                <div class="text-sm text-slate-600">
                                    <strong>[+ 신규]</strong> 버튼을 누른 후, 상단에 새로 생긴 
                                    <span class="inline-flex items-center px-2 py-0.5 rounded border border-indigo-200 bg-indigo-50 text-indigo-700 text-xs font-bold"><i class="fa-regular fa-copy mr-1"></i> 기존자재 불러오기</span> 버튼을 클릭합니다.
                                </div>
                            </div>
                            <div class="flex gap-4 items-start">
                                <div class="bg-slate-100 px-3 py-1 rounded font-bold text-slate-600 text-sm whitespace-nowrap">Step 2</div>
                                <div class="text-sm text-slate-600">
                                    팝업창에서 <strong>참고할 자재(원본)</strong>를 검색하여 [불러오기]를 누릅니다.<br>
                                    <span class="text-slate-400 text-xs">* '승인 완료(Approved)'된 건과 '내가 작성 중(Requested)'인 건만 안전하게 검색됩니다.</span>
                                </div>
                            </div>
                            <div class="flex gap-4 items-start">
                                <div class="bg-slate-100 px-3 py-1 rounded font-bold text-slate-600 text-sm whitespace-nowrap">Step 3</div>
                                <div class="text-sm text-slate-600">
                                    <strong>✨ 찾아 바꾸기 (Find & Replace)</strong><br>
                                    시스템이 <em>"품명에서 특정 단어를 변경하시겠습니까?"</em>라고 물어봅니다.<br>
                                    예를 들어 <strong>'얼큰한맛'</strong>을 <strong>'순한맛'</strong>으로 입력하면, 품명 및 관련 텍스트가 자동으로 치환되어 입력됩니다.
                                </div>
                            </div>
                        </div>

                        <div class="warn-box mt-6 text-sm">
                            <strong>⚠️ 주의사항: 출처 추적 시스템</strong><br>
                            복사하여 생성된 요청은 <strong>"어떤 자재(REQ-XXX)를 베꼈는지"</strong> 시스템에 기록이 남습니다.<br>
                            따라서 원본 데이터가 잘못되었다면 내 데이터도 틀릴 수 있으니, 불러온 후에는 <strong>반드시 내용을 재검토</strong>해주세요.
                        </div>
                    </div>
                </section>

                <section id="input">
                    <h2 class="text-2xl font-bold text-slate-800 mb-6 flex items-center">
                        <span class="step-num">3</span> 상세 입력 및 자동 검증
                    </h2>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div class="bg-white p-6 rounded-xl border border-slate-200">
                            <h3 class="font-bold text-slate-800 mb-2">🤖 스마트 자동 입력</h3>
                            <p class="text-sm text-slate-600 mb-3">
                                복잡한 회계/물류 코드를 외울 필요가 없습니다. <strong>자재유형(MTART)</strong>만 선택하면 나머지는 시스템이 알아서 채워줍니다.
                            </p>
                            <ul class="text-xs text-slate-500 bg-slate-50 p-3 rounded space-y-1">
                                <li>• 완제품(FERT) 선택 시 → 조달유형(E), 평가클래스(7920) 자동 세팅</li>
                                <li>• 상품(HAWA) 선택 시 → 조달유형(F), 평가클래스(3100) 자동 세팅</li>
                            </ul>
                        </div>

                        <div class="bg-white p-6 rounded-xl border border-slate-200">
                            <h3 class="font-bold text-slate-800 mb-2">🛡️ 헬프 데스크 (Tooltips)</h3>
                            <p class="text-sm text-slate-600 mb-3">
                                낯선 용어 옆의 <strong>물음표(?) 아이콘</strong>을 눌러보세요.
                            </p>
                            <ul class="text-xs text-slate-500 bg-slate-50 p-3 rounded space-y-1">
                                <li>• <strong>정의(Definition):</strong> 이 필드가 무엇인지 설명</li>
                                <li>• <strong>리스크(Risk):</strong> 잘못 입력하면 어떤 사고(원가 왜곡 등)가 터지는지 경고</li>
                            </ul>
                        </div>
                    </div>

                    <div id="hierarchy" class="mt-6 bg-indigo-50 p-6 rounded-xl border border-indigo-100">
                        <h3 class="font-bold text-indigo-800 mb-2"><i class="fa-solid fa-sitemap mr-2"></i> 제품계층구조 (Hierarchy)</h3>
                        <p class="text-sm text-indigo-700 mb-3">
                            오타 방지를 위해 텍스트 입력이 아닌 <strong>1단계(대분류)부터 4단계까지 순차 선택</strong> 방식만 허용됩니다.
                        </p>
                        <div class="text-xs text-indigo-600 bg-white p-3 rounded border border-indigo-200">
                            <strong>💡 찾는 분류가 없다면?</strong><br>
                            선택 박스 하단의 <span class="font-bold">[+ 목록에 없나요?]</span> 버튼을 눌러주세요.<br>
                            신규 분류 생성 요청이 자동으로 관리자에게 전송되고 기록에 남습니다.
                        </div>
                    </div>
                </section>

                <section id="history">
                    <h2 class="text-2xl font-bold text-slate-800 mb-6 flex items-center">
                        <span class="step-num">4</span> 변경 이력 및 소통
                    </h2>

                    <div class="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
                        <div class="flex items-start gap-4">
                            <div class="bg-slate-100 p-3 rounded-full"><i class="fa-solid fa-clock-rotate-left text-slate-600 text-xl"></i></div>
                            <div>
                                <h3 class="font-bold text-slate-800">모든 변경사항 추적 (Audit Log)</h3>
                                <p class="text-sm text-slate-600 mt-1">
                                    상단의 <strong>[이력]</strong> 버튼을 누르면 누가, 언제, 어떤 값을, 무엇에서 무엇으로 바꿨는지 초 단위로 확인할 수 있습니다.
                                </p>
                            </div>
                        </div>

                        <div class="border-t border-slate-100"></div>

                        <div class="flex items-start gap-4">
                            <div class="bg-slate-100 p-3 rounded-full"><i class="fa-regular fa-comments text-slate-600 text-xl"></i></div>
                            <div>
                                <h3 class="font-bold text-slate-800">시스템 자동 알림 및 채팅</h3>
                                <p class="text-sm text-slate-600 mt-1">
                                    우측 사이드 패널에서 관리자와 실시간으로 소통할 수 있습니다. 또한 시스템이 <strong>"필수값 누락"</strong>이나 <strong>"복사 출처"</strong> 등을 자동으로 댓글로 남겨줍니다.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                <section id="coop">
                    <h2 class="text-2xl font-bold text-slate-800 mb-6 flex items-center">
                        <span class="step-num">5</span> 업무협조의뢰 작성 (일괄)
                    </h2>

                    <div class="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <p class="text-slate-600 text-sm mb-4">
                            여러 건의 자재 코드를 한 번에 요청할 때, 메일이나 결재 문서 작성이 번거로우셨나요?
                        </p>
                        <ol class="list-decimal list-inside text-sm text-slate-700 space-y-2 bg-slate-50 p-4 rounded-lg">
                            <li>목록에서 협조전에 포함할 요청들을 <strong>체크박스로 선택</strong>합니다.</li>
                            <li>상단의 <strong>[협조전]</strong> 버튼을 클릭합니다.</li>
                            <li>자동으로 생성된 <strong>"요청 양식(품명, 규격, 사유 포함)"</strong>을 확인합니다.</li>
                            <li><strong>[복사]</strong> 버튼을 눌러 메일이나 그룹웨어에 붙여넣기만 하면 끝!</li>
                        </ol>
                    </div>
                </section>

            </div>

            <footer class="bg-white border-t border-slate-200 py-10 text-center shrink-0">
                <p class="text-slate-500 text-sm font-medium">© 2025 HARIM INDUSTRY Smart MDM System</p>
                <p class="text-slate-400 text-xs mt-1">Manual Version 2.0 (Updated Features)</p>
            </footer>
        </main>
    </div>

</body>
</html>
  `;

  return (
    <div dangerouslySetInnerHTML={{ __html: manualHtml }} className="w-full h-screen" />
  );
}