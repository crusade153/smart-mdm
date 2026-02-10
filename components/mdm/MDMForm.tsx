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
import { SapMasterData, MaterialRequest } from "@/types/mdm"
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
import { TemplateSelectDialog } from "./TemplateSelectDialog"
import { ProductNameGenerator } from "./ProductNameGenerator"

// 채팅 컴포넌트
const ChatComponent = ({ 
  activeRequest, 
  currentUser, 
  commentInput, 
  setCommentInput, 
  handleSendComment, 
  isCommentsLoading,
  messagesEndRef 
}: any) => (
  <div className="flex flex-col h-full">
    <div className="flex-1 p-4 bg-slate-50/30 overflow-y-auto min-h-0">
      <div className="space-y-4">
        {isCommentsLoading ? (
          <div className="flex justify-center py-10"><Loader2 className="animate-spin text-slate-400"/></div> 
        ) : (activeRequest?.comments || []).length === 0 ? (
          <div className="text-center text-slate-400 text-xs mt-10">대화 내역이 없습니다.</div>
        ) : (
          activeRequest?.comments.map((cmt: any, idx: number) => (
            <div key={idx} className={`flex flex-col gap-1 ${cmt.writer === currentUser?.name ? 'items-end' : 'items-start'}`}>
              <div className="flex items-center gap-1 text-[10px] text-slate-400">
                <span className="font-bold text-slate-600">{cmt.writer}</span>
                <span>{new Date(cmt.createdAt).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
              </div>
              <div className={`p-3 rounded-xl text-xs max-w-[90%] shadow-sm ${
                cmt.message.includes('[계층구조 신규 요청]') ? 'bg-amber-100 text-amber-800 border border-amber-200 w-full' : 
                cmt.writer === 'System' ? 'bg-orange-50 text-orange-700 border border-orange-100 w-full flex items-start gap-2' : 
                cmt.writer === currentUser?.name ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-white border border-slate-200 text-slate-700 rounded-tl-none'
              }`}>
                {cmt.writer === 'System' && !cmt.message.includes('계층구조') && <AlertTriangle size={14} className="shrink-0 mt-0.5"/>}
                {cmt.message}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
    </div>
    <div className="p-3 border-t bg-white shrink-0">
      <div className="flex gap-2">
        <Input 
          value={commentInput} 
          onChange={(e) => setCommentInput(e.target.value)} 
          placeholder="메시지..." 
          className="text-xs h-9 bg-slate-50" 
          onKeyDown={(e) => e.key === 'Enter' && handleSendComment()} 
          disabled={!activeRequest || activeRequest.id === 'new'} 
        />
        <Button onClick={handleSendComment} size="icon" className="h-9 w-9 bg-indigo-600 hover:bg-indigo-700 shrink-0" disabled={!activeRequest || activeRequest.id === 'new'}>
          <Send size={14} />
        </Button>
      </div>
    </div>
  </div>
);

export function MDMForm() {
  const { 
    currentRequest, requests, setCurrentRequest, setRequests, createNewRequest,
    setComments, currentUser, selectedIds,
    columnDefs, setColumnDefs,
    addRequest, updateRequest 
  } = useMDMStore()
  
  const activeRequest = requests.find(r => r.id === currentRequest?.id) || currentRequest;
  const isNewMode = activeRequest?.id === 'new';

  const [commentInput, setCommentInput] = useState("")
  const [isHistoryOpen, setIsHistoryOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isCommentsLoading, setIsCommentsLoading] = useState(false)
  const [isTemplateOpen, setIsTemplateOpen] = useState(false) 
  const [isCopyDialogOpen, setIsCopyDialogOpen] = useState(false) 
  const [templateText, setTemplateText] = useState("")
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [sourceRequestId, setSourceRequestId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (Object.keys(columnDefs).length === 0) {
      getColumnDefinitionsAction().then(data => setColumnDefs(data));
    }
  }, [columnDefs, setColumnDefs]);

  const isOwner = activeRequest?.requesterName === currentUser?.name;
  const isAdmin = currentUser?.isAdmin;
  const isRequestedStatus = activeRequest?.status === 'Requested';
  const isReviewStatus = activeRequest?.status === 'Review'; 

  const canEdit = isNewMode || (isOwner && isRequestedStatus) || isAdmin;
  // 💡 [수정] 관리자는 상태와 무관하게 언제든 SAP Code 수정 가능
  const canEditSapCode = isAdmin; 
  const canDelete = !isNewMode && activeRequest && (isAdmin || isOwner);

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

  const handleNameGenerate = (generatedName: string) => {
    if (!canEdit) return;
    form.setValue("MAKTX", generatedName, { 
      shouldValidate: true, shouldDirty: true, shouldTouch: true 
    });
  };

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [activeRequest?.comments, isChatOpen]);

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

  const mtart = form.watch("MTART");
  const werks = form.watch("WERKS"); 

  useEffect(() => {
    const currentValues = form.getValues();
    
    if (mtart === 'FERT' || mtart === 'ZSET') {
      if (currentValues.BESKZ !== 'E') form.setValue('BESKZ', 'E');
      if (currentValues.BKLAS !== '7920') form.setValue('BKLAS', '7920');
      if (currentValues.MLAST !== 3) form.setValue('MLAST', 3);
      if (currentValues.KTGRM !== '10') form.setValue('KTGRM', '10');
    } else if (mtart === 'HAWA') {
      if (currentValues.BESKZ !== 'F') form.setValue('BESKZ', 'F');
      if (currentValues.BKLAS !== '3100') form.setValue('BKLAS', '3100');
      if (currentValues.MLAST !== 2) form.setValue('MLAST', 2);
      if (currentValues.KTGRM !== '20') form.setValue('KTGRM', '20');
      // 💡 [추가] HAWA 선택 시 구매그룹 H01 자동 입력
      if (currentValues.EKGRP !== 'H01') form.setValue('EKGRP', 'H01');
    }
  }, [mtart, form]);

  useEffect(() => {
    const currentValues = form.getValues();
    
    if (werks === '1021' || werks === '1022') { 
      if (currentValues.LGPRO !== '2200') form.setValue('LGPRO', '2200'); 
    } else if (werks === '1023') { 
      if (currentValues.LGPRO !== '2301') form.setValue('LGPRO', '2301'); 
    } else if (werks === '1031') {
      if (currentValues.LGPRO !== '3000') form.setValue('LGPRO', '3000');
    }
    
    if (werks === '1022') { 
      if (currentValues.LGFSB !== '2210') form.setValue('LGFSB', '2210'); 
    } else if (werks === '1023') { 
      if (currentValues.LGFSB !== '2301') form.setValue('LGFSB', '2301'); 
    }
  }, [werks, form]);

  useEffect(() => {
    if (activeRequest && !isNewMode) {
      const currentData = form.getValues();
      if (JSON.stringify(currentData) !== JSON.stringify(activeRequest.data)) {
        const mergedData = { ...generateDefaultValues(), ...activeRequest.data };
        form.reset(mergedData);
      }
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
    }
  }, [activeRequest?.id, isNewMode, setComments]);

  const handleBackToList = () => { setCurrentRequest(null); setSourceRequestId(null); }

  const handleLoadTemplate = (targetRequest: MaterialRequest) => {
    const replaceText = prompt(`[${targetRequest.data.MAKTX}] 내용을 복사합니다.\n\n편의를 위해 품명 등에서 특정 단어를 변경하시겠습니까?\n(예: '얼큰한맛' -> '순한맛')\n\n변경할 단어를 입력하세요. (변경 없으면 취소/확인)`);
    
    let newData: SapMasterData = { ...targetRequest.data }; 
    let replaceMsg = "";

    if (replaceText && replaceText.trim() !== "") {
       const newWord = prompt(`'${replaceText}'을(를) 무엇으로 바꾸시겠습니까?`);
       if (newWord !== null) {
          Object.keys(newData).forEach((key) => {
            const val = newData[key];
            if (typeof val === 'string') {
               newData[key] = val.replaceAll(replaceText, newWord);
            }
          });
          replaceMsg = ` ('${replaceText}' → '${newWord}' 치환됨)`;
       }
    }

    newData.MATNR = ""; 
    form.reset({ ...generateDefaultValues(), ...newData });
    setSourceRequestId(targetRequest.id); 
    setIsCopyDialogOpen(false);

    alert(
      `✅ [${targetRequest.data.MAKTX}] 자재 정보를 성공적으로 불러왔습니다.${replaceMsg}\n\n` +
      `⚠️ 주의: 품명, 바코드 등 고유 정보까지 모두 복사되었습니다.\n` +
      `반드시 현재 요청 품목에 맞게 수정해주세요!`
    );
  };

  const onSubmit = async (data: SapMasterData) => {
    const missingFields = MDM_FORM_SCHEMA.filter(f => f.required && !data[f.key]).map(f => f.label);
    const actorName = currentUser?.name || 'Unknown';

    if (isNewMode) {
      if (!confirm("요청을 등록하시겠습니까?")) return;
      
      addRequest(data); 
      alert("저장되었습니다.");
      
      createRequestAction(data, actorName).then(async (result) => {
        if (result.success && result.id) {
          await refreshData(result.id);
          
          if (sourceRequestId) {
             const sourceReq = requests.find(r => r.id === sourceRequestId);
             const sourceName = sourceReq?.data.MAKTX || sourceRequestId;
             await createCommentAction(
               result.id, 
               `📋 [시스템] 이 요청은 '${sourceName}' (${sourceRequestId}) 자재 정보를 복사(Clone)하여 생성되었습니다.`, 
               "System"
             );
             setSourceRequestId(null);
          }

          if (missingFields.length > 0) {
             await createCommentAction(result.id, `⚠️ [시스템 알림] 필수값이 비어있습니다: ${missingFields.join(', ')}`, "System");
          }
        } else {
          alert("저장 실패! 다시 시도해주세요. " + result.message);
        }
      });

    } else if (activeRequest) {
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

  const handleDelete = async () => {
    if (!activeRequest || isNewMode) return;
    if (!confirm("삭제하시겠습니까?")) return;
    setIsSubmitting(true);
    const result = await deleteRequestAction(activeRequest.id);
    if (result.success) {
        alert(result.message);
        createNewRequest(); 
        const latestRequests = await getRequestsAction(); 
        setRequests(latestRequests);
    }
    setIsSubmitting(false);
  }

  const handleHierarchyRequest = async (msg: string) => {
    let reqId = activeRequest?.id;
    if (isNewMode || !reqId) {
      if(!confirm("계층구조 요청을 위해 현재 내용을 임시 저장합니다.")) return;
      setIsSubmitting(true);
      try {
        const formData = form.getValues();
        const result = await createRequestAction(formData, currentUser?.name || 'Unknown');
        if (!result.success || !result.id) return;
        reqId = result.id;
        await refreshData(reqId);
      } finally { setIsSubmitting(false); }
    }
    await createCommentAction(reqId, msg, "System");
    alert("요청되었습니다.");
    await refreshData(reqId);
  }

  const handleSendComment = async () => {
    if (!commentInput.trim() || !activeRequest || isNewMode || !currentUser) return;
    const msg = commentInput;
    const reqId = activeRequest.id;
    
    setCommentInput("");
    const tempComments = [
      ...(activeRequest.comments || []), 
      { writer: currentUser.name, message: msg, createdAt: new Date().toISOString() }
    ];
    setComments(reqId, tempComments); 

    await createCommentAction(reqId, msg, currentUser.name);
    
    const realComments = await getCommentsAction(reqId);
    setComments(reqId, realComments);
  }

  const handleStartReview = async () => {
    if (!activeRequest || isNewMode) return;
    if (!confirm("검토를 시작하시겠습니까?")) return;
    const actor = currentUser?.name || 'Admin';
    updateStatusAction(activeRequest.id, 'Review', actor); 
    const updated = requests.map(r => r.id === activeRequest.id ? { ...r, status: 'Review' as const } : r);
    setRequests(updated);
    if(currentRequest) setCurrentRequest({ ...currentRequest, status: 'Review' });
    alert("상태가 변경되었습니다.");
    await createCommentAction(activeRequest.id, "검토를 시작했습니다.", actor);
    await refreshData(activeRequest.id);
  }

  const handleReject = async () => {
    if (!activeRequest || isNewMode) return;
    const reason = prompt("반려 사유:");
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
    if (!activeRequest || isNewMode) return;
    const matnrValue = form.getValues("MATNR");
    if (!matnrValue) { alert("자재코드(MATNR) 입력 필요"); return; }
    if (!confirm(`자재코드 [${matnrValue}]로 승인하시겠습니까?`)) return;
    const actor = currentUser?.name || 'Admin';
    const updated = requests.map(r => r.id === activeRequest.id ? { ...r, status: 'Approved' as const, data: {...r.data, MATNR: matnrValue} } : r);
    setRequests(updated);
    if(currentRequest) setCurrentRequest({ ...currentRequest, status: 'Approved', data: {...currentRequest.data, MATNR: matnrValue} });
    alert("승인 완료되었습니다.");
    await updateRequestAction(activeRequest.id, { ...activeRequest.data, MATNR: matnrValue }, actor);
    await updateStatusAction(activeRequest.id, 'Approved', actor);
    await createCommentAction(activeRequest.id, `✅ 최종 승인 완료 (SAP Code: ${matnrValue})`, actor);
    await refreshData(activeRequest.id);
  }

  const openTemplateDialog = () => {
    let targets = requests.filter(r => selectedIds.includes(r.id));
    
    if (targets.length === 0 && activeRequest && !isNewMode) {
        targets = [activeRequest];
    }

    if (targets.length === 0) {
        alert("협조전을 작성할 요청을 목록에서 선택해주세요.");
        return;
    }

    const firstItemName = targets[0].data.MAKTX || '품명 미입력';
    const countSuffix = targets.length > 1 ? ` 외 ${targets.length - 1}건` : '';
    const title = `[업무협조의뢰] 신규 자재 코드 생성 요청 [${firstItemName}${countSuffix}]`;

    const bodyContent = targets.map((req, index) => {
        const hierarchyRequest = req.comments?.filter((c: any) => c.message.includes('[계층구조 신규 요청]'))
            .map((c: any) => c.message.replace('📂 [계층구조 신규 요청]', '').trim()).join('\n      - ') || '특이사항 없음';

        return `
■ No.${index + 1} : ${req.data.MAKTX || '(품명 없음)'} (${req.id})

1. 자재 정보
   - 자재유형: ${req.data.MTART || '-'}
   - 기본단위: ${req.data.MEINS || '-'}
   - 자재그룹: ${req.data.MATKL || '-'}
   - 중량: ${req.data.NTGEW || '0'} ${req.data.GEWEI || ''}

2. 관리 정보
   - 플랜트: ${req.data.WERKS || '-'}
   - 저장위치: ${req.data.LGPRO || '-'}
   - MRP 관리자: ${req.data.DISPO || '-'}

3. 요청 사항 (계층구조)
   - ${hierarchyRequest}
        `.trim();
    }).join('\n\n--------------------------------------------------\n\n');

    const footer = `
위 품목에 대해 기준정보 생성 요청드립니다.

- 요청일: ${new Date().toLocaleDateString()}
- 요청자: ${currentUser?.name || 'Unknown'}
    `.trim();

    const fullText = `${title}\n\n${bodyContent}\n\n${footer}`;
    
    setTemplateText(fullText); 
    setIsTemplateOpen(true);
  }

  const copyToClipboard = () => { navigator.clipboard.writeText(templateText); alert("복사되었습니다."); setIsTemplateOpen(false); }

  // 💡 [수정] 이미지 렌더링을 위해 툴팁 로직 강화
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
              <button type="button" className="text-slate-400 hover:text-indigo-600 transition-colors focus:outline-none"><HelpCircle size={13} /></button>
            </PopoverTrigger>
            <PopoverContent className="w-96 p-0 overflow-hidden shadow-xl border-indigo-100" side="right" align="start">
              <div className="bg-indigo-50 px-4 py-3 border-b border-indigo-100 flex items-center gap-2"><BookOpen size={16} className="text-indigo-600"/><h4 className="font-bold text-indigo-900 text-sm">{field.label}</h4></div>
              <div className="p-4 space-y-3 bg-white text-xs">
                <p className="text-slate-600 font-medium">{def.definition}</p>
                {/* 💡 [추가] 사용 예시 강조 표시 */}
                {def.usage && (
                   <div className="p-2 bg-slate-50 rounded border border-slate-100 text-slate-700">
                     <span className="font-bold text-indigo-600 mr-1">💡 예시:</span> {def.usage}
                   </div>
                )}
                {/* 💡 [추가] 이미지 렌더링 */}
                {def.image && (
                    <div className="mt-2 border rounded-md overflow-hidden">
                        <img src={def.image} alt="Guide Image" className="w-full h-auto object-cover" />
                        <div className="bg-slate-100 text-[10px] text-center py-1 text-slate-500">참고 예시 이미지</div>
                    </div>
                )}
                {def.risk && (
                  <div className="mt-2 p-2 bg-red-50 border border-red-100 rounded text-red-700">
                    <span className="font-bold block mb-1">⚠️ 미입력/오류 리스크</span>
                    {def.risk}
                  </div>
                )}
              </div>
            </PopoverContent>
          </Popover>
        )}
      </div>
    );
  };

  const renderFieldInput = (field: FieldMeta, fieldProps: any) => {
    let isReadOnly = field.fixed || !canEdit;
    if (field.key === 'MATNR') isReadOnly = !canEditSapCode; 
    
    if (
      (field.key === 'LGPRO' && ['1021','1022','1023','1031'].includes(werks || '')) || 
      (field.key === 'LGFSB' && ['1022','1023'].includes(werks || ''))
    ) {
      isReadOnly = true;
    }

    let fieldStyle = "h-9 text-sm w-full ";
    if (isReadOnly || field.fixed) fieldStyle += "bg-slate-100 text-slate-400 cursor-not-allowed";
    else if (field.required) fieldStyle += "bg-amber-50 border-amber-200";
    else fieldStyle += "bg-white";

    const safeValue = fieldProps.value ?? '';

    if (field.key === 'MATNR') return <FormControl><div className="flex gap-2 w-full"><Input {...fieldProps} value={safeValue} readOnly={isReadOnly} className={fieldStyle} />{isReadOnly && <Lock size={14} className="text-slate-400"/>}</div></FormControl>;
    
    if (field.key === 'LGFSB' && werks === '1021') return <Select onValueChange={fieldProps.onChange} value={String(safeValue)} disabled={isReadOnly}><FormControl><SelectTrigger className={fieldStyle}><SelectValue placeholder="선택" /></SelectTrigger></FormControl><SelectContent><SelectItem value="2101">2101 냉동</SelectItem><SelectItem value="2102">2102 냉장</SelectItem><SelectItem value="2103">2103 상온</SelectItem></SelectContent></Select>;
    if (field.key === 'LGFSB' && werks === '1031') return <Select onValueChange={fieldProps.onChange} value={String(safeValue)} disabled={isReadOnly}><FormControl><SelectTrigger className={fieldStyle}><SelectValue placeholder="선택" /></SelectTrigger></FormControl><SelectContent>
      <SelectItem value="3000">3000 물류창고</SelectItem>
      <SelectItem value="3300">3300 생산실적창고</SelectItem>
      <SelectItem value="9000">9000 오드그로서 창고</SelectItem>
      <SelectItem value="9100">9100 미식마켓 창고</SelectItem>
    </SelectContent></Select>;

    if (field.type === 'custom_prdha') return <FormControl><div className={isReadOnly ? "pointer-events-none opacity-60" : "w-full"}><HierarchySelector value={safeValue} onChange={fieldProps.onChange} onRequestNew={handleHierarchyRequest} /></div></FormControl>;
    
    if (field.type === 'select' && field.options) {
      return (
        <Select 
          onValueChange={(val) => fieldProps.onChange(val === '_EMPTY_' ? '' : val)} 
          value={safeValue === '' ? '_EMPTY_' : String(safeValue)} 
          disabled={isReadOnly}
        >
          <FormControl>
            <SelectTrigger className={fieldStyle}>
              <SelectValue placeholder="선택" />
            </SelectTrigger>
          </FormControl>
          <SelectContent>
            {Object.entries(field.options).map(([k, v]) => (
              <SelectItem key={k} value={k === '' ? '_EMPTY_' : k}>
                {String(v)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    }

    if (field.type === 'ref_select' && field.refKey) return <Select onValueChange={fieldProps.onChange} value={String(safeValue)} disabled={isReadOnly}><FormControl><SelectTrigger className={fieldStyle}><SelectValue placeholder="선택" /></SelectTrigger></FormControl><SelectContent>{(MOCK_REF_DATA as any)[field.refKey]?.map((item: any) => <SelectItem key={item.code} value={item.code}>[{item.code}] {item.name}</SelectItem>)}</SelectContent></Select>;
    if (field.type === 'custom_matkl') return <Select onValueChange={fieldProps.onChange} value={String(safeValue)} disabled={isReadOnly}><FormControl><SelectTrigger className={fieldStyle}><SelectValue placeholder="선택" /></SelectTrigger></FormControl><SelectContent>{MOCK_MAT_GROUP.map((item) => <SelectItem key={item.code} value={item.code}>[{item.code}] {item.name}</SelectItem>)}</SelectContent></Select>;
    
    return <FormControl>
        <Input 
            {...fieldProps} 
            value={safeValue} 
            type={field.type === 'number' ? 'number' : field.type === 'date' ? 'date' : 'text'} 
            readOnly={isReadOnly} 
            className={fieldStyle} 
        />
    </FormControl>;
  }

  if (!activeRequest && !currentRequest) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-4">
        <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center">
          <ArrowLeft className="w-8 h-8 opacity-50" />
        </div>
        <p className="text-sm font-medium">목록에서 요청을 선택하거나<br/>[+ 신규] 버튼을 눌러주세요.</p>
      </div>
    )
  }

  return (
    <div className="flex h-full bg-slate-50/50 w-full overflow-hidden">
      <AuditLogDialog requestId={activeRequest?.id || null} isOpen={isHistoryOpen} onClose={() => setIsHistoryOpen(false)} />
      
      <TemplateSelectDialog 
        isOpen={isCopyDialogOpen} 
        onClose={() => setIsCopyDialogOpen(false)} 
        onSelect={handleLoadTemplate} 
      />

      <Dialog open={isTemplateOpen} onOpenChange={setIsTemplateOpen}>
        <DialogContent className="max-w-xl bg-white"><DialogHeader><DialogTitle className="flex items-center gap-2"><FileText size={20} className="text-indigo-600"/> 업무협조의뢰 양식</DialogTitle><DialogDescription>협조의뢰 본문에 붙여넣으세요.</DialogDescription></DialogHeader><div className="py-2"><Textarea value={templateText} readOnly className="h-[400px] text-sm font-mono bg-slate-50 leading-relaxed resize-none"/></div><DialogFooter><Button onClick={copyToClipboard} className="bg-indigo-600 w-full sm:w-auto gap-2"><Copy size={16}/> 복사</Button></DialogFooter></DialogContent>
      </Dialog>

      <Sheet open={isChatOpen} onOpenChange={setIsChatOpen}>
        <SheetContent className="w-[340px] sm:w-[400px] p-0 flex flex-col bg-white" side="right">
          <SheetHeader className="p-4 border-b shrink-0"><SheetTitle className="text-sm flex items-center gap-2"><MessageSquare size={16}/> 메시지 히스토리</SheetTitle></SheetHeader>
          <div className="flex-1 overflow-hidden h-full">
            <ChatComponent 
              activeRequest={activeRequest} 
              currentUser={currentUser} 
              commentInput={commentInput} 
              setCommentInput={setCommentInput} 
              handleSendComment={handleSendComment} 
              isCommentsLoading={isCommentsLoading} 
              messagesEndRef={messagesEndRef}
            />
          </div>
        </SheetContent>
      </Sheet>

      <div className="flex-1 flex flex-col min-w-0 w-full">
        <div className="h-14 md:h-16 border-b bg-white px-4 md:px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 overflow-hidden">
            <Button variant="ghost" size="icon" className="md:hidden mr-1 -ml-2 text-slate-500" onClick={handleBackToList}><ArrowLeft size={20} /></Button>
            <div className="flex flex-col gap-0.5 min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-base md:text-lg text-slate-800 truncate">{isNewMode ? '신규 요청' : (activeRequest?.data.MAKTX || '품명 미입력')}</h2>
                {activeRequest && !isNewMode && <span className="hidden md:inline-flex text-[10px] px-2 py-0.5 rounded border bg-slate-100 text-slate-600 border-slate-200">{activeRequest.status}</span>}
              </div>
              {activeRequest && !isNewMode && <span className="text-[10px] md:text-xs text-slate-400 font-mono truncate">{activeRequest.id}</span>}
            </div>
          </div>

          <div className="flex gap-1 md:gap-2 shrink-0">
            {isNewMode && (
                <Button 
                    variant="outline" 
                    className="h-8 md:h-9 text-xs gap-1 px-2 md:px-4 bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100" 
                    onClick={() => setIsCopyDialogOpen(true)}
                >
                    <Copy size={14} />
                    <span className="hidden md:inline">기존자재 불러오기</span>
                </Button>
            )}

            {activeRequest && !isNewMode && (
              <Button variant="outline" className="h-8 md:h-9 text-xs gap-1 px-2 md:px-4 2xl:hidden" onClick={() => setIsChatOpen(true)}>
                <MessageSquare size={14} className="text-indigo-600"/>
                <span className="hidden md:inline">채팅</span>
              </Button>
            )}
            
            {activeRequest && !isNewMode && (
              <Button variant="outline" className="h-8 md:h-9 text-xs gap-1 px-2 md:px-4 text-slate-700 border-slate-300 hover:bg-slate-50 hidden sm:flex" onClick={openTemplateDialog}>
                <FileText size={14} className="text-indigo-600"/>
                <span className="hidden lg:inline">협조전</span>
              </Button>
            )}

            {activeRequest && !isNewMode && (
              <Button variant="outline" className="h-8 md:h-9 text-xs gap-1 px-2 md:px-4 text-slate-600" onClick={() => setIsHistoryOpen(true)}>
                <History size={14} />
                <span className="hidden md:inline">이력</span>
              </Button>
            )}

            {canDelete && (
               <Button variant="destructive" className="h-8 md:h-9 text-xs gap-1 px-2 md:px-4" onClick={handleDelete}><Trash2 size={14} /><span className="hidden md:inline">삭제</span></Button>
            )}

            {canEdit && (
                <Button onClick={form.handleSubmit(onSubmit)} variant="outline" className="h-8 md:h-9 text-xs gap-1 px-2 md:px-4 min-w-[50px]" disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                  <span className="hidden md:inline ml-1">저장</span>
                </Button>
            )}
            
            {currentUser?.isAdmin && activeRequest && !isNewMode && activeRequest.status === 'Requested' && (
                <Button onClick={handleStartReview} className="bg-orange-500 hover:bg-orange-600 h-8 md:h-9 text-xs gap-1 text-white"><PlayCircle size={14} /><span className="hidden md:inline">검토</span></Button>
            )}
            {currentUser?.isAdmin && activeRequest && !isNewMode && activeRequest.status === 'Review' && (
                <>
                  <Button onClick={handleReject} variant="destructive" className="h-8 md:h-9 text-xs gap-1"><XCircle size={14} /><span className="hidden md:inline">반려</span></Button>
                  <Button onClick={handleApprove} className="bg-green-600 hover:bg-green-700 h-8 md:h-9 text-xs gap-1 text-white"><CheckCircle size={14} /><span className="hidden md:inline">승인</span></Button>
                </>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-hidden flex flex-col">
          <Form {...form}>
            {isNewMode && <div className="bg-blue-50 border-b border-blue-100 px-4 py-2 text-xs text-blue-700 text-center"><Info size={12} className="inline mr-1"/> 신규 작성 모드입니다.</div>}
            
            <Tabs defaultValue="basic" className="flex flex-col h-full overflow-hidden">
              <div className="bg-white border-b px-2 md:px-4 shrink-0">
                <TabsList className="h-10 bg-transparent w-full justify-start p-0 gap-2 md:gap-4 overflow-x-auto no-scrollbar">
                  {FORM_TABS.map((tab) => (<TabsTrigger key={tab.id} value={tab.id} className="rounded-none border-b-2 border-transparent px-2 py-2 text-xs md:text-sm font-medium text-slate-500 data-[state=active]:border-indigo-600 data-[state=active]:text-indigo-600 data-[state=active]:shadow-none hover:text-slate-800">{tab.label}</TabsTrigger>))}
                </TabsList>
              </div>
              
              <div className="flex-1 overflow-y-auto bg-slate-50 p-4 md:p-6">
                {FORM_TABS.map((tab) => (
                  <TabsContent key={tab.id} value={tab.id} className="mt-0">
                    <Card className="p-4 md:p-6 border-slate-200 shadow-sm">
                      {/* 기본정보 탭일 때 상단에 품명 생성기 표시 */}
                      {tab.id === 'basic' && canEdit && (
                        <div className="mb-6">
                          <ProductNameGenerator onNameChange={handleNameGenerate} />
                        </div>
                      )}

                      <div className="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-x-6 gap-y-5">
                        {MDM_FORM_SCHEMA.filter(f => f.tab === tab.id).map((field) => (
                          <div key={field.key} className={field.type === 'custom_prdha' ? 'col-span-full' : ''}>
                            <FormField control={form.control} name={field.key as string}
                              render={({ field: fieldProps }) => (
                                <FormItem className="space-y-1">
                                  {renderLabelWithHelp(field)} 
                                  {/* MAKTX 필드는 생성기를 통해서만 입력하도록 readOnly 처리 */}
                                  {field.key === 'MAKTX' && canEdit ? (
                                    <FormControl>
                                      <Input 
                                        {...fieldProps} 
                                        // ⚠️ undefined일 경우 빈 문자열로 변환 (Uncontrolled 방지)
                                        value={fieldProps.value ?? ''}
                                        readOnly 
                                        className="h-9 text-sm w-full bg-slate-100 text-slate-600 font-bold cursor-not-allowed" 
                                        placeholder="위 생성기를 통해 자동 입력됩니다."
                                      />
                                    </FormControl>
                                  ) : (
                                    renderFieldInput(field, fieldProps)
                                  )}
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

      {activeRequest && !isNewMode && (
        <div className="hidden 2xl:flex w-[320px] border-l border-slate-200 bg-white flex-col shrink-0">
          <div className="h-16 border-b flex items-center px-4 shrink-0 bg-slate-50/50">
            <h3 className="font-bold text-slate-700 flex items-center gap-2 text-sm"><MessageSquare size={16}/> 메시지 히스토리</h3>
          </div>
          <ChatComponent 
            activeRequest={activeRequest} 
            currentUser={currentUser} 
            commentInput={commentInput} 
            setCommentInput={setCommentInput} 
            handleSendComment={handleSendComment} 
            isCommentsLoading={isCommentsLoading} 
            messagesEndRef={messagesEndRef}
          />
        </div>
      )}
    </div>
  )
}