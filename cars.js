/* =====================================================================
   더원오토 · 마세라티 인증 중고차 — 예시 매물 데이터
   ---------------------------------------------------------------------
   ■ 매물 추가 방법
     1) 아래 CARS 배열에서 { ... } 한 덩어리를 복사해 붙여 넣습니다.
     2) id 는 다른 매물과 겹치지 않게 영문·숫자·하이픈(-)으로만 적습니다.
     3) 사진은 img/ 폴더에 넣고 images 에 파일 경로를 순서대로 적습니다.
        (첫 번째 사진이 목록·대표 사진으로 쓰입니다.)
     4) 배경이 투명한 누끼 사진이면 cutout: true, 일반 사진이면 false.

   ■ 값 안내
     model   : 'grecale' | 'levante' | 'ghibli' | 'quattroporte' | 'granturismo' | 'mc20'
     price   : 만원 단위 숫자 (예: 1억 1,900만원 → 11900)
     mileage : km 단위 숫자
     status  : '판매중' | '예약중' | '판매완료'
     featured: true 이면 메인 화면 "지금 만날 수 있는 매물"에 노출

   ※ 현재 들어 있는 12대는 화면 확인용 예시 데이터입니다.
     config.js 에 저장소 연결 정보를 넣으면 이 파일은 더 이상 쓰이지 않고,
     관리자 페이지(admin.html)에서 등록한 매물만 사이트에 표시됩니다.
   ===================================================================== */

window.CARS = [
  {
    id: 'grecale-gt-2023-01',
    model: 'grecale', trim: 'GT',
    year: 2023, month: 5, mileage: 18400, price: 7650,
    fuel: '가솔린 · 마일드 하이브리드', displacement: '1,995cc', power: '300마력',
    transmission: '8단 자동', drive: 'AWD',
    color: '그레이', interior: '블랙 가죽',
    status: '판매중', featured: false, cutout: true,
    images: ['img/grecale.webp', 'img/detail-interior.webp', 'img/detail-wheel.webp'],
    options: ['파노라마 선루프', '소너스 파베르 사운드', '어댑티브 크루즈 컨트롤', '360° 서라운드 뷰', '통풍·열선 시트', '전동 트렁크'],
    history: { accident: '무사고', owners: '1인 소유', service: '공식 서비스센터 정비 이력' },
    desc: '일상과 주말을 모두 아우르는 컴팩트 럭셔리 SUV. 1인 소유, 정기 점검 이력이 모두 확인된 차량입니다.'
  },
  {
    id: 'grecale-trofeo-2023-02',
    model: 'grecale', trim: 'Trofeo',
    year: 2023, month: 9, mileage: 9800, price: 11900,
    fuel: '가솔린', displacement: '2,992cc V6 트윈터보', power: '530마력',
    transmission: '8단 자동', drive: 'AWD',
    color: '매트 그레이', interior: '블랙·레드 스티치',
    status: '판매중', featured: true, cutout: true,
    images: ['img/grecale.webp', 'img/detail-engine.webp', 'img/detail-interior.webp'],
    options: ['네튜노 V6 엔진', '에어 서스펜션', '21인치 휠', '카본 인테리어 트림', '소너스 파베르 하이 프리미엄', '헤드업 디스플레이'],
    history: { accident: '무사고', owners: '1인 소유', service: '공식 서비스센터 정비 이력' },
    desc: 'MC20에서 온 네튜노 V6를 품은 그레칼레의 정점. 주행거리 1만 km 미만의 신차급 컨디션입니다.'
  },
  {
    id: 'levante-gt-2022-01',
    model: 'levante', trim: 'GT 하이브리드',
    year: 2022, month: 3, mileage: 31200, price: 7980,
    fuel: '가솔린 · 마일드 하이브리드', displacement: '1,995cc', power: '330마력',
    transmission: '8단 자동', drive: 'AWD (Q4)',
    color: '그린', interior: '탄 가죽',
    status: '판매중', featured: false, cutout: true,
    images: ['img/levante.webp', 'img/detail-cabin.webp', 'img/detail-wheel.webp'],
    options: ['에어 서스펜션', '파노라마 선루프', '하만카돈 사운드', '어댑티브 크루즈 컨트롤', '통풍·열선 시트', '전동 트렁크'],
    history: { accident: '무사고', owners: '1인 소유', service: '공식 서비스센터 정비 이력' },
    desc: '마세라티 SUV의 여유로운 차체와 효율적인 하이브리드 파워트레인을 함께 누릴 수 있는 차량입니다.'
  },
  {
    id: 'levante-trofeo-2021-02',
    model: 'levante', trim: 'Trofeo',
    year: 2021, month: 11, mileage: 27500, price: 12800,
    fuel: '가솔린', displacement: '3,799cc V8 트윈터보', power: '580마력',
    transmission: '8단 자동', drive: 'AWD (Q4)',
    color: '그린', interior: '레드 풀 그레인 가죽',
    status: '판매중', featured: true, cutout: true,
    images: ['img/levante.webp', 'img/detail-cabin.webp', 'img/detail-wheel.webp'],
    options: ['V8 트윈터보 엔진', '코르사 주행 모드', '22인치 휠', '카본 익스테리어 패키지', '바워스 앤 윌킨스 사운드', '소프트 클로즈 도어'],
    history: { accident: '무사고', owners: '2인 소유', service: '공식 서비스센터 정비 이력' },
    desc: 'V8 트윈터보의 사운드와 가속을 SUV에서 경험할 수 있는 르반떼 최상위 트림입니다.'
  },
  {
    id: 'ghibli-gt-2022-01',
    model: 'ghibli', trim: 'GT 하이브리드',
    year: 2022, month: 6, mileage: 24100, price: 6450,
    fuel: '가솔린 · 마일드 하이브리드', displacement: '1,995cc', power: '330마력',
    transmission: '8단 자동', drive: 'RWD',
    color: '레드', interior: '블랙 가죽',
    status: '판매중', featured: false, cutout: true,
    images: ['img/ghibli.webp', 'img/detail-interior.webp', 'img/detail-wheel.webp'],
    options: ['어댑티브 LED 헤드램프', '하만카돈 사운드', '어댑티브 크루즈 컨트롤', '통풍·열선 시트', '전동 선셰이드', '무선 충전'],
    history: { accident: '무사고', owners: '1인 소유', service: '공식 서비스센터 정비 이력' },
    desc: '마세라티 세단의 시작점. 합리적인 유지비와 이탈리안 스포츠 세단의 감성을 함께 갖췄습니다.'
  },
  {
    id: 'ghibli-trofeo-2021-02',
    model: 'ghibli', trim: 'Trofeo',
    year: 2021, month: 8, mileage: 19700, price: 10900,
    fuel: '가솔린', displacement: '3,799cc V8 트윈터보', power: '580마력',
    transmission: '8단 자동', drive: 'RWD',
    color: '레드', interior: '블랙·레드 가죽',
    status: '예약중', featured: true, cutout: true,
    images: ['img/ghibli.webp', 'img/detail-engine.webp', 'img/detail-interior.webp'],
    options: ['V8 트윈터보 엔진', '코르사 주행 모드', '21인치 휠', '카본 인테리어 트림', '바워스 앤 윌킨스 사운드', '스포츠 배기'],
    history: { accident: '무사고', owners: '1인 소유', service: '공식 서비스센터 정비 이력' },
    desc: '세단의 실용성에 V8의 성능을 더한 기블리 트로페오. 현재 예약 상담이 진행 중인 차량입니다.'
  },
  {
    id: 'quattroporte-modena-2022-01',
    model: 'quattroporte', trim: 'Modena Q4',
    year: 2022, month: 4, mileage: 22300, price: 9800,
    fuel: '가솔린', displacement: '2,979cc V6 트윈터보', power: '430마력',
    transmission: '8단 자동', drive: 'AWD (Q4)',
    color: '블루', interior: '탄 가죽',
    status: '판매중', featured: true, cutout: true,
    images: ['img/quattroporte.webp', 'img/detail-cabin.webp', 'img/detail-wheel.webp'],
    options: ['뒷좌석 컴포트 패키지', '4존 에어컨', '바워스 앤 윌킨스 사운드', '소프트 클로즈 도어', '전동 리어 선블라인드', '어댑티브 크루즈 컨트롤'],
    history: { accident: '무사고', owners: '1인 소유', service: '공식 서비스센터 정비 이력' },
    desc: '마세라티의 플래그십 세단. 넉넉한 뒷좌석과 사륜구동의 안정감을 갖춘 의전·패밀리 겸용 차량입니다.'
  },
  {
    id: 'quattroporte-trofeo-2021-02',
    model: 'quattroporte', trim: 'Trofeo',
    year: 2021, month: 10, mileage: 15600, price: 13500,
    fuel: '가솔린', displacement: '3,799cc V8 트윈터보', power: '580마력',
    transmission: '8단 자동', drive: 'RWD',
    color: '블루', interior: '블랙·레드 가죽',
    status: '판매중', featured: false, cutout: true,
    images: ['img/quattroporte.webp', 'img/detail-engine.webp', 'img/detail-cabin.webp'],
    options: ['V8 트윈터보 엔진', '코르사 주행 모드', '21인치 휠', '카본 인테리어 트림', '바워스 앤 윌킨스 사운드', '뒷좌석 컴포트 패키지'],
    history: { accident: '무사고', owners: '1인 소유', service: '공식 서비스센터 정비 이력' },
    desc: '플래그십의 품격에 580마력 V8을 더한 콰트로포르테의 최상위 트림입니다.'
  },
  {
    id: 'granturismo-modena-2024-01',
    model: 'granturismo', trim: 'Modena',
    year: 2024, month: 2, mileage: 6200, price: 17900,
    fuel: '가솔린', displacement: '2,992cc V6 트윈터보', power: '490마력',
    transmission: '8단 자동', drive: 'AWD',
    color: '레드', interior: '아이보리 가죽',
    status: '판매중', featured: true, cutout: true,
    images: ['img/granturismo.webp', 'img/detail-interior.webp', 'img/detail-wheel.webp'],
    options: ['네튜노 V6 엔진', '에어 서스펜션', '소너스 파베르 사운드', '디지털 클러스터', '헤드업 디스플레이', '360° 서라운드 뷰'],
    history: { accident: '무사고', owners: '1인 소유', service: '공식 서비스센터 정비 이력' },
    desc: '장거리도 편안한 2도어 그랜드 투어러. 신형 그란투리스모를 합리적으로 만날 수 있는 기회입니다.'
  },
  {
    id: 'granturismo-trofeo-2024-02',
    model: 'granturismo', trim: 'Trofeo',
    year: 2024, month: 6, mileage: 4100, price: 21500,
    fuel: '가솔린', displacement: '2,992cc V6 트윈터보', power: '550마력',
    transmission: '8단 자동', drive: 'AWD',
    color: '레드', interior: '블랙·레드 가죽',
    status: '판매중', featured: false, cutout: true,
    images: ['img/granturismo.webp', 'img/detail-engine.webp', 'img/detail-interior.webp'],
    options: ['네튜노 V6 엔진', '코르사 주행 모드', '카본 익스테리어 패키지', '소너스 파베르 하이 프리미엄', '스포츠 시트', '전자식 LSD'],
    history: { accident: '무사고', owners: '1인 소유', service: '공식 서비스센터 정비 이력' },
    desc: '그란투리스모의 고성능 트림. 주행거리 5천 km 미만으로 신차에 가까운 컨디션입니다.'
  },
  {
    id: 'mc20-coupe-2022-01',
    model: 'mc20', trim: '쿠페',
    year: 2022, month: 7, mileage: 5900, price: 26800,
    fuel: '가솔린', displacement: '2,992cc V6 트윈터보', power: '630마력',
    transmission: '8단 DCT', drive: 'MR (미드십 후륜)',
    color: '화이트', interior: '블랙·블루 알칸타라',
    status: '판매중', featured: true, cutout: true,
    images: ['img/mc20.webp', 'img/detail-engine.webp', 'img/detail-wheel.webp'],
    options: ['네튜노 V6 엔진', '버터플라이 도어', '카본 모노코크', '프런트 리프트 시스템', '카본 세라믹 브레이크', '소너스 파베르 사운드'],
    history: { accident: '무사고', owners: '1인 소유', service: '공식 서비스센터 정비 이력' },
    desc: '마세라티의 미드십 슈퍼 스포츠카. 프런트 리프트와 카본 세라믹 브레이크가 적용된 차량입니다.'
  },
  {
    id: 'mc20-coupe-2023-02',
    model: 'mc20', trim: '쿠페',
    year: 2023, month: 3, mileage: 3200, price: 28900,
    fuel: '가솔린', displacement: '2,992cc V6 트윈터보', power: '630마력',
    transmission: '8단 DCT', drive: 'MR (미드십 후륜)',
    color: '화이트', interior: '블랙 알칸타라',
    status: '판매완료', featured: false, cutout: true,
    images: ['img/mc20.webp', 'img/detail-engine.webp', 'img/detail-wheel.webp'],
    options: ['네튜노 V6 엔진', '버터플라이 도어', '카본 모노코크', '프런트 리프트 시스템', '카본 익스테리어 패키지', '전자식 LSD'],
    history: { accident: '무사고', owners: '1인 소유', service: '공식 서비스센터 정비 이력' },
    desc: '주행거리 3천 km대의 MC20. 판매가 완료된 차량으로, 유사 매물은 상담을 통해 안내해 드립니다.'
  }
];
