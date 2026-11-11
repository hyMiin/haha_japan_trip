/**
 * 하하커플 4주년 일본여행 — 뷰어 → 구글 시트 결제 내역 자동 추가
 *
 * 설치
 *  1) 시트 「하하커플_4주년_일본여행사용내역」 → 확장 프로그램 → Apps Script
 *  2) 기존 내용을 지우고 이 파일 전체를 붙여 넣기
 *  3) 아래 TOKEN 을 둘만 아는 비밀 코드로 바꾸고 저장 (Ctrl+S)
 *  4) 배포 → 새 배포 → 유형: 웹 앱
 *       실행 계정: 나 / 액세스 권한: 모든 사용자 → 배포 → 권한 승인
 *  5) 나온 웹 앱 URL(…/exec)을 뷰어 '예산' 메뉴 → 구글 시트 연동에 입력
 *  6) (캡처 입력) 프로젝트 설정(톱니바퀴) → 스크립트 속성 → 속성 추가
 *       속성: GEMINI_KEY   값: Google AI Studio에서 받은 API 키
 *
 * 코드를 고친 뒤에는 배포 → 배포 관리 → 수정(연필) → 버전: 새 버전 → 배포 해야 반영됩니다.
 */

const TOKEN = '여기에-비밀코드';          // ← 꼭 바꾸세요
const SHEET_NAME = '여행 경비';
const PEOPLE = ['하이민', '하보'];
const COLS = 10;                            // A:J
const GEMINI_MODEL = 'gemini-2.5-flash';
const GEMINI_KEY = '';                      // 비워 두면 스크립트 속성 GEMINI_KEY 사용

function doGet() {
  return ContentService.createTextOutput('OK — 하하커플 시트 연동이 배포되어 있습니다.');
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const req = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    if (TOKEN === '여기에-비밀코드') return out({ ok: false, error: '스크립트의 TOKEN을 먼저 바꿔 주세요' });
    if (req.token !== TOKEN) return out({ ok: false, error: '비밀 코드가 맞지 않습니다' });
    if (req.action === 'ping') return out({ ok: true, capture: !!geminiKey() });
    if (req.action === 'extract') return out(extract(req.image, req.mime));
    if (req.action === 'replace') return out(replaceAll(req.entries));
    if (req.action !== 'add' || !req.entry) return out({ ok: false, error: '알 수 없는 요청' });
    return out(addEntry(req.entry));
  } catch (err) {
    return out({ ok: false, error: String(err && err.message || err) });
  } finally {
    lock.releaseLock();
  }
}

function addEntry(x) {
  const id = String(x.id || '');
  if (!id) return { ok: false, error: 'id 없음' };
  const props = PropertiesService.getScriptProperties();
  if (props.getProperty('id_' + id)) return { ok: true, duplicate: true };

  const sh = SpreadsheetApp.getActive().getSheetByName(SHEET_NAME);
  if (!sh) return { ok: false, error: '「' + SHEET_NAME + '」 탭을 찾지 못했습니다' };

  const tb = findTable(sh);
  if (!tb) return { ok: false, error: '시트에서 결제 내역 표(머리행·합계 행)를 찾지 못했습니다' };
  const head = tb.head, total = tb.total;

  const first = head + 1;
  const last = total - 1;                    // 현재 마지막 데이터 행
  sh.insertRowAfter(last);
  const r = last + 1;                        // 새 행 (합계는 r+1 로 밀림)

  // 서식: 새 행은 마지막 행 서식(아래 테두리 포함), 이전 마지막 행은 첫 데이터 행 서식
  sh.getRange(last, 1, 1, COLS).copyTo(sh.getRange(r, 1, 1, COLS), { formatOnly: true });
  if (last > first) sh.getRange(first, 1, 1, COLS).copyTo(sh.getRange(last, 1, 1, COLS), { formatOnly: true });
  sh.setRowHeight(r, sh.getRowHeight(first));

  sh.getRange(r, 1, 1, COLS).setValues([rowOf(x)]);

  fixFormulas(sh, first, r);

  props.setProperty('id_' + id, String(r));
  return { ok: true, row: r };
}

// 결제 내역 표 위치: A='일차' 이고 C='내용 / 사용처' 인 머리행 ~ 그 아래 첫 A='합계' 행
function findTable(sh) {
  const vals = sh.getRange(1, 1, sh.getLastRow(), 3).getDisplayValues();
  let head = -1, total = -1;
  for (let i = 0; i < vals.length; i++) {
    if (head < 0) { if (vals[i][0] === '일차' && vals[i][2] === '내용 / 사용처') head = i + 1; }
    else if (vals[i][0] === '합계') { total = i + 1; break; }
  }
  return head < 0 || total < 0 ? null : { head: head, total: total };
}

function fixFormulas(sh, first, last) {
  const t = last + 1;
  const G = '$G$' + first + ':$G$' + last, D = '$D$' + first + ':$D$' + last, E = '$E$' + first + ':$E$' + last;
  sh.getRange(t, 7).setFormula('=SUM(G' + first + ':G' + last + ')');
  const below = sh.getRange(t + 1, 1, Math.max(1, sh.getLastRow() - t), 1).getDisplayValues();
  below.forEach(function (row, i) {
    if (PEOPLE.indexOf(row[0]) === -1) return;
    const p = t + 1 + i;
    sh.getRange(p, 3, 1, 3).setFormulas([[
      '=SUMIF(' + D + ',A' + p + ',' + G + ')',
      '=SUMIFS(' + G + ',' + D + ',A' + p + ',' + E + ',"1인")+SUMIF(' + E + ',"2인",' + G + ')/2',
      '=C' + p + '-D' + p
    ]]);
  });
}

function rowOf(x) {
  return [String(x.day || ''), String(x.cat || ''), String(x.desc || ''), String(x.payer || ''),
    x.split === '1인' ? '1인' : '2인', String(x.method || ''), Math.round(Number(x.krw) || 0),
    String(x.resv || ''), x.jpyRef ? String(x.jpyRef) : (x.jpy ? 'JPY ' + Math.round(Number(x.jpy)).toLocaleString('en-US') : ''),
    String(x.memo || '')];
}

// 뷰어 지출 내역 전체로 결제 내역 표를 다시 씀 (시트에서 직접 고친 내용은 덮어씀)
function replaceAll(list) {
  if (!Array.isArray(list)) return { ok: false, error: '목록이 없습니다' };
  const sh = SpreadsheetApp.getActive().getSheetByName(SHEET_NAME);
  if (!sh) return { ok: false, error: '「' + SHEET_NAME + '」 탭을 찾지 못했습니다' };
  const tb = findTable(sh);
  if (!tb) return { ok: false, error: '시트에서 결제 내역 표(머리행·합계 행)를 찾지 못했습니다' };
  const first = tb.head + 1, oldN = tb.total - first, n = Math.max(1, list.length);
  if (n > oldN) sh.insertRowsAfter(tb.total - 1, n - oldN);
  else if (n < oldN) sh.deleteRows(first + n, oldN - n);
  const last = first + n - 1;
  const rng = sh.getRange(first, 1, n, COLS);
  sh.getRange(first, 1, 1, COLS).copyTo(rng, { formatOnly: true });
  rng.setBorder(null, null, false, null, null, false);
  sh.getRange(last, 1, 1, COLS).setBorder(null, null, true, null, null, null, '#bdc1c6', SpreadsheetApp.BorderStyle.SOLID);
  sh.setRowHeights(first, n, sh.getRowHeight(first));
  rng.setValues(list.length ? list.map(rowOf) : [['', '', '', '', '', '', '', '', '', '']]);
  fixFormulas(sh, first, last);
  const props = PropertiesService.getScriptProperties();
  list.forEach(function (x) { if (x.id) props.setProperty('id_' + x.id, 'sync'); });
  return { ok: true, rows: list.length };
}

function geminiKey() { return PropertiesService.getScriptProperties().getProperty('GEMINI_KEY') || GEMINI_KEY; }

// 결제 캡처 → { desc, krw, jpy, date }
function extract(b64, mime) {
  const key = geminiKey();
  if (!key) return { ok: false, error: '스크립트 속성에 GEMINI_KEY가 없습니다' };
  if (!b64) return { ok: false, error: '이미지가 없습니다' };
  const prompt = [
    '이 이미지는 일본 여행 중 결제 내역 캡처(카드 앱 결제 알림·영수증·이용내역)입니다.',
    '결제 1건의 정보를 JSON으로만 답하세요.',
    '- desc: 가맹점/사용처 이름. 일본어 상호는 그대로 두고, 알아보기 쉬운 한글 설명을 괄호로 덧붙여도 됩니다. 30자 이내.',
    '- krw: 실제 청구·출금된 원화 금액(숫자). 원화 표시가 없으면 null.',
    '- jpy: 결제한 엔화 금액(숫자). 엔화 표시가 없으면 null.',
    '- date: 결제 날짜 YYYY-MM-DD. 연도가 없으면 2026. 모르면 null.',
    '- cat: food(식당·카페·편의점 음식), transport(전철·버스·택시·교통카드 충전), donki(돈키호테·쇼핑·기념품), stay(숙박·입탕세), etc(그 외) 중 하나.',
    '카드 잔액·남은 금액·한도·포인트·카드번호·승인번호는 절대 금액으로 쓰지 말고 무시하세요.',
    '결제가 여러 건이면 가장 위(가장 최근) 1건만 답하세요. 결제 내역이 아니면 모든 값을 null로 답하세요.'
  ].join('\n');
  const body = {
    contents: [{ parts: [{ text: prompt }, { inline_data: { mime_type: mime || 'image/jpeg', data: b64 } }] }],
    generationConfig: {
      temperature: 0,
      responseMimeType: 'application/json',
      responseSchema: {
        type: 'OBJECT',
        properties: {
          desc: { type: 'STRING', nullable: true },
          krw: { type: 'NUMBER', nullable: true },
          jpy: { type: 'NUMBER', nullable: true },
          date: { type: 'STRING', nullable: true },
          cat: { type: 'STRING', enum: ['food', 'transport', 'donki', 'stay', 'etc'] }
        }
      }
    }
  };
  const res = UrlFetchApp.fetch('https://generativelanguage.googleapis.com/v1beta/models/' + GEMINI_MODEL + ':generateContent', {
    method: 'post', contentType: 'application/json', payload: JSON.stringify(body),
    headers: { 'x-goog-api-key': key }, muteHttpExceptions: true
  });
  const code = res.getResponseCode(), txt = res.getContentText();
  if (code !== 200) {
    let msg = txt; try { msg = JSON.parse(txt).error.message; } catch (e) { /* keep raw */ }
    return { ok: false, error: 'Gemini 오류 ' + code + ': ' + String(msg).slice(0, 200) };
  }
  let r = {};
  try { r = JSON.parse(JSON.parse(txt).candidates[0].content.parts[0].text); }
  catch (e) { return { ok: false, error: 'Gemini 응답을 해석하지 못했습니다' }; }
  return { ok: true, result: { desc: r.desc || '', krw: num(r.krw), jpy: num(r.jpy), date: /^\d{4}-\d{2}-\d{2}$/.test(r.date || '') ? r.date : '', cat: r.cat || '' } };
}
function num(v) { const n = Number(v); return isFinite(n) && n > 0 ? Math.round(n) : null; }

function out(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}
