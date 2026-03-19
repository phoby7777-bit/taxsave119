// Supabase Edge Function: SMS 알림 전송
// 새로운 문의가 등록되면 관리자에게 SMS를 전송합니다.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const ADMIN_PHONE = "010-0000-0000"; // 관리자 전화번호 (실제 번호로 변경)
const ALIGO_API_KEY = Deno.env.get("ALIGO_API_KEY") || "";
const ALIGO_USER_ID = Deno.env.get("ALIGO_USER_ID") || "";
const ALIGO_SENDER = Deno.env.get("ALIGO_SENDER") || ""; // 발신번호

interface InquiryPayload {
  type: "INSERT";
  table: string;
  record: {
    id: number;
    name: string;
    phone: string;
    email?: string;
    message?: string;
    created_at: string;
  };
  schema: string;
}

serve(async (req) => {
  try {
    // CORS 헤더 설정
    if (req.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
        },
      });
    }

    // Webhook 페이로드 파싱
    const payload: InquiryPayload = await req.json();
    const { record } = payload;

    console.log("새로운 문의 접수:", record);

    // SMS 메시지 작성
    const smsMessage = `[TaxSave119 새 문의]\n이름: ${record.name}\n연락처: ${record.phone}\n이메일: ${record.email || "미입력"}\n내용: ${record.message || "미입력"}`;

    // 알리고 SMS API 호출
    const formData = new URLSearchParams();
    formData.append("key", ALIGO_API_KEY);
    formData.append("user_id", ALIGO_USER_ID);
    formData.append("sender", ALIGO_SENDER);
    formData.append("receiver", ADMIN_PHONE.replace(/-/g, "")); // 하이픈 제거
    formData.append("msg", smsMessage);
    formData.append("testmode_yn", "N"); // 실제 전송: N, 테스트: Y

    const aligoResponse = await fetch("https://apis.aligo.in/send/", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData.toString(),
    });

    const aligoResult = await aligoResponse.json();

    console.log("알리고 API 응답:", aligoResult);

    if (aligoResult.result_code !== "1") {
      throw new Error(`SMS 전송 실패: ${aligoResult.message}`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "SMS 전송 완료",
        inquiry_id: record.id,
      }),
      {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        status: 200,
      }
    );
  } catch (error) {
    console.error("에러 발생:", error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : String(error),
      }),
      {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        status: 500,
      }
    );
  }
});
