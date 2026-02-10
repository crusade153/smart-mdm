"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Card } from "@/components/ui/card"
import { Wand2, ChevronDown, Copy, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Props {
  onNameChange: (generatedName: string) => void;
}

export function ProductNameGenerator({ onNameChange }: Props) {
  // 1. 상태 관리
  const [promo, setPromo] = useState(""); 
  const [name, setName] = useState("");
  const [weight, setWeight] = useState("");
  const [unit, setUnit] = useState("g");
  const [bundleQty, setBundleQty] = useState("1");
  const [boxQty, setBoxQty] = useState("");
  const [generatedName, setGeneratedName] = useState(""); // 내부 표시용 상태 추가

  // 2. 조합 로직
  useEffect(() => {
    // 1) Promo: 값이 있으면 대괄호와 띄어쓰기 추가
    const part1 = promo && promo.trim() !== '' ? `[${promo}] ` : ""; 
    
    // 2) Name: 제품명 본문
    const part2 = name ? name : "";
    
    // 3) Weight: 중량과 단위
    const part3 = weight ? ` ${weight}${unit}` : "";
    
    // 4) Bundle Qty: 번들 수량 (* 1 등)
    const part4 = bundleQty ? ` * ${bundleQty}` : "";
    
    // 5) Box Qty: 박스 입수 ((12/box))
    const part5 = boxQty ? ` (${boxQty}/box)` : "";

    // 최종 조합
    const fullName = `${part1}${part2}${part3}${part4}${part5}`.trim();
    
    setGeneratedName(fullName);
    onNameChange(fullName);
  }, [promo, name, weight, unit, bundleQty, boxQty, onNameChange]);

  // Promo 선택 헬퍼 함수
  const handlePromoSelect = (val: string) => {
    if (val === 'RESET') {
        setPromo("");
    } else {
        setPromo(val);
    }
  };

  return (
    <Card className="p-5 bg-white border border-slate-200 shadow-sm mb-6">
      {/* 헤더 영역 */}
      <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-indigo-100 rounded-full">
            <Wand2 size={16} className="text-indigo-600" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-800">표준 품명 생성기</h4>
            <p className="text-xs text-slate-500">규칙에 맞춰 입력하면 표준 품명이 자동 완성됩니다.</p>
          </div>
        </div>
      </div>
      
      {/* 입력 폼 영역 (Grid 비율 조정으로 균형 맞춤) */}
      <div className="grid grid-cols-12 gap-4">
        
        {/* 1. Promo (3/12) */}
        <div className="col-span-12 md:col-span-3">
          <Label className="text-xs font-semibold text-slate-600 mb-1.5 block">
            전용/Promo <span className="text-slate-400 font-normal">(직접입력)</span>
          </Label>
          <div className="flex relative">
            <Input 
                placeholder="입력" 
                className="h-10 text-sm bg-slate-50 border-slate-200 focus-visible:ring-indigo-500 pr-8" 
                value={promo}
                onChange={(e) => setPromo(e.target.value)}
            />
            {/* 헬퍼 드롭다운 */}
            <div className="absolute right-0 top-0 h-full">
                <Select onValueChange={handlePromoSelect}>
                    <SelectTrigger className="h-10 w-8 px-0 border-l-0 border-slate-200 bg-transparent text-slate-500 rounded-l-none focus:ring-0">
                        <ChevronDown size={14} className="mx-auto"/>
                    </SelectTrigger>
                    <SelectContent align="end">
                        <SelectItem value="RESET" className="text-slate-400 font-medium">직접입력 (초기화)</SelectItem>
                        <SelectItem value="코리아세븐">코리아세븐</SelectItem>
                        <SelectItem value="CU">CU</SelectItem>
                        <SelectItem value="GS25">GS25</SelectItem>
                        <SelectItem value="이마트">이마트</SelectItem>
                        <SelectItem value="쿠팡">쿠팡</SelectItem>
                        <SelectItem value="홈플러스">홈플러스</SelectItem>
                        <SelectItem value="컬리">컬리</SelectItem>
                        <SelectItem value="증정용">증정용</SelectItem>
                        <SelectItem value="수출용">수출용</SelectItem>
                    </SelectContent>
                </Select>
            </div>
          </div>
        </div>

        {/* 2. 제품명 (4/12) - 가장 넓게 */}
        <div className="col-span-12 md:col-span-4">
          <Label className="text-xs font-semibold text-slate-600 mb-1.5 block">
            제품명 <span className="text-red-500">*</span>
          </Label>
          <Input 
            placeholder="예: 하림 치즈 인 더 컵" 
            className="h-10 text-sm bg-slate-50 border-slate-200 focus-visible:ring-indigo-500" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
          />
        </div>

        {/* 3. 단량 (2/12) */}
        <div className="col-span-6 md:col-span-2">
          <Label className="text-xs font-semibold text-slate-600 mb-1.5 block">
            단량 <span className="text-red-500">*</span>
          </Label>
          <div className="flex gap-1">
            <Input 
                placeholder="103" 
                type="number" 
                className="h-10 text-sm bg-slate-50 border-slate-200 px-2 focus-visible:ring-indigo-500 text-right" 
                value={weight} 
                onChange={(e) => setWeight(e.target.value)} 
            />
            <Select value={unit} onValueChange={setUnit}>
              <SelectTrigger className="h-10 w-[4.5rem] text-sm bg-slate-50 border-slate-200 px-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="g">g</SelectItem>
                <SelectItem value="kg">kg</SelectItem>
                <SelectItem value="ml">ml</SelectItem>
                <SelectItem value="L">L</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* 4. 번들 (1/12 -> 1.5/12) - 조금 넓힘 */}
        <div className="col-span-3 md:col-span-1">
          <Label className="text-xs font-semibold text-slate-600 mb-1.5 block text-center">
            번들
          </Label>
          <div className="relative flex items-center">
            <span className="absolute left-2 text-sm text-slate-400 font-bold">*</span>
            <Input 
              type="number" 
              placeholder="1" 
              className="h-10 text-sm bg-slate-50 border-slate-200 text-center pl-4 pr-1 focus-visible:ring-indigo-500" 
              value={bundleQty} 
              onChange={(e) => setBundleQty(e.target.value)} 
            />
          </div>
        </div>

        {/* 5. 박스 (2/12 -> 1.5/12) - 조금 넓힘 */}
        <div className="col-span-3 md:col-span-2">
          <Label className="text-xs font-semibold text-slate-600 mb-1.5 block">
            박스입수 <span className="text-red-500">*</span>
          </Label>
          <div className="relative">
            <Input 
                type="number" 
                placeholder="12" 
                className="h-10 text-sm bg-slate-50 border-slate-200 pr-10 focus-visible:ring-indigo-500 text-right" 
                value={boxQty} 
                onChange={(e) => setBoxQty(e.target.value)} 
            />
            <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-medium tracking-tight">/box</span>
          </div>
        </div>
      </div>
      
      {/* 결과 미리보기 영역 (강조됨) */}
      <div className="mt-6 bg-indigo-50/50 rounded-lg border border-indigo-100 p-4 flex flex-col items-center justify-center text-center gap-2">
        <div className="text-xs font-medium text-indigo-500 flex items-center gap-1">
            <CheckCircle2 size={12} /> 자동 생성된 품명 (Auto Generated)
        </div>
        
        {/* 결과 텍스트 크게 */}
        <div className="text-lg md:text-xl font-bold text-indigo-900 break-all px-4">
            {generatedName || <span className="text-slate-300 font-normal">위 내용을 입력하면 품명이 완성됩니다.</span>}
        </div>

        {/* 예시 데이터 (가독성 개선) */}
        <div className="mt-1 text-sm text-slate-500 bg-white/50 px-3 py-1 rounded-full border border-slate-100">
            <span className="font-bold text-slate-400 mr-2">Example:</span> 
            [코리아세븐] 하림 치즈 인 더 컵 103g * 1 (12/box)
        </div>
      </div>
    </Card>
  )
}