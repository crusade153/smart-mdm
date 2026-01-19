"use client"

import { useState, useEffect, useRef } from "react"
import { useForm } from "react-hook-form"
import { 
  Save, MessageSquare, Send, AlertTriangle, 
  CheckCircle, XCircle, PlayCircle, Lock, Trash2, History,
  HelpCircle, BookOpen, Loader2, Info, FileText, Copy, ArrowLeft 
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card } from "@/components/ui/card"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription
} from "@/components/ui/dialog"
import { 
  Sheet, SheetContent, SheetHeader, SheetTitle 
} from "@/components/ui/sheet" 
import { Textarea } from "@/components/ui/textarea"

import { MDM_FORM_SCHEMA, FORM_TABS, FieldMeta } from "@/lib/constants/sap-fields"
import { useMDMStore } from "@/stores/useMDMStore"
import { SapMasterData } from "@/types/mdm"
import { HierarchySelector } from "./HierarchySelector"
import { MOCK_MAT_GROUP, MOCK_REF_DATA } from "@/lib/mock-data"
import { 
  createRequestAction, 
  createCommentAction, 
  getCommentsAction, 
  getRequestsAction,
  updateRequestAction, 
  deleteRequestAction,
  updateStatusAction,
  getColumnDefinitionsAction
} from "@/actions/mdm"
import { AuditLogDialog } from "./AuditLogDialog" 

export function MDMForm() {
  const { 
    currentRequest, requests, setCurrentRequest, setRequests, createNewRequest,
    setComments, currentUser,
    columnDefs, setColumnDefs,
    addRequest, updateRequest 
  } = useMDMStore()
  
  const activeRequest = requests.find(r => r.id === currentRequest?.id) || currentRequest;

  const [commentInput, setCommentInput] = useState("")
  const [isHistoryOpen, setIsHistoryOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isCommentsLoading, setIsCommentsLoading] = useState(false)
  const [isTemplateOpen, setIsTemplateOpen] = useState(false)
  const [templateText, setTemplateText] = useState("")

  // 📱 채팅창 제어용 State (모바일/노트북용)
  const [isChatOpen, setIsChatOpen] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)

  // 1. 컬럼 설명(FAQ) 데이터 로드
  useEffect(() => {
    if (Object.keys(columnDefs).length === 0) {
      getColumnDefinitionsAction().then(data => setColumnDefs(data));
    }
  }, [columnDefs, setColumnDefs]);

  const isOwner = activeRequest?.requesterName === currentUser?.name;
  const isAdmin = currentUser?.isAdmin;
  const isRequestedStatus = activeRequest?.status === 'Requested';
  const isReviewStatus = activeRequest?.status === 'Review'; 

  const canEdit = !activeRequest || (isOwner && isRequestedStatus) || isAdmin;
  const canEditSapCode = isAdmin && isReviewStatus;
  const canDelete = activeRequest && (isAdmin || isOwner);

  const generateDefaultValues = () => {
    const defaults: any = {};
    MDM_FORM_SCHEMA.forEach(field => {
      if (field.defaultValue !== undefined) {
        defaults[field.key] = field.defaultValue;
      }
    });
    return defaults;
  };

  const form = useForm<SapMasterData>({
    defaultValues: generateDefaultValues()
  })

  // 2. 채팅 스크롤 하단 고정
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [activeRequest?.comments, isChatOpen]);

  // 3. 데이터 동기화 함수
  const refreshData = async (targetId?: string) => {
    const latestRequests = await getRequestsAction();
    setRequests(latestRequests);

    if (targetId) {
      const updatedRequest = latestRequests.find(r => r.id === targetId);
      if (updatedRequest) {
        setCurrentRequest(updatedRequest);
        const comments = await getCommentsAction(targetId);
        setComments(targetId, comments);
      }
    }
  };

  // 4. 자동 완성 로직 (MTART, WERKS) - [✅ 기능 보존 확인]
  const mtart = form.watch("MTART");
  const werks = form.watch("WERKS"); 

  useEffect(() => {
    if (mtart === 'FERT' || mtart === 'ZSET') {
      form.setValue('BESKZ', 'E');
      form.setValue('BKLAS', '7920');
      form.setValue('MLAST', 3);
    } else if (mtart === 'HAWA') {
      form.setValue('BESKZ', 'F');
      form.setValue('BKLAS', '3100');
      form.setValue('MLAST', 2);
    }
  }, [mtart, form]);

  useEffect(() => {
    if (werks === '1021' || werks === '1022') {
        form.setValue('LGPRO', '2200');
    } else if (werks === '1023') {
        form.setValue('LGPRO', '2301');
    } 

    if (werks === '1022') {
        form.setValue('LGFSB', '2210');
    } else if (werks === '1023') {
        form.setValue('LGFSB', '2301');
    }
  }, [werks, form]);

  // 5. 폼 데이터 초기화 및 댓글 로드
  useEffect(() => {
    if (activeRequest) {
      form.reset({ ...generateDefaultValues(), ...activeRequest.data });
      
      const loadComments = async () => {
        setIsCommentsLoading(true);
        try {
          const comments = await getCommentsAction(activeRequest.id);
          setComments(activeRequest.id, comments);
        } finally {
          setIsCommentsLoading(false);
        }
      };
      loadComments();
    } else {
      form.reset(generateDefaultValues());
    }
  }, [activeRequest?.id, form, setComments]); 

  // 📱 모바일 뒤로가기 핸들러
  const handleBackToList = () => {
    setCurrentRequest(null);
  }

  // 6. 저장(Submit) 핸들러
  const onSubmit = async (data: SapMasterData) => {
    const missingFields = MDM_FORM_SCHEMA.filter(f => f.required && !data[f.key]).map(f => f.label);
    const actorName = currentUser?.name || 'Unknown';

    if (!activeRequest) {
      if (!confirm("요청을 등록하시겠습니까?")) return;
      addRequest(data); 
      alert("저장되었습니다.");
      
      createRequestAction(data, actorName).then(async (result) => {
        if (result.success && result.id) {
          await refreshData(result.id);
          if (missingFields.length > 0) {
             await createCommentAction(result.id, `⚠️ [시스템 알림] 필수값이 비어있습니다: ${missingFields.join(', ')}`, "System");
          }
        } else {
          alert("저장 실패! 다시 시도해주세요. " + result.message);
        }
      });

    } else {
      updateRequest(activeRequest.id, data);
      alert("수정되었습니다.");

      updateRequestAction(activeRequest.id, data, actorName).then(async (result) => {
        if (result.success) {
          await refreshData(activeRequest.id);
          if (missingFields.length > 0) {
             await createCommentAction(activeRequest.id, `⚠️ [시스템 알림] 필수값이 비어있습니다: ${missingFields.join(', ')}`, "System");
          }
        } else {
          alert("수정 실패! " + result.message);
        }
      });
    }
  }

  // 7. 삭제 핸들러
  const handleDelete = async () => {
    if (!activeRequest) return;
    if (!confirm("정말 이 요청을 삭제하시겠습니까?")) return;

    setIsSubmitting(true);
    const result = await deleteRequestAction(activeRequest.id);
    if (result.success) {
        alert(result.message);
        createNewRequest(); 
        const latestRequests = await getRequestsAction(); 
        setRequests(latestRequests);
    } else {
        alert(result.message);
    }
    setIsSubmitting(false);
  }

  // 8. 계층구조 요청 핸들러
  const handleHierarchyRequest = async (msg: string) => {
    let reqId = activeRequest?.id;
    if (!reqId) {
      if(!confirm("계층구조 요청을 위해 현재 내용을 임시 저장합니다.")) return;
      setIsSubmitting(true);
      try {
        const formData = form.getValues();
        const result = await createRequestAction(formData, currentUser?.name || 'Unknown');
        if (!result.success || !result.id) {
          alert("임시 저장 실패");
          return;
        }
        reqId = result.id;
        await refreshData(reqId);
      } finally {
        setIsSubmitting(false);
      }
    }
    await createCommentAction(reqId, msg, "System");
    alert("계층구조 생성 요청이 등록되었습니다.");
    await refreshData(reqId);
  }

  // 9. 댓글 전송 핸들러
  const handleSendComment = async () => {
    if (!commentInput.trim() || !activeRequest || !currentUser) return;
    const msg = commentInput;
    const reqId = activeRequest.id;
    setCommentInput("");
    
    const tempComments = [...activeRequest.comments, { writer: currentUser.name, message: msg, createdAt: new Date().toISOString() }];
    setComments(reqId, tempComments);

    await createCommentAction(reqId, msg, currentUser.name);
    const realComments = await getCommentsAction(reqId);
    setComments(reqId, realComments);
  }

  // 10. 승인/반려 프로세스 핸들러
  const handleStartReview = async () => {
    if (!activeRequest) return;
    if (!confirm("검토를 시작하시겠습니까?")) return;

    const actor = currentUser?.name || 'Admin';
    updateStatusAction(activeRequest.id, 'Review', actor); 
    const updated = requests.map(r => r.id === activeRequest.id ? { ...r, status: 'Review' as const } : r);
    setRequests(updated);
    if(currentRequest) setCurrentRequest({ ...currentRequest, status: 'Review' });
    
    alert("검토 상태로 변경되었습니다.");
    
    await createCommentAction(activeRequest.id, "검토를 시작했습니다.", actor);
    await refreshData(activeRequest.id);
  }

  const handleReject = async () => {
    if (!activeRequest) return;
    const reason = prompt("반려 사유를 입력해주세요:");
    if (!reason) return;

    const actor = currentUser?.name || 'Admin';
    const updated = requests.map(r => r.id === activeRequest.id ? { ...r, status: 'Reject' as const } : r);
    setRequests(updated);
    if(currentRequest) setCurrentRequest({ ...currentRequest, status: 'Reject' });
    alert("반려 처리되었습니다.");

    await updateStatusAction(activeRequest.id, 'Reject', actor);
    await createCommentAction(activeRequest.id, `🚫 반려됨: ${reason}`, actor);
    await refreshData(activeRequest.id);
  }

  const handleApprove = async () => {
    if (!activeRequest) return;
    const matnrValue = form.getValues("MATNR");
    if (!matnrValue) {
        alert("최종 승인을 위해서는 '자재코드(MATNR)' 입력이 필요합니다.");
        return;
    }
    if (!confirm(`자재코드 [${matnrValue}]로 최종 승인하시겠습니까?`)) return;

    const actor = currentUser?.name || 'Admin';
    const updated = requests.map(r => r.id === activeRequest.id ? { ...r, status: 'Approved' as const, data: {...r.data, MATNR: matnrValue} } : r);
    setRequests(updated);
    if(currentRequest) setCurrentRequest({ ...currentRequest, status: 'Approved', data: {...currentRequest.data, MATNR: matnrValue} });
    alert("최종 승인(완료) 처리되었습니다.");

    await updateRequestAction(activeRequest.id, { ...activeRequest.data, MATNR: matnrValue }, actor);
    await updateStatusAction(activeRequest.id, 'Approved', actor);
    await createCommentAction(activeRequest.id, `✅ 최종 승인 완료 (SAP Code: ${matnrValue})`, actor);
    await refreshData(activeRequest.id);
  }

  // 11. 협조전 템플릿 로직
  const openTemplateDialog = () => {
    if (!activeRequest) return;
    const hierarchyRequest = activeRequest.comments?.filter(c => c.message.includes('[계층구조 신규 요청]'))
      .map(c => c.message.replace('📂 [계층구조 신규 요청]', '').trim())
      .join('\n   - ') || '';

    const text = `
[업무협조의뢰] 신규 자재 코드 생성 요청 [${activeRequest.data.MAKTX || '품명'}]

1. 자재 정보
   - 자재명: ${activeRequest.data.MAKTX || '-'}
   - 자재유형: ${activeRequest.data.MTART || '-'}
   - 기본단위: ${activeRequest.data.MEINS || '-'}
   - 자재그룹: ${activeRequest.data.MATKL || '-'}
   - 중량: ${activeRequest.data.NTGEW || '0'} ${activeRequest.data.GEWEI || ''}

2. 관리 정보
   - 플랜트: ${activeRequest.data.WERKS || '-'}
   - 저장위치: ${activeRequest.data.LGPRO || '-'}
   - MRP 관리자: ${activeRequest.data.DISPO || '-'}

${hierarchyRequest ? `3. 요청 사항 (계층구조)\n   - ${hierarchyRequest}\n` : ''}
위 품목에 대해 기준정보 생성 요청드립니다.
- 요청일: ${activeRequest.createdAt.split('T')[0]}
- 요청자: ${activeRequest.requesterName}
`.trim();

    setTemplateText(text);
    setIsTemplateOpen(true);
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(templateText);
    alert("📋 클립보드에 복사되었습니다.");
    setIsTemplateOpen(false);
  }

  // 12. 라벨 렌더링 (도움말 포함)
  const renderLabelWithHelp = (field: FieldMeta) => {
    const def = columnDefs[field.key];
    return (
      <div className="flex items-center gap-1.5 mb-1.5">
        <FormLabel className="text-[11px] font-bold text-slate-500 flex items-center m-0">
          {field.label}
          {field.required && <span className="text-red-500 ml-0.5">*</span>}
        </FormLabel>
        
        {def && (
          <Popover>
            <PopoverTrigger asChild>
              <button type="button" className="text-slate-400 hover:text-indigo-600 transition-colors focus:outline-none">
                <HelpCircle size={13} />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0 overflow-hidden shadow-xl border-indigo-100" side="right" align="start">
              <div className="bg-indigo-50 px-4 py-3 border-b border-indigo-100 flex items-center gap-2">
                <BookOpen size={16} className="text-indigo-600"/>
                <h4 className="font-bold text-indigo-900 text-sm">{field.label} <span className="font-normal text-xs text-indigo-400">({field.key})</span></h4>
              </div>
              <div className="p-4 space-y-3 bg-white text-xs">
                {def.definition && (
                  <div><span className="font-bold text-slate-700 block mb-1">📖 정의</span><p className="text-slate-600 leading-relaxed">{def.definition}</p></div>
                )}
                {def.usage && (
                  <div><span className="font-bold text-slate-700 block mb-1">💡 용도 및 예시</span><p className="text-slate-600 leading-relaxed bg-slate-50 p-2 rounded">{def.usage}</p></div>
                )}
                {def.risk && (
                  <div><span className="font-bold text-red-600 block mb-1 flex items-center gap-1"><AlertTriangle size={12}/> 오입력 시 리스크</span><p className="text-red-500 leading-relaxed bg-red-50 p-2 rounded border border-red-100">{def.risk}</p></div>
                )}
              </div>
            </PopoverContent>
          </Popover>
        )}
      </div>
    );
  };

  // 13. 입력 필드 렌더링
  const renderFieldInput = (field: FieldMeta, fieldProps: any) => {
    let isReadOnly = field.fixed || !canEdit;
    if (field.key === 'MATNR') isReadOnly = !canEditSapCode; 

    if (field.key === 'LGPRO') {
        if (werks === '1021' || werks === '1022' || werks === '1023') isReadOnly = true; 
    }
    if (field.key === 'LGFSB') {
        if (werks === '1022' || werks === '1023') isReadOnly = true;
    }

    let fieldStyle = "h-9 text-sm w-full ";
    if (isReadOnly || field.fixed) {
      if (field.defaultValue !== undefined && field.defaultValue !== '' || (field.key === 'LGPRO' && isReadOnly) || (field.key === 'LGFSB' && isReadOnly)) {
        fieldStyle += "bg-blue-50 text-blue-700 font-semibold border-blue-200 cursor-not-allowed";
      } else {
        fieldStyle += "bg-slate-100 text-slate-400 cursor-not-allowed";
      }
    } else if (field.required) {
      fieldStyle += "bg-amber-50 border-amber-200 focus:ring-amber-500";
    } else {
      fieldStyle += "bg-white";
    }

    if (field.key === 'MATNR') {
        return (
            <FormControl>
                <div className="flex gap-2 w-full">
                    <Input 
                        {...fieldProps} 
                        value={fieldProps.value || ''}
                        placeholder={canEditSapCode ? "SAP 코드 입력" : "채번 대기중"}
                        readOnly={isReadOnly}
                        className={`h-9 text-sm w-full ${canEditSapCode ? "bg-white border-indigo-300 ring-2 ring-indigo-100 font-bold text-indigo-700" : "bg-slate-100 text-slate-400"}`}
                    />
                    {isReadOnly && <Lock size={14} className="text-slate-400 self-center shrink-0"/>}
                </div>
            </FormControl>
        )
    }

    if (field.key === 'LGFSB' && werks === '1021') {
        return (
          <Select onValueChange={fieldProps.onChange} value={String(fieldProps.value || '')} disabled={isReadOnly}>
            <FormControl>
              <SelectTrigger className={fieldStyle}>
                <SelectValue placeholder="선택 (1021 전용)" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectItem value="2101">2101 제품냉동창고</SelectItem>
              <SelectItem value="2102">2102 제품냉장창고</SelectItem>
              <SelectItem value="2103">2103 제품상온창고</SelectItem>
            </SelectContent>
          </Select>
        );
    }

    if (field.type === 'custom_prdha') {
        return ( 
            <FormControl> 
                <div className={isReadOnly ? "pointer-events-none opacity-60" : "w-full"}>
                    <HierarchySelector value={fieldProps.value} onChange={fieldProps.onChange} onRequestNew={handleHierarchyRequest} /> 
                </div>
            </FormControl> 
        );
    }
    if (field.type === 'select' && field.options) {
      return (
        <Select onValueChange={fieldProps.onChange} value={String(fieldProps.value || '')} disabled={isReadOnly}>
          <FormControl>
            <SelectTrigger className={fieldStyle}>
              <SelectValue placeholder="선택" />
            </SelectTrigger>
          </FormControl>
          <SelectContent>
            {Object.entries(field.options).map(([k, v]) => (
              <SelectItem key={k} value={k}>{String(v)}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    }
    if (field.type === 'ref_select' && field.refKey) {
        const list = (MOCK_REF_DATA as any)[field.refKey] || [];
        return (
          <Select onValueChange={fieldProps.onChange} value={String(fieldProps.value || '')} disabled={isReadOnly}>
            <FormControl>
              <SelectTrigger className={fieldStyle}>
                <SelectValue placeholder="선택" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {list.map((item: any) => (
                <SelectItem key={item.code} value={item.code}>[{item.code}] {item.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
    }
    if (field.type === 'custom_matkl') {
      return (
        <Select onValueChange={fieldProps.onChange} value={String(fieldProps.value || '')} disabled={isReadOnly}>
          <FormControl>
            <SelectTrigger className={fieldStyle}>
              <SelectValue placeholder="선택" />
            </SelectTrigger>
          </FormControl>
          <SelectContent>
            {MOCK_MAT_GROUP.map((item) => (
              <SelectItem key={item.code} value={item.code}>[{item.code}] {item.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    }
    return (
      <FormControl>
        <Input 
          {...fieldProps} 
          value={fieldProps.value || ''} 
          type={field.type === 'number' ? 'number' : field.type === 'date' ? 'date' : 'text'} 
          readOnly={isReadOnly} 
          className={fieldStyle} 
        />
      </FormControl>
    );
  }

  // 14. 채팅 컴포넌트 (공통)
  const ChatComponent = () => (
    <div className="flex flex-col h-full">
      <div className="flex-1 p-4 bg-slate-50/30 overflow-y-auto min-h-0">
        <div className="space-y-4">
          {isCommentsLoading ? (
              <div className="flex justify-center py-10"><Loader2 className="animate-spin text-slate-400"/></div>
          ) : !activeRequest ? ( 
              <div className="text-center text-slate-400 text-xs mt-10">요청을 선택하세요.</div> 
          ) : (activeRequest.comments || []).length === 0 ? ( 
              <div className="text-center text-slate-400 text-xs mt-10">대화 내역이 없습니다.</div> 
          ) : (
            (activeRequest.comments || []).map((cmt, idx) => (
              <div key={idx} className={`flex flex-col gap-1 ${cmt.writer === currentUser?.name ? 'items-end' : 'items-start'}`}>
                <div className="flex items-center gap-1 text-[10px] text-slate-400"><span className="font-bold text-slate-600">{cmt.writer}</span><span>{new Date(cmt.createdAt).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span></div>
                <div className={`p-3 rounded-xl text-xs max-w-[90%] shadow-sm ${cmt.message.includes('[계층구조 신규 요청]') ? 'bg-amber-100 text-amber-800 border border-amber-200 w-full' : cmt.writer === 'System' ? 'bg-orange-50 text-orange-700 border border-orange-100 w-full flex items-start gap-2' : cmt.writer === currentUser?.name ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-white border border-slate-200 text-slate-700 rounded-tl-none'}`}>
                  {cmt.writer === 'System' && !cmt.message.includes('계층구조') && <AlertTriangle size={14} className="shrink-0 mt-0.5"/>}{cmt.message}
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>
      <div className="p-3 border-t bg-white shrink-0">
        <div className="flex gap-2">
          <Input value={commentInput} onChange={(e) => setCommentInput(e.target.value)} placeholder="메시지 입력..." className="text-xs h-9 bg-slate-50" onKeyDown={(e) => e.key === 'Enter' && handleSendComment()} disabled={!activeRequest} />
          <Button onClick={handleSendComment} size="icon" className="h-9 w-9 bg-indigo-600 hover:bg-indigo-700 shrink-0" disabled={!activeRequest}><Send size={14} /></Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-full bg-slate-50/50 w-full overflow-hidden">
      <AuditLogDialog 
        requestId={activeRequest?.id || null} 
        isOpen={isHistoryOpen} 
        onClose={() => setIsHistoryOpen(false)} 
      />

      <Dialog open={isTemplateOpen} onOpenChange={setIsTemplateOpen}>
        <DialogContent className="max-w-xl bg-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><FileText size={20} className="text-indigo-600"/> 업무협조의뢰 양식</DialogTitle>
            <DialogDescription>그룹웨어 협조의뢰 본문에 붙여넣으세요.</DialogDescription>
          </DialogHeader>
          <div className="py-2">
            <Textarea value={templateText} readOnly className="h-[400px] text-sm font-mono bg-slate-50 leading-relaxed resize-none"/>
          </div>
          <DialogFooter>
            <Button onClick={copyToClipboard} className="bg-indigo-600 w-full sm:w-auto gap-2"><Copy size={16}/> 멘트 복사</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 📱 모바일/노트북용 채팅 Sheet */}
      <Sheet open={isChatOpen} onOpenChange={setIsChatOpen}>
        <SheetContent className="w-[340px] sm:w-[400px] p-0 flex flex-col bg-white" side="right">
          <SheetHeader className="p-4 border-b shrink-0"><SheetTitle className="text-sm flex items-center gap-2"><MessageSquare size={16}/> 메시지 히스토리</SheetTitle></SheetHeader>
          <div className="flex-1 overflow-hidden h-full">
            <ChatComponent />
          </div>
        </SheetContent>
      </Sheet>

      <div className="flex-1 flex flex-col min-w-0 w-full">
        
        {/* 헤더 */}
        <div className="h-14 md:h-16 border-b bg-white px-4 md:px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 overflow-hidden">
            {/* 모바일 뒤로가기 버튼 */}
            <Button 
                variant="ghost" 
                size="icon" 
                className="md:hidden mr-1 -ml-2 text-slate-500" 
                onClick={handleBackToList}
            >
                <ArrowLeft size={20} />
            </Button>

            <div className="flex flex-col gap-0.5 min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-base md:text-lg text-slate-800 truncate">
                    {activeRequest ? (activeRequest.data.MAKTX || '품명 미입력') : '신규 요청'}
                </h2>
                <span className="hidden md:inline-flex text-[10px] px-2 py-0.5 rounded select-none border transition-colors cursor-default bg-slate-100 text-slate-600 border-slate-200">
                    {currentUser?.isAdmin ? '👑 관리자' : '👤 사용자'}
                </span>
              </div>
              {activeRequest && ( 
                  <span className="text-[10px] md:text-xs text-slate-400 font-mono truncate">
                    {activeRequest.id} | <span className={activeRequest.status === 'Approved' ? 'text-green-600 font-bold' : ''}>{activeRequest.status}</span>
                  </span> 
              )}
            </div>
          </div>

          <div className="flex gap-1 md:gap-2 shrink-0">
            {activeRequest && (
              // 📱 채팅 버튼 (2xl 이상에서는 숨김 -> 우측 고정창이 보이므로)
              <Button variant="outline" className="h-8 md:h-9 text-xs gap-1 px-2 md:px-4 2xl:hidden" onClick={() => setIsChatOpen(true)}>
                <MessageSquare size={14} className="text-indigo-600"/>
                <span className="hidden md:inline">채팅</span>
              </Button>
            )}

            {activeRequest && (
              <Button variant="outline" className="h-8 md:h-9 text-xs gap-1 px-2 md:px-4 text-slate-700 border-slate-300 hover:bg-slate-50 hidden sm:flex" onClick={openTemplateDialog}>
                <FileText size={14} className="text-indigo-600"/>
                <span className="hidden lg:inline">협조전</span>
              </Button>
            )}

            {activeRequest && (
              <Button variant="outline" className="h-8 md:h-9 text-xs gap-1 px-2 md:px-4 text-slate-600" onClick={() => setIsHistoryOpen(true)}>
                <History size={14} />
                <span className="hidden md:inline">이력</span>
              </Button>
            )}

            {canDelete && (
               <Button variant="destructive" className="h-8 md:h-9 text-xs gap-1 px-2 md:px-4" onClick={handleDelete}>
                 <Trash2 size={14} />
                 <span className="hidden md:inline">삭제</span>
               </Button>
            )}

            {canEdit && (
                <Button 
                  onClick={form.handleSubmit(onSubmit)} 
                  variant="outline" 
                  className="h-8 md:h-9 text-xs gap-1 px-2 md:px-4 min-w-[50px] transition-all duration-200" 
                  disabled={isSubmitting} 
                >
                  {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                  <span className="hidden md:inline ml-1">저장</span>
                </Button>
            )}

            {currentUser?.isAdmin && activeRequest && (
                <>
                    {activeRequest.status === 'Requested' && ( <Button onClick={handleStartReview} className="bg-orange-500 hover:bg-orange-600 h-8 md:h-9 text-xs gap-1 text-white"><PlayCircle size={14} /><span className="hidden md:inline">검토</span></Button> )}
                    {activeRequest.status === 'Review' && ( <> <Button onClick={handleReject} variant="destructive" className="h-8 md:h-9 text-xs gap-1"><XCircle size={14} /><span className="hidden md:inline">반려</span></Button> <Button onClick={handleApprove} className="bg-green-600 hover:bg-green-700 h-8 md:h-9 text-xs gap-1 text-white"><CheckCircle size={14} /><span className="hidden md:inline">승인</span></Button> </> )}
                </>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-hidden flex flex-col">
          <Form {...form}>
            {!activeRequest && (
              <div className="bg-blue-50 border-b border-blue-100 px-4 md:px-6 py-3 flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
                <Info size={16} className="text-blue-600 shrink-0" />
                <p className="text-xs text-blue-700 font-medium">
                  📝 <span className="font-bold">신규 작성</span>: 필수 항목 입력 후 <span className="underline">저장</span>해주세요.
                </p>
              </div>
            )}

            <Tabs defaultValue="basic" className="flex flex-col h-full overflow-hidden">
              <div className="bg-white border-b px-2 md:px-4 shrink-0">
                <TabsList className="h-10 bg-transparent w-full justify-start p-0 gap-2 md:gap-4 overflow-x-auto no-scrollbar">
                  {FORM_TABS.map((tab) => (
                    <TabsTrigger key={tab.id} value={tab.id} className="rounded-none border-b-2 border-transparent px-2 py-2 text-xs md:text-sm font-medium text-slate-500 data-[state=active]:border-indigo-600 data-[state=active]:text-indigo-600 data-[state=active]:shadow-none hover:text-slate-800">
                      {tab.label}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>
              
              <div className="flex-1 overflow-y-auto bg-slate-50 p-4 md:p-6">
                {FORM_TABS.map((tab) => (
                  <TabsContent key={tab.id} value={tab.id} className="mt-0">
                    <Card className="p-4 md:p-6 border-slate-200 shadow-sm">
                      {/* 🛠️ Grid 수정: 기본 1열, 2xl(1536px) 이상에서만 2열 */}
                      <div className="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-x-6 gap-y-5">
                        {MDM_FORM_SCHEMA.filter(f => f.tab === tab.id).map((field) => (
                          <div key={field.key} className={field.type === 'custom_prdha' ? 'col-span-full' : ''}>
                            <FormField control={form.control} name={field.key as string}
                              render={({ field: fieldProps }) => (
                                <FormItem className="space-y-1">
                                  {renderLabelWithHelp(field)} 
                                  {renderFieldInput(field, fieldProps)}
                                  <FormMessage className="text-[10px]" />
                                </FormItem>
                              )}
                            />
                          </div>
                        ))}
                      </div>
                    </Card>
                  </TabsContent>
                ))}
              </div>
            </Tabs>
          </Form>
        </div>
      </div>

      {/* 🖥️ 우측 고정 채팅 (2xl 이상 대형 화면에서만 보임) */}
      <div className="hidden 2xl:flex w-[320px] border-l border-slate-200 bg-white flex-col shrink-0">
        <div className="h-16 border-b flex items-center px-4 shrink-0 bg-slate-50/50">
          <h3 className="font-bold text-slate-700 flex items-center gap-2 text-sm"><MessageSquare size={16}/> 메시지 히스토리</h3>
        </div>
        <ChatComponent />
      </div>
    </div>
  )
}