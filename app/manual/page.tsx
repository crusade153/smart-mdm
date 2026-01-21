import React from 'react';

export default function ManualPage() {
  const manualHtml = `
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Smart MDM 사용자 매뉴얼</title>
    <!-- Tailwind CSS (CDN) -->
    <script src="https://cdn.tailwindcss.com"></script>
    <!-- Google Fonts -->
    <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;700&display=swap" rel="stylesheet">
    <!-- FontAwesome Icons -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <style>
        body { font-family: 'Noto Sans KR', sans-serif; scroll-behavior: smooth; }
        .sidebar-link.active { background-color: #e0e7ff; color: #4338ca; border-right: 3px solid #4338ca; }
        .badge { display: inline-block; padding: 0.25em 0.6em; font-size: 0.75rem; font-weight: 700; line-height: 1; text-align: center; white-space: nowrap; vertical-align: baseline; border-radius: 0.375rem; }
    </style>
</head>
<body class="bg-slate-50 text-slate-800">

    <div class="flex h-screen overflow-hidden">
        <!-- 사이드바 -->
        <aside class="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col flex-shrink-0 z-20 overflow-y-auto">
            <div class="h-16 flex items-center px-6 border-b border-slate-200 bg-slate-900 text-white shrink-0 sticky top-0 z-10">
                <i class="fa-solid fa-layer-group text-indigo-400 mr-2"></i>
                <span class="font-bold text-lg">Smart MDM 가이드</span>
            </div>
            <nav class="flex-1 py-4">
                <ul class="space-y-1">
                    <li><a href="#intro" class="sidebar-link block px-6 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900">1. 시스템 개요</a></li>
                    <li><a href="#login" class="sidebar-link block px-6 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900">2. 로그인 및 회원가입</a></li>
                    <li><a href="#layout" class="sidebar-link block px-6 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900">3. 메인 화면 구성</a></li>
                    <li><a href="#create" class="sidebar-link block px-6 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900">4. 신규 요청 작성 (중요)</a></li>
                    <li><a href="#hierarchy" class="sidebar-link block px-6 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 pl-10 text-indigo-600">- 제품계층구조 선택</a></li>
                    <li><a href="#extra" class="sidebar-link block px-6 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 pl-10 text-indigo-600">- 추가데이터 입력</a></li>
                    <li><a href="#process" class="sidebar-link block px-6 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900">5. 승인 및 반려 프로세스</a></li>
                    <li><a href="#comm" class="sidebar-link block px-6 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900">6. 소통 및 이력 관리</a></li>
                    <li><a href="#export" class="sidebar-link block px-6 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900">7. 데이터 내보내기 (CSV)</a></li>
                </ul>
            </nav>
            <div class="p-4 border-t border-slate-200 shrink-0 bg-white">
                <p class="text-xs text-slate-400">v1.0 (2025.05.21)</p>
            </div>
        </aside>

        <!-- 메인 컨텐츠 -->
        <main class="flex-1 overflow-y-auto scroll-smooth h-full">
            <div class="max-w-4xl mx-auto px-8 py-10 space-y-16 pb-32">
                
                <!-- 1. 시스템 개요 -->
                <section id="intro" class="space-y-4 pt-10">
                    <h1 class="text-3xl font-extrabold text-slate-900">Smart MDM 사용자 매뉴얼</h1>
                    <p class="text-lg text-slate-600 leading-relaxed">
                        Smart MDM은 하림산업의 마스터 데이터(자재 기준정보) 생성 요청, 검토, 승인 및 SAP 연동을 위한 표준화 플랫폼입니다. 
                        복잡한 SAP 필드를 체계적으로 관리하고, 유관부서 간의 실시간 소통을 지원합니다.
                    </p>
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                        <div class="bg-white p-4 rounded-lg border shadow-sm">
                            <div class="text-indigo-600 mb-2"><i class="fa-solid fa-check-circle fa-lg"></i></div>
                            <h3 class="font-bold mb-1">데이터 표준화</h3>
                            <p class="text-xs text-slate-500">필수값 검증 및 선택형 입력으로 휴먼 에러 방지</p>
                        </div>
                        <div class="bg-white p-4 rounded-lg border shadow-sm">
                            <div class="text-indigo-600 mb-2"><i class="fa-solid fa-comments fa-lg"></i></div>
                            <h3 class="font-bold mb-1">실시간 협업</h3>
                            <p class="text-xs text-slate-500">요청자-관리자 간 채팅 및 상태 추적</p>
                        </div>
                        <div class="bg-white p-4 rounded-lg border shadow-sm">
                            <div class="text-indigo-600 mb-2"><i class="fa-solid fa-file-csv fa-lg"></i></div>
                            <h3 class="font-bold mb-1">SAP 연동 지원</h3>
                            <p class="text-xs text-slate-500">SAP 업로드 양식에 맞춘 CSV 자동 생성</p>
                        </div>
                    </div>
                </section>

                <hr class="border-slate-200">

                <!-- 2. 로그인 -->
                <section id="login" class="space-y-4 pt-10">
                    <h2 class="text-2xl font-bold text-slate-800 flex items-center gap-2">
                        <span class="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-sm">2</span>
                        로그인 및 회원가입
                    </h2>
                    <div class="space-y-3 pl-10 text-slate-600">
                        <p><strong class="text-slate-800">로그인:</strong> 부여받은 ID와 비밀번호로 접속합니다.</p>
                        <p><strong class="text-slate-800">회원가입:</strong> 계정이 없는 경우 [회원가입] 탭에서 신청할 수 있습니다.</p>
                        <div class="bg-amber-50 border-l-4 border-amber-500 p-4 my-2 text-sm text-amber-700">
                            <strong>주의:</strong> 회원가입 직후에는 '승인 대기' 상태가 되며, 관리자가 승인한 후에 로그인이 가능합니다.
                        </div>
                    </div>
                </section>

                <hr class="border-slate-200">

                <!-- 3. 메인 화면 -->
                <section id="layout" class="space-y-4 pt-10">
                    <h2 class="text-2xl font-bold text-slate-800 flex items-center gap-2">
                        <span class="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-sm">3</span>
                        메인 화면 구성
                    </h2>
                    <p class="pl-10 text-slate-600">화면은 크게 좌측의 <strong>요청 목록(List)</strong>과 우측의 <strong>상세 입력 폼(Detail)</strong>으로 나뉩니다.</p>
                    
                    <div class="pl-10 space-y-4">
                        <ul class="list-disc list-inside space-y-2 text-sm text-slate-600">
                            <li><strong>요청 목록:</strong> 내가 작성했거나 검토해야 할 목록이 표시됩니다. 상단 검색창을 통해 품명이나 ID로 검색할 수 있습니다.</li>
                            <li><strong>상세 폼:</strong> 선택한 요청의 상세 정보를 탭 별로 입력하고 수정하는 공간입니다.</li>
                            <li><strong>상태 뱃지:</strong> 
                                <span class="badge bg-indigo-100 text-indigo-700">요 (Requested)</span> 
                                <span class="badge bg-orange-100 text-orange-700">진 (Review)</span> 
                                <span class="badge bg-green-100 text-green-700">완 (Approved)</span> 
                                <span class="badge bg-red-100 text-red-700">거 (Reject)</span>
                            </li>
                        </ul>
                    </div>
                </section>

                <hr class="border-slate-200">

                <!-- 4. 신규 요청 -->
                <section id="create" class="space-y-6 pt-10">
                    <h2 class="text-2xl font-bold text-slate-800 flex items-center gap-2">
                        <span class="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-sm">4</span>
                        신규 요청 작성
                    </h2>
                    <p class="pl-10 text-slate-600">
                        목록 상단의 <span class="bg-indigo-600 text-white px-2 py-1 rounded text-xs">Could you create + 신규</span> 버튼을 눌러 작성을 시작합니다.
                    </p>

                    <!-- 제품계층구조 -->
                    <div id="hierarchy" class="pl-10 bg-slate-50 p-6 rounded-xl border border-slate-200">
                        <h3 class="text-lg font-bold text-indigo-700 mb-3"><i class="fa-solid fa-sitemap mr-2"></i> 제품계층구조 선택 (Hierarchy Selector)</h3>
                        <p class="text-sm mb-4">가장 중요한 분류 기준인 제품 계층구조는 4단계 드롭다운을 통해 선택합니다.</p>
                        
                        <div class="space-y-2 text-sm text-slate-700">
                            <ol class="list-decimal list-inside space-y-1">
                                <li><strong>1단계(대분류)</strong>부터 순차적으로 선택합니다. (예: The미식)</li>
                                <li>상위 단계를 선택해야 하위 단계 목록이 활성화됩니다.</li>
                                <li>선택을 완료하면 하단에 <strong>선택 경로</strong>(예: The미식 > 장인라면 > ...)가 텍스트로 표시되어 검증이 쉽습니다.</li>
                                <li><strong>목록에 없는 경우:</strong> 우측 하단 <span class="text-amber-600 font-bold"><i class="fa-solid fa-circle-plus"></i> 목록에 없나요?</span> 버튼을 눌러 신규 생성을 요청하세요.</li>
                            </ol>
                        </div>
                    </div>

                    <!-- 추가 데이터 -->
                    <div id="extra" class="pl-10 bg-slate-50 p-6 rounded-xl border border-slate-200">
                        <h3 class="text-lg font-bold text-indigo-700 mb-3"><i class="fa-solid fa-plus-square mr-2"></i> 추가데이터 탭 (신규 기능)</h3>
                        <p class="text-sm mb-4">
                            기존의 '추가정보' 탭은 SAP 표준 필드로 구성되어 수정이 제한적일 수 있습니다.<br>
                            새로 신설된 <strong>[추가데이터]</strong> 탭은 자유롭게 값을 입력할 수 있습니다.
                        </p>
                        <ul class="list-disc list-inside text-sm text-slate-700 space-y-1">
                            <li><strong>배경색:</strong> 흰색 (자유 입력 가능)</li>
                            <li><strong>항목:</strong> 환산단위, 환산분자, 환산분모, 병렬단위Type 등</li>
                            <li>이곳에 입력된 데이터는 CSV 다운로드 시 <strong>별도 영역(시트 2)</strong>에 출력됩니다.</li>
                        </ul>
                    </div>
                </section>

                <hr class="border-slate-200">

                <!-- 5. 프로세스 -->
                <section id="process" class="space-y-4 pt-10">
                    <h2 class="text-2xl font-bold text-slate-800 flex items-center gap-2">
                        <span class="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-sm">5</span>
                        승인 및 반려 프로세스
                    </h2>
                    <div class="pl-10 overflow-x-auto">
                        <div class="flex items-center gap-4 text-sm min-w-max">
                            <div class="flex flex-col items-center gap-2">
                                <div class="w-24 h-10 bg-indigo-100 border border-indigo-300 rounded flex items-center justify-center font-bold text-indigo-700">Requested</div>
                                <span class="text-slate-500">작성 완료 및 요청</span>
                            </div>
                            <i class="fa-solid fa-arrow-right text-slate-300"></i>
                            <div class="flex flex-col items-center gap-2">
                                <div class="w-24 h-10 bg-orange-100 border border-orange-300 rounded flex items-center justify-center font-bold text-orange-700">Review</div>
                                <span class="text-slate-500">관리자 검토 중</span>
                            </div>
                            <i class="fa-solid fa-arrow-right text-slate-300"></i>
                            <div class="flex flex-col items-center gap-2">
                                <div class="w-24 h-10 bg-green-100 border border-green-300 rounded flex items-center justify-center font-bold text-green-700">Approved</div>
                                <span class="text-slate-500">최종 승인 (SAP코드 생성)</span>
                            </div>
                        </div>
                        <div class="mt-4 text-sm text-slate-600">
                            * <strong>반려(Reject):</strong> 관리자가 반려 사유를 입력하고 상태를 변경하면, 요청자가 내용을 수정하여 다시 저장할 수 있습니다.
                        </div>
                    </div>
                </section>

                <hr class="border-slate-200">

                <!-- 6. 소통 -->
                <section id="comm" class="space-y-4 pt-10">
                    <h2 class="text-2xl font-bold text-slate-800 flex items-center gap-2">
                        <span class="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-sm">6</span>
                        소통 및 이력 관리
                    </h2>
                    <div class="pl-10 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h3 class="font-bold text-slate-900 mb-2">💬 실시간 채팅</h3>
                            <p class="text-sm text-slate-600 mb-2">우측 패널(모바일은 버튼 클릭)을 통해 관리자와 실시간으로 메시지를 주고받을 수 있습니다.</p>
                            <p class="text-sm text-slate-500 bg-slate-100 p-2 rounded">
                                <i class="fa-solid fa-info-circle"></i> 계층구조 신규 요청 등 시스템 메시지도 이곳에 기록됩니다.
                            </p>
                        </div>
                        <div>
                            <h3 class="font-bold text-slate-900 mb-2">🕒 변경 이력 (Audit Log)</h3>
                            <p class="text-sm text-slate-600">상단의 <strong>[이력]</strong> 버튼을 누르면 누가, 언제, 어떤 필드를 변경했는지 상세 로그를 확인할 수 있습니다.</p>
                        </div>
                    </div>
                </section>

                <hr class="border-slate-200">

                <!-- 7. 내보내기 -->
                <section id="export" class="space-y-4 pt-10">
                    <h2 class="text-2xl font-bold text-slate-800 flex items-center gap-2">
                        <span class="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-sm">7</span>
                        데이터 내보내기 (CSV)
                    </h2>
                    <p class="pl-10 text-slate-600">
                        목록에서 원하는 항목을 체크한 후, 상단의 <span class="bg-white border border-green-300 text-green-700 px-2 py-0.5 rounded text-xs font-bold"><i class="fa-solid fa-download"></i> CSV</span> 버튼을 누릅니다.
                    </p>
                    
                    <div class="pl-10 bg-slate-800 text-slate-200 p-4 rounded-lg font-mono text-xs shadow-inner">
                        <div class="mb-4">
                            <span class="text-slate-400">--- [영역 1] SAP 업로드 양식 (기본 데이터) ---</span><br>
                            플랜트, 자재유형, 자재코드, 품명, 기본단위, ... <br>
                            1021, FERT, 5000001, 더미식 장인라면, EA, ...
                        </div>
                        <div>
                            <span class="text-green-400">--- [영역 2] 추가 데이터 (시트 2 역할) ---</span><br>
                            <span class="text-yellow-300">추가데이터</span><br>
                            자재코드, 환산단위, 환산분자, 환산분모, 병렬단위Type<br>
                            5000001, BOX, 20, 1, A
                        </div>
                    </div>
                    <p class="pl-10 text-sm text-slate-500 mt-2">
                        * <strong>[추가데이터]</strong> 섹션의 '자재코드'는 기본 정보에서 생성된 코드가 자동으로 매핑되어 출력됩니다.
                    </p>
                </section>

            </div>

            <!-- Footer -->
            <footer class="bg-slate-50 border-t border-slate-200 py-8 text-center shrink-0">
                <p class="text-slate-400 text-xs">© 2025 HARIM INDUSTRY Smart MDM System. All rights reserved.</p>
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