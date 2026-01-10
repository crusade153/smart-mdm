"use client"
import { useEffect, useState } from "react";
import { getPendingUsersAction, approveUserAction } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { useMDMStore } from "@/stores/useMDMStore";
import { useRouter } from "next/navigation";

export default function AdminPage() {
  const [pendingUsers, setPendingUsers] = useState<any[]>([]);
  const { currentUser, isLoggedIn } = useMDMStore();
  const router = useRouter();

  // 관리자 체크
  useEffect(() => {
    if (!isLoggedIn || !currentUser?.isAdmin) {
      alert("관리자 권한이 필요합니다.");
      router.push("/main");
    }
  }, [isLoggedIn, currentUser, router]);

  // 목록 불러오기
  const loadUsers = async () => {
    const users = await getPendingUsersAction();
    setPendingUsers(users);
  };

  useEffect(() => { loadUsers(); }, []);

  const handleApprove = async (userId: string) => {
    if(!confirm("승인하시겠습니까?")) return;
    await approveUserAction(userId);
    alert("승인 처리되었습니다.");
    loadUsers(); // 목록 갱신
  };

  return (
    <div className="min-h-screen bg-slate-100 p-10 flex justify-center">
        <div className="w-full max-w-3xl bg-white rounded-xl shadow-lg p-8 h-fit">
            <h1 className="text-2xl font-bold mb-6 text-slate-800 border-b pb-4">👥 가입 승인 대기 목록</h1>
            
            {pendingUsers.length === 0 ? (
                <p className="text-center text-slate-500 py-10">대기 중인 사용자가 없습니다.</p>
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
            
            <div className="mt-8 text-center">
                <Button variant="outline" onClick={() => router.push('/main')}>메인으로 돌아가기</Button>
            </div>
        </div>
    </div>
  );
}