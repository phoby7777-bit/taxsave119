# TaxSave119 SMS 알림 설정 가이드

문의가 접수되면 관리자 휴대폰으로 자동 문자 발송되도록 설정하는 방법입니다.

---

## 📋 필요한 것

1. **알리고(Aligo) 계정** - 한국 SMS 발송 서비스
2. **Supabase CLI** (선택사항 - Edge Function 배포용)
3. **관리자 전화번호**

---

## 🚀 1단계: 알리고(Aligo) 가입 및 설정

### 1-1. 알리고 회원가입
1. https://smartsms.aligo.in/ 접속
2. 회원가입 진행
3. 로그인 후 충전 (문자 1건당 약 8~15원)

### 1-2. 발신번호 등록
1. 알리고 대시보드 > **발신번호 관리**
2. 발신번호 등록 (본인 인증 필요)
3. 승인 대기 (보통 1~2일 소요)

### 1-3. API Key 발급
1. 알리고 대시보드 > **API Key 관리**
2. **API Key** 복사 (예: `abcd1234efgh5678`)
3. **사용자 ID** 확인 (로그인 아이디)

---

## 🔧 2단계: Supabase Edge Function 배포

### 2-1. Supabase CLI 설치 (Windows)
```powershell
# PowerShell에서 실행
scoop install supabase
```

또는 npm 사용:
```bash
npm install -g supabase
```

### 2-2. Supabase 로그인
```bash
supabase login
```

### 2-3. 프로젝트 연결
```bash
cd c:\Users\이재춘\Desktop\taxsave119
supabase link --project-ref toionnagakjowyewpgti
```

### 2-4. 환경변수 설정
Supabase Dashboard에서 환경변수를 설정합니다:

1. https://supabase.com/dashboard/project/toionnagakjowyewpgti/settings/functions
2. **Edge Functions > Configuration** 메뉴
3. 다음 환경변수 추가:

```
ALIGO_API_KEY=여기에_알리고_API_KEY_입력
ALIGO_USER_ID=여기에_알리고_사용자ID_입력
ALIGO_SENDER=01012345678
```

**중요:** `ALIGO_SENDER`는 알리고에서 승인받은 발신번호를 입력하세요 (하이픈 제거)

### 2-5. Edge Function 배포
```bash
supabase functions deploy send-sms-notification
```

배포 완료 후 다음과 같은 URL이 생성됩니다:
```
https://toionnagakjowyewpgti.supabase.co/functions/v1/send-sms-notification
```

---

## 🔗 3단계: Database Webhook 설정

### 3-1. Supabase Dashboard에서 Webhook 생성
1. https://supabase.com/dashboard/project/toionnagakjowyewpgti/database/hooks
2. **Create a new hook** 클릭
3. 다음 정보 입력:

| 항목 | 값 |
|------|-----|
| **Name** | `send-sms-on-inquiry` |
| **Table** | `public.inquiries` |
| **Events** | `Insert` (체크) |
| **Type** | `HTTP Request` |
| **Method** | `POST` |
| **URL** | `https://toionnagakjowyewpgti.supabase.co/functions/v1/send-sms-notification` |

4. **HTTP Headers** 추가:
```
Content-Type: application/json
Authorization: Bearer [YOUR_SERVICE_ROLE_KEY]
```

**SERVICE_ROLE_KEY 찾기:**
- https://supabase.com/dashboard/project/toionnagakjowyewpgti/settings/api
- **Project API keys** 섹션
- **service_role** 키 복사 (secret으로 표시됨)

5. **Create webhook** 클릭

---

## 📱 4단계: 관리자 전화번호 설정

### Edge Function 파일 수정
[supabase/functions/send-sms-notification/index.ts](supabase/functions/send-sms-notification/index.ts) 파일 3번째 줄:

```typescript
const ADMIN_PHONE = "010-1234-5678"; // 실제 관리자 번호로 변경
```

수정 후 다시 배포:
```bash
supabase functions deploy send-sms-notification
```

---

## ✅ 5단계: 테스트

### 5-1. 웹사이트에서 문의 작성
1. https://taxsave119.vercel.app/#contact 접속
2. 문의 폼 작성 후 제출

### 5-2. 확인 사항
- ✅ Supabase Database에 문의 저장됨
- ✅ 관리자 휴대폰으로 SMS 수신됨

### 5-3. 로그 확인
문제가 있다면 로그를 확인하세요:

1. https://supabase.com/dashboard/project/toionnagakjowyewpgti/functions/send-sms-notification/logs
2. Edge Function 실행 로그 확인
3. 에러 메시지 확인

---

## 💰 비용

### 알리고 SMS 요금
- **단문(SMS)**: 건당 8~15원
- **장문(LMS)**: 건당 40~50원
- 월 고정비 없음, 충전식

### Supabase Edge Function
- 무료 플랜: 월 500,000 요청까지 무료
- 문의량이 적으면 무료로 사용 가능

---

## 🔍 문제 해결

### SMS가 안 오는 경우

1. **알리고 API Key 확인**
   - Supabase Dashboard > Settings > Edge Functions > Configuration
   - 환경변수가 올바르게 설정되었는지 확인

2. **발신번호 승인 확인**
   - 알리고 대시보드에서 발신번호 승인 상태 확인

3. **충전 잔액 확인**
   - 알리고 잔액이 충분한지 확인

4. **Edge Function 로그 확인**
   - https://supabase.com/dashboard/project/toionnagakjowyewpgti/functions/send-sms-notification/logs

5. **Webhook 확인**
   - Database > Webhooks에서 hook 상태 확인
   - 에러 로그가 있는지 확인

---

## 🔄 대안: 네이버 클라우드 SMS

알리고 대신 네이버 클라우드 SMS를 사용하려면:

1. https://www.ncloud.com/ 가입
2. SMS 서비스 활성화
3. [supabase/functions/send-sms-notification/index.ts](supabase/functions/send-sms-notification/index.ts) 파일에서 API 호출 부분을 네이버 클라우드 API로 변경

네이버 클라우드 SMS API 문서:
https://api.ncloud-docs.com/docs/ai-application-service-sens-smsv2

---

## 📞 지원

문제가 해결되지 않으면 다음을 확인하세요:
- 알리고 고객센터: https://smartsms.aligo.in/admin/api/info.html
- Supabase 문서: https://supabase.com/docs/guides/functions
