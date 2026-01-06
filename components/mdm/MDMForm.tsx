"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { 
  Save, MessageSquare, Send, AlertTriangle, 
  CheckCircle, XCircle, PlayCircle, Lock
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

import { MDM_FORM_SCHEMA, FORM_TABS, FieldMeta } from "@/lib/constants/sap-fields"
import { useMDMStore } from "@/stores/useMDMStore"
import { SapMasterData } from "@/types/mdm"
import { HierarchySelector } from "./HierarchySelector"
import { MOCK_MAT_GROUP, MOCK_REF_DATA } from "@/lib/mock-data"

export function MDMForm() {
  const { 
    addRequest, updateRequest, currentRequest, addComment, 
    updateStatus, updateSapCode, currentUser, toggleUserMode 
  } = useMDMStore()
  
  const [commentInput, setCommentInput] = useState("")

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

  // ✅ [로직 추가] 자재유형(MTART) 감시 및 평가클래스(BKLAS) 자동 변경
  const mtart = form.watch("MTART");

  useEffect(() => {
    if (mtart === 'HAWA') {
      form.setValue('BKLAS', '3100'); // 상품이면 3100
    } else if (mtart) {
      form.setValue('BKLAS', '7920'); // 그 외(FERT, ZSET)는 7920
    }
  }, [mtart, form]);

  // ✅ [수정] 리스트 선택 시 데이터 리셋 (고정값 유지 로직 적용)
  useEffect(() => {
    const defaults = generateDefaultValues(); // 1. 스키마에 정의된 고정값들을 먼저 가져옴

    if (currentRequest) {
      // 2. 고정값(defaults) 위에 저장된 데이터(currentRequest.data)를 덮어씌움
      // 이렇게 하면 저장된 데이터에 해당 필드가 없더라도 고정값이 유지됨
      form.reset({
        ...defaults,
        ...currentRequest.data
      });
    } else {
      form.reset(defaults);
    }
  }, [currentRequest, form]);

  const onSubmit = (data: SapMasterData) => {
    const missingFields = MDM_FORM_SCHEMA.filter(f => f.required && !data[f.key]).map(f => f.label);
    
    if (currentRequest) {
      updateRequest(currentRequest.id, data);
      if (missingFields.length > 0) {
        addComment(currentRequest.id, `⚠️ [시스템] 필수값 미입력: ${missingFields.join(', ')}`, "System");
        alert(`저장되었으나 필수값이 누락되었습니다.\n(${missingFields.length}개 항목)`);
      } else {
        alert("수정되었습니다.");
      }
    } else {
      addRequest(data);
      alert("신규 요청이 등록되었습니다.");
    }
  }

const handleSendComment = () => {
  // currentUser가 없으면(null이면) 함수 실행을 멈추도록 조건 추가 (!currentUser)
  if (!commentInput.trim() || !currentRequest || !currentUser) return; 
  
  // 위에서 null 체크를 했으므로, 여기서는 currentUser가 안전하다고 판단함
  addComment(currentRequest.id, commentInput, currentUser.name);
  setCommentInput("");
}

  const handleHierarchyRequest = (msg: string) => {
    if (!currentRequest) {
      alert("먼저 요청을 저장한 후 계층구조 생성을 요청해주세요.");
      return;
    }
    addComment(currentRequest.id, msg, "System");
    alert("요청사항이 메시지에 등록되었습니다.");
  }

  // --- 관리자 액션 핸들러 ---
  const handleStartReview = () => {
    if (!currentRequest) return;
    if (confirm("검토를 시작하시겠습니까? 상태가 '진행(Review)'로 변경됩니다.")) {
      updateStatus(currentRequest.id, 'Review');
      addComment(currentRequest.id, "관리자가 검토를 시작했습니다.", "System");
    }
  }

  const handleReject = () => {
    if (!currentRequest) return;
    const reason = prompt("반려 사유를 입력해주세요:");
    if (reason) {
      updateStatus(currentRequest.id, 'Reject');
      addComment(currentRequest.id, `🚫 반려됨: ${reason}`, "System");
    }
  }

  const handleApprove = () => {
    if (!currentRequest) return;
    const matnrValue = form.getValues("MATNR");
    
    if (!matnrValue) {
        alert("최종 승인을 위해서는 '자재코드(MATNR)' 입력이 필요합니다.\n기본정보 탭에서 자재코드를 입력해주세요.");
        return;
    }

    if (confirm(`자재코드 [${matnrValue}]로 최종 승인하시겠습니까?`)) {
      updateSapCode(currentRequest.id, matnrValue);
      addComment(currentRequest.id, `✅ 최종 승인 완료 (SAP Code: ${matnrValue})`, "System");
    }
  }

  const renderFieldInput = (field: FieldMeta, fieldProps: any) => {
    const requiredStyle = field.required ? "bg-amber-50 border-amber-200 focus:ring-amber-500" : "bg-white";
    const readOnlyStyle = field.fixed ? "bg-slate-100 text-slate-500 cursor-not-allowed" : requiredStyle;

    if (field.key === 'MATNR') {
        const isEditable = currentUser.isAdmin && currentRequest?.status === 'Review';
        return (
            <FormControl>
                <div className="flex gap-2">
                    <Input 
                        {...fieldProps} 
                        value={fieldProps.value || ''}
                        placeholder={isEditable ? "SAP 코드 입력" : "채번 대기중"}
                        readOnly={!isEditable}
                        className={`h-9 text-sm ${isEditable ? "bg-white border-indigo-300 ring-2 ring-indigo-100" : "bg-slate-100 text-slate-400"}`}
                    />
                    {!isEditable && <Lock size={14} className="text-slate-400 self-center shrink-0"/>}
                </div>
            </FormControl>
        )
    }

    if (field.type === 'custom_prdha') {
      return (
        <FormControl>
          <HierarchySelector 
            value={fieldProps.value} 
            onChange={fieldProps.onChange} 
            onRequestNew={handleHierarchyRequest} 
          />
        </FormControl>
      );
    }
    
    if (field.type === 'select' && field.options) {
      return (
        <Select onValueChange={fieldProps.onChange} value={String(fieldProps.value || '')}>
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
          <Select onValueChange={fieldProps.onChange} value={String(fieldProps.value || '')}>
            <FormControl>
              <SelectTrigger className={`h-9 text-sm ${readOnlyStyle}`}>
                <SelectValue placeholder="선택" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {list.map((item: any) => (
                <SelectItem key={item.code} value={item.code}>
                  [{item.code}] {item.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
    }
    
    if (field.type === 'custom_matkl') {
      return (
        <Select onValueChange={fieldProps.onChange} value={String(fieldProps.value || '')}>
          <FormControl>
            <SelectTrigger className={`h-9 text-sm ${readOnlyStyle}`}>
              <SelectValue placeholder="선택" />
            </SelectTrigger>
          </FormControl>
          <SelectContent>
            {MOCK_MAT_GROUP.map((item) => (
              <SelectItem key={item.code} value={item.code}>
                [{item.code}] {item.name}
              </SelectItem>
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
          readOnly={field.fixed} 
          className={`h-9 text-sm ${readOnlyStyle}`} 
        />
      </FormControl>
    );
  }

  return (
    <div className="flex h-full bg-slate-50/50">
      <div className="flex-1 flex flex-col min-w-0">
        <div className="h-16 border-b bg-white px-6 flex items-center justify-between shrink-0">
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-lg text-slate-800">
                {currentRequest ? '상세 정보' : '신규 요청'}
              </h2>
              <span 
                  onClick={toggleUserMode} 
                  className={`text-[10px] px-2 py-0.5 rounded cursor-pointer select-none border transition-colors ${currentUser.isAdmin ? 'bg-purple-100 text-purple-700 border-purple-200' : 'bg-slate-100 text-slate-600 border-slate-200'}`}
              >
                  {currentUser.isAdmin ? '👑 관리자 모드' : '👤 사용자 모드'}
              </span>
            </div>
            {currentRequest && (
                <span className="text-xs text-slate-400 font-mono">
                    {currentRequest.id} | <span className={currentRequest.status === 'Approved' ? 'text-green-600 font-bold' : ''}>{currentRequest.status}</span>
                </span>
            )}
          </div>

          <div className="flex gap-2">
            {(!currentRequest || (currentRequest.requesterName === currentUser.name && currentRequest.status === 'Requested') || currentUser.isAdmin) && (
                <Button onClick={form.handleSubmit(onSubmit)} variant="outline" className="h-9 text-xs gap-1">
                  <Save size={14} /> 저장
                </Button>
            )}

            {currentUser.isAdmin && currentRequest && (
                <>
                    {currentRequest.status === 'Requested' && (
                        <Button onClick={handleStartReview} className="bg-orange-500 hover:bg-orange-600 h-9 text-xs gap-1 text-white">
                            <PlayCircle size={14} /> 검토 시작
                        </Button>
                    )}
                    {currentRequest.status === 'Review' && (
                        <>
                            <Button onClick={handleReject} variant="destructive" className="h-9 text-xs gap-1">
                                <XCircle size={14} /> 반려
                            </Button>
                            <Button onClick={handleApprove} className="bg-green-600 hover:bg-green-700 h-9 text-xs gap-1 text-white">
                                <CheckCircle size={14} /> 승인 & 채번
                            </Button>
                        </>
                    )}
                </>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-hidden">
          <Form {...form}>
            <Tabs defaultValue="basic" className="flex flex-col h-full">
              <div className="bg-white border-b px-4 shrink-0">
                <TabsList className="h-10 bg-transparent w-full justify-start p-0 gap-4 overflow-x-auto no-scrollbar">
                  {FORM_TABS.map((tab) => (
                    <TabsTrigger 
                      key={tab.id} value={tab.id}
                      className="rounded-none border-b-2 border-transparent px-2 py-2 text-sm font-medium text-slate-500 
                                 data-[state=active]:border-indigo-600 data-[state=active]:text-indigo-600 data-[state=active]:shadow-none hover:text-slate-800"
                    >
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
                            <FormField
                              control={form.control}
                              name={field.key as string}
                              render={({ field: fieldProps }) => (
                                <FormItem className="space-y-1">
                                  <FormLabel className="text-[11px] font-bold text-slate-500 flex items-center">
                                    {field.label}
                                    {field.required && <span className="text-red-500 ml-0.5">*</span>}
                                  </FormLabel>
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
          <h3 className="font-bold text-slate-700 flex items-center gap-2 text-sm">
            <MessageSquare size={16}/> 메시지 히스토리
          </h3>
        </div>

        <ScrollArea className="flex-1 p-4 bg-slate-50/30">
          <div className="space-y-4">
            {!currentRequest ? (
              <div className="text-center text-slate-400 text-xs mt-10">요청을 선택하세요.</div>
            ) : currentRequest.comments.length === 0 ? (
              <div className="text-center text-slate-400 text-xs mt-10">대화 내역이 없습니다.</div>
            ) : (
              currentRequest.comments.map((cmt, idx) => (
                <div key={idx} className={`flex flex-col gap-1 ${cmt.writer === currentUser.name ? 'items-end' : 'items-start'}`}>
                  <div className="flex items-center gap-1 text-[10px] text-slate-400">
                    <span className="font-bold text-slate-600">{cmt.writer}</span>
                    <span>{new Date(cmt.createdAt).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
                  </div>
                  <div className={`p-3 rounded-xl text-xs max-w-[90%] shadow-sm ${
                    cmt.message.includes('[계층구조 신규 요청]') ? 'bg-amber-100 text-amber-800 border border-amber-200 w-full' :
                    cmt.writer === 'System' ? 'bg-orange-50 text-orange-700 border border-orange-100 w-full flex items-start gap-2' :
                    cmt.writer === currentUser.name ? 'bg-indigo-600 text-white rounded-tr-none' : 
                    'bg-white border border-slate-200 text-slate-700 rounded-tl-none'
                  }`}>
                    {cmt.writer === 'System' && !cmt.message.includes('계층구조') && <AlertTriangle size={14} className="shrink-0 mt-0.5"/>}
                    {cmt.message}
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>

        <div className="p-3 border-t bg-white">
          <div className="flex gap-2">
            <Input 
              value={commentInput}
              onChange={(e) => setCommentInput(e.target.value)}
              placeholder="메시지 입력..." 
              className="text-xs h-9 bg-slate-50"
              onKeyDown={(e) => e.key === 'Enter' && handleSendComment()}
              disabled={!currentRequest}
            />
            <Button onClick={handleSendComment} size="icon" className="h-9 w-9 bg-indigo-600 hover:bg-indigo-700 shrink-0" disabled={!currentRequest}>
              <Send size={14} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}