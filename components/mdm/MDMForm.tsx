"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useForm } from "react-hook-form"
import { 
  Save, MessageSquare, Send, AlertTriangle, 
  HelpCircle, BookOpen, Loader2, User, 
  CheckCircle, XCircle, PlayCircle, PanelRightOpen, PanelRightClose,
  ArrowRight, Tag, Copy, FileText, RotateCcw
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"

import { MDM_FORM_SCHEMA, FieldMeta } from "@/lib/constants/sap-fields"
import { useMDMStore } from "@/stores/useMDMStore"
import { SapMasterData, MaterialRequest } from "@/types/mdm"
import { HierarchySelector } from "./HierarchySelector"
import { MOCK_MAT_GROUP, MOCK_REF_DATA } from "@/lib/mock-data"
import { 
  createRequestAction, 
  createCommentAction, 
  getCommentsAction, 
  getRequestsAction,
  updateRequestAction, 
  updateStatusAction,
  getColumnDefinitionsAction
} from "@/actions/mdm"
import { ProductNameGenerator, GeneratorState } from "./ProductNameGenerator"
import { TemplateSelectDialog } from "./TemplateSelectDialog"

// 🟢 섹션 정의 (표준 품명 탭 최상단 배치)
const SECTIONS = [
  { id: 'naming', title: '표준 품명(필수)', icon: '✨' },
  { id: 'basic', title: '기본 정보', icon: '📦' },
  { id: 'add', title: '규격/바코드', icon: '📏' },
  { id: 'sales', title: '영업 정보', icon: '💰' },
  { id: 'purchase', title: '구매 정보', icon: '🛒' },
  { id: 'mrp', title: '생산/MRP', icon: '🏭' },
  { id: 'schedule', title: '일정 관리', icon: '📅' },
  { id: 'quality', title: '품질 관리', icon: '✅' },
  { id: 'storage', title: '저장/보관', icon: '❄️' },
  { id: 'finance', title: '회계 정보', icon: '💵' },
  { id: 'cost', title: '원가 정보', icon: '📊' },
  { id: 'class', title: '분류 특성', icon: '🏷️' },
  { id: 'extra', title: '환산 단위', icon: '🔄' }
];

export function MDMForm() {
  const { 
    currentRequest, requests, setCurrentRequest, setRequests,
    setComments, currentUser, 
    columnDefs, setColumnDefs,
    addRequest, updateRequest, updateStatus
  } = useMDMStore()
  
  const activeRequest = requests.find(r => r.id === currentRequest?.id) || currentRequest;
  const isNewMode = activeRequest?.id === 'new';

  // State
  const [activeTab, setActiveTab] = useState('naming'); // 기본 탭: 네이밍
  const [isChatOpen, setIsChatOpen] = useState(true);  
  const [commentInput, setCommentInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null); 
  
  // 기능용 State
  const [isCopyDialogOpen, setIsCopyDialogOpen] = useState(false);
  const [isTemplateOpen, setIsTemplateOpen] = useState(false);
  const isTemplateLoaded = useRef(false);
  const [templateText, setTemplateText] = useState("");

  // 💡 생성기 상태 (탭 이동 시에도 값 유지)
  const [genState, setGenState] = useState<GeneratorState>({
    promo: "", brand: "", name: "", weight: "", unit: "g", bundleQty: "1", boxQty: "", 
    isPromoDirect: false, isBrandDirect: false
  });

  // 권한 체크: '검토중(Review)' 상태까지는 작성자가 언제든지 수정할 수 있게 개편
  const isOwner = activeRequest?.requesterName === currentUser?.name;
  const isAdmin = currentUser?.isAdmin;
  const isRequestedStatus = activeRequest?.status === 'Requested';
  const isReviewStatus = activeRequest?.status === 'Review';
  const canEdit = isNewMode || (isOwner && (isRequestedStatus || isReviewStatus)) || isAdmin;
  const canEditSapCode = isAdmin; 

  const generateDefaultValues = () => {
    const defaults: any = {};
    MDM_FORM_SCHEMA.forEach(field => {
      defaults[field.key] = field.defaultValue !== undefined ? field.defaultValue : "";
    });
    return defaults;
  };

  const form = useForm<SapMasterData>({
    defaultValues: generateDefaultValues(),
    mode: "onChange"
  })

  const currentMakTx = form.watch("MAKTX");

  // 품명 업데이트 핸들러
  const handleNameGenerate = useCallback((val: string) => {
    if (val.trim()) {
        form.setValue("MAKTX", val, { shouldDirty: true });
    }
  }, [form]);

  // 초기 툴팁 로드
  useEffect(() => {
    if (Object.keys(columnDefs).length === 0) {
      getColumnDefinitionsAction().then(data => setColumnDefs(data));
    }
  }, [columnDefs, setColumnDefs]);

  // 💡 데이터 로드 및 상태 복구 로직
  useEffect(() => {
    if (activeRequest && !isNewMode) {
      if (isTemplateLoaded.current) {
        isTemplateLoaded.current = false;
        return;
      }
      const currentData = form.getValues();
      if (JSON.stringify(currentData) !== JSON.stringify(activeRequest.data)) {
        const mergedData = { ...generateDefaultValues(), ...activeRequest.data };
        form.reset(mergedData);
        
        // DB에 저장된 생성기 상태가 있다면 복구
        if (activeRequest.data) {
            setGenState(prev => ({
                ...prev,
                promo: activeRequest.data.GEN_PROMO || "",
                brand: activeRequest.data.GEN_BRAND || "",
                name: activeRequest.data.GEN_NAME || "",
                weight: activeRequest.data.GEN_WEIGHT || "",
                unit: activeRequest.data.GEN_UNIT || "g",
                bundleQty: activeRequest.data.GEN_BUNDLE || "1",
                boxQty: activeRequest.data.GEN_BOX || "",
                isPromoDirect: !!activeRequest.data.GEN_PROMO_DIRECT,
                isBrandDirect: !!activeRequest.data.GEN_BRAND_DIRECT,
            }));
        }
        
        // 💡 항상 네이밍 탭부터 시작
        setActiveTab('naming');
      }
    } else if (isNewMode) {
        setActiveTab('naming');
    }
  }, [activeRequest?.id, isNewMode]);

  // 채팅 스크롤
  useEffect(() => {
    if (isChatOpen && messagesEndRef.current && (activeRequest?.comments?.length || 0) > 0) {
        messagesEndRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [activeRequest?.comments?.length, isChatOpen]);

  // 템플릿 불러오기
  const handleLoadTemplate = (targetRequest: MaterialRequest) => {
    const { MATNR, MAKTX, ...rest } = targetRequest.data;
    const defaults = generateDefaultValues();
    isTemplateLoaded.current = true;
    form.reset({ ...defaults, ...rest });

    // 생성기 상태 복구
    setGenState({
      promo: targetRequest.data.GEN_PROMO || "",
      brand: targetRequest.data.GEN_BRAND || "",
      name: targetRequest.data.GEN_NAME || "",
      weight: targetRequest.data.GEN_WEIGHT || "",
      unit: targetRequest.data.GEN_UNIT || "g",
      bundleQty: targetRequest.data.GEN_BUNDLE || "1",
      boxQty: targetRequest.data.GEN_BOX || "",
      isPromoDirect: !!targetRequest.data.GEN_PROMO_DIRECT,
      isBrandDirect: !!targetRequest.data.GEN_BRAND_DIRECT,
    });

    setIsCopyDialogOpen(false);
  };

  // 협조전 텍스트 생성
  const openTemplateDialog = () => {
    const req = activeRequest;
    if (!req) return;
    const today = new Date().toLocaleDateString();
    
    // 요청하신 항목만 포함
    const text = `
[업무협조의뢰] 기준정보 신규 생성 요청

수신: 기준정보 관리 담당자 귀하
발신: ${req.requesterName}
일자: ${today}

1. 요청 개요
   귀 부서의 노고에 감사드립니다.
   아래 품목에 대한 기준정보(Master Data) 생성을 요청드리오니 검토 후 승인 바랍니다.

2. 상세 내역
   - 플랜트: ${req.data.WERKS || '-'}
   - 자재유형: ${req.data.MTART || '-'}
   - 자재내역: ${req.data.MAKTX || '-'}
   - 단위: ${req.data.MEINS || '-'}
   - 순중량: ${req.data.NTGEW || '0'} ${req.data.GEWEI || ''}
   - 온도조건: ${req.data.TEMPB || '-'}
   - 총 셸프라이프: ${req.data.MHDHB || '-'}
   - QM숙성기간: ${req.data.MWERT_11 || '-'}

위와 같이 요청합니다.
    `.trim();
    setTemplateText(text);
    setIsTemplateOpen(true);
  };

  // 필드 자동 완성
  const mtart = form.watch("MTART");
  const werks = form.watch("WERKS"); 

  useEffect(() => {
    const cv = form.getValues();
    if (mtart === 'FERT' || mtart === 'ZSET') {
      if (cv.BESKZ !== 'E') form.setValue('BESKZ', 'E');
      if (cv.BKLAS !== '7920') form.setValue('BKLAS', '7920');
      if (cv.MLAST !== 3) form.setValue('MLAST', 3);
      if (cv.KTGRM !== '10') form.setValue('KTGRM', '10');
    } else if (mtart === 'HAWA') {
      if (cv.BESKZ !== 'F') form.setValue('BESKZ', 'F');
      if (cv.BKLAS !== '3100') form.setValue('BKLAS', '3100');
      if (cv.MLAST !== 2) form.setValue('MLAST', 2);
      if (cv.KTGRM !== '20') form.setValue('KTGRM', '20');
      if (cv.EKGRP !== 'H01') form.setValue('EKGRP', 'H01');
    }
  }, [mtart, form]);

  useEffect(() => {
    const cv = form.getValues();
    if (['1021','1022'].includes(werks || '')) { if (cv.LGPRO !== '2200') form.setValue('LGPRO', '2200'); }
    else if (werks === '1023') { if (cv.LGPRO !== '2301') form.setValue('LGPRO', '2301'); }
    else if (werks === '1031') { if (cv.LGPRO !== '3000') form.setValue('LGPRO', '3000'); }
    
    if (werks === '1022') { if (cv.LGFSB !== '2210') form.setValue('LGFSB', '2210'); }
    else if (werks === '1023') { if (cv.LGFSB !== '2301') form.setValue('LGFSB', '2301'); }
  }, [werks, form]);

  // 저장 처리
  const onSubmit = async (data: SapMasterData) => {
    // 💡 [필수] 40자 제한 강제 차단
    if (data.MAKTX && data.MAKTX.length > 40) {
        alert(`품명(MAKTX)은 40자를 초과할 수 없습니다.\n현재 길이: ${data.MAKTX.length}자`);
        return;
    }

    if (!confirm("저장하시겠습니까?")) return;
    setIsSubmitting(true);

    // 💡 [필수] 생성기 상태값도 함께 저장
    const submitData = {
        ...data,
        GEN_PROMO: genState.promo,
        GEN_BRAND: genState.brand,
        GEN_NAME: genState.name,
        GEN_WEIGHT: genState.weight,
        GEN_UNIT: genState.unit,
        GEN_BUNDLE: genState.bundleQty,
        GEN_BOX: genState.boxQty,
        GEN_PROMO_DIRECT: genState.isPromoDirect,
        GEN_BRAND_DIRECT: genState.isBrandDirect
    };

    try {
      if (isNewMode) {
        addRequest(submitData);
        const result = await createRequestAction(submitData, currentUser?.name || 'Unknown');
        if (result.success && result.id) {
          alert("저장되었습니다.");
          const latest = await getRequestsAction();
          setRequests(latest);
          const newReq = latest.find((r: any) => r.id === result.id);
          if(newReq) setCurrentRequest(newReq);
        }
      } else if (activeRequest) {
        updateRequest(activeRequest.id, submitData);
        await updateRequestAction(activeRequest.id, submitData, currentUser?.name || 'Unknown');
        alert("수정되었습니다.");
      }
    } finally { setIsSubmitting(false); }
  }

  // 상태 변경 (승인/반려/검토/검토완료)
  const handleStatusChange = async (status: string) => {
    if (!activeRequest || isNewMode) return;

    let statusLabel = status;
    if (status === 'Review') statusLabel = '검토중';
    if (status === 'ReviewCompleted') statusLabel = '검토완료';
    if (status === 'Approved') statusLabel = '승인';
    if (status === 'Reject') statusLabel = '반려';

    if (!confirm(`[${statusLabel}] 상태로 변경하시겠습니까?`)) return;
    if (status === 'Approved' && !form.getValues('MATNR')) return alert("최종 승인을 위해서는 자재코드(MATNR) 입력이 필수입니다.");
    
    setIsSubmitting(true);
    try {
        await updateStatusAction(activeRequest.id, status, currentUser?.name || 'Admin');
        updateStatus(activeRequest.id, status as any);
        await createCommentAction(activeRequest.id, `🔄 상태 변경: ${statusLabel}`, currentUser?.name || 'Admin');
        const latest = await getRequestsAction();
        setRequests(latest);
        const updatedReq = latest.find(r => r.id === activeRequest.id);
        if(updatedReq) setCurrentRequest(updatedReq);
        alert("처리되었습니다.");
    } finally { setIsSubmitting(false); }
  };

  const handleComment = async () => {
    if(!commentInput.trim() || !activeRequest?.id || isNewMode) return;
    const msg = commentInput;
    setCommentInput("");
    const newCmt = { writer: currentUser?.name || 'Me', message: msg, createdAt: new Date().toISOString() };
    const tempComments = [...(activeRequest.comments || []), newCmt];
    setComments(activeRequest.id, tempComments);
    await createCommentAction(activeRequest.id, msg, currentUser?.name || 'User');
    const realComments = await getCommentsAction(activeRequest.id);
    setComments(activeRequest.id, realComments);
  };

  const handleHierarchyRequest = async (msg: string) => {
    if (isNewMode) return alert("먼저 기본 정보를 저장해주세요.");
    await createCommentAction(activeRequest!.id, msg, "System");
    alert("요청되었습니다.");
    const comments = await getCommentsAction(activeRequest!.id);
    setComments(activeRequest!.id, comments);
  }

  // 필드 렌더링
  const renderFieldInput = (field: FieldMeta, fieldProps: any) => {
    let isReadOnly = field.fixed || !canEdit;
    if (field.key === 'MATNR') isReadOnly = !canEditSapCode; 
    if ((field.key === 'LGPRO' && ['1021','1022','1023','1031'].includes(werks || '')) || (field.key === 'LGFSB' && ['1022','1023'].includes(werks || ''))) isReadOnly = true;

    const fieldStyle = `h-10 text-sm w-full transition-all duration-200 ${isReadOnly ? "bg-slate-50 text-slate-500 border-slate-200" : "bg-white border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"}`;
    const safeValue = fieldProps.value ?? '';

    if (field.key === 'MATNR') return <FormControl><div className="flex gap-2 w-full"><Input {...fieldProps} value={safeValue} readOnly={isReadOnly} className={fieldStyle} />{isReadOnly && <div className="bg-slate-100 px-3 flex items-center justify-center border border-slate-200 rounded-md text-slate-400"><User size={14}/></div>}</div></FormControl>;
    if (field.type === 'custom_prdha') return <FormControl><div className={isReadOnly ? "pointer-events-none opacity-60" : "w-full"}><HierarchySelector value={safeValue} onChange={fieldProps.onChange} onRequestNew={handleHierarchyRequest} /></div></FormControl>;
    if (field.type === 'select' || field.type === 'ref_select' || field.type === 'custom_matkl') {
        let options: Record<string, string> | {code: string, name: string}[] = field.options || [];
        if (field.type === 'ref_select' && field.refKey) options = (MOCK_REF_DATA as any)[field.refKey] || [];
        if (field.type === 'custom_matkl') options = MOCK_MAT_GROUP;
        return <Select onValueChange={(val) => fieldProps.onChange(val === '_EMPTY_' ? '' : val)} value={safeValue === '' ? '_EMPTY_' : String(safeValue)} disabled={isReadOnly}>
            <FormControl><SelectTrigger className={fieldStyle}><SelectValue placeholder="선택하세요" /></SelectTrigger></FormControl>
            <SelectContent>
                {Array.isArray(options) ? options.map((opt: any) => <SelectItem key={opt.code} value={opt.code}>[{opt.code}] {opt.name}</SelectItem>) : Object.entries(options).map(([k,v]) => <SelectItem key={k} value={k === '' ? '_EMPTY_' : k}>{v}</SelectItem>)}
            </SelectContent>
        </Select>;
    }
    return <FormControl><Input {...fieldProps} value={safeValue} type={field.type === 'number' ? 'number' : field.type === 'date' ? 'date' : 'text'} readOnly={isReadOnly} className={fieldStyle} /></FormControl>;
  }

  const renderLabelWithHelp = (field: FieldMeta) => {
    const def = columnDefs[field.key];
    return (
      <div className="flex items-center gap-1.5 mb-1.5">
        <FormLabel className="text-[13px] font-bold text-slate-700 m-0 flex items-center">
            {field.label}
            {field.required && <span className="text-red-500 ml-1 font-bold">*</span>}
        </FormLabel>
        {def && <Popover><PopoverTrigger asChild><button type="button" className="text-slate-400 hover:text-indigo-600 transition-colors"><HelpCircle size={14} /></button></PopoverTrigger><PopoverContent className="w-80 p-0 shadow-xl border-indigo-100" side="top" align="start"><div className="bg-indigo-50 px-4 py-2 border-b border-indigo-100 flex items-center gap-2"><BookOpen size={14} className="text-indigo-600"/><span className="font-bold text-indigo-900 text-xs">{field.label} 도움말</span></div><div className="p-4 text-xs space-y-2 bg-white"><p className="text-slate-700 font-medium">{def.definition}</p>{def.usage && <div className="bg-slate-50 p-2 rounded text-slate-600 border border-slate-100">💡 예시: {def.usage}</div>}{def.risk && <div className="bg-red-50 p-2 text-red-700 rounded border border-red-100">⚠️ {def.risk}</div>}</div></PopoverContent></Popover>}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 border border-slate-200 rounded-xl overflow-hidden shadow-sm">
      
      <TemplateSelectDialog isOpen={isCopyDialogOpen} onClose={() => setIsCopyDialogOpen(false)} onSelect={handleLoadTemplate} />
      <Dialog open={isTemplateOpen} onOpenChange={setIsTemplateOpen}>
        <DialogContent className="max-w-2xl bg-white"><DialogHeader><DialogTitle className="flex items-center gap-2"><FileText size={20} className="text-indigo-600"/> 업무협조의뢰 양식</DialogTitle><DialogDescription>내용을 복사하여 메일/결재에 사용하세요.</DialogDescription></DialogHeader><div className="py-2"><Textarea value={templateText} readOnly className="h-[450px] text-sm font-mono bg-slate-50 resize-none leading-relaxed border-slate-200"/></div><DialogFooter><Button onClick={() => { navigator.clipboard.writeText(templateText); alert("복사되었습니다."); setIsTemplateOpen(false); }} className="bg-indigo-600 gap-2 hover:bg-indigo-700"><Copy size={16}/> 내용 복사</Button></DialogFooter></DialogContent>
      </Dialog>

      {/* 헤더 */}
      <div className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0 z-20">
        <div className="flex items-center gap-4">
            <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    {activeRequest?.data.MAKTX || (isNewMode ? "신규 자재 생성" : "품명 없음")}
                    {!isNewMode && <span className={`px-2 py-0.5 rounded text-[10px] border ${activeRequest?.status === 'Approved' ? 'bg-green-50 text-green-700 border-green-200' : activeRequest?.status === 'ReviewCompleted' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-slate-100 text-slate-500'}`}>{activeRequest?.status === 'ReviewCompleted' ? 'ReviewCompleted' : activeRequest?.status}</span>}
                </h2>
                <span className="text-xs text-slate-400 flex items-center gap-2">
                    {activeRequest?.id} <span className="w-px h-3 bg-slate-200"></span> {activeRequest?.requesterName || currentUser?.name}
                </span>
            </div>
        </div>
        <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" className="text-indigo-600 border-indigo-200 bg-indigo-50 hover:bg-indigo-100 h-9" onClick={() => setIsCopyDialogOpen(true)}><Copy size={14} className="mr-1"/> 불러오기</Button>
            {!isNewMode && <Button size="sm" variant="ghost" className="text-slate-500 h-9 hover:text-slate-900" onClick={openTemplateDialog}><FileText size={14} className="mr-1"/> 협조전</Button>}
            {canEdit && <Button size="sm" onClick={form.handleSubmit(onSubmit)} disabled={isSubmitting} className="bg-indigo-600 hover:bg-indigo-700 h-9 px-4">{isSubmitting ? <Loader2 size={14} className="animate-spin mr-2"/> : <Save size={14} className="mr-2"/>} 저장</Button>}
            
            {/* 관리자 전용 상태 변경 버튼들 */}
            {isAdmin && !isNewMode && activeRequest?.status === 'Requested' && (
                <Button size="sm" variant="outline" className="text-orange-600 border-orange-200 bg-orange-50 hover:bg-orange-100 h-9" onClick={() => handleStatusChange('Review')}>
                    <PlayCircle size={14} className="mr-2"/> 검토시작
                </Button>
            )}
            
            {isAdmin && !isNewMode && activeRequest?.status === 'Review' && (
                <>
                    <Button size="sm" variant="outline" className="text-blue-600 border-blue-200 bg-blue-50 hover:bg-blue-100 h-9" onClick={() => handleStatusChange('ReviewCompleted')}>
                        <CheckCircle size={14} className="mr-2"/> 검토완료
                    </Button>
                    <Button size="sm" variant="outline" className="text-red-600 border-red-200 bg-red-50 hover:bg-red-100 h-9" onClick={() => handleStatusChange('Reject')}>
                        <XCircle size={14} className="mr-2"/> 반려
                    </Button>
                </>
            )}

            {isAdmin && !isNewMode && activeRequest?.status === 'ReviewCompleted' && (
                <>
                    <Button size="sm" variant="outline" className="text-orange-600 border-orange-200 bg-orange-50 hover:bg-orange-100 h-9" onClick={() => handleStatusChange('Review')}>
                        <RotateCcw size={14} className="mr-2"/> 검토중으로 해제
                    </Button>
                    <Button size="sm" variant="outline" className="text-green-600 border-green-200 bg-green-50 hover:bg-green-100 h-9" onClick={() => handleStatusChange('Approved')}>
                        <CheckCircle size={14} className="mr-2"/> 최종 승인
                    </Button>
                    <Button size="sm" variant="outline" className="text-red-600 border-red-200 bg-red-50 hover:bg-red-100 h-9" onClick={() => handleStatusChange('Reject')}>
                        <XCircle size={14} className="mr-2"/> 반려
                    </Button>
                </>
            )}

            <div className="h-6 w-px bg-slate-200 mx-1"></div>
            <Button variant="ghost" size="icon" onClick={() => setIsChatOpen(!isChatOpen)} className={`h-9 w-9 ${isChatOpen ? 'text-indigo-600 bg-indigo-50' : 'text-slate-400'}`}>{isChatOpen ? <PanelRightClose size={18}/> : <PanelRightOpen size={18}/>}</Button>
        </div>
      </div>

      {/* 품명 고정 바 */}
      <div className="bg-indigo-600 text-white px-6 py-2.5 shadow-md z-10 shrink-0 flex items-center justify-between">
        <div className="flex items-center gap-3 overflow-hidden w-full">
            <Tag size={16} className="text-indigo-200 shrink-0" />
            <span className="text-lg font-bold truncate leading-tight">
                {currentMakTx || <span className="opacity-50 text-base font-normal">좌측 '표준 품명' 탭에서 품명을 생성해주세요</span>}
            </span>
        </div>
      </div>

      <div className="flex flex-1 min-h-0 overflow-hidden relative">
        <div className="w-60 bg-white border-r border-slate-200 flex flex-col py-4 shrink-0 overflow-y-auto custom-scrollbar">
            <div className="px-5 mb-3 text-xs font-extrabold text-slate-400 uppercase tracking-wider">Sections</div>
            <div className="flex flex-col gap-1 px-3">
                {SECTIONS.map(section => (
                    <button key={section.id} onClick={() => setActiveTab(section.id)} className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all text-left group ${activeTab === section.id ? 'bg-indigo-50 text-indigo-700 shadow-sm ring-1 ring-indigo-200' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}>
                        <span className={`text-lg group-hover:scale-110 transition-transform ${activeTab === section.id ? 'opacity-100' : 'opacity-70'}`}>{section.icon}</span>
                        {section.title}
                        {activeTab === section.id && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-500"></div>}
                    </button>
                ))}
            </div>
        </div>

        <div className="flex-1 bg-slate-50 overflow-hidden flex flex-col relative min-w-0">
            <Form {...form}>
                <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar">
                    <div className="w-full h-full flex flex-col">
                        <div className="mb-6 flex items-center justify-between shrink-0">
                            <div>
                                <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                                    {SECTIONS.find(s => s.id === activeTab)?.icon} {SECTIONS.find(s => s.id === activeTab)?.title}
                                </h2>
                                <p className="text-slate-500 text-sm mt-1">{activeTab === 'naming' ? "규칙에 맞춰 표준 품명을 생성하는 가장 중요한 단계입니다." : "해당 섹션의 정보를 정확히 입력해주세요."}</p>
                            </div>
                        </div>

                        <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm flex-1 mb-8">
                            {activeTab === 'naming' ? (
                                <div className="h-full flex flex-col">
                                    <ProductNameGenerator data={genState} onDataChange={setGenState} onNameChange={handleNameGenerate} />
                                    <div className="mt-8 p-4 bg-indigo-50 rounded-lg text-sm text-indigo-800 border border-indigo-100">
                                        <p className="font-bold mb-2">📌 작성 가이드</p>
                                        <p>1. 품명은 SAP 및 물류 시스템의 기준이 되므로 신중히 작성해주세요.</p>
                                        <p>2. 작성이 완료되면 하단의 [다음 섹션으로] 버튼을 눌러 상세 정보를 입력하세요.</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-8">
                                    {MDM_FORM_SCHEMA.filter(f => f.tab === activeTab).map((field) => (
                                        <div key={field.key} className={field.type.includes('custom') ? 'col-span-full' : ''}>
                                            <FormField control={form.control} name={field.key as string} render={({ field: fieldProps }) => (
                                                    <FormItem className="space-y-1.5">
                                                        {renderLabelWithHelp(field)}
                                                        {field.key === 'MAKTX' && canEdit ? (
                                                            <FormControl><Input {...fieldProps} value={fieldProps.value || ''} readOnly className="bg-slate-100 text-slate-500 cursor-not-allowed font-bold h-10" placeholder="네이밍 탭에서 생성하세요."/></FormControl>
                                                        ) : (
                                                            renderFieldInput(field, fieldProps)
                                                        )}
                                                        <FormMessage className="text-[11px]" />
                                                    </FormItem>
                                            )} />
                                        </div>
                                    ))}
                                    {MDM_FORM_SCHEMA.filter(f => f.tab === activeTab).length === 0 && <div className="col-span-full text-center py-20 text-slate-300 flex flex-col items-center"><div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4 text-2xl">📭</div>입력 항목이 없는 섹션입니다.</div>}
                                </div>
                            )}
                            <div className="mt-12 flex justify-end pt-6 border-t border-slate-100">
                                <Button variant="outline" size="lg" className="text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 border-slate-300" onClick={() => { const idx = SECTIONS.findIndex(s => s.id === activeTab); if(idx < SECTIONS.length - 1) setActiveTab(SECTIONS[idx+1].id); }}>
                                    다음 섹션으로 <ArrowRight size={16} className="ml-2"/>
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </Form>
        </div>

        {isChatOpen && (
            <div className="w-[350px] bg-white border-l border-slate-200 flex flex-col shrink-0 transition-all duration-300 shadow-xl z-20 h-full">
                <div className="h-14 border-b border-slate-100 flex items-center justify-between px-4 bg-slate-50/50 shrink-0">
                    <h3 className="font-bold text-slate-700 flex items-center gap-2 text-sm"><MessageSquare size={16} className="text-indigo-500"/> 실시간 소통</h3>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:bg-white" onClick={() => setIsChatOpen(false)}><PanelRightClose size={14}/></Button>
                </div>
                
                <div className="flex-1 overflow-y-auto bg-slate-50/30 p-4 custom-scrollbar">
                    {activeRequest?.comments?.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-slate-400 text-xs gap-2"><div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center"><MessageSquare size={18} className="opacity-50"/></div><p>대화 내역이 없습니다.<br/>첫 메시지를 남겨보세요.</p></div>
                    ) : (
                        <div className="space-y-4">
                            {activeRequest?.comments?.map((cmt, idx) => (
                                <div key={idx} className={`flex flex-col gap-1 ${cmt.writer === (currentUser?.name || 'Me') ? 'items-end' : 'items-start'}`}>
                                    <span className="text-[10px] text-slate-400 px-1">{cmt.writer} • {new Date(cmt.createdAt).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
                                    <div className={`p-3 rounded-2xl text-xs max-w-[90%] leading-relaxed shadow-sm ${cmt.writer === 'System' ? 'bg-orange-50 text-orange-800 border border-orange-100 w-full text-center' : cmt.writer === (currentUser?.name || 'Me') ? 'bg-indigo-600 text-white rounded-tr-sm' : 'bg-white border border-slate-200 text-slate-700 rounded-tl-sm'}`}>
                                        {cmt.writer === 'System' && <AlertTriangle size={12} className="inline mr-1 -mt-0.5"/>}
                                        {cmt.message}
                                    </div>
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>
                    )}
                </div>

                <div className="p-3 border-t bg-white shrink-0">
                    <div className="flex gap-2">
                        <Textarea value={commentInput} onChange={(e) => setCommentInput(e.target.value)} placeholder="메시지 입력 (Shift+Enter 줄바꿈)" className="min-h-[40px] max-h-[100px] text-xs resize-none bg-slate-50 border-slate-200 focus:bg-white" onKeyDown={(e) => { if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleComment(); }}} disabled={isNewMode} />
                        <Button onClick={handleComment} size="icon" className="h-10 w-10 bg-indigo-600 hover:bg-indigo-700 shrink-0 shadow-sm" disabled={isNewMode}><Send size={16} /></Button>
                    </div>
                    {isNewMode && <p className="text-[10px] text-orange-500 mt-2 text-center bg-orange-50 py-1 rounded">※ 요청 저장 후 대화가 가능합니다.</p>}
                </div>
            </div>
        )}
      </div>
    </div>
  )
}