"use client"
import { useEffect, useState } from "react";
// 여기서 getAllUsersAction을 불러올 때 에러가 났었습니다. 
// 위 1번 파일이 수정되면 에러가 사라집니다.
import { getPendingUsersAction, approveUserAction, getAllUsersAction } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { useMDMStore } from "@/stores/useMDMStore";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Users } from "lucide-react";

export default function AdminPage() {
  const [pendingUsers, setPendingUsers] = useState<any[]>([]);
  
  // 회원 명부용 상태
  const [userList, setUserList] = useState<any[]>([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 15;

  const { currentUser, isLoggedIn } = useMDMStore();
  const router = useRouter();

  // 관리자 권한 체크
  useEffect(() => {
    if (!isLoggedIn || !currentUser?.isAdmin) {
      alert("관리자 권한이 필요합니다.");
      router.push("/main");
    }
  }, [isLoggedIn, currentUser, router]);

  // 1. 대기 목록 로드
  const loadPendingUsers = async () => {
    const users = await getPendingUsersAction();
    setPendingUsers(users);
  };

  // 2. 전체 회원 명부 로드 (페이지네이션)
  const loadAllUsers = async (page: number) => {
    const result = await getAllUsersAction(page, PAGE_SIZE);
    if (result.success) {
        setUserList(result.users);
        setTotalUsers(result.total);
    }
  };

  // 초기 실행
  useEffect(() => { 
      loadPendingUsers(); 
      loadAllUsers(1); 
  }, []);

  // 페이지 변경 핸들러
  const handlePageChange = (newPage: number) => {
      const maxPage = Math.ceil(totalUsers / PAGE_SIZE);
      if (newPage < 1 || newPage > maxPage) return;
      
      setCurrentPage(newPage);
      loadAllUsers(newPage);
  };

  // 승인 버튼 핸들러
  const handleApprove = async (userId: string) => {
    if(!confirm("승인하시겠습니까?")) return;
    await approveUserAction(userId);
    alert("승인 처리되었습니다.");
    
    // 두 목록 모두 새로고침 (상태 변경 반영)
    loadPendingUsers(); 
    loadAllUsers(currentPage); 
  };

  return (
    <div className="min-h-screen bg-slate-100 p-10 flex justify-center">
        <div className="w-full max-w-4xl flex flex-col gap-8">
            
            {/* 섹션 1: 가입 승인 대기 목록 */}
            <div className="bg-white rounded-xl shadow-lg p-8">
                <h1 className="text-2xl font-bold mb-6 text-slate-800 border-b pb-4">👥 가입 승인 대기 목록</h1>
                
                {pendingUsers.length === 0 ? (
                    <p className="text-center text-slate-500 py-6 text-sm">대기 중인 사용자가 없습니다.</p>
                ) : (
                    <ul className="space-y-3">
                    {pendingUsers.map(u => (
                        <li key={u.id} className="flex justify-between items-center border p-4 rounded-lg bg-slate-50">
                            <div className="flex flex-col">
                                <span className="font-bold text-slate-800">{u.name} <span className="text-sm font-normal text-slate-500">({u.id})</span></span>
                                <span className="text-xs text-slate-400">{u.email}</span>
                            </div>
                            <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => handleApprove(u.id)}>승인하기</Button>
                        </li>
                    ))}
                    </ul>
                )}
            </div>

            {/* 섹션 2: 전체 회원 명부 */}
            <div className="bg-white rounded-xl shadow-lg p-8">
                <div className="flex justify-between items-center border-b pb-4 mb-6">
                    <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        <Users className="w-6 h-6 text-indigo-600"/> 전체 회원 명부
                    </h2>
                    <span className="text-sm bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full font-bold">
                        총 {totalUsers}명
                    </span>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b">
                            <tr>
                                <th className="px-4 py-3">이름 (ID)</th>
                                <th className="px-4 py-3">이메일</th>
                                <th className="px-4 py-3">가입일</th>
                                <th className="px-4 py-3 text-center">상태</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {userList.length === 0 ? (
                                <tr><td colSpan={4} className="text-center py-10 text-slate-400">등록된 회원이 없습니다.</td></tr>
                            ) : (
                                userList.map((user) => (
                                    <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-4 py-3 font-medium text-slate-800">
                                            {user.name} <span className="text-slate-400 font-normal ml-1">({user.id})</span>
                                        </td>
                                        <td className="px-4 py-3 text-slate-600">{user.email}</td>
                                        <td className="px-4 py-3 text-slate-500">
                                            {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '-'}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <span className={`px-2 py-1 rounded text-xs font-bold ${
                                                user.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                                            }`}>
                                                {user.status === 'active' ? '승인' : '대기'}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* 페이지네이션 컨트롤 */}
                {totalUsers > 0 && (
                    <div className="flex justify-center items-center gap-4 mt-6 pt-4 border-t border-slate-100">
                        <Button 
                            variant="outline" 
                            size="sm" 
                            disabled={currentPage === 1}
                            onClick={() => handlePageChange(currentPage - 1)}
                            className="h-8 px-3"
                        >
                            <ChevronLeft className="w-4 h-4 mr-1"/> 이전
                        </Button>
                        <span className="text-sm font-medium text-slate-600">
                            Page {currentPage} / {Math.max(1, Math.ceil(totalUsers / PAGE_SIZE))}
                        </span>
                        <Button 
                            variant="outline" 
                            size="sm" 
                            disabled={currentPage >= Math.ceil(totalUsers / PAGE_SIZE)}
                            onClick={() => handlePageChange(currentPage + 1)}
                            className="h-8 px-3"
                        >
                            다음 <ChevronRight className="w-4 h-4 ml-1"/>
                        </Button>
                    </div>
                )}
            </div>
            
            <div className="text-center pb-10">
                <Button variant="outline" onClick={() => router.push('/main')}>메인으로 돌아가기</Button>
            </div>
        </div>
    </div>
  );
}