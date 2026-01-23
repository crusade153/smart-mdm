"use client"

import { useState, useEffect, useMemo } from "react"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PlusCircle, Loader2, ChevronRight, MapPin } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { getHierarchyAction, HierarchyItem } from "@/actions/mdm"

interface Props {
  value?: string;
  onChange: (value: string) => void;
  onRequestNew?: (reason: string) => void;
}

export function HierarchySelector({ value, onChange, onRequestNew }: Props) {
  const [hierarchyData, setHierarchyData] = useState<HierarchyItem[]>([]);
  const [loading, setLoading] = useState(true);

  // 선택된 코드 상태 (L1~L4)
  const [l1, setL1] = useState("");
  const [l2, setL2] = useState("");
  const [l3, setL3] = useState("");
  const [l4, setL4] = useState("");
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newRequestText, setNewRequestText] = useState("");

  // 1. 컴포넌트 마운트 시 구글 시트 데이터 불러오기
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const data = await getHierarchyAction();
      setHierarchyData(data);
      setLoading(false);
    };
    fetchData();
  }, []);

  // 2. 저장된 값(value)이 들어오면 역으로 추적하여 드롭다운 자동 선택 (18자리 코드 파싱)
  useEffect(() => {
    if (value && value.length === 18) {
        // 이미 선택된 상태와 같다면(무한루프 방지) 중단
        const current = `${l1}${l2}${l3}${l4}`;
        if (value === current) return;

        const nextL1 = value.substring(0, 3);
        const nextL2 = value.substring(3, 8);
        const nextL3 = value.substring(8, 13);
        const nextL4 = value.substring(13, 18);

        setL1(nextL1);
        setL2(nextL2);
        setL3(nextL3);
        setL4(nextL4);
    } else if (!value) {
        setL1(""); setL2(""); setL3(""); setL4("");
    }
  }, [value]); // value가 바뀔 때마다 실행

  // 3. 계층별 필터링 로직 (Cascading)
  const l1List = useMemo(() => 
    hierarchyData.filter(item => item.level === 1), 
  [hierarchyData]);

  const l2List = useMemo(() => 
    hierarchyData.filter(item => item.level === 2 && item.parent === l1), 
  [hierarchyData, l1]);

  const l3List = useMemo(() => 
    hierarchyData.filter(item => item.level === 3 && item.parent === l2), 
  [hierarchyData, l2]);

  const l4List = useMemo(() => 
    hierarchyData.filter(item => item.level === 4 && item.parent === l3), 
  [hierarchyData, l3]);

  // 4. 선택 값이 변경될 때마다 부모 컴포넌트에 알림
  useEffect(() => {
    if (l1) {
        // 값이 하나라도 선택되면 조합해서 전달
        const fullCode = `${l1}${l2}${l3}${l4}`;
        if (value !== fullCode) {
            onChange(fullCode);
        }
    }
  }, [l1, l2, l3, l4, onChange, value]);

  // 5. [수정 완료] 선택된 경로 텍스트 생성 (부모 코드까지 검사하여 정확한 매핑)
  const selectedPath = useMemo(() => {
    if (hierarchyData.length === 0) return "";
    
    // ✅ 여기서 parent(부모)가 일치하는지 꼭 확인해야 동명이인(같은 코드 다른 그룹) 문제를 막습니다.
    const n1 = hierarchyData.find(i => i.level === 1 && i.code === l1)?.name;
    const n2 = hierarchyData.find(i => i.level === 2 && i.code === l2 && i.parent === l1)?.name;
    const n3 = hierarchyData.find(i => i.level === 3 && i.code === l3 && i.parent === l2)?.name;
    const n4 = hierarchyData.find(i => i.level === 4 && i.code === l4 && i.parent === l3)?.name;
    
    // 존재하는 이름만 필터링하여 화살표로 연결
    return [n1, n2, n3, n4].filter(Boolean).join(" > ");
  }, [l1, l2, l3, l4, hierarchyData]);

  const handleNewRequest = () => {
    if (newRequestText.trim() && onRequestNew) {
      onRequestNew(`📂 [계층구조 신규 요청] ${newRequestText}`);
      setNewRequestText("");
      setIsDialogOpen(false);
    }
  }

  // 로딩 중일 때 표시
  if (loading) {
    return (
        <div className="flex items-center gap-2 p-3 bg-slate-50 border rounded-lg text-xs text-slate-500">
            <Loader2 className="animate-spin h-4 w-4" /> 데이터 불러오는 중...
        </div>
    )
  }

  return (
    <div className="space-y-3 p-4 bg-slate-50/50 border border-slate-200 rounded-lg shadow-sm">
      
      {/* 경로 및 시각화 영역 */}
      <div className="flex flex-col gap-1.5 mb-2">
        <div className="flex items-center gap-2 text-xs text-slate-700 bg-indigo-50/60 px-3 py-2.5 rounded-md border border-indigo-100 ring-1 ring-indigo-200/50">
            <MapPin size={14} className="text-indigo-600 shrink-0"/>
            <span className="font-bold text-indigo-700 shrink-0">선택 경로:</span>
            <span className="truncate font-medium text-slate-900 flex-1">
                {selectedPath || <span className="text-slate-400 font-normal">아래에서 단계를 선택해주세요</span>}
            </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {/* 1단계 선택 */}
        <Select value={l1} onValueChange={(v) => { setL1(v); setL2(""); setL3(""); setL4(""); }}>
            <SelectTrigger className="bg-white border-slate-300 h-9 text-xs focus:ring-indigo-500">
                <SelectValue placeholder="1단계 (대분류)" />
            </SelectTrigger>
            <SelectContent>
                {l1List.map((item) => (
                    <SelectItem key={item.code} value={item.code} className="text-xs">
                        <span className="font-bold text-slate-400 mr-2 w-8 inline-block">{item.code}</span>{item.name}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>

        {/* 2단계 선택 */}
        <Select value={l2} onValueChange={(v) => { setL2(v); setL3(""); setL4(""); }} disabled={!l1 || l2List.length === 0}>
            <SelectTrigger className="bg-white border-slate-300 h-9 text-xs focus:ring-indigo-500">
                <SelectValue placeholder="2단계 (중분류)" />
            </SelectTrigger>
            <SelectContent>
                {l2List.map((item) => (
                    <SelectItem key={item.code} value={item.code} className="text-xs">
                        <span className="font-bold text-slate-400 mr-2 w-10 inline-block">{item.code}</span>{item.name}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>

        {/* 3단계 선택 */}
        <Select value={l3} onValueChange={(v) => { setL3(v); setL4(""); }} disabled={!l2 || l3List.length === 0}>
            <SelectTrigger className="bg-white border-slate-300 h-9 text-xs focus:ring-indigo-500">
                <SelectValue placeholder="3단계 (소분류)" />
            </SelectTrigger>
            <SelectContent>
                {l3List.map((item) => (
                    <SelectItem key={item.code} value={item.code} className="text-xs">
                        <span className="font-bold text-slate-400 mr-2 w-10 inline-block">{item.code}</span>{item.name}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>

        {/* 4단계 선택 */}
        <Select value={l4} onValueChange={setL4} disabled={!l3 || l4List.length === 0}>
            <SelectTrigger className="bg-white border-slate-300 h-9 text-xs focus:ring-indigo-500">
                <SelectValue placeholder="4단계 (세분류)" />
            </SelectTrigger>
            <SelectContent>
                {l4List.map((item) => (
                    <SelectItem key={item.code} value={item.code} className="text-xs">
                        <span className="font-bold text-slate-400 mr-2 w-10 inline-block">{item.code}</span>{item.name}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
      </div>

      {/* 하단 코드 표시 및 추가 요청 버튼 */}
      <div className="flex justify-between items-center px-1 pt-1">
            <div className="text-[10px] font-mono text-slate-400">
                Current Code: <span className="font-bold text-slate-600 bg-slate-100 px-1 rounded">{value || 'None'}</span>
            </div>
            
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="h-5 text-[10px] text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 p-0 px-2 rounded-full font-medium">
                <PlusCircle size={10} className="mr-1"/> 목록에 없나요? (추가요청)
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                <DialogTitle>신규 계층구조 생성 요청</DialogTitle>
                </DialogHeader>
                <div className="py-4">
                <Input 
                    placeholder="예: 3단계 '매운맛 라면' 추가해주세요." 
                    value={newRequestText}
                    onChange={(e) => setNewRequestText(e.target.value)}
                />
                </div>
                <DialogFooter>
                <Button onClick={handleNewRequest} className="bg-indigo-600">요청하기</Button>
                </DialogFooter>
            </DialogContent>
            </Dialog>
        </div>
    </div>
  )
}