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
    budgetNote: "총예산 2인 합산 약 600,000원 (왕복 항공권 제외)",
    specDate: "2026-11-07",
    verifiedAt: "2026-11-07"
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
        { time: "08:30", text: "인천국제공항 출발 (편명·터미널 확인 필요)", kind: "flight" },
        { time: "10:00–10:30", text: "나리타국제공항 도착 예상", kind: "flight", place: "d1-narita" },
        { time: "11:00–11:30", text: "나리타공항 출발 계획 → 하코네유모토 (경로 미확정)", kind: "move" },
        { time: "14:00–15:00", text: "하코네유모토 도착 예상", kind: "move", place: "d1-yumoto-st" },
        { time: "15:00–16:30", text: "하코네유모토 관광: 치모토 · 다케이치 완자 · 온천마을 · 족탕", kind: "visit", place: "d1-onsen-town" },
        { time: "16:30–17:30", text: "하코네유모토 → 고라 (등산전차) → 가미고라 (케이블카)", kind: "move", place: "d1-gora" },
        { time: "17:30–18:00", text: "Gora Onsen Kinkaku 체크인 목표", kind: "stay", place: "d1-kinkaku" },
        { time: "18:00–19:00", text: "저녁 식사 (식당 미정)", kind: "meal" },
        { time: "19:00 이후", text: "프라이빗 온천 및 휴식 (실제 이용 시간 미확정)", kind: "stay" }
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
          time: "14:00–15:00 도착 예상",
          desc: "하코네 관광의 출발점. 이후 등산전차로 고라까지 이동합니다.",
          checks: ["짐 보관·운송 서비스 실제 이용 가능 여부"],
          osmQuery: "箱根湯本駅"
        },
        {
          id: "d1-chimoto", order: 3, name: "치모토 (Chimoto)", nameLocal: "ちもと",
          kind: "visit", status: "course", precision: "reference", yoonha: "check",
          lat: 35.2326, lng: 139.1055,
          precisionNote: "방문 지점 미확정 — 하코네유모토역을 기준점으로 표시",
          time: "15:00–16:30 중 (하코네유모토 관광 시간 안)",
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
          time: "15:00–16:30 중",
          desc: "하코네유모토 상점가에서 먹을 완자(어묵 꼬치) 간식.",
          checks: ["정확한 매장 위치", "영업시간", "윤일담 실제 촬영지인지 여부"],
          osmQuery: "竹いち 箱根湯本"
        },
        {
          id: "d1-onsen-town", order: 5, name: "하코네유모토 온천마을", nameLocal: "箱根湯本温泉街",
          kind: "visit", status: "course", precision: "area", yoonha: "check",
          lat: 35.2319, lng: 139.1036,
          precisionNote: "역 앞 상점가 일대의 대표 지점",
          time: "15:00–16:30",
          desc: "역 앞 상점가와 하야카와 강변 온천마을 산책. DAY 1의 윤일담 관련 코스입니다.",
          checks: ["윤일담 실제 촬영지와 일반 방문 장소의 구분"],
          osmQuery: "箱根湯本 温泉街"
        },
        {
          id: "d1-footbath", order: 6, name: "온천마을 족탕", nameLocal: "足湯",
          kind: "visit", status: "course", precision: "reference",
          lat: 35.2319, lng: 139.1036,
          precisionNote: "족탕 위치 미확인 — 온천마을 대표 지점을 기준점으로 표시",
          time: "15:00–16:30 중",
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
      title: "오와쿠다니 → 신주쿠 → 다이칸야마 → 시부야",
      stay: "신주쿠 지역 예약 숙소 (예약 완료 · 숙소명 대조 필요)",
      color: "#1E88C8",
      schedule: [
        { time: "07:30–08:30", text: "기상 및 체크아웃 준비", kind: "stay", place: "d2-kinkaku" },
        { time: "08:30–09:00", text: "가미고라 → 소운잔 (케이블카)", kind: "move", place: "d2-sounzan" },
        { time: "09:00–09:20", text: "소운잔 → 오와쿠다니 (로프웨이)", kind: "move" },
        { time: "09:20–10:30", text: "오와쿠다니 관광 · 화산 전망 · 쿠로타마고", kind: "visit", place: "d2-owakudani" },
        { time: "10:30–12:00", text: "오와쿠다니 하산", kind: "move" },
        { time: "12:00–13:00", text: "하코네 점심 (식당 미정)", kind: "meal" },
        { time: "13:00–14:00", text: "하코네유모토 이동 및 짐 회수", kind: "move", place: "d2-yumoto" },
        { time: "14:00 전후", text: "하코네유모토 → 신주쿠 (열차 미예약)", kind: "move" },
        { time: "15:30–16:00", text: "신주쿠 도착 예상", kind: "move" },
        { time: "16:00–16:30", text: "예약 숙소 체크인", kind: "stay", place: "d2-hotel" },
        { time: "16:30–17:00", text: "신주쿠 → 다이칸야마", kind: "move" },
        { time: "17:00–18:30", text: "다이칸야마 관광 · T-SITE", kind: "visit", place: "d2-daikanyama" },
        { time: "18:30–18:45", text: "다이칸야마 → 시부야", kind: "move" },
        { time: "18:45–21:00", text: "시부야 관광 및 저녁", kind: "visit", place: "d2-hachiko" },
        { time: "21:00–21:30", text: "신주쿠 숙소 복귀", kind: "move", place: "d2-hotel" }
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
          time: "08:30–09:00 도착 · 09:00 이후 로프웨이",
          desc: "관광 목적지가 아닌 환승 지점. 케이블카 → 로프웨이.",
          checks: ["케이블카 첫차 시각", "로프웨이 운행 시작(공개 안내 2~11월 9:00)·기상 운휴"],
          osmQuery: "早雲山駅"
        },
        {
          id: "d2-owakudani", order: 3, name: "오와쿠다니", nameLocal: "大涌谷",
          kind: "visit", status: "course", precision: "landmark",
          lat: 35.2440, lng: 139.0196,
          time: "09:20–10:30",
          desc: "화산 분기 지대 전망. 로프웨이 오와쿠다니역 바로 앞.",
          checks: ["11/15 로프웨이 운행 여부 (악천후·화산가스·점검 운휴 가능)", "화산 활동에 따른 출입 규제"],
          osmQuery: "大涌谷"
        },
        {
          id: "d2-kurotamago", order: 4, name: "쿠로타마고", nameLocal: "黒たまご (大涌谷くろたまご館)",
          kind: "visit", status: "course", precision: "reference",
          lat: 35.2440, lng: 139.0196,
          precisionNote: "판매점(くろたまご館 등) 위치 — 오와쿠다니 대표 지점을 기준점으로 표시",
          time: "09:20–10:30 중",
          desc: "온천 연못에서 삶은 검은 달걀. 오와쿠다니에서만 판매.",
          checks: ["방문일 판매 시간·가격"],
          osmQuery: "大涌谷くろたまご館"
        },
        {
          id: "d2-yumoto", order: 5, name: "하코네유모토역 (짐 회수·출발)", nameLocal: "箱根湯本駅",
          kind: "transit", status: "transit", precision: "landmark",
          lat: 35.2326, lng: 139.1055,
          time: "13:00–14:00 도착·짐 회수 · 14:00 전후 출발",
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
          time: "18:45–21:00 중",
          desc: "시부야역 하치코 출구 앞.",
          checks: [],
          osmQuery: "忠犬ハチ公像"
        },
        {
          id: "d2-scramble", order: 12, name: "시부야 스크램블 교차로", nameLocal: "渋谷スクランブル交差点",
          kind: "visit", status: "course", precision: "landmark",
          lat: 35.6595, lng: 139.7004,
          time: "18:45–21:00 중",
          desc: "하치코 동상 바로 앞의 대형 교차로.",
          checks: [],
          osmQuery: "渋谷スクランブル交差点"
        },
        {
          id: "d2-tower", order: 13, name: "타워레코드 시부야", nameLocal: "タワーレコード渋谷店",
          kind: "visit", status: "course", precision: "landmark",
          lat: 35.6615, lng: 139.7013,
          time: "18:45–21:00 중",
          desc: "대형 음반 매장.",
          checks: ["방문일 영업시간"],
          osmQuery: "タワーレコード渋谷店"
        },
        {
          id: "d2-shibuya-st", order: 14, name: "시부야 상업 거리", nameLocal: "渋谷センター街 일대",
          kind: "visit", status: "course", precision: "area",
          lat: 35.6603, lng: 139.6987,
          precisionNote: "센터가이 일대 대표 지점",
          time: "18:45–21:00 중 · 저녁 식사",
          desc: "시부야 상업 거리 산책과 저녁 식사(식당 미정).",
          checks: ["저녁 식당"],
          osmQuery: "渋谷センター街"
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
        { time: "07:30", text: "기상", kind: "stay" },
        { time: "08:00–08:30", text: "숙소 체크아웃", kind: "stay", place: "d3-hotel" },
        { time: "08:30–09:30", text: "신주쿠 → 아사쿠사", kind: "move" },
        { time: "09:30–10:00", text: "카미나리몬 관광", kind: "visit", place: "d3-kaminarimon" },
        { time: "10:00–10:45", text: "나카미세 상점가", kind: "visit", place: "d3-nakamise" },
        { time: "10:45–11:30", text: "센소지 관광", kind: "visit", place: "d3-sensoji" },
        { time: "11:30–12:00", text: "아사쿠사 골목 산책", kind: "visit", place: "d3-backstreets" },
        { time: "12:00–13:00", text: "카미나리몬 산사다 덴푸라 점심", kind: "meal", place: "d3-sansada" },
        { time: "13:00–13:40", text: "자유 관광 및 쇼핑", kind: "visit" },
        { time: "13:40–14:00", text: "공항 이동 준비", kind: "move" },
        { time: "14:00 전후", text: "아사쿠사 → 나리타공항", kind: "move" },
        { time: "15:30–16:00", text: "나리타공항 도착 목표 (고정 제약)", kind: "flight", place: "d3-narita" },
        { time: "18:50", text: "나리타공항 출발 (고정 제약 · 편명·터미널 확인 필요)", kind: "flight", place: "d3-narita" }
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

  /* 동선 점검: 확정 관광지를 삭제하지 않고 문제와 조정안만 기록 */
  issues: [
    {
      day: "day2", level: "high",
      title: "체크아웃 후 짐 처리 방법이 정해지지 않음",
      detail: "일정에 '13:00–14:00 하코네유모토 이동 및 짐 회수'가 있지만, 체크아웃(가미고라) 후 짐을 어디에 맡기는지가 없습니다. 짐을 들고 케이블카·로프웨이로 오와쿠다니를 왕복하면 혼잡한 11월 주말에 부담이 큽니다.",
      options: [
        "숙소에 오와쿠다니 다녀올 때까지 짐 보관을 요청하고 돌아오는 길에 회수 (가미고라 경유)",
        "하코네 짐 운송(캐리) 서비스로 숙소 → 하코네유모토 또는 신주쿠 숙소 배송 가능 여부 확인",
        "고라역·소운잔역 코인로커 이용 (공식 역 안내에 소운잔역 코인로커 표기, 크기·수량 미확인)"
      ]
    },
    {
      day: "day2", level: "high",
      title: "하코네유모토 → 신주쿠 열차 미예약",
      detail: "로망스카는 전석 지정석이며 특급권은 승차일 1개월 전 10:00부터 판매됩니다(하코네나비 안내). 11월 일요일 오후 상행은 매진 가능성이 있어 지금 예약을 권합니다. 실제 시간표는 확인하지 못했습니다.",
      options: [
        "14:00 전후 로망스카 좌석을 지금 예약",
        "매진 시: 하코네유모토 → 오다와라 (등산선) → 오다큐 쾌속급행 또는 신칸센 (소요시간 별도 확인)"
      ]
    },
    {
      day: "all", level: "mid",
      title: "11월 주말 하코네 케이블카·로프웨이 혼잡",
      detail: "2025년에는 11월 토·휴일에 케이블카(고라발)와 로프웨이(소운잔·도겐다이)에서 웹 예약제 우선 개찰을 시행했습니다. 2026년 시행 여부는 확인하지 못했습니다. DAY 1 16:30–17:30 고라 → 가미고라, DAY 2 오전 이동에 대기가 생길 수 있습니다.",
      options: [
        "2026년 우선 개찰 예약 시행 여부를 확인하고 가능하면 예약",
        "DAY 2 하산 시간(10:30–12:00, 90분)은 대기 여유로 두고 점심 시각을 탄력적으로 조정"
      ]
    },
    {
      day: "day2", level: "mid",
      title: "로프웨이 운행 시작 9:00 · 기상 운휴 가능",
      detail: "공개 안내상 로프웨이는 2~11월 9:00 운행 시작(소운잔 9:00~16:45, 오와쿠다니역 ~17:00)이며 악천후·점검 시 운휴할 수 있습니다. 08:30 가미고라 출발이면 소운잔에서 첫 운행을 기다리는 구조라 일정과는 맞습니다.",
      options: [
        "당일 아침 하코네나비 운행 정보 확인",
        "운휴 시 대체 교통(버스 등) 여부를 현지에서 확인 — 오와쿠다니는 코스에서 삭제하지 않음"
      ]
    },
    {
      day: "day1", level: "mid",
      title: "나리타 출발이 늦어지면 치모토 영업 종료(17:00 안내)에 걸릴 수 있음",
      detail: "하코네유모토 도착 예상이 14:00–15:00이라 입국 수속이 지연되면 관광 시간이 줄어듭니다.",
      options: [
        "하코네유모토 도착 후 치모토를 가장 먼저 방문",
        "족탕·온천마을 산책은 시간에 맞춰 줄이고, 16:30 출발은 유지 (체크인 17:30–18:00)"
      ]
    },
    {
      day: "day1", level: "low",
      title: "고라 지역 저녁 식사 미정",
      detail: "체크인 후 18:00–19:00 저녁 식당이 정해지지 않았습니다. 고라 지역 식당의 영업 종료 시각은 확인하지 못했습니다.",
      options: [
        "하코네유모토 또는 고라역 주변에서 미리 음식 구매",
        "숙소에 주변 식당·저녁 영업 여부 문의"
      ]
    },
    {
      day: "day3", level: "mid",
      title: "아사쿠사 관광 중 여행 가방 처리",
      detail: "08:00–08:30 체크아웃 후 짐을 들고 4~4.5시간 관광합니다.",
      options: [
        "아사쿠사역 코인로커 또는 짐 보관소 이용 (위치·크기 확인 필요)",
        "숙소에서 공항으로 짐 당일 배송 서비스 가능 여부 확인"
      ]
    },
    {
      day: "day3", level: "low",
      title: "공항 이동은 터미널 확인 후 확정",
      detail: "14:00 전후 아사쿠사 출발 → 15:30–16:00 공항 도착 목표는 18:50 출발 기준으로 여유가 있습니다. 실제 열차(예: 도에이 아사쿠사선 직통 공항행)와 소요시간은 출발 터미널 기준으로 검증해야 합니다.",
      options: ["편명·터미널 확정 후 열차 시각 확정"]
    }
  ],

  /* 확인한 정보와 출처 — 확인 시점 2026-11-07 */
  verification: [
    {
      item: "Agoda Property ID 43346 실제 숙소",
      result: "확인 못 함",
      detail: "Agoda 페이지에 접속할 수 없었습니다. 기존 검색 결과대로 Premier Hotel-CABIN-Shinjuku일 수 있으며, 그렇다면 주소는 신주쿠구 가부키초 2-40-3, 세이부신주쿠역 도보 약 2분, JR 신주쿠역 동쪽 출구 도보 약 8~10분입니다. 예약 확인서와 대조해야 합니다.",
      sources: [
        { title: "Premier Hotel -CABIN- Shinjuku 공식", url: "https://cabin.kenhotels.com/shinjuku/english" },
        { title: "HafH 숙소 정보 (주소)", url: "https://hafh.com/properties/5675" }
      ]
    },
    {
      item: "Gora Onsen Kinkaku 주소",
      result: "부분 확인",
      detail: "숙박 안내 사이트 기준 주소 하코네마치 고라 1320-601, 최근접역 가미고라역. 공식·예약 확인서 대조 전입니다.",
      sources: [{ title: "LIVE JAPAN", url: "https://livejapan.com/en/in-tokyo/in-pref-kanagawa/in-hakone_odawara/spot-lj0057904" }]
    },
    {
      item: "나리타공항 → 하코네유모토 경로·운임",
      result: "확인 못 함",
      detail: "후보 경로: ① 게이세이 스카이라이너 → 닛포리 → JR → 신주쿠 → 로망스카, ② 나리타 익스프레스 → 도쿄/시나가와 → 도카이도 신칸센 → 오다와라 → 하코네 등산선. 실제 시각·운임은 확인하지 못했습니다.",
      sources: [{ title: "GO TOKYO — 하코네 접근 (도쿄·시나가와 경유)", url: "https://www.gotokyo.org/jp/destinations/beyond-tokyo/hakone.html" }]
    },
    {
      item: "하코네 등산전차·케이블카 운행시간",
      result: "부분 확인",
      detail: "케이블카 고라~소운잔 약 10분. 운행시간은 2차 출처에 8:25~18:20(고라·소운잔 발)으로 나오나 공식 시간표로 확인하지 못했습니다.",
      sources: [
        { title: "하코네나비 소운잔역 (공식)", url: "https://www.hakonenavi.jp/spot/8086" },
        { title: "MAPPLE 하코네 등산 케이블카 (2차 출처)", url: "https://www.mapple.net/region/a0304010105_g04000000_s-situation=one/spot/" }
      ]
    },
    {
      item: "11/15 하코네 로프웨이 운행시간·기상 변수",
      result: "부분 확인",
      detail: "공식 안내: 2~11월 소운잔·우바코·도겐다이 9:00~16:45, 오와쿠다니역 9:00~17:00, 약 1분 간격. 악천후·정기 점검 시 운휴. 2025년 11월 토·휴일 우선 개찰 예약 시행(2026년 미확인).",
      sources: [
        { title: "하코네나비 하코네 로프웨이 스폿", url: "https://www.hakonenavi.jp/spot/21657" },
        { title: "하코네나비 소운잔역", url: "https://www.hakonenavi.jp/transportation/station/sounzan/" },
        { title: "tabi-mag — 우선 개찰 예약 (2025)", url: "https://tabi-mag.jp/odakyuhakone-autumn/" }
      ]
    },
    {
      item: "하코네유모토 → 신주쿠 로망스카",
      result: "부분 확인",
      detail: "전석 지정석, 승차일 1개월 전 10:00부터 예약 가능, 신주쿠~하코네유모토 최속 약 75분. 11/15 실제 시간표·잔여석은 확인하지 못했습니다.",
      sources: [
        { title: "하코네나비 — 도쿄에서 하코네 가는 법", url: "https://www.hakonenavi.jp/feature/24536" },
        { title: "하코네나비 — 로망스카 안내", url: "https://www.hakonenavi.jp/feature/23163" }
      ]
    },
    {
      item: "신주쿠 숙소 → 다이칸야마 → 시부야",
      result: "확인 못 함",
      detail: "일반적으로 JR 신주쿠 → 시부야 → 도큐 도요코선 다이칸야마(1정거장) 또는 시부야에서 도보. 숙소 위치 확정 후 확인이 필요합니다.",
      sources: []
    },
    {
      item: "신주쿠 숙소 → 아사쿠사 → 나리타공항",
      result: "확인 못 함",
      detail: "아사쿠사역에서 도에이 아사쿠사선 직통 공항행 열차 등을 검토할 수 있으나 시간표·소요시간은 확인하지 못했습니다.",
      sources: []
    },
    {
      item: "산사다 영업시간·휴무",
      result: "출처 간 불일치",
      detail: "핫페퍼: 월~일 11:30~21:30(L.O. 21:00), 12/27~1/8 휴무. 다른 이용자 게시물: 11:00~20:00, 부정기 휴무. 방문 전 확인이 필요합니다.",
      sources: [
        { title: "핫페퍼 구루메 — 浅草 雷門 三定", url: "https://www.hotpepper.jp/strJ000103850/" },
        { title: "aumo 게시물", url: "https://aumo.jp/photos/53293987" }
      ]
    },
    {
      item: "치모토 영업시간",
      result: "확인 못 함",
      detail: "명세의 안내(에키마에도리점 9:00~17:00)를 이번에 직접 열람하지 못했습니다.",
      sources: [{ title: "치모토 (명세 제공 링크)", url: "https://www.yumochi.com/page7" }]
    },
    {
      item: "하코네 프라이빗 온천 예약 시간",
      result: "확인 못 함",
      detail: "숙소에 직접 문의가 필요합니다.",
      sources: []
    },
    {
      item: "2인 총예산 약 600,000원",
      result: "검증 불가",
      detail: "숙박비 결제액, 교통비, 식비, 환율 실제 값이 없어 계산하지 않았습니다. 아래 예산표에 금액을 입력하면 합계를 볼 수 있습니다.",
      sources: []
    }
  ],

  budget: {
    totalKRW: 600000,
    rateJPYtoKRW: null,
    items: [
      { id: "stay1", label: "숙소 1 — Gora Onsen Kinkaku (예약 결제액)", currency: "KRW", amount: null },
      { id: "stay2", label: "숙소 2 — 신주쿠 숙소 (예약 결제액)", currency: "KRW", amount: null },
      { id: "nrt-hakone", label: "나리타 → 하코네유모토 교통 (2인)", currency: "JPY", amount: null },
      { id: "hakone-local", label: "하코네 내 교통: 등산전차·케이블카·로프웨이 (2인)", currency: "JPY", amount: null },
      { id: "romancecar", label: "하코네유모토 → 신주쿠 (2인)", currency: "JPY", amount: null },
      { id: "tokyo-local", label: "도쿄 시내 교통 (2인)", currency: "JPY", amount: null },
      { id: "asakusa-nrt", label: "아사쿠사 → 나리타 (2인)", currency: "JPY", amount: null },
      { id: "food", label: "식비 (2인 · 3일)", currency: "JPY", amount: null },
      { id: "misc", label: "간식·기념품·짐 보관 등 기타", currency: "JPY", amount: null }
    ]
  }
};
