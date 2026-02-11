"use client"

import { useEffect, useState, use } from "react"
import { useRouter } from "next/navigation"
import { useMDMStore } from "@/stores/useMDMStore"
import { getRequestsAction, getCommentsAction } from "@/actions/mdm"
import { MDMForm } from "@/components/mdm/MDMForm"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Loader2 } from "lucide-react"

// Next.js 15: params는 Promise입니다.
export default function RequestDetailPage({ params }: { params: Promise<{ id: string }> }) {
  // use() 훅을 사용하여 Promise 언래핑 (React 19/Next 15)
  const { id } = use(params);
  const router = useRouter();
  const { requests, setRequests, setCurrentRequest, setComments } = useMDMStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initPage = async () => {
      // 1. 신규 작성이면 패스
      if (id === 'new') {
        setLoading(false);
        return;
      }

      // 2. 스토어에서 데이터 찾기 (의존성 루프 방지를 위해 store.getState() 방식 사용 권장하나, 여기서는 로직 분리로 해결)
      // 현재 requests 상태에서 찾음
      let targetRequest = requests.find(r => r.id === id);
      
      // 없으면 서버에서 가져옴 (새로고침 시)
      if (!targetRequest) {
        try {
          // 여기서 getRequestsAction을 호출하지만, setRequests는 조건부로 실행하거나
          // 의존성 배열에서 requests를 뺐기 때문에 안전합니다.
          const allRequests = await getRequestsAction();
          setRequests(allRequests); // 스토어 업데이트
          targetRequest = allRequests.find((r: any) => r.id === id);
        } catch (e) {
          console.error(e);
        }
      }

      if (targetRequest) {
        setCurrentRequest(targetRequest);
        // 코멘트 가져오기
        const comments = await getCommentsAction(id);
        setComments(id, comments);
      } else {
        alert("요청을 찾을 수 없습니다.");
        router.push('/dashboard');
      }
      setLoading(false);
    };

    initPage();
    
    // 🚨 [핵심 수정] 'requests'를 의존성 배열에서 제거하여 무한 루프 방지
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, router, setRequests, setCurrentRequest, setComments]); 

  if (loading) {
    return (
        <div className="h-[calc(100vh-100px)] flex items-center justify-center">
            <Loader2 className="animate-spin text-indigo-600 w-10 h-10"/>
        </div>
    );
  }

  return (
    <div className="max-w-[1600px] mx-auto animate-in fade-in slide-in-from-bottom-2 duration-500 h-full flex flex-col">
      {/* 뒤로가기 헤더 */}
      <div className="mb-4 shrink-0">
        <Button variant="ghost" size="sm" className="text-slate-500 hover:text-slate-800 -ml-2" onClick={() => router.push('/dashboard')}>
          <ArrowLeft size={16} className="mr-2"/> 목록으로 돌아가기
        </Button>
      </div>

      {/* 폼 컴포넌트 컨테이너 (높이 확보) */}
      <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden flex-1 min-h-0">
        <MDMForm />
      </div>
    </div>
  );
}