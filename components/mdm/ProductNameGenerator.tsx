"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Card } from "@/components/ui/card"
import { Wand2, CheckCircle2, RotateCcw, Loader2, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getRefDataAction } from "@/actions/ref-data" 

export interface GeneratorState {
  promo: string;
  brand: string;
  name: string;
  weight: string;
  unit: string;
  bundleQty: string;
  boxQty: string;
  isPromoDirect: boolean;
  isBrandDirect: boolean;
}

interface Props {
  data: GeneratorState;
  onDataChange: (newData: GeneratorState) => void;
  onNameChange: (generatedName: string) => void;
}

export function ProductNameGenerator({ data, onDataChange, onNameChange }: Props) {
  const [loading, setLoading] = useState(true);
  const [promoOptions, setPromoOptions] = useState<string[]>([]);
  const [brandOptions, setBrandOptions] = useState<string[]>([]);
  
  const [generatedName, setGeneratedName] = useState("");
  
  // 💡 [복구] 글자수 제한 로직
  const MAX_LENGTH = 40;
  const currentLength = generatedName.length;
  const isOverLimit = currentLength > MAX_LENGTH;

  useEffect(() => {
    const loadOptions = async () => {
      setLoading(true);
      const [promos, brands] = await Promise.all([
        getRefDataAction('sm_ref_promo'),
        getRefDataAction('sm_ref_brand')
      ]);
      setPromoOptions(promos);
      setBrandOptions(brands);
      setLoading(false);
    };
    loadOptions();
  }, []);

  useEffect(() => {
    const { promo, brand, name, weight, unit, bundleQty, boxQty } = data;

    const part1 = promo && promo.trim() !== '' ? `[${promo}] ` : ""; 
    const part2 = brand && brand.trim() !== '' ? `${brand} ` : "";
    const part3 = name ? name : "";
    
    // TOTE일 경우 TOT로 명칭 변경 처리
    const displayUnit = unit === "TOTE" ? "TOT" : unit;
    const part4 = weight ? ` ${weight}${displayUnit}` : "";
    
    // 번들 수량이 1일 때도 생략하지 않고 표시되도록 수정
    const part5 = bundleQty ? ` * ${bundleQty}` : "";
    const part6 = boxQty ? ` (${boxQty}/box)` : "";

    const fullName = `${part1}${part2}${part3}${part4}${part5}${part6}`.trim();
    
    setGeneratedName(fullName);
    
    if (fullName) {
        onNameChange(fullName);
    }
  }, [data, onNameChange]);

  const updateData = (fields: Partial<GeneratorState>) => {
    onDataChange({ ...data, ...fields });
  };

  const handlePromoSelect = (val: string) => {
    if (val === '_DIRECT_') updateData({ isPromoDirect: true, promo: "" });
    else if (val === '_RESET_') updateData({ isPromoDirect: false, promo: "" });
    else updateData({ isPromoDirect: false, promo: val });
  };

  const handleBrandSelect = (val: string) => {
    if (val === '_DIRECT_') updateData({ isBrandDirect: true, brand: "" });
    else if (val === '_RESET_') updateData({ isBrandDirect: false, brand: "" });
    else updateData({ isBrandDirect: false, brand: val });
  };

  return (
    <Card className="p-5 bg-white border border-slate-200 shadow-sm mb-6">
      <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-indigo-100 rounded-full"><Wand2 size={16} className="text-indigo-600" /></div>
          <div><h4 className="text-sm font-bold text-slate-800">표준 품명 생성기</h4><p className="text-xs text-slate-500">규칙에 맞춰 입력하면 표준 품명이 자동 완성됩니다.</p></div>
        </div>
        {loading && <div className="text-xs text-slate-400 flex gap-1"><Loader2 className="animate-spin w-3 h-3"/> 로딩중...</div>}
      </div>
      
      <div className="grid grid-cols-12 gap-3 items-end">
        <div className="col-span-12 sm:col-span-2">
          <Label className="text-xs font-semibold text-slate-600 mb-1.5 block">전용/Promo</Label>
          {data.isPromoDirect ? (
            <div className="flex gap-1">
                <Input placeholder="직접입력" className="h-9 text-xs" value={data.promo} onChange={(e) => updateData({ promo: e.target.value })} autoFocus />
                <Button variant="outline" size="icon" className="h-9 w-9 shrink-0" onClick={() => updateData({ isPromoDirect: false, promo: "" })}><RotateCcw size={12} /></Button>
            </div>
          ) : (
            <Select onValueChange={handlePromoSelect} value={promoOptions.includes(data.promo) ? data.promo : (data.promo ? '_DIRECT_' : '')}>
                <SelectTrigger className="h-9 text-xs bg-slate-50"><SelectValue placeholder="선택" /></SelectTrigger>
                <SelectContent>
                    <SelectItem value="_RESET_" className="text-slate-400">선택 안함</SelectItem>
                    {promoOptions.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                    <div className="my-1 border-t border-slate-100" />
                    <SelectItem value="_DIRECT_" className="text-indigo-600 font-bold">✎ 직접 입력...</SelectItem>
                </SelectContent>
            </Select>
          )}
        </div>

        <div className="col-span-12 sm:col-span-2">
          <Label className="text-xs font-semibold text-slate-600 mb-1.5 block">브랜드</Label>
          {data.isBrandDirect ? (
            <div className="flex gap-1">
                <Input placeholder="직접입력" className="h-9 text-xs" value={data.brand} onChange={(e) => updateData({ brand: e.target.value })} autoFocus />
                <Button variant="outline" size="icon" className="h-9 w-9 shrink-0" onClick={() => updateData({ isBrandDirect: false, brand: "" })}><RotateCcw size={12} /></Button>
            </div>
          ) : (
            <Select onValueChange={handleBrandSelect} value={brandOptions.includes(data.brand) ? data.brand : (data.brand ? '_DIRECT_' : '')}>
                <SelectTrigger className="h-9 text-xs bg-slate-50"><SelectValue placeholder="선택" /></SelectTrigger>
                <SelectContent>
                    <SelectItem value="_RESET_" className="text-slate-400">선택 안함</SelectItem>
                    {brandOptions.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                    <div className="my-1 border-t border-slate-100" />
                    <SelectItem value="_DIRECT_" className="text-indigo-600 font-bold">✎ 직접 입력...</SelectItem>
                </SelectContent>
            </Select>
          )}
        </div>

        <div className="col-span-12 sm:col-span-4">
          <Label className="text-xs font-semibold text-slate-600 mb-1.5 block">제품명 <span className="text-red-500">*</span></Label>
          <Input placeholder="예: 치즈 인 더 컵" className="h-9 text-xs bg-slate-50" value={data.name} onChange={(e) => updateData({ name: e.target.value })} />
        </div>

        <div className="col-span-6 sm:col-span-2">
          <Label className="text-xs font-semibold text-slate-600 mb-1.5 block">단량 <span className="text-red-500">*</span></Label>
          <div className="flex gap-1">
            <Input placeholder="103" type="number" className="h-9 text-xs bg-slate-50 text-right" value={data.weight} onChange={(e) => updateData({ weight: e.target.value })} />
            <Select value={data.unit} onValueChange={(val) => updateData({ unit: val })}>
              <SelectTrigger className="h-9 w-[4.5rem] text-xs bg-slate-50"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="g">g</SelectItem>
                <SelectItem value="kg">kg</SelectItem>
                <SelectItem value="ml">ml</SelectItem>
                <SelectItem value="L">L</SelectItem>
                <SelectItem value="TOTE">TOTE</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="col-span-3 sm:col-span-1">
          <Label className="text-xs font-semibold text-slate-600 mb-1.5 block text-center">번들</Label>
          <Input type="number" className="h-9 text-xs bg-slate-50 text-center" value={data.bundleQty} onChange={(e) => updateData({ bundleQty: e.target.value })} />
        </div>

        <div className="col-span-3 sm:col-span-1">
          <Label className="text-xs font-semibold text-slate-600 mb-1.5 block text-center">박스입수</Label>
          <Input type="number" className="h-9 text-xs bg-slate-50 text-center" value={data.boxQty} onChange={(e) => updateData({ boxQty: e.target.value })} />
        </div>
      </div>
      
      {/* 💡 [복구] 결과 및 글자수 카운터 영역 */}
      <div className={`mt-5 rounded-lg border p-4 flex flex-col items-center justify-center text-center gap-2 relative overflow-hidden transition-colors duration-300 ${isOverLimit ? 'bg-red-50 border-red-200' : 'bg-indigo-50/60 border-indigo-100'}`}>
        {!isOverLimit && <div className="absolute top-0 left-0 w-full h-1 bg-indigo-200"></div>}
        <div className={`text-[10px] uppercase tracking-wider font-bold flex items-center gap-1 ${isOverLimit ? 'text-red-500' : 'text-indigo-400'}`}>
            {isOverLimit ? <AlertTriangle size={12}/> : <CheckCircle2 size={12}/>} Auto Generated Name
        </div>
        <div className={`text-base sm:text-lg font-extrabold break-all px-2 select-all ${isOverLimit ? 'text-red-600 line-through decoration-red-300' : 'text-indigo-900'}`}>
            {generatedName || <span className="text-slate-300 font-normal italic">위 내용을 입력하면 품명이 완성됩니다.</span>}
        </div>
        
        {/* 카운터 및 경고 메시지 */}
        <div className="w-full flex flex-col items-center gap-1 mt-1 border-t border-slate-200/50 pt-2">
            {isOverLimit && <div className="text-xs font-bold text-red-600 animate-pulse flex items-center gap-1"><AlertTriangle size={12} className="inline"/> 40자 초과! 저장할 수 없습니다.</div>}
            <div className="flex justify-between w-full px-2 text-[11px]">
                <span className="text-slate-500"><span className="font-bold text-slate-400 mr-1">Ex:</span> [코리아세븐] 하림 치즈 103g * 1 (12/box)</span>
                <span className={`font-mono font-bold ${isOverLimit ? 'text-red-600' : 'text-green-600'}`}>{currentLength} / {MAX_LENGTH}자</span>
            </div>
        </div>
      </div>
    </Card>
  )
}