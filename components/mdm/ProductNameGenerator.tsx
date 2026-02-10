"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Card } from "@/components/ui/card"
import { Wand2, CheckCircle2, RotateCcw, Loader2, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getRefDataAction } from "@/actions/ref-data" 

interface Props {
  onNameChange: (generatedName: string) => void;
}

export function ProductNameGenerator({ onNameChange }: Props) {
  // --- 1. 상태 관리 ---
  const [loading, setLoading] = useState(true);
  
  // 옵션 데이터
  const [promoOptions, setPromoOptions] = useState<string[]>([]);
  const [brandOptions, setBrandOptions] = useState<string[]>([]);

  // 입력 값
  const [promo, setPromo] = useState("");
  const [brand, setBrand] = useState("");
  const [name, setName] = useState("");
  const [weight, setWeight] = useState("");
  const [unit, setUnit] = useState("g");
  const [bundleQty, setBundleQty] = useState("1");
  const [boxQty, setBoxQty] = useState("");
  const [generatedName, setGeneratedName] = useState("");

  // 직접 입력 모드 여부
  const [isPromoDirect, setIsPromoDirect] = useState(false);
  const [isBrandDirect, setIsBrandDirect] = useState(false);

  // SAP 글자수 제한
  const MAX_LENGTH = 40;
  const currentLength = generatedName.length;
  const isOverLimit = currentLength > MAX_LENGTH;

  // --- 2. 데이터 로드 (초기 실행) ---
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

  // --- 3. 조합 로직 (값이 변할 때마다 실행) ---
  useEffect(() => {
    // 1) Promo: 값이 있으면 [값] 형태로 변환
    const part1 = promo && promo.trim() !== '' ? `[${promo}] ` : ""; 
    
    // 2) Brand: 브랜드명 + 띄어쓰기
    const part2 = brand && brand.trim() !== '' ? `${brand} ` : "";

    // 3) Name: 제품명 본문
    const part3 = name ? name : "";
    
    // 4) Weight: 중량과 단위 (중량이 있을 때만)
    const part4 = weight ? ` ${weight}${unit}` : "";
    
    // 5) Bundle Qty: 번들 수량 (* 1 등)
    const part5 = bundleQty ? ` * ${bundleQty}` : "";
    
    // 6) Box Qty: 박스 입수 ((12/box))
    const part6 = boxQty ? ` (${boxQty}/box)` : "";

    // 최종 조합 (공백 정리)
    const fullName = `${part1}${part2}${part3}${part4}${part5}${part6}`.trim();
    
    setGeneratedName(fullName);
    onNameChange(fullName);
  }, [promo, brand, name, weight, unit, bundleQty, boxQty, onNameChange]);

  // --- 4. 핸들러 함수들 ---

  // Promo 선택 핸들러
  const handlePromoSelect = (val: string) => {
    if (val === '_DIRECT_') {
        setIsPromoDirect(true);
        setPromo(""); 
    } else if (val === '_RESET_') {
        setIsPromoDirect(false);
        setPromo("");
    } else {
        setIsPromoDirect(false);
        setPromo(val);
    }
  };

  // Brand 선택 핸들러
  const handleBrandSelect = (val: string) => {
    if (val === '_DIRECT_') {
        setIsBrandDirect(true);
        setBrand(""); 
    } else if (val === '_RESET_') {
        setIsBrandDirect(false);
        setBrand("");
    } else {
        setIsBrandDirect(false);
        setBrand(val);
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
        {loading && <div className="text-xs text-slate-400 flex gap-1"><Loader2 className="animate-spin w-3 h-3"/> 로딩중...</div>}
      </div>
      
      {/* 입력 폼 영역 */}
      <div className="grid grid-cols-12 gap-3 items-end">
        
        {/* 1. Promo (2 col) */}
        <div className="col-span-12 sm:col-span-2">
          <Label className="text-xs font-semibold text-slate-600 mb-1.5 block">전용/Promo</Label>
          
          {isPromoDirect ? (
            <div className="flex gap-1">
                <Input 
                    placeholder="직접입력" 
                    className="h-9 text-xs bg-white border-indigo-300 focus-visible:ring-indigo-500" 
                    value={promo}
                    onChange={(e) => setPromo(e.target.value)}
                    autoFocus
                />
                <Button 
                    variant="outline" size="icon" className="h-9 w-9 shrink-0" 
                    onClick={() => { setIsPromoDirect(false); setPromo(""); }}
                    title="목록 선택으로 돌아가기"
                >
                    <RotateCcw size={12} />
                </Button>
            </div>
          ) : (
            <Select onValueChange={handlePromoSelect} value={promoOptions.includes(promo) ? promo : (promo ? '_DIRECT_' : '')}>
                <SelectTrigger className="h-9 text-xs bg-slate-50 border-slate-200">
                    <SelectValue placeholder="선택" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="_RESET_" className="text-slate-400">선택 안함</SelectItem>
                    {promoOptions.map(opt => (
                        <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                    ))}
                    <div className="my-1 border-t border-slate-100" />
                    <SelectItem value="_DIRECT_" className="text-indigo-600 font-bold">✎ 직접 입력...</SelectItem>
                </SelectContent>
            </Select>
          )}
        </div>

        {/* 2. Brand (2 col) */}
        <div className="col-span-12 sm:col-span-2">
          <Label className="text-xs font-semibold text-slate-600 mb-1.5 block">브랜드</Label>
          
          {isBrandDirect ? (
            <div className="flex gap-1">
                <Input 
                    placeholder="직접입력" 
                    className="h-9 text-xs bg-white border-indigo-300 focus-visible:ring-indigo-500" 
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    autoFocus
                />
                <Button 
                    variant="outline" size="icon" className="h-9 w-9 shrink-0" 
                    onClick={() => { setIsBrandDirect(false); setBrand(""); }}
                    title="목록 선택으로 돌아가기"
                >
                    <RotateCcw size={12} />
                </Button>
            </div>
          ) : (
            <Select onValueChange={handleBrandSelect} value={brandOptions.includes(brand) ? brand : (brand ? '_DIRECT_' : '')}>
                <SelectTrigger className="h-9 text-xs bg-slate-50 border-slate-200">
                    <SelectValue placeholder="선택" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="_RESET_" className="text-slate-400">선택 안함</SelectItem>
                    {brandOptions.map(opt => (
                        <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                    ))}
                    <div className="my-1 border-t border-slate-100" />
                    <SelectItem value="_DIRECT_" className="text-indigo-600 font-bold">✎ 직접 입력...</SelectItem>
                </SelectContent>
            </Select>
          )}
        </div>

        {/* 3. 제품명 (4 col) */}
        <div className="col-span-12 sm:col-span-4">
          <Label className="text-xs font-semibold text-slate-600 mb-1.5 block">
            제품명 <span className="text-red-500">*</span>
          </Label>
          <Input 
            placeholder="예: 치즈 인 더 컵" 
            className="h-9 text-xs bg-slate-50 border-slate-200 focus-visible:ring-indigo-500" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
          />
        </div>

        {/* 4. 단량 (2 col) */}
        <div className="col-span-6 sm:col-span-2">
          <Label className="text-xs font-semibold text-slate-600 mb-1.5 block">
            단량 <span className="text-red-500">*</span>
          </Label>
          <div className="flex gap-1">
            <Input 
                placeholder="103" 
                type="number" 
                className="h-9 text-xs bg-slate-50 border-slate-200 px-2 focus-visible:ring-indigo-500 text-right" 
                value={weight} 
                onChange={(e) => setWeight(e.target.value)} 
            />
            <Select value={unit} onValueChange={setUnit}>
              <SelectTrigger className="h-9 w-[4.5rem] text-xs bg-slate-50 border-slate-200 px-2">
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

        {/* 5. 번들 (1 col) */}
        <div className="col-span-3 sm:col-span-1">
          <Label className="text-xs font-semibold text-slate-600 mb-1.5 block text-center">
            번들
          </Label>
          <div className="relative flex items-center">
            <span className="absolute left-1.5 text-xs text-slate-400 font-bold">*</span>
            <Input 
              type="number" 
              placeholder="1" 
              className="h-9 text-xs bg-slate-50 border-slate-200 text-center pl-3 pr-1 focus-visible:ring-indigo-500" 
              value={bundleQty} 
              onChange={(e) => setBundleQty(e.target.value)} 
            />
          </div>
        </div>

        {/* 6. 박스 (1 col) */}
        <div className="col-span-3 sm:col-span-1">
          <Label className="text-xs font-semibold text-slate-600 mb-1.5 block text-center">
            박스입수
          </Label>
          <div className="relative">
            <Input 
                type="number" 
                placeholder="12" 
                className="h-9 text-xs bg-slate-50 border-slate-200 text-center focus-visible:ring-indigo-500" 
                value={boxQty} 
                onChange={(e) => setBoxQty(e.target.value)} 
            />
          </div>
        </div>
      </div>
      
      {/* 결과 미리보기 영역 */}
      <div 
        className={`mt-5 rounded-lg border p-4 flex flex-col items-center justify-center text-center gap-2 relative overflow-hidden transition-colors duration-300
        ${isOverLimit ? 'bg-red-50 border-red-200' : 'bg-indigo-50/60 border-indigo-100'}`}
      >
        {!isOverLimit && <div className="absolute top-0 left-0 w-full h-1 bg-indigo-200"></div>}
        
        <div className={`text-[10px] uppercase tracking-wider font-bold flex items-center gap-1 ${isOverLimit ? 'text-red-500' : 'text-indigo-400'}`}>
            {isOverLimit ? <AlertTriangle size={12}/> : <CheckCircle2 size={12}/>} Auto Generated Name
        </div>
        
        {/* 결과 텍스트 */}
        <div className={`text-base sm:text-lg font-extrabold break-all px-2 select-all ${isOverLimit ? 'text-red-600 line-through decoration-red-300' : 'text-indigo-900'}`}>
            {generatedName || <span className="text-slate-300 font-normal italic">위 내용을 입력하면 품명이 완성됩니다.</span>}
        </div>

        {/* 길이 카운터 및 경고 메시지 */}
        <div className="w-full flex flex-col items-center gap-1 mt-1 border-t border-slate-200/50 pt-2">
            
            {/* 글자수 제한 경고 메시지 */}
            {isOverLimit && (
                <div className="text-xs font-bold text-red-600 animate-pulse flex items-center gap-1">
                    <AlertTriangle size={12} className="inline"/> SAP 시스템 허용 길이(40자)를 초과했습니다!
                </div>
            )}

            <div className="flex justify-between w-full px-2 text-[11px]">
                <span className="text-slate-500">
                    <span className="font-bold text-slate-400 mr-1">Ex:</span> [코리아세븐] 하림 치즈 103g * 1 (12/box)
                </span>
                
                {/* 글자수 카운터 */}
                <span className={`font-mono font-bold ${isOverLimit ? 'text-red-600' : 'text-green-600'}`}>
                    {currentLength} / {MAX_LENGTH}자
                </span>
            </div>
        </div>
      </div>
    </Card>
  )
}