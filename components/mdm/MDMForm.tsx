"use client"

import { useState, useEffect, useRef } from "react"
import { useForm } from "react-hook-form"
import { 
  Save, MessageSquare, Send, AlertTriangle, 
  CheckCircle, XCircle, PlayCircle, Lock, Trash2, History,
  HelpCircle, BookOpen, Loader2, Info 
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
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

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
    columnDefs, setColumnDefs
  } = useMDMStore()
  
  // ✅ 중요: 검색 필터링 등으로 인해 currentRequest 참조가 끊어지지 않도록
  // 전체 requests 목록에서 현재 선택된 ID와 일치하는 최신 객체를 실시간으로 찾아서 사용합니다.
  const activeRequest = requests.find(r => r.id === currentRequest?.id) || currentRequest;

  const [commentInput, setCommentInput] = useState("")
  const [isHistoryOpen, setIsHistoryOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // 댓글 로딩 상태 추가
  const [isCommentsLoading, setIsCommentsLoading] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (Object.keys(columnDefs).length === 0) {
      getColumnDefinitionsAction().then(data => setColumnDefs(data));
    }
  }, [columnDefs, setColumnDefs]);

  // 권한 체크 (activeRequest 기준)
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

  // 스크롤 자동 이동
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [activeRequest?.comments]);

  const refreshData = async (targetId?: string) => {
    const latestRequests = await getRequestsAction();
    setRequests(latestRequests);

    if (targetId) {
      const updatedRequest = latestRequests.find(r => r.id === targetId);
      if (updatedRequest) {
        setCurrentRequest(updatedRequest);
        // 댓글도 새로고침
        const comments = await getCommentsAction(targetId);
        setComments(targetId, comments);
        form.reset({ ...generateDefaultValues(), ...updatedRequest.data });
      }
    }
  };

  const mtart = form.watch("MTART");
  useEffect(() => {
    if (mtart === 'HAWA') form.setValue('BKLAS', '3100');
    else if (mtart) form.setValue('BKLAS', '7920');
  }, [mtart, form]);

  // 폼 데이터 리셋 및 댓글 로딩
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
      
      // 댓글 데이터가 비어있거나 초기화 상태일 때만 로딩 (이미 있으면 스킵하여 깜빡임 방지)
      // 단, 검색 등으로 인해 다시 마운트될 수 있으므로 id가 바뀔 때마다 체크
      loadComments();
    } else {
      form.reset(generateDefaultValues());
    }
  }, [activeRequest?.id, form, setComments]); // activeRequest.id가 바뀔 때만 실행

  const onSubmit = async (data: SapMasterData) => {
    const missingFields = MDM_FORM_SCHEMA.filter(f => f.required && !data[f.key]).map(f => f.label);
    let targetId = activeRequest?.id;
    const actorName = currentUser?.name || 'Unknown';

    if (!activeRequest) {
      if (!confirm("요청을 등록하시겠습니까?")) return;
      
      setIsSubmitting(true);

      try {
        const result = await createRequestAction(data, actorName);
        if (result.success && result.id) {
          alert(result.message);
          targetId = result.id;
          await refreshData(targetId);
        } else {
          alert(result.message);
          return;
        }
      } catch (error) {
        console.error(error);
        alert("저장 중 오류가 발생했습니다.");
      } finally {
        setIsSubmitting(false);
      }

    } else {
      setIsSubmitting(true);
      try {
        const result = await updateRequestAction(activeRequest.id, data, actorName);
        if (result.success) {
          alert(result.message);
          await refreshData(activeRequest.id);
        } else {
          alert(result.message);
        }
      } catch (error) {
        console.error(error);
        alert("수정 중 오류가 발생했습니다.");
      } finally {
        setIsSubmitting(false);
      }
    }

    if (missingFields.length > 0 && targetId) {
      const msg = `⚠️ [시스템 알림] 필수값이 비어있습니다: ${missingFields.join(', ')}`;
      await createCommentAction(targetId, msg, "System");
      await refreshData(targetId);
    }
  }

  const handleDelete = async () => {
    if (!activeRequest) return;
    if (!confirm("정말 이 요청을 삭제하시겠습니까?")) return;

    const result = await deleteRequestAction(activeRequest.id);
    if (result.success) {
        alert(result.message);
        createNewRequest(); 
        const latestRequests = await getRequestsAction(); 
        setRequests(latestRequests);
    } else {
        alert(result.message);
    }
  }

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

  const handleSendComment = async () => {
    if (!commentInput.trim() || !activeRequest || !currentUser) return;
    const msg = commentInput;
    const reqId = activeRequest.id;
    setCommentInput("");
    await createCommentAction(reqId, msg, currentUser.name);
    await refreshData(reqId);
  }

  const handleStartReview = async () => {
    if (!activeRequest) return;
    if (!confirm("검토를 시작하시겠습니까? 상태가 '진행(Review)'로 변경됩니다.")) return;

    const actor = currentUser?.name || 'Admin';
    const result = await updateStatusAction(activeRequest.id, 'Review', actor);
    
    if(result.success) {
      const msg = "검토를 시작했습니다.";
      await createCommentAction(activeRequest.id, msg, actor);
      await refreshData(activeRequest.id);
      alert("검토 상태로 변경되었습니다.");
    } else {
      alert("상태 변경 실패: " + result.message);
    }
  }

  const handleReject = async () => {
    if (!activeRequest) return;
    const reason = prompt("반려 사유를 입력해주세요:");
    if (!reason) return;

    const actor = currentUser?.name || 'Admin';
    const result = await updateStatusAction(activeRequest.id, 'Reject', actor);

    if(result.success) {
      const msg = `🚫 반려됨: ${reason}`;
      await createCommentAction(activeRequest.id, msg, actor);
      await refreshData(activeRequest.id);
      alert("반려 처리되었습니다.");
    } else {
       alert("반려 처리 실패: " + result.message);
    }
  }

  const handleApprove = async () => {
    if (!activeRequest) return;
    
    const matnrValue = form.getValues("MATNR");
    if (!matnrValue) {
        alert("최종 승인을 위해서는 '자재코드(MATNR)' 입력이 필요합니다.\n기본정보 탭에서 자재코드를 입력해주세요.");
        return;
    }

    if (!confirm(`자재코드 [${matnrValue}]로 최종 승인하시겠습니까? 상태가 '완료(Approved)'로 변경됩니다.`)) return;

    const actor = currentUser?.name || 'Admin';
    const dataUpdateResult = await updateRequestAction(activeRequest.id, { ...activeRequest.data, MATNR: matnrValue }, actor);
    
    if (!dataUpdateResult.success) {
        alert("자재코드 저장 중 오류 발생");
        return;
    }

    const statusUpdateResult = await updateStatusAction(activeRequest.id, 'Approved', actor);

    if (statusUpdateResult.success) {
      const msg = `✅ 최종 승인 완료 (SAP Code: ${matnrValue})`;
      await createCommentAction(activeRequest.id, msg, actor);
      await refreshData(activeRequest.id);
      alert("최종 승인(완료) 처리되었습니다.");
    } else {
      alert("승인 처리 실패: " + statusUpdateResult.message);
    }
  }

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
                  <div>
                    <span className="font-bold text-slate-700 block mb-1">📖 정의</span>
                    <p className="text-slate-600 leading-relaxed">{def.definition}</p>
                  </div>
                )}
                {def.usage && (
                  <div>
                    <span className="font-bold text-slate-700 block mb-1">💡 용도 및 예시</span>
                    <p className="text-slate-600 leading-relaxed bg-slate-50 p-2 rounded">{def.usage}</p>
                  </div>
                )}
                {def.risk && (
                  <div>
                    <span className="font-bold text-red-600 block mb-1 flex items-center gap-1">
                      <AlertTriangle size={12}/> 오입력 시 리스크
                    </span>
                    <p className="text-red-500 leading-relaxed bg-red-50 p-2 rounded border border-red-100">
                      {def.risk}
                    </p>
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
    const requiredStyle = field.required ? "bg-amber-50 border-amber-200 focus:ring-amber-500" : "bg-white";
    let isReadOnly = field.fixed || !canEdit;
    if (field.key === 'MATNR') isReadOnly = !canEditSapCode; 
    const readOnlyStyle = isReadOnly ? "bg-slate-100 text-slate-500 cursor-not-allowed" : requiredStyle;

    if (field.key === 'MATNR') {
        return (
            <FormControl>
                <div className="flex gap-2">
                    <Input 
                        {...fieldProps} 
                        value={fieldProps.value || ''}
                        placeholder={canEditSapCode ? "SAP 코드 입력" : "채번 대기중"}
                        readOnly={isReadOnly}
                        className={`h-9 text-sm ${canEditSapCode ? "bg-white border-indigo-300 ring-2 ring-indigo-100 font-bold text-indigo-700" : "bg-slate-100 text-slate-400"}`}
                    />
                    {isReadOnly && <Lock size={14} className="text-slate-400 self-center shrink-0"/>}
                </div>
            </FormControl>
        )
    }
    if (field.type === 'custom_prdha') {
        return ( 
            <FormControl> 
                <div className={isReadOnly ? "pointer-events-none opacity-60" : ""}>
                    <HierarchySelector value={fieldProps.value} onChange={fieldProps.onChange} onRequestNew={handleHierarchyRequest} /> 
                </div>
            </FormControl> 
        );
    }
    if (field.type === 'select' && field.options) {
      return (
        <Select onValueChange={fieldProps.onChange} value={String(fieldProps.value || '')} disabled={isReadOnly}>
          <FormControl>
            <SelectTrigger className={`h-9 text-sm ${readOnlyStyle}`}>
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
              <SelectTrigger className={`h-9 text-sm ${readOnlyStyle}`}>
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
            <SelectTrigger className={`h-9 text-sm ${readOnlyStyle}`}>
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
          className={`h-9 text-sm ${readOnlyStyle}`} 
        />
      </FormControl>
    );
  }

  return (
    <div className="flex h-full bg-slate-50/50">
      <AuditLogDialog 
        requestId={activeRequest?.id || null} 
        isOpen={isHistoryOpen} 
        onClose={() => setIsHistoryOpen(false)} 
      />

      <div className="flex-1 flex flex-col min-w-0">
        <div className="h-16 border-b bg-white px-6 flex items-center justify-between shrink-0">
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-lg text-slate-800">{activeRequest ? '상세 정보' : '신규 요청'}</h2>
              <span className={`text-[10px] px-2 py-0.5 rounded select-none border transition-colors cursor-default ${currentUser?.isAdmin ? 'bg-purple-100 text-purple-700 border-purple-200' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                  {currentUser?.isAdmin ? '👑 관리자 계정' : '👤 일반 사용자'}
              </span>
            </div>
            {activeRequest && ( <span className="text-xs text-slate-400 font-mono">{activeRequest.id} | <span className={activeRequest.status === 'Approved' ? 'text-green-600 font-bold' : ''}>{activeRequest.status}</span></span> )}
          </div>

          <div className="flex gap-2">
            {activeRequest && (
              <Button variant="outline" className="h-9 text-xs gap-1 text-slate-600" onClick={() => setIsHistoryOpen(true)}>
                <History size={14} /> 이력
              </Button>
            )}

            {canDelete && (
               <Button variant="destructive" className="h-9 text-xs gap-1" onClick={handleDelete}>
                 <Trash2 size={14} /> 삭제
               </Button>
            )}

            {canEdit && (
                <Button 
                  onClick={form.handleSubmit(onSubmit)} 
                  variant="outline" 
                  className="h-9 text-xs gap-1 transition-all duration-200 min-w-[60px]" 
                  disabled={isSubmitting} 
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      <span>처리중...</span>
                    </>
                  ) : (
                    <>
                      <Save size={14} />
                      <span>저장</span>
                    </>
                  )}
                </Button>
            )}

            {currentUser?.isAdmin && activeRequest && (
                <>
                    {activeRequest.status === 'Requested' && ( <Button onClick={handleStartReview} className="bg-orange-500 hover:bg-orange-600 h-9 text-xs gap-1 text-white"><PlayCircle size={14} /> 검토 시작</Button> )}
                    {activeRequest.status === 'Review' && ( <> <Button onClick={handleReject} variant="destructive" className="h-9 text-xs gap-1"><XCircle size={14} /> 반려</Button> <Button onClick={handleApprove} className="bg-green-600 hover:bg-green-700 h-9 text-xs gap-1 text-white"><CheckCircle size={14} /> 승인 & 채번</Button> </> )}
                </>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-hidden flex flex-col">
          <Form {...form}>
            {!activeRequest && (
              <div className="bg-blue-50 border-b border-blue-100 px-6 py-3 flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
                <Info size={16} className="text-blue-600 shrink-0" />
                <p className="text-xs text-blue-700 font-medium">
                  📝 <span className="font-bold">신규 작성 모드</span>입니다. 모든 필수 항목을 입력하고 우측 상단의 <span className="underline">저장 버튼</span>을 눌러주세요.
                </p>
              </div>
            )}

            <Tabs defaultValue="basic" className="flex flex-col h-full overflow-hidden">
              <div className="bg-white border-b px-4 shrink-0">
                <TabsList className="h-10 bg-transparent w-full justify-start p-0 gap-4 overflow-x-auto no-scrollbar">
                  {FORM_TABS.map((tab) => (
                    <TabsTrigger key={tab.id} value={tab.id} className="rounded-none border-b-2 border-transparent px-2 py-2 text-sm font-medium text-slate-500 data-[state=active]:border-indigo-600 data-[state=active]:text-indigo-600 data-[state=active]:shadow-none hover:text-slate-800">
                      {tab.label}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>
              <ScrollArea className="flex-1 bg-slate-50 p-6">
                {FORM_TABS.map((tab) => (
                  <TabsContent key={tab.id} value={tab.id} className="mt-0">
                    <Card className="p-6 border-slate-200 shadow-sm">
                      <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-x-6 gap-y-5">
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
              </ScrollArea>
            </Tabs>
          </Form>
        </div>
      </div>

      <div className="w-[320px] border-l border-slate-200 bg-white flex flex-col shrink-0">
        <div className="h-16 border-b flex items-center px-4 shrink-0 bg-slate-50/50">
          <h3 className="font-bold text-slate-700 flex items-center gap-2 text-sm"><MessageSquare size={16}/> 메시지 히스토리</h3>
        </div>
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
        <div className="p-3 border-t bg-white">
          <div className="flex gap-2">
            <Input value={commentInput} onChange={(e) => setCommentInput(e.target.value)} placeholder="메시지 입력..." className="text-xs h-9 bg-slate-50" onKeyDown={(e) => e.key === 'Enter' && handleSendComment()} disabled={!activeRequest} />
            <Button onClick={handleSendComment} size="icon" className="h-9 w-9 bg-indigo-600 hover:bg-indigo-700 shrink-0" disabled={!activeRequest}><Send size={14} /></Button>
          </div>
        </div>
      </div>
    </div>
  )
}