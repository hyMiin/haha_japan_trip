/*
 * 하하커플 4주년 일본여행 — 일정 데이터
 *
 * 원칙
 *  - 확정: 여행 날짜, 숙소 2곳 예약, 전체 관광 코스와 방문 순서
 *  - 계획값: 모든 세부 시각 (실제 운행·영업·예약 시간 검증 전)
 *  - 좌표: 지도 표시용 근사값. precision 값으로 정확도를 구분한다.
 *      landmark  = 잘 알려진 명소의 대표 좌표(근사, 수십~100m 오차 가능)
 *      area      = 거리·상점가 등 넓은 지역의 대표 지점
 *      reference = 정확한 위치를 몰라 근처 역·지역을 임시 기준점으로 사용 (실제 장소 위치 아님)
 *  - 확인되지 않은 요금·운행시간·예약 상태는 사실처럼 기록하지 않는다.
 *
 * 이 파일은 window.TRIP_DATA 하나만 정의한다. 뷰어의 "JSON 내보내기"로 받은 파일과 구조가 같다.
 */
window.TRIP_DATA = {
  version: 1,
  meta: {
    title: "하하커플 4주년 일본여행",
    subtitle: "하코네 · 도쿄 · 2박 3일",
    dates: "2026.11.14 (토) – 11.16 (월)",
    travelers: "성인 2명",
    purpose: "4주년 기념여행 · 일본 관광 · 「윤하, 일본을 담다」(윤일담) 촬영지 방문",
    budgetNote: "총예산 2인 합산 약 700,000원 (왕복 항공권 제외)",
    specDate: "2026-11-09",
    verifiedAt: "2026-11-09"
  },

  notices: [
    "확정된 것은 여행 날짜, 숙소 2곳 예약, 전체 관광 코스와 방문 순서입니다.",
    "모든 세부 시각은 계획값입니다. 실제 운행·영업·예약 시간은 아직 검증되지 않았습니다.",
    "지도 위 연결선은 방문 순서를 잇는 직선입니다. 실제 도로·대중교통 이동 경로가 아닙니다.",
    "점선 테두리 마커는 정확한 장소가 아니라 근처 역·지역을 기준점으로 표시한 것입니다."
  ],

  days: [
    {
      id: "day1",
      label: "DAY 1",
      date: "2026-11-14",
      weekday: "토",
      title: "나리타 도착 → 하코네유모토 온천마을 → 고라",
      stay: "Gora Onsen Kinkaku (예약 완료)",
      color: "#E0795A",
      schedule: [
        { time: "08:30", text: "인천국제공항 출발 [고정] (편명·터미널 확인 필요)", kind: "flight" },
        { time: "10:00–10:30", text: "나리타 도착 → 입국(Visit Japan Web QR) · 교통카드 준비(Welcome Suica 등, '결제·Wallet' 메뉴 참고)", kind: "flight", place: "d1-narita" },
        { time: "11:00–11:20", text: "스카이라이너 나리타 → 닛포리 (최단 36분 · 1인 2,580엔, 할인 e-티켓 2,310엔 · 공항 출발 시각 확인 필요)", kind: "move" },
        { time: "약 12:00–12:25", text: "JR 야마노테선 닛포리 → 신주쿠 (약 25분 추정 · 운임 확인 필요)", kind: "move" },
        { time: "12:40", text: "로망스카 하코네 61호 신주쿠 12:40 → 하코네유모토 14:08 (토휴일 · 전석 지정, 지금 예약 가능)", kind: "move" },
        { time: "14:10–16:30", text: "하코네유모토 관광: 치모토 먼저(17:00까지 안내) · 다케이치 완자 · 온천마을 · 족탕", kind: "visit", place: "d1-onsen-town" },
        { time: "16:30–17:30", text: "등산전차 유모토 → 고라 (약 35분, 460엔) → 케이블카 → 가미고라 (주말 혼잡 대기 가능)", kind: "move", place: "d1-gora" },
        { time: "17:30–18:00", text: "Gora Onsen Kinkaku 체크인 목표 [예약 완료]", kind: "stay", place: "d1-kinkaku" },
        { time: "18:00–19:00", text: "저녁 식사 (식당 미정 · 고라 지역 영업시간 확인 또는 미리 구매)", kind: "meal" },
        { time: "19:00 이후", text: "프라이빗 온천 및 휴식 (예약 가능 시간 숙소 확인)", kind: "stay" }
      ],
      places: [
        {
          id: "d1-narita", order: 1, name: "나리타국제공항", nameLocal: "成田国際空港",
          kind: "transit", status: "fixed", precision: "reference",
          lat: 35.7720, lng: 140.3929,
          precisionNote: "도착 터미널 미확정 — 공항 대표 지점",
          time: "10:00–10:30 도착 예상 · 11:00–11:30 출발 계획",
          desc: "입국 후 하코네로 바로 이동합니다. 인천 08:30 출발 항공편은 고정 제약입니다.",
          checks: ["정확한 편명과 도착 터미널", "나리타 → 하코네유모토 실제 경로·소요시간·운임"],
          osmQuery: "Narita International Airport"
        },
        {
          id: "d1-yumoto-st", order: 2, name: "하코네유모토역", nameLocal: "箱根湯本駅",
          kind: "transit", status: "transit", precision: "landmark",
          lat: 35.2326, lng: 139.1055,
          time: "14:08 도착 (로망스카 하코네 61호, 토휴일)",
          desc: "하코네 관광의 출발점. 이후 등산전차로 고라까지 이동합니다.",
          checks: ["짐 보관·운송 서비스 실제 이용 가능 여부"],
          osmQuery: "箱根湯本駅"
        },
        {
          id: "d1-chimoto", order: 3, name: "치모토 (Chimoto)", nameLocal: "ちもと",
          kind: "visit", status: "course", precision: "reference", yoonha: "check",
          lat: 35.2326, lng: 139.1055,
          precisionNote: "방문 지점 미확정 — 하코네유모토역을 기준점으로 표시",
          time: "14:10–16:30 중 · 가장 먼저 방문",
          desc: "하코네유모토의 화과자점. 에키마에도리점은 공식 안내상 9:00~17:00로 검색되었으나 방문일 휴무 여부는 미확인입니다.",
          checks: ["어느 지점을 방문할지", "방문일 영업시간·임시 휴무", "윤일담 실제 촬영지인지 여부"],
          links: [{ label: "치모토 안내 (명세에 제공된 링크)", url: "https://www.yumochi.com/page7" }],
          osmQuery: "ちもと 箱根湯本"
        },
        {
          id: "d1-takeichi", order: 4, name: "다케이치 완자", nameLocal: "竹いち",
          kind: "visit", status: "course", precision: "reference", yoonha: "check",
          lat: 35.2326, lng: 139.1055,
          precisionNote: "정확한 매장 위치 미확인 — 하코네유모토역을 기준점으로 표시",
          time: "14:10–16:30 중",
          desc: "하코네유모토 상점가에서 먹을 완자(어묵 꼬치) 간식.",
          checks: ["정확한 매장 위치", "영업시간", "윤일담 실제 촬영지인지 여부"],
          osmQuery: "竹いち 箱根湯本"
        },
        {
          id: "d1-onsen-town", order: 5, name: "하코네유모토 온천마을", nameLocal: "箱根湯本温泉街",
          kind: "visit", status: "course", precision: "area", yoonha: "check",
          lat: 35.2319, lng: 139.1036,
          precisionNote: "역 앞 상점가 일대의 대표 지점",
          time: "14:10–16:30",
          desc: "역 앞 상점가와 하야카와 강변 온천마을 산책. DAY 1의 윤일담 관련 코스입니다.",
          checks: ["윤일담 실제 촬영지와 일반 방문 장소의 구분"],
          osmQuery: "箱根湯本 温泉街"
        },
        {
          id: "d1-footbath", order: 6, name: "온천마을 족탕", nameLocal: "足湯",
          kind: "visit", status: "course", precision: "reference",
          lat: 35.2319, lng: 139.1036,
          precisionNote: "족탕 위치 미확인 — 온천마을 대표 지점을 기준점으로 표시",
          time: "14:10–16:30 중",
          desc: "온천마을 산책 중 들를 족탕.",
          checks: ["족탕의 위치", "방문일 운영 여부"],
          osmQuery: "箱根湯本 足湯"
        },
        {
          id: "d1-gora", order: 7, name: "고라역 (환승)", nameLocal: "強羅駅",
          kind: "transit", status: "transit", precision: "landmark",
          lat: 35.2503, lng: 139.0471,
          time: "16:30–17:30 이동 중",
          desc: "관광 목적지가 아닌 환승 지점. 등산전차 → 케이블카로 갈아탑니다.",
          checks: ["하코네유모토 → 고라 등산전차 운행시간", "고라 → 가미고라 케이블카 운행시간", "11월 주말 혼잡·대기"],
          osmQuery: "強羅駅"
        },
        {
          id: "d1-kinkaku", order: 8, name: "Gora Onsen Kinkaku", nameLocal: "強羅温泉 金閣荘",
          kind: "stay", status: "booked", precision: "reference",
          lat: 35.2456, lng: 139.0383,
          precisionNote: "숙소 좌표 미확인 — 가미고라역(上強羅) 부근을 기준점으로 표시",
          time: "17:30–18:00 체크인 목표 · 11/15 체크아웃",
          desc: "1박 · 2인 · 예약 완료. 예약제 프라이빗 온천(무료). 공개 숙박 안내에는 주소가 고라 1320-601, 가장 가까운 역이 가미고라역으로 나와 있으나 예약 확인서와 대조하지 않았습니다.",
          checks: ["예약 확인서의 주소·지도 좌표", "프라이빗 온천 예약 가능 시간·이용 조건", "고라 지역 저녁 식사 또는 사전 음식 구매"],
          links: [
            { label: "Agoda 예약 페이지", url: "https://www.agoda.com/ko-kr/gora-onsen-kinkaku-private-onsen-free-by-reservation/hotel/all/hakone-jp.html?checkin=2026-11-14&checkout=2026-11-15&los=1&rooms=1&adults=2&children=0" },
            { label: "LIVE JAPAN 숙소 정보 (주소·최근접역)", url: "https://livejapan.com/en/in-tokyo/in-pref-kanagawa/in-hakone_odawara/spot-lj0057904" }
          ],
          osmQuery: "上強羅駅"
        }
      ]
    },

    {
      id: "day2",
      label: "DAY 2",
      date: "2026-11-15",
      weekday: "일",
      title: "오와쿠다니 → 신주쿠 → 다이칸야마 → 시부야 → 돈키호테",
      stay: "신주쿠 지역 예약 숙소 (예약 완료 · 숙소명 대조 필요)",
      color: "#1E88C8",
      schedule: [
        { time: "07:30–08:30", text: "기상 · 체크아웃 준비 · 짐은 하코네 캐리 서비스로 유모토역 보내기 (프런트 10:00 마감, 1개 1,500엔 · 제휴 숙소인지 확인 필요)", kind: "stay", place: "d2-kinkaku" },
        { time: "08:30–09:00", text: "케이블카 가미고라 → 소운잔 (운임 확인 필요)", kind: "move", place: "d2-sounzan" },
        { time: "09:00–09:15", text: "로프웨이 소운잔 → 오와쿠다니 (운행 9:00부터 · 약 10분 · 왕복 3,000엔/인)", kind: "move" },
        { time: "09:15–10:30", text: "오와쿠다니 관광 · 화산 전망 · 쿠로타마고(4개 500엔, 2차 출처)", kind: "visit", place: "d2-owakudani" },
        { time: "10:30–12:00", text: "하산: 로프웨이 → 소운잔 → 케이블카(430엔) → 고라 → 등산전차(460엔) → 유모토 (탑승 약 1시간 + 대기)", kind: "move" },
        { time: "12:00–13:00", text: "점심 (하코네유모토 · 식당 미정)", kind: "meal" },
        { time: "13:30–14:00", text: "하코네유모토역에서 짐 수령 (캐리 서비스 수령 13:30–18:30)", kind: "move", place: "d2-yumoto" },
        { time: "14:00 전후", text: "로망스카 하코네유모토 → 신주쿠 (약 80분 · 운임 1,270 + 특급 1,200엔/인 · [미예약] 정확한 시각 확인 필요)", kind: "move" },
        { time: "15:30–16:00", text: "신주쿠 도착", kind: "move" },
        { time: "16:00–16:30", text: "예약 숙소 체크인 [예약 완료]", kind: "stay", place: "d2-hotel" },
        { time: "16:30–17:00", text: "JR 야마노테 신주쿠 → 시부야 → 도큐 도요코선 각역정차 → 다이칸야마 (약 20분, 339엔/인)", kind: "move" },
        { time: "17:00–18:30", text: "다이칸야마 거리 · T-SITE 츠타야", kind: "visit", place: "d2-daikanyama" },
        { time: "18:30–19:00", text: "다이칸야마 → 시부야 (도보 15–20분 또는 도요코선 140엔)", kind: "move" },
        { time: "19:00–20:00", text: "하치코 · 스크램블 교차로 · 타워레코드(22:00까지)", kind: "visit", place: "d2-hachiko" },
        { time: "20:00–21:00", text: "시부야 저녁 (식당 미정)", kind: "meal", place: "d2-shibuya-st" },
        { time: "21:00–22:30", text: "MEGA 돈키호테 시부야 본점 (24시간, 2차 출처) · 면세는 공항 환급 방식", kind: "visit", place: "d2-donki" },
        { time: "22:30–23:00", text: "JR 야마노테 시부야 → 신주쿠 (7분, 199엔/인)", kind: "move", place: "d2-hotel" }
      ],
      returnTo: "d2-hotel",
      places: [
        {
          id: "d2-kinkaku", order: 1, name: "Gora Onsen Kinkaku (체크아웃)", nameLocal: "強羅温泉 金閣荘",
          kind: "stay", status: "booked", precision: "reference",
          lat: 35.2456, lng: 139.0383,
          precisionNote: "숙소 좌표 미확인 — 가미고라역 부근을 기준점으로 표시",
          time: "07:30–08:30 체크아웃 준비",
          desc: "체크아웃 후 가미고라역에서 케이블카를 탑니다.",
          checks: ["체크아웃 후 짐 처리 방법 (아래 '동선 점검' 참고)"],
          osmQuery: "上強羅駅"
        },
        {
          id: "d2-sounzan", order: 2, name: "소운잔역 (환승)", nameLocal: "早雲山駅",
          kind: "transit", status: "transit", precision: "landmark",
          lat: 35.2441, lng: 139.0355,
          time: "08:30–09:00 도착 · 09:00 로프웨이 운행 시작",
          desc: "관광 목적지가 아닌 환승 지점. 케이블카 → 로프웨이.",
          checks: ["케이블카 첫차 시각", "로프웨이 운행 시작(공개 안내 2~11월 9:00)·기상 운휴"],
          osmQuery: "早雲山駅"
        },
        {
          id: "d2-owakudani", order: 3, name: "오와쿠다니", nameLocal: "大涌谷",
          kind: "visit", status: "course", precision: "landmark",
          lat: 35.2440, lng: 139.0196,
          time: "09:15–10:30",
          desc: "화산 분기 지대 전망. 로프웨이 오와쿠다니역 바로 앞.",
          checks: ["11/15 로프웨이 운행 여부 (악천후·화산가스·점검 운휴 가능)", "화산 활동에 따른 출입 규제"],
          osmQuery: "大涌谷"
        },
        {
          id: "d2-kurotamago", order: 4, name: "쿠로타마고", nameLocal: "黒たまご (大涌谷くろたまご館)",
          kind: "visit", status: "course", precision: "reference",
          lat: 35.2440, lng: 139.0196,
          precisionNote: "판매점(くろたまご館 등) 위치 — 오와쿠다니 대표 지점을 기준점으로 표시",
          time: "09:15–10:30 중",
          desc: "온천 연못에서 삶은 검은 달걀. 오와쿠다니에서만 판매.",
          checks: ["방문일 판매 시간·가격"],
          osmQuery: "大涌谷くろたまご館"
        },
        {
          id: "d2-yumoto", order: 5, name: "하코네유모토역 (짐 회수·출발)", nameLocal: "箱根湯本駅",
          kind: "transit", status: "transit", precision: "landmark",
          lat: 35.2326, lng: 139.1055,
          time: "13:30 짐 수령 · 14:00 전후 로망스카 출발",
          desc: "신주쿠행 열차 출발지. 열차는 아직 예약하지 않았습니다.",
          checks: ["짐을 어디에 맡겼다가 회수하는지", "로망스카 시간표와 좌석 예약 (전석 지정석)"],
          osmQuery: "箱根湯本駅"
        },
        {
          id: "d2-hotel", order: 6, name: "신주쿠 예약 숙소", nameLocal: "新宿 (숙소명 대조 필요)",
          kind: "stay", status: "booked", precision: "reference",
          lat: 35.6900, lng: 139.7004,
          precisionNote: "숙소 위치 미확정 — 신주쿠역을 임시 기준점으로 표시",
          time: "16:00–16:30 체크인 · 21:00–21:30 복귀 · 11/16 체크아웃",
          desc: "1박 · 2인 · 예약 완료 (Agoda Property ID 43346). 검색상 이 ID가 Premier Hotel-CABIN-Shinjuku(가부키초 2-40-3)와 연결된다는 결과가 있었으나, 예약 확인서와 대조하지 않아 숙소명·위치를 확정하지 않았습니다.",
          checks: ["예약 확인서의 숙소명·주소·최근접역", "체크인 가능 시각"],
          links: [{ label: "Agoda 예약 페이지 (Property ID 43346)", url: "https://www.agoda.com/ko-kr/accom/property?propertyId=43346&countryId=3&checkIn=2026-11-15&adults=2&rooms=1&los=1" }],
          osmQuery: "新宿駅"
        },
        {
          id: "d2-matsukiyo", order: 7, name: "마츠모토키요시 (선택)", nameLocal: "マツモトキヨシ",
          kind: "visit", status: "optional", precision: "reference",
          lat: 35.6900, lng: 139.7004,
          precisionNote: "방문 지점 미정 — 신주쿠역 일대를 기준점으로 표시",
          time: "시간이 허용될 경우",
          desc: "신주쿠 숙소 주변 쇼핑. 시간이 남을 때만 방문하는 선택 항목입니다.",
          checks: ["방문할 매장"],
          osmQuery: "マツモトキヨシ 新宿"
        },
        {
          id: "d2-daikanyama", order: 8, name: "다이칸야마 거리·골목", nameLocal: "代官山",
          kind: "visit", status: "course", precision: "area",
          lat: 35.6484, lng: 139.7024,
          precisionNote: "다이칸야마역 주변 거리의 대표 지점",
          time: "17:00–18:30",
          desc: "다이칸야마 거리와 골목 산책.",
          checks: [],
          osmQuery: "代官山駅"
        },
        {
          id: "d2-yoonha", order: 9, name: "윤일담 관련 지역 (다이칸야마)", nameLocal: "代官山",
          kind: "visit", status: "course", precision: "reference", yoonha: "check",
          lat: 35.6484, lng: 139.7024,
          precisionNote: "촬영 위치 미확인 — 다이칸야마 거리 대표 지점을 기준점으로 표시",
          time: "17:00–18:30 중",
          desc: "「윤하, 일본을 담다」 관련 다이칸야마 지역.",
          checks: ["실제 촬영 장소 (영상 장면과 대조)"],
          osmQuery: "代官山"
        },
        {
          id: "d2-tsite", order: 10, name: "다이칸야마 T-SITE / 츠타야 서점", nameLocal: "代官山 T-SITE 蔦屋書店",
          kind: "visit", status: "course", precision: "landmark",
          lat: 35.6489, lng: 139.6997,
          time: "17:00–18:30 중",
          desc: "츠타야 서점 다이칸야마점.",
          checks: ["방문일 영업시간"],
          osmQuery: "代官山 蔦屋書店"
        },
        {
          id: "d2-hachiko", order: 11, name: "하치코 동상", nameLocal: "忠犬ハチ公像",
          kind: "visit", status: "course", precision: "landmark",
          lat: 35.6590, lng: 139.7006,
          time: "19:00–20:00 중",
          desc: "시부야역 하치코 출구 앞.",
          checks: [],
          osmQuery: "忠犬ハチ公像"
        },
        {
          id: "d2-scramble", order: 12, name: "시부야 스크램블 교차로", nameLocal: "渋谷スクランブル交差点",
          kind: "visit", status: "course", precision: "landmark",
          lat: 35.6595, lng: 139.7004,
          time: "19:00–20:00 중",
          desc: "하치코 동상 바로 앞의 대형 교차로.",
          checks: [],
          osmQuery: "渋谷スクランブル交差点"
        },
        {
          id: "d2-tower", order: 13, name: "타워레코드 시부야", nameLocal: "タワーレコード渋谷店",
          kind: "visit", status: "course", precision: "landmark",
          lat: 35.6615, lng: 139.7013,
          time: "19:00–20:00 중",
          desc: "대형 음반 매장.",
          checks: ["방문일 영업시간"],
          osmQuery: "タワーレコード渋谷店"
        },
        {
          id: "d2-shibuya-st", order: 14, name: "시부야 상업 거리", nameLocal: "渋谷センター街 일대",
          kind: "visit", status: "course", precision: "area",
          lat: 35.6603, lng: 139.6987,
          precisionNote: "센터가이 일대 대표 지점",
          time: "20:00–21:00 저녁",
          desc: "시부야 상업 거리 산책과 저녁 식사(식당 미정).",
          checks: ["저녁 식당"],
          osmQuery: "渋谷センター街"
        },
        {
          id: "d2-donki", order: 15, name: "MEGA 돈키호테 시부야 본점", nameLocal: "MEGAドン・キホーテ渋谷本店",
          kind: "visit", status: "course", precision: "landmark",
          lat: 35.6612, lng: 139.6977,
          precisionNote: "주소(시부야구 우다가와초 28-6) 기준 근사 좌표",
          time: "21:00–22:30 · 쇼핑 예산 2인 70,000원(초기 배정)",
          desc: "DAY 2 마지막 일정. 시부야 본점 방문이 어려우면 신주쿠 숙소 근처 돈키호테 신주쿠 동남구점으로 대체합니다. 2026년 11월부터 일본 면세 방식이 바뀌었는지 '예약·티켓 / 쇼핑' 메뉴를 확인하세요.",
          checks: ["영업시간·면세 카운터 운영시간", "면세 절차·최소 구매금액(2026년 11월 기준)", "SOL트래블 카드 결제 가능 여부", "한국 반입 제한 품목(육류 가공품·의약품·액체류)"],
          osmQuery: "MEGAドン・キホーテ渋谷本店"
        },
        {
          id: "d2-donki-alt", order: 16, name: "돈키호테 신주쿠 동남구점 (대안)", nameLocal: "ドン・キホーテ新宿東南口店",
          kind: "visit", status: "optional", precision: "reference",
          lat: 35.6900, lng: 139.7004,
          precisionNote: "매장 위치 미확인 — 신주쿠역을 기준점으로 표시",
          time: "시부야 본점 방문이 어려울 때",
          desc: "시부야 본점 대신 들를 수 있는 숙소 근처 대안 매장.",
          checks: ["매장 위치·영업시간"],
          osmQuery: "ドン・キホーテ 新宿東南口店"
        }
      ]
    },

    {
      id: "day3",
      label: "DAY 3",
      date: "2026-11-16",
      weekday: "월",
      title: "아사쿠사 → 나리타공항 → 인천",
      stay: "귀국",
      color: "#5B63B7",
      schedule: [
        { time: "07:30", text: "기상 · 돈키호테 면세품과 영수증을 꺼내기 쉬운 곳에 정리", kind: "stay" },
        { time: "08:00–08:30", text: "숙소 체크아웃", kind: "stay", place: "d3-hotel" },
        { time: "08:30–09:30", text: "마루노우치선 신주쿠 → 아카사카미쓰케(같은 승강장 환승) → 긴자선 → 아사쿠사 (약 35분 · 252엔/인 추정 · 출근 혼잡)", kind: "move" },
        { time: "09:30", text: "도에이 아사쿠사역 코인로커에 짐 보관 (개찰 밖 대형 36개 · 요금 확인 필요)", kind: "move" },
        { time: "09:30–10:00", text: "카미나리몬", kind: "visit", place: "d3-kaminarimon" },
        { time: "10:00–10:45", text: "나카미세 상점가", kind: "visit", place: "d3-nakamise" },
        { time: "10:45–11:30", text: "센소지", kind: "visit", place: "d3-sensoji" },
        { time: "11:30–12:00", text: "아사쿠사 골목 산책", kind: "visit", place: "d3-backstreets" },
        { time: "12:00–13:00", text: "카미나리몬 산사다 덴푸라 점심 (11:30 개점, 2차 출처)", kind: "meal", place: "d3-sansada" },
        { time: "13:00–13:40", text: "쇼핑 및 자유시간", kind: "visit", place: "d3-backstreets" },
        { time: "13:40–14:15", text: "짐 회수 · 이동 준비", kind: "move" },
        { time: "14:21", text: "도에이 아사쿠사선 직통 「エアポート快特」 아사쿠사 14:21 → 나리타 (약 70분 추정 · 1,276엔/인 · 여유 원하면 13:43)", kind: "move" },
        { time: "15:30–16:00", text: "나리타공항 도착 목표 [고정] → 체크인 전에 면세 환급 확인(물건·영수증·여권) → 체크인 → 보안검색", kind: "flight", place: "d3-narita" },
        { time: "18:50", text: "나리타공항 출발 [고정] (편명·터미널 확인 필요)", kind: "flight", place: "d3-narita" }
      ],
      places: [
        {
          id: "d3-hotel", order: 1, name: "신주쿠 예약 숙소 (체크아웃)", nameLocal: "新宿 (숙소명 대조 필요)",
          kind: "stay", status: "booked", precision: "reference",
          lat: 35.6900, lng: 139.7004,
          precisionNote: "숙소 위치 미확정 — 신주쿠역을 임시 기준점으로 표시",
          time: "08:00–08:30 체크아웃",
          desc: "체크아웃 후 짐을 가지고 아사쿠사로 이동합니다.",
          checks: ["여행 가방 보관 또는 운반 방법"],
          osmQuery: "新宿駅"
        },
        {
          id: "d3-kaminarimon", order: 2, name: "카미나리몬", nameLocal: "雷門",
          kind: "visit", status: "course", precision: "landmark",
          lat: 35.7111, lng: 139.7964,
          time: "09:30–10:00",
          desc: "센소지의 정문. 큰 붉은 등롱.",
          checks: [],
          osmQuery: "雷門 浅草"
        },
        {
          id: "d3-nakamise", order: 3, name: "나카미세 상점가", nameLocal: "仲見世通り",
          kind: "visit", status: "course", precision: "area",
          lat: 35.7127, lng: 139.7965,
          time: "10:00–10:45",
          desc: "카미나리몬에서 센소지 본당까지 이어지는 상점가. 기념품.",
          checks: ["상점 개점 시각"],
          osmQuery: "仲見世通り"
        },
        {
          id: "d3-sensoji", order: 4, name: "센소지", nameLocal: "浅草寺",
          kind: "visit", status: "course", precision: "landmark",
          lat: 35.7148, lng: 139.7967,
          time: "10:45–11:30",
          desc: "도쿄에서 가장 오래된 사찰로 알려진 곳. 본당·오층탑.",
          checks: [],
          osmQuery: "浅草寺"
        },
        {
          id: "d3-backstreets", order: 5, name: "아사쿠사 전통 거리·기념품 상점", nameLocal: "浅草 伝法院通り 일대",
          kind: "visit", status: "course", precision: "area",
          lat: 35.7122, lng: 139.7946,
          precisionNote: "덴보인도리 일대 대표 지점 (산책 경로 미정)",
          time: "11:30–12:00 · 13:00–13:40",
          desc: "아사쿠사 골목 산책과 기념품 쇼핑.",
          checks: [],
          osmQuery: "伝法院通り"
        },
        {
          id: "d3-sansada", order: 6, name: "카미나리몬 산사다", nameLocal: "雷門 三定",
          kind: "meal", status: "course", precision: "landmark",
          lat: 35.7109, lng: 139.7969,
          time: "12:00–13:00",
          desc: "카미나리몬 바로 옆 덴푸라 노포. 공개 정보상 주소 다이토구 아사쿠사 1-2-2. 영업시간은 출처마다 달라(11:00~ / 11:30~) 확인이 필요합니다.",
          checks: ["11/16(월) 영업시간·휴무", "실제 대기 시간·예약 가능 여부"],
          osmQuery: "雷門 三定"
        },
        {
          id: "d3-narita", order: 7, name: "나리타국제공항", nameLocal: "成田国際空港",
          kind: "transit", status: "fixed", precision: "reference",
          lat: 35.7720, lng: 140.3929,
          precisionNote: "출발 터미널 미확정 — 공항 대표 지점",
          time: "15:30–16:00 도착 목표 · 18:50 출발",
          desc: "귀국 항공편 18:50 출발은 고정 제약입니다.",
          checks: ["정확한 편명과 출발 터미널", "아사쿠사 → 나리타 열차·소요시간"],
          osmQuery: "Narita International Airport"
        }
      ]
    }
  ],

  excluded: [
    "미타카의 숲 지브리 미술관 (예매 불가)",
    "하코네 조각의 숲 미술관",
    "고라 지역 별도 관광 (환승 지점으로만 이용)",
    "소운잔 지역 별도 관광 (환승 지점으로만 이용)",
    "하라주쿠",
    "오모테산도",
    "오다이바",
    "도쿄 디즈니씨"
  ],

  /* 동선 점검: 확정 관광지를 삭제하지 않고 문제와 조정안만 기록 (2026-11-09 갱신) */
  issues: [
    {
      day: "all", level: "high",
      title: "교통비가 계획 18만 원을 넘을 가능성이 큼",
      detail: "조사한 운임으로 계산하면 2인 교통비가 약 2만 8천 엔(약 24만 원, 100엔=855원 가정)입니다. 스카이라이너·로망스카 특급권 2회·하코네 프리패스가 대부분입니다. 계산 근거는 '예산' 메뉴의 예상 비용표를 보세요.",
      options: [
        "DAY 2 하코네유모토 → 신주쿠를 특급권 없는 오다큐 일반열차로 바꾸면 2인 약 2,300엔 절약 (소요시간 확인 필요)",
        "숙박비 실제 결제액이 25만 원보다 적으면 남는 금액을 교통비로 이동",
        "돈키호테·예비비 배정을 줄여 교통비를 먼저 확보 (지시서의 우선순위와 같음)"
      ]
    },
    {
      day: "all", level: "high",
      title: "로망스카 2회 모두 미예약 — 지금 예약 가능",
      detail: "로망스카는 전석 지정이며 승차 1개월 전 10:00(일본 시간)부터 판매합니다. 11/14·11/15 모두 판매 중입니다. DAY 1은 토휴일 하코네 61호(신주쿠 12:40 → 유모토 14:08)가 공식 시각표로 확인됩니다. DAY 2 일요일 14시대 상행 시각은 확인하지 못했습니다.",
      options: ["EMot Online Tickets(e-Romancecar)에서 2인 좌석 예약 (온라인 특급요금 1,150엔)", "매진 시 오다큐 일반열차 또는 오다와라 경유"]
    },
    {
      day: "day3", level: "high",
      title: "2026-11-01부터 일본 면세가 '공항 환급' 방식으로 바뀜",
      detail: "돈키호테 등에서는 세금 포함 가격으로 결제하고, 출국 날 나리타에서 체크인 전에 물건·영수증·여권을 가지고 확인을 받아야 환급됩니다. 한 영수증 안의 물건이 하나라도 없으면 그 영수증 전체가 환급되지 않습니다. 공식 소요시간은 없고 '여유를 충분히 두라'고만 안내합니다.",
      options: ["면세 대상(같은 매장·같은 날 세전 5,000엔 이상) 물건은 위탁 가방 맨 위나 기내 가방에 따로 담기", "공항 도착 15:30 목표 유지, 가능하면 13:43 직통 열차로 앞당기기"]
    },
    {
      day: "day2", level: "mid",
      title: "체크아웃 후 짐 → 하코네 캐리 서비스로 해결 가능성",
      detail: "공식 안내상 숙소 프런트에 당일 10:00까지 맡기면 하코네유모토역에서 13:30–18:30에 받을 수 있습니다(1개 1,500엔, 대형 2,500엔). 단, Gora Onsen Kinkaku가 제휴 숙소인지는 확인하지 못했습니다. DAY 1(유모토 14:08 도착)은 역 → 숙소 접수 마감 12:00을 넘으므로 짐을 들고 이동해야 합니다.",
      options: ["숙소에 하코네 캐리 서비스 이용 가능 여부 문의", "불가하면 숙소에 짐을 맡기고 하산 길에 가미고라에서 회수 (동선 +30분 정도)"]
    },
    {
      day: "all", level: "mid",
      title: "11월 주말 하코네 혼잡 — 우선 개찰 예약은 이번 날짜에 없음",
      detail: "2026년 우선 개찰(로프웨이 유료 패스트레인, 케이블카 우선승차)은 11/21·22에만 시행합니다. 11/14·15에는 줄을 서야 합니다. 등산전차는 주말 9–11시·15–17시가 붐빕니다.",
      options: ["DAY 2는 08:30 가미고라 출발 유지 (로프웨이 9:00 첫 운행)", "DAY 1 16:30 등산전차가 붐비면 고라행이 늦어질 수 있으니 숙소에 도착 예정 시간 알리기"]
    },
    {
      day: "day2", level: "mid",
      title: "로프웨이 기상·화산가스 운휴 시 대체 수단 불확실",
      detail: "공식 안내상 강풍·낙뢰·태풍이나 화산가스 측정값에 따라 운휴할 수 있습니다. 정기점검 때는 대행버스가 있지만, 갑작스러운 운휴 때 대행버스가 다니는지는 확인하지 못했습니다.",
      options: ["당일 아침 하코네나비 운행 정보 확인", "운휴 시 현지 안내에 따라 버스 등 대체 수단 확인 — 오와쿠다니는 코스에서 삭제하지 않음", "프리패스 사용 시 한 번도 타지 못한 교통수단은 환불 대상(공식)"]
    },
    {
      day: "day1", level: "mid",
      title: "치모토 17:00 종료 — 도착 후 가장 먼저",
      detail: "하코네유모토 도착이 14:08(로망스카 61호 기준)이라 관광 시간은 약 2시간 20분입니다. 입국이 늦어져 다음 로망스카로 밀리면 줄어듭니다.",
      options: ["유모토 도착 후 치모토 → 다케이치 → 온천마을·족탕 순서", "16:30 출발은 유지 (체크인 17:30–18:00)"]
    },
    {
      day: "day2", level: "low",
      title: "다이칸야마 T-SITE 영업시간 출처 불일치",
      detail: "T-SITE 공식 층별 안내는 09:00–22:00, 다른 점포 페이지는 1층 21:00·2층 20:00 종료로 나옵니다. 17:00–18:30 방문이면 어느 쪽이든 영업 중입니다.",
      options: ["순서 변경 불필요"]
    },
    {
      day: "day3", level: "mid",
      title: "평일 출근 시간 신주쿠 → 아사쿠사 이동 (짐 있음)",
      detail: "08:30은 출근 혼잡 시간입니다. 같은 승강장에서 갈아탈 수 있는 마루노우치선 → 아카사카미쓰케 → 긴자선 경로가 짐 들고 이동하기에 가장 편합니다.",
      options: ["2인 + 큰 가방이면 택시(2차 출처 약 2,500–4,500엔)도 검토", "아사쿠사 도착 후 도에이 아사쿠사역 코인로커(개찰 밖, 대형 36개)"]
    }
  ],

  /* 확인 결과 요약 — 상세 출처는 각 메뉴(교통·Wallet·예약·티켓)에 있음. 확인일 2026-11-09 */
  verification: [
    {
      item: "Agoda Property ID 43346 실제 숙소",
      result: "확인 못 함",
      detail: "Premier Hotel-CABIN-Shinjuku일 가능성이 있습니다(가부키초 2-40-3, 세이부신주쿠역 북쪽 출구 도보 2분, JR 신주쿠역 동쪽 출구 도보 8분, 체크인 15:00·체크아웃 11:00). 예약 확인서와 대조해야 합니다.",
      sources: [
        { title: "Premier Hotel -CABIN- Shinjuku 공식 공지 (주소)", url: "https://cabin.kenhotels.com/shinjuku/news/2026/05/07/5068/" },
        { title: "じゃらん 숙소 정보 (도보 시간)", url: "https://www.jalan.net/yad304851/" }
      ]
    },
    {
      item: "Gora Onsen Kinkaku 주소",
      result: "부분 확인",
      detail: "숙박 안내 사이트 기준 고라 1320-601, 최근접역 가미고라역. 예약 확인서와 대조 전입니다. 하코네 캐리 서비스 제휴 여부도 미확인.",
      sources: [{ title: "LIVE JAPAN", url: "https://livejapan.com/en/in-tokyo/in-pref-kanagawa/in-hakone_odawara/spot-lj0057904" }]
    },
    {
      item: "교통 운임·시간표",
      result: "부분 확인",
      detail: "로프웨이·프리패스·로망스카 특급요금·스카이라이너·도에이 시각표 등 주요 값은 공식 출처로 확인했습니다. 케이블카 고라→가미고라 운임, DAY 2 로망스카 시각, 공항발 스카이라이너 시각은 확인하지 못했습니다. 상세는 '교통' 메뉴.",
      sources: [{ title: "하코네나비 프리패스 (공식)", url: "https://www.hakonenavi.jp/transportation/ticket/freepass" }]
    },
    {
      item: "영업시간",
      result: "부분 확인",
      detail: "타워레코드 시부야 11:00–22:00(공식), T-SITE 츠타야 09:00–22:00(공식, 다른 출처와 불일치), MEGA 돈키호테 시부야 24시간(2차), 산사다 11:30–21:30(2차), 치모토 9:00–17:00(2차), 쿠로타마고 판매 16:40까지(2차).",
      sources: [
        { title: "TOWER RECORDS 渋谷店 (공식)", url: "https://tower.jp/store/Shibuya/" },
        { title: "代官山 蔦屋書店 (공식)", url: "https://store.tsite.jp/daikanyama/floor/shop/tsutaya-books/" },
        { title: "핫페퍼 — 三定", url: "https://www.hotpepper.jp/strJ000103850/" }
      ]
    },
    {
      item: "하코네 프라이빗 온천 예약 시간",
      result: "확인 못 함",
      detail: "숙소에 직접 문의가 필요합니다.",
      sources: []
    },
    {
      item: "2인 총예산 약 700,000원",
      result: "부분 확인",
      detail: "교통비는 조사한 운임으로 추정했습니다(약 2만 8천 엔). 숙박비 실제 결제액과 식비는 없어 '예산' 메뉴에서 직접 입력해야 합니다. 환율은 11/6 하나은행 매매기준율 100엔=859.02원(2차 보도)이 가장 최근 확인값입니다.",
      sources: [{ title: "철강금속신문 (2026-11-06 환율 보도)", url: "https://www.snmnews.com/news/articleView.html?idxno=577060" }]
    }
  ]
};
