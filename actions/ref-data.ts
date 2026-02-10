"use server"

import { supabase } from "@/lib/supabase";

// 기준정보(옵션) 불러오기 함수
export async function getRefDataAction(table: 'sm_ref_promo' | 'sm_ref_brand') {
  try {
    const { data, error } = await supabase
      .from(table)
      .select('name')
      .order('name', { ascending: true });

    if (error) throw error;

    // name 배열만 반환
    return data.map((item: any) => item.name as string);
  } catch (error) {
    console.error(`Error fetching ${table}:`, error);
    return [];
  }
}