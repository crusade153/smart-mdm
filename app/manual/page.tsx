import React from 'react';

export default function ManualPage() {
  const manualHtml = `
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Smart MDM 사용자 가이드</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Pretendard:wght@300;400;600;800&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <style>
        body { font-family: 'Pretendard', sans-serif; scroll-behavior: smooth; }
        .sidebar-link.active { background-color: #EEF2FF; color: #4F46E5; border-right: 3px solid #4F46E5; font-weight: 600; }
        .tip-box { background-color: #F0F9FF; border-left: 4px solid #0EA5E9; padding: 1rem; border-radius: 0 0.5rem 0.5rem 0; margin: 1rem 0; }
        .warn-box { background-color: #FFFBEB; border-left: 4px solid #F59E0B; padding: 1rem; border-radius: 0 0.5rem 0.5rem 0; margin: 1rem 0; }
        .step-circle { width: 2rem; height: 2rem; background-color: #4F46E5; color: white; border-radius: 9999px; display: flex; align-items: center; justify-content: center; font-weight: bold; margin-right: 0.75rem; flex-shrink: 0; }
    </style>
</head>
<body class="bg-slate-50 text-slate-800 antialiased">

    <div class="flex h-screen overflow-hidden">
        
        <aside class="w-72 bg-white border-r border-slate-200 hidden md:flex flex-col flex-shrink-0 z-20 shadow-sm">
            <div class="h-20 flex items-center px-6 border-b border-slate-100 bg-white shrink-0 sticky top-0 z-10">
                <div class="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold mr-3">M</div>
                <span class="font-bold text-xl text-slate-800">Smart MDM</span>
            </div>
            
            <nav class="flex-1 py-6 overflow-y-auto">
                <ul class="space-y-1">
                    <li><a href="#login" class="sidebar-link block px-6 py-3 text-sm text-slate-600 hover:bg-slate-50 transition-colors">1. 회원가입 및 로그인</a></li>
                    <li><a href="#main" class="sidebar-link block px-6 py-3 text-sm text-slate-600 hover:bg-slate-50 transition-colors">2. 목록 조회 및 검색</a></li>
                    <li><a href="#create" class="sidebar-link block px-6 py-3 text-sm text-slate-600 hover:bg-slate-50 transition-colors">3. 신규 요청 작성 (중요)</a></li>
                    <li><a href="#hierarchy" class="sidebar-link block px-6 py-3 text-sm text-slate-600 hover:bg-slate-50 transition-colors pl-10 text-indigo-600">ㄴ 계층구조 및 누락 알림</a></li>
                    <li><a href="#tooltip" class="sidebar-link block px-6 py-3 text-sm text-slate-600 hover:bg-slate-50 transition-colors pl-10 text-indigo-600">ㄴ 툴팁(도움말) 활용</a></li>
                    <li><a href="#process" class="sidebar-link block px-6 py-3 text-sm text-slate-600 hover:bg-slate-50 transition-colors">4. 진행 상태 및 승인</a></li>
                    <li><a href="#contact" class="sidebar-link block px-6 py-3 text-sm text-slate-600 hover:bg-slate-50 transition-colors">5. 문의하기</a></li>
                </ul>
            </nav>
        </aside>

        <main class="flex-1 overflow-y-auto scroll-smooth h-full bg-slate-50">
            <div class="max-w-5xl mx-auto px-10 py-16 space-y-24 pb-40">
                
                <section class="text-center pb-8 border-b border-slate-200">
                    <h1 class="text-4xl font-extrabold text-slate-900 mb-4">Smart MDM 사용 가이드</h1>
                    <p class="text-lg text-slate-600">
                        기준정보 관리, 이제 더 쉽고 정확하게 시작하세요.<br>
                        사용자 여러분의 원활한 업무를 위해 상세한 사용법을 안내해 드립니다.
                    </p>
                </section>

                <section id="login">
                    <div class="flex items-center gap-3 mb-6">
                        <div class="step-circle">1</div>
                        <h2 class="text-2xl font-bold text-slate-800">회원가입은 회사 메일로!</h2>
                    </div>
                    
                    <div class="bg-white p-8 rounded-xl border border-slate-200 shadow-sm">
                        <p class="text-slate-600 mb-4">
                            본인 확인 및 보안을 위해 회원가입 시 반드시 <strong>회사 이메일 계정</strong>을 ID로 사용해주세요.
                        </p>
                        <div class="bg-slate-100 p-4 rounded-lg font-mono text-sm text-slate-700 border border-slate-300 inline-block mb-4">
                            ✅ 올바른 예시: <strong>yukd2022@harim-foods.com</strong>
                        </div>
                        <p class="text-sm text-slate-500">
                            * 가입 직후에는 '승인 대기' 상태이며, 관리자 승인 후 로그인이 가능합니다.
                        </p>
                    </div>
                </section>

                <section id="main">
                    <div class="flex items-center gap-3 mb-6">
                        <div class="step-circle">2</div>
                        <h2 class="text-2xl font-bold text-slate-800">원하는 정보 찾기</h2>
                    </div>

                    <div class="bg-white p-8 rounded-xl border border-slate-200 shadow-sm space-y-4">
                        <h3 class="font-bold text-lg text-indigo-700">🔍 검색 기능 활용</h3>
                        <p class="text-slate-600">
                            화면 상단의 검색창을 통해 내가 찾고자 하는 요청 건을 빠르게 조회할 수 있습니다.
                        </p>
                        <ul class="list-disc list-inside bg-slate-50 p-4 rounded-lg text-sm text-slate-700 space-y-1">
                            <li><strong>ID 검색:</strong> 요청 번호 (예: REQ-1234...)</li>
                            <li><strong>이름 검색:</strong> 요청자 이름 (예: 홍길동)</li>
                            <li><strong>품명 검색:</strong> 자재 내역 (예: 장인라면)</li>
                        </ul>
                    </div>
                </section>

                <section id="create">
                    <div class="flex items-center gap-3 mb-6">
                        <div class="step-circle">3</div>
                        <h2 class="text-2xl font-bold text-slate-800">신규 요청 작성하기</h2>
                    </div>

                    <p class="text-slate-600 mb-6 pl-11">
                        우측 상단의 <span class="inline-flex items-center px-2 py-1 rounded bg-indigo-600 text-white text-xs font-bold"><i class="fa-solid fa-plus mr-1"></i> 신규</span> 버튼을 누르면 작성 폼이 활성화됩니다.
                    </p>

                    <div class="pl-11 space-y-8">
                        <div class="bg-white p-6 rounded-xl border border-slate-200">
                            <h3 class="text-lg font-bold text-slate-800 mb-3 flex items-center">
                                <i class="fa-solid fa-star-of-life text-red-500 text-xs mr-2"></i> 필수 입력값과 누락 알림
                            </h3>
                            <p class="text-slate-600 text-sm mb-4">
                                입력 폼에서 라벨 옆에 <span class="text-red-500 font-bold">*</span> 표시가 있는 항목은 필수값입니다.
                            </p>
                            
                            <div class="warn-box text-sm">
                                <strong class="block mb-2 text-amber-700"><i class="fa-solid fa-bell"></i> 잠깐! 필수값을 누락하고 저장하셨나요?</strong>
                                <p class="mb-2">
                                    Smart MDM은 임시 저장을 돕기 위해 필수값이 비어있어도 <strong>저장은 가능합니다.</strong>
                                </p>
                                <p>
                                    하지만, 저장 직후 <strong>우측 [메시지 히스토리]</strong>를 꼭 확인해주세요!<br>
                                    시스템이 <span class="text-red-600 font-bold">"어떤 항목이 누락되었는지"</span> 자동으로 리스트를 뽑아 알려드립니다.
                                </p>
                            </div>
                        </div>

                        <div id="hierarchy" class="bg-indigo-50 p-6 rounded-xl border border-indigo-100">
                            <h3 class="text-lg font-bold text-indigo-800 mb-3 flex items-center">
                                <i class="fa-solid fa-sitemap mr-2"></i> 제품계층구조 선택
                            </h3>
                            <p class="text-sm text-indigo-700 mb-3">
                                제품 분류는 1단계(대분류)부터 4단계까지 순서대로 선택해야 합니다.
                            </p>
                            <div class="tip-box bg-white text-sm border-indigo-400">
                                <strong>💡 목록에 없는 분류가 필요한가요?</strong><br>
                                선택 상자 밑에 있는 <span class="text-amber-600 font-bold">[목록에 없나요?]</span> 버튼을 눌러주세요.<br>
                                팝업창에 필요한 분류 내용을 적어 요청하면, <strong>메시지 히스토리</strong>에 기록이 남고 관리자에게 전달됩니다.
                            </div>
                        </div>

                        <div id="tooltip" class="bg-white p-6 rounded-xl border border-slate-200">
                            <h3 class="text-lg font-bold text-slate-800 mb-3 flex items-center">
                                <i class="fa-regular fa-circle-question mr-2 text-slate-400"></i> 이게 무슨 항목이지? (툴팁 활용)
                            </h3>
                            <p class="text-sm text-slate-600 mb-3">
                                낯선 속성값(컬럼)이 있다면 항목 이름 옆의 <strong>물음표 아이콘(?)</strong>을 눌러보세요.
                            </p>
                            <ul class="list-disc list-inside text-sm text-slate-600 bg-slate-50 p-4 rounded">
                                <li>해당 항목이 <strong>무엇을 의미하는지</strong> 설명해 줍니다.</li>
                                <li><strong>오입력 시 발생할 수 있는 리스크</strong>를 안내하여 실수를 방지합니다.</li>
                                <li class="text-xs text-slate-400 mt-2">* 설명 내용은 지속적으로 업데이트 중입니다.</li>
                            </ul>
                        </div>
                    </div>
                </section>

                <section id="process">
                    <div class="flex items-center gap-3 mb-6">
                        <div class="step-circle">4</div>
                        <h2 class="text-2xl font-bold text-slate-800">진행 상태 한눈에 보기</h2>
                    </div>

                    <div class="bg-white p-8 rounded-xl border border-slate-200 shadow-sm">
                        <div class="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
                            <div class="p-4 bg-indigo-50 rounded-lg border border-indigo-100">
                                <span class="block text-2xl mb-2">📝</span>
                                <h4 class="font-bold text-indigo-700">진행 (Requested)</h4>
                                <p class="text-xs text-slate-500 mt-1">요청을 완료한 상태</p>
                            </div>
                            <div class="hidden md:flex items-center justify-center text-slate-300">
                                <i class="fa-solid fa-arrow-right"></i>
                            </div>
                            <div class="p-4 bg-orange-50 rounded-lg border border-orange-100">
                                <span class="block text-2xl mb-2">👀</span>
                                <h4 class="font-bold text-orange-700">검토 (Review)</h4>
                                <p class="text-xs text-slate-500 mt-1">관리자가 확인 중</p>
                            </div>
                            <div class="hidden md:flex items-center justify-center text-slate-300">
                                <i class="fa-solid fa-arrow-right"></i>
                            </div>
                            <div class="p-4 bg-green-50 rounded-lg border border-green-100">
                                <span class="block text-2xl mb-2">✅</span>
                                <h4 class="font-bold text-green-700">완료 (Approved)</h4>
                                <p class="text-xs text-slate-500 mt-1">제품코드 부여 완료</p>
                            </div>
                        </div>

                        <div class="mt-6 p-4 bg-red-50 rounded-lg border border-red-100 flex gap-4 items-start">
                            <i class="fa-solid fa-ban text-red-500 mt-1 text-lg"></i>
                            <div>
                                <h4 class="font-bold text-red-700">혹시 '거절(Reject)' 되었나요?</h4>
                                <p class="text-sm text-red-600 mt-1">
                                    불필요한 데이터이거나 수정이 필요한 경우 거절될 수 있습니다.<br>
                                    당황하지 마시고 <strong>우측 [메시지 히스토리]</strong>를 확인하세요. 관리자가 남긴 <strong>거절 사유</strong>를 확인할 수 있습니다.
                                </p>
                            </div>
                        </div>

                        <div class="mt-6 border-t pt-6">
                            <h4 class="font-bold text-slate-800 mb-2 flex items-center gap-2">
                                <i class="fa-regular fa-comments"></i> 관리자와 소통하기
                            </h4>
                            <p class="text-sm text-slate-600">
                                별도로 문의할 내용이 있다면 언제든지 우측 채팅창에 메시지를 남겨주세요.<br>
                                관리자가 확인 후 답변을 드립니다.
                            </p>
                        </div>
                    </div>
                </section>

                <section id="contact">
                    <div class="flex items-center gap-3 mb-6">
                        <div class="step-circle">5</div>
                        <h2 class="text-2xl font-bold text-slate-800">더 궁금한 점이 있으신가요?</h2>
                    </div>

                    <div class="bg-slate-800 text-white p-8 rounded-xl shadow-lg flex flex-col md:flex-row items-center justify-between gap-6">
                        <div>
                            <h3 class="font-bold text-lg mb-2">원가 TFT 문의 채널</h3>
                            <p class="text-slate-300 text-sm">
                                시스템 사용 중 어려운 점이나 건의사항이 있다면 언제든 연락 주세요.<br>
                                여러분의 의견으로 Smart MDM은 계속 발전합니다.
                            </p>
                        </div>
                        <a href="mailto:yukd2022@harim-foods.com" class="bg-white text-slate-900 px-6 py-3 rounded-lg font-bold hover:bg-slate-100 transition-colors flex items-center gap-2">
                            <i class="fa-regular fa-envelope"></i> yukd2022@harim-foods.com
                        </a>
                    </div>
                </section>

            </div>

            <footer class="bg-white border-t border-slate-200 py-10 text-center shrink-0">
                <p class="text-slate-500 text-sm font-medium">© 2025 HARIM INDUSTRY Smart MDM System</p>
                <p class="text-slate-400 text-xs mt-1">함께 만드는 가치, 함께 여는 미래</p>
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