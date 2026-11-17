/* =====================================================================
   더원오토 · 마세라티 인증 중고차 — 사이트 설정
   ===================================================================== */

/* 1) 매물 저장소(Supabase) 연결 정보
      비워 두면 사이트는 예시 매물(cars.js)을 보여 주고,
      관리자 페이지는 저장되지 않는 "체험 모드"로 열립니다.

      url : Supabase 프로젝트 주소   예) 'https://abcdefghijkl.supabase.co'
      key : Publishable key          예) 'sb_publishable_xxxxxxxx'
            (예전 이름: anon public key, eyJ 로 시작)
      ※ sb_secret_ 로 시작하는 Secret key 나 service_role key 는
        절대 이 파일에 넣지 마세요. */
window.DB = {
  url: 'https://zbvxijnbvspccfbjgjic.supabase.co',
  key: 'sb_publishable_KUym4xtq4CzRTooyZ5iX_Q_a9YO1Y_O',
  bucket: 'car-photos'
};

/* 2) 사이트 기본 정보 — 비워 두면 화면에 "등록 예정"으로 표시됩니다. */
window.SITE = {
  name: '더원오토',
  nameEn: 'THE ONE AUTO',
  phone: '',          // 예: '02-000-0000'
  kakao: '',          // 카카오톡 채널 주소 예: 'https://pf.kakao.com/_xxxxx'
  address: '',        // 전시장 주소
  hours: '',          // 예: '평일 09:00–19:00 · 주말 10:00–18:00'
  bizNo: '',          // 사업자등록번호
  ceo: '',            // 대표자
  notifyEmail: 'suimbd1@naver.com'   // 상담 신청이 오면 알림 메일을 받을 주소 (비우면 메일을 보내지 않음)
};
