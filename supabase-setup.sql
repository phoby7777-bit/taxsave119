-- TaxSave119 문의 테이블 생성 SQL
-- Supabase Dashboard의 SQL Editor에서 실행하세요

-- inquiries 테이블 생성
CREATE TABLE IF NOT EXISTS public.inquiries (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security (RLS) 활성화
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;

-- 공개 삽입 정책 (누구나 문의를 작성할 수 있음)
CREATE POLICY "Anyone can insert inquiries"
  ON public.inquiries
  FOR INSERT
  TO public
  WITH CHECK (true);

-- 관리자만 조회 가능 (보안을 위해)
-- 필요시 Supabase Dashboard에서 직접 조회하거나, 인증된 사용자만 조회하도록 설정
CREATE POLICY "Only authenticated users can view inquiries"
  ON public.inquiries
  FOR SELECT
  TO authenticated
  USING (true);

-- 인덱스 생성 (성능 향상)
CREATE INDEX IF NOT EXISTS inquiries_created_at_idx ON public.inquiries (created_at DESC);

-- ============================================
-- Database Webhook 설정 (SMS 알림)
-- ============================================
-- 아래 내용은 Supabase Dashboard에서 수동으로 설정해야 합니다.
-- Database > Webhooks > Create a new hook

-- Webhook 설정 정보:
-- Name: send-sms-on-inquiry
-- Table: public.inquiries
-- Events: INSERT
-- Type: HTTP Request
-- HTTP Request URL: https://[YOUR-PROJECT-REF].supabase.co/functions/v1/send-sms-notification
-- HTTP Headers:
--   Content-Type: application/json
--   Authorization: Bearer [YOUR-SERVICE-ROLE-KEY]
