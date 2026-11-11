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
 *
 * 코드를 고친 뒤에는 배포 → 배포 관리 → 수정(연필) → 버전: 새 버전 → 배포 해야 반영됩니다.
 */

const TOKEN = '여기에-비밀코드';          // ← 꼭 바꾸세요
const SHEET_NAME = '여행 경비';
const PEOPLE = ['하이민', '하보'];
const COLS = 10;                            // A:J

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
    if (req.action === 'ping') return out({ ok: true });
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

  // 결제 내역 표: A='일차' 이고 C='내용 / 사용처' 인 머리행 ~ 그 아래 첫 A='합계' 행
  const vals = sh.getRange(1, 1, sh.getLastRow(), 3).getDisplayValues();
  let head = -1, total = -1;
  for (let i = 0; i < vals.length; i++) {
    if (head < 0) {
      if (vals[i][0] === '일차' && vals[i][2] === '내용 / 사용처') head = i + 1;
    } else if (vals[i][0] === '합계') { total = i + 1; break; }
  }
  if (head < 0 || total < 0) return { ok: false, error: '시트에서 결제 내역 표(머리행·합계 행)를 찾지 못했습니다' };

  const first = head + 1;
  const last = total - 1;                    // 현재 마지막 데이터 행
  sh.insertRowAfter(last);
  const r = last + 1;                        // 새 행 (합계는 r+1 로 밀림)

  // 서식: 새 행은 마지막 행 서식(아래 테두리 포함), 이전 마지막 행은 첫 데이터 행 서식
  sh.getRange(last, 1, 1, COLS).copyTo(sh.getRange(r, 1, 1, COLS), { formatOnly: true });
  if (last > first) sh.getRange(first, 1, 1, COLS).copyTo(sh.getRange(last, 1, 1, COLS), { formatOnly: true });
  sh.setRowHeight(r, sh.getRowHeight(first));

  const krw = Math.round(Number(x.krw) || 0);
  const jpy = x.jpy ? 'JPY ' + Math.round(Number(x.jpy)).toLocaleString('en-US') : '';
  sh.getRange(r, 1, 1, COLS).setValues([[
    String(x.day || ''), String(x.cat || ''), String(x.desc || ''), String(x.payer || ''),
    x.split === '1인' ? '1인' : '2인', String(x.method || ''), krw, '', jpy, String(x.memo || '')
  ]]);

  // 합계·정산 수식의 범위를 새 행까지 넓힘
  const t = r + 1;
  const G = '$G$' + first + ':$G$' + r, D = '$D$' + first + ':$D$' + r, E = '$E$' + first + ':$E$' + r;
  sh.getRange(t, 7).setFormula('=SUM(G' + first + ':G' + r + ')');
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

  props.setProperty('id_' + id, String(r));
  return { ok: true, row: r };
}

function out(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}
