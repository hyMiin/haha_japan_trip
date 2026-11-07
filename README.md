# haha_japan_trip — 하하커플 4주년 일본여행 일정 지도

하코네·도쿄 2박 3일(2026.11.14 토 – 11.16 월) 일정을 날짜별로 지도에서 보는 정적 웹 뷰어입니다.

- 뷰어: https://hymiin.github.io/haha_japan_trip/
- 지도: OpenStreetMap 타일 + [Leaflet](https://leafletjs.com) 1.9.4 (저장소에 포함, 외부 CDN·API 키 불필요)

## 기능

- 전체 / DAY 1 / DAY 2 / DAY 3 날짜 선택 (`#day2/d2-owakudani`처럼 주소로 공유 가능)
- 방문 순서 번호 마커, 순서를 잇는 **직선**(실제 이동 경로 아님) 켜기/끄기
- 장소 선택 시 시간(계획값), 설명, 상태(예약 완료·고정 제약·확정 코스·환승 지점·선택), 확인 필요 사항 표시
- 정확한 위치를 모르는 장소는 근처 역·지역을 **기준점**으로 표시하고 점선 테두리로 구분
- 장소 검색(한글·일본어·"확인 필요"·"기준점" 등), 전체 보기, 확대·축소
- OpenStreetMap에서 선택 장소 열기 / 이름 검색
- 동선 점검과 조정안, 확인 결과와 출처(확인 시점 2026-11-07), 제외 장소
- 예산표: 금액을 직접 입력하면 합계와 목표(2인 약 600,000원) 대비 차이 표시 (브라우저에 저장)
- JSON 내보내기 / 가져오기 (가져온 일정은 브라우저에 저장되며 "기본 일정으로 되돌리기" 가능)

## 파일

| 파일 | 내용 |
|---|---|
| `index.html` | 페이지 구조 |
| `style.css` | 디자인 (PC: 지도+사이드 패널, 모바일: 지도 위·목록 아래) |
| `app.js` | 지도·목록·검색·가져오기/내보내기·예산 로직 |
| `trip-data.js` | 일정 데이터 (`window.TRIP_DATA`) — 일정 수정은 이 파일에서 |
| `vendor/leaflet/` | Leaflet 1.9.4 (BSD-2-Clause, `LEAFLET-LICENSE`) |

`vendor/leaflet/leaflet.js`는 작업 환경에서 npm·CDN에 접근할 수 없어, Leaflet 공식 저장소의 `v1.9.4` 태그 소스(`src/`)를 TypeScript 컴파일러로 묶어 만든 파일입니다. `leaflet.css`와 이미지는 같은 태그의 `dist/`에서 그대로 가져왔습니다. 공식 배포본으로 바꾸려면 같은 경로에 `leaflet.js`(1.9.4)를 덮어쓰면 됩니다.

## 데이터 작성 규칙

- 확정: 여행 날짜, 숙소 2곳 예약, 전체 관광 코스와 방문 순서
- 모든 세부 시각은 **계획값**이며 실제 운행·영업·예약 시간 검증 전
- `precision`: `landmark`(대표 좌표, 근사) · `area`(지역 대표 지점) · `reference`(임시 기준점, 실제 위치 아님)
- 확인되지 않은 요금·운행시간·예약 상태는 사실처럼 적지 않고 `checks`(확인 필요)에 둔다
- 좌표가 없는 장소는 `lat`/`lng`를 `null`로 두면 목록에만 표시된다

## 로컬 실행

```sh
python3 -m http.server 8000
# http://localhost:8000 접속
```

지도 데이터 © [OpenStreetMap](https://www.openstreetmap.org/copyright) contributors.
