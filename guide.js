/* 하하커플 4주년 일본여행 — 가이드 메뉴(교통·예산·Wallet·예약·비상 대응)
 * 내용은 guide-data.js(window.GUIDE_DATA)에 있고, 이 파일은 화면 전환·렌더링·예산 장부만 담당한다.
 */
(function () {
  "use strict";

  var VIEWS = ["transport", "budget", "wallet", "tickets", "food", "emergency"];
  var LEDGER_KEY = "haha-trip-ledger-v7";
  var SHEET_KEY = "haha-trip-sheet-v1";
  var CHECK_KEY = "haha-trip-checklist-v1";
  var G = window.GUIDE_DATA || { views: {}, budget: null };

  function $(id) { return document.getElementById(id); }
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function safeUrl(u) { u = String(u || ""); return /^https?:\/\//i.test(u) ? u : "#"; }
  function clone(o) { return JSON.parse(JSON.stringify(o)); }
  function sget(k) { try { return window.localStorage.getItem(k); } catch (e) { return null; } }
  function sset(k, v) { try { window.localStorage.setItem(k, v); } catch (e) { /* ignore */ } }

  /* 간단 표기: **굵게**, [확인 필요]/[확정]/[예약 완료]/[계획]/[미지원]/[지원]/[주의] 태그, 줄바꿈 \n */
  var TAGS = {
    "확인 필요": "warn", "확정": "st-course", "예약 완료": "st-booked", "계획": "st-transit",
    "미지원": "bad", "지원": "good", "주의": "warn", "미예약": "warn", "고정": "st-fixed", "선택": "st-optional",
    "공식": "src-official", "2차 출처": "src-secondary"
  };
  function fmt(t) {
    var h = esc(t);
    h = h.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
    h = h.replace(/\[([^\]]{1,12})\]/g, function (m, k) {
      return TAGS[k] ? '<span class="chip ' + TAGS[k] + '">' + k + "</span>" : m;
    });
    h = h.replace(/\n/g, "<br>");
    return h;
  }

  /* ---------- view switching ---------- */
  function currentView() {
    var v = location.hash.replace(/^#/, "").split("/")[0];
    return VIEWS.indexOf(v) !== -1 ? v : "map";
  }
  function showView() {
    var v = currentView();
    var isMap = v === "map";
    $("map-view").hidden = !isMap;
    $("day-tabs").hidden = !isMap;
    $("guide-view").hidden = isMap;
    document.body.classList.toggle("is-guide", !isMap);
    Array.prototype.forEach.call(document.querySelectorAll("#view-nav [data-view]"), function (a) {
      if (a.getAttribute("data-view") === v) a.setAttribute("aria-current", "page");
      else a.removeAttribute("aria-current");
    });
    if (isMap) {
      setTimeout(function () { if (window.__tripViewer) window.__tripViewer.refresh(); }, 30);
    } else {
      renderView(v);
      window.scrollTo(0, 0);
      $("guide-view").scrollTop = 0;
    }
  }

  /* ---------- generic blocks ---------- */
  function block(b) {
    switch (b.type) {
      case "p": return "<p>" + fmt(b.text) + "</p>";
      case "callout":
        return '<div class="callout ' + esc(b.tone || "info") + '">' + (b.title ? "<strong>" + fmt(b.title) + "</strong>" : "") +
          (b.text ? "<p>" + fmt(b.text) + "</p>" : "") +
          (b.items ? "<ul>" + b.items.map(function (i) { return "<li>" + fmt(i) + "</li>"; }).join("") + "</ul>" : "") + "</div>";
      case "list":
        return "<ul class=\"g-list\">" + b.items.map(function (i) { return "<li>" + fmt(i) + "</li>"; }).join("") + "</ul>";
      case "steps":
        return (b.title ? '<h4 class="g-sub">' + fmt(b.title) + "</h4>" : "") +
          '<ol class="g-steps">' + b.items.map(function (i) { return "<li>" + fmt(i) + "</li>"; }).join("") + "</ol>";
      case "kv":
        return '<dl class="g-kv">' + b.items.map(function (r) { return "<dt>" + fmt(r[0]) + "</dt><dd>" + fmt(r[1]) + "</dd>"; }).join("") + "</dl>";
      case "table":
        return (b.title ? '<h4 class="g-sub">' + fmt(b.title) + "</h4>" : "") +
          '<div class="g-table-wrap"><table class="g-table"><thead><tr>' + b.head.map(function (c) { return "<th>" + fmt(c) + "</th>"; }).join("") +
          "</tr></thead><tbody>" + b.rows.map(function (r) {
            return "<tr>" + r.map(function (c, i) { return '<td data-label="' + esc(b.head[i] || "") + '">' + fmt(c) + "</td>"; }).join("") + "</tr>";
          }).join("") + "</tbody></table></div>" + (b.note ? '<p class="g-note">' + fmt(b.note) + "</p>" : "");
      case "segment":
        return segment(b);
      case "checklist":
        return checklist(b);
      case "places":
        return (b.title ? '<h4 class="g-sub">' + fmt(b.title) + "</h4>" : "") + '<ul class="g-places">' + b.items.map(function (it) {
          var url = "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(it.query || it.name);
          return '<li><a href="' + esc(url) + '" target="_blank" rel="noopener noreferrer" class="g-place-name">' + esc(it.name) + ' ↗</a>' +
            '<span class="g-place-meta">' + esc(it.menu) + " · " + esc(it.price) + " / 1인</span></li>";
        }).join("") + "</ul>";
      case "sources":
        return '<div class="g-sources"><strong>출처</strong>' + (b.checked ? ' <small>확인일 ' + esc(b.checked) + "</small>" : "") +
          "<ul>" + b.items.map(function (s) {
            return '<li><a href="' + esc(safeUrl(s.url)) + '" target="_blank" rel="noopener">' + esc(s.title) + "</a>" +
              (s.kind ? ' <span class="chip ' + (s.kind === "공식" ? "src-official" : "src-secondary") + '">' + esc(s.kind) + "</span>" : "") + "</li>";
          }).join("") + "</ul></div>";
      default: return "";
    }
  }

  function segment(b) {
    var h = '<article class="seg"><header class="seg-head"><span class="seg-date">' + esc(b.date) + "</span><h4>" + fmt(b.title) + "</h4>" +
      (b.status ? '<span class="chip ' + (TAGS[b.status] || "st-transit") + '">' + esc(b.status) + "</span>" : "") + "</header>";
    if (b.summary) h += '<p class="seg-sum">' + fmt(b.summary) + "</p>";
    if (b.rows) h += '<dl class="g-kv">' + b.rows.map(function (r) { return "<dt>" + fmt(r[0]) + "</dt><dd>" + fmt(r[1]) + "</dd>"; }).join("") + "</dl>";
    if (b.options) {
      h += '<div class="g-table-wrap"><table class="g-table"><thead><tr><th>경로</th><th>1인</th><th>2인</th><th>소요</th><th>비고</th></tr></thead><tbody>' +
        b.options.map(function (o) {
          return '<tr><td data-label="경로">' + fmt(o[0]) + '</td><td data-label="1인">' + fmt(o[1]) + '</td><td data-label="2인">' + fmt(o[2]) +
            '</td><td data-label="소요">' + fmt(o[3]) + '</td><td data-label="비고">' + fmt(o[4] || "") + "</td></tr>";
        }).join("") + "</tbody></table></div>";
    }
    if (b.fallback) h += '<p class="seg-fb"><strong>대체 경로</strong> ' + fmt(b.fallback) + "</p>";
    return h + "</article>";
  }

  function checklist(b) {
    var saved = {};
    try { saved = JSON.parse(sget(CHECK_KEY) || "{}"); } catch (e) { saved = {}; }
    return (b.title ? '<h4 class="g-sub">' + fmt(b.title) + "</h4>" : "") + '<ul class="g-check">' + b.items.map(function (it, i) {
      var id = b.id + "-" + i;
      return '<li><label><input type="checkbox" data-check="' + esc(id) + '"' + (saved[id] ? " checked" : "") + "> <span>" + fmt(it) + "</span></label></li>";
    }).join("") + "</ul>";
  }

  function renderView(v) {
    var el = $("guide-view");
    if (v === "budget") { el.innerHTML = renderBudget(); updateBudget(); return; }
    var d = G.views[v];
    if (!d) { el.innerHTML = "<p>내용이 없습니다.</p>"; return; }
    var h = '<div class="g-inner"><header class="g-head"><h2>' + fmt(d.title) + "</h2>" + (d.intro ? "<p>" + fmt(d.intro) + "</p>" : "") +
      (G.checked && !d.noMeta ? '<p class="g-meta">정보 확인일 ' + esc(G.checked) + " · 출처는 각 항목 아래</p>" : "") + "</header>";
    if (d.sections && d.sections.length > 2) {
      h += '<nav class="g-toc" aria-label="목차">' + d.sections.map(function (s, i) {
        return '<a href="#' + v + "/s" + i + '" data-toc="s' + i + '">' + esc(s.h) + "</a>";
      }).join("") + "</nav>";
    }
    h += (d.sections || []).map(function (s, i) {
      return '<section class="g-sec" id="g-' + v + "-s" + i + '"><h3>' + fmt(s.h) + "</h3>" + (s.blocks || []).map(block).join("") + "</section>";
    }).join("");
    el.innerHTML = h + "</div>";
    var sub = location.hash.split("/")[1];
    if (sub) { var t = $("g-" + v + "-" + sub); if (t) setTimeout(function () { t.scrollIntoView({ block: "start" }); }, 0); }
  }

  /* ---------- budget ledger ---------- */
  var ledger = null;
  function defaultLedger() {
    var b = G.budget || {};
    return {
      totalKRW: b.totalKRW || 700000,
      krwPer100Yen: typeof b.krwPer100Yen === "number" ? b.krwPer100Yen : null,
      categories: clone(b.categories || []),
      expenses: clone(b.paid || [])
    };
  }
  function loadLedger() {
    ledger = defaultLedger();
    var raw = sget(LEDGER_KEY);
    if (raw) { try { mergeLedger(JSON.parse(raw)); } catch (e) { /* ignore */ } }
  }
  function mergeLedger(x) {
    if (!x || typeof x !== "object") return;
    if (typeof x.totalKRW === "number" && x.totalKRW > 0) ledger.totalKRW = x.totalKRW;
    if (typeof x.krwPer100Yen === "number" && x.krwPer100Yen > 0) ledger.krwPer100Yen = x.krwPer100Yen;
    if (Array.isArray(x.categories)) {
      x.categories.forEach(function (c) {
        var hit = ledger.categories.filter(function (k) { return k.id === c.id; })[0];
        if (hit) { if (typeof c.planKRW === "number") hit.planKRW = c.planKRW; }
        else if (c.id && c.label) ledger.categories.push({ id: String(c.id), label: String(c.label), planKRW: +c.planKRW || 0 });
      });
    }
    if (Array.isArray(x.expenses)) {
      ledger.expenses = x.expenses.filter(function (e) { return e && typeof e.amount === "number"; }).map(function (e) {
        return {
          id: String(e.id || Math.random().toString(36).slice(2)), day: String(e.day || ""), cat: String(e.cat || ""),
          desc: String(e.desc || ""), amount: +e.amount, currency: e.currency === "KRW" ? "KRW" : "JPY",
          method: String(e.method || ""), split: e.split === "1인" ? "1인" : "2인",
          payer: typeof e.payer === "string" ? e.payer : "",
          jpy: typeof e.jpy === "number" ? e.jpy : null, date: typeof e.date === "string" ? e.date : "", viaImage: !!e.viaImage,
          sync: e.sync === "sent" || /^paid-/.test(String(e.id || "")) ? "sent" : (e.sync === "fail" ? "fail" : "")
        };
      });
    }
  }
  function saveLedger() { sset(LEDGER_KEY, JSON.stringify(ledger)); }

  /* ---------- 구글 시트 연동 ---------- */
  function sheetCfg() { try { var c = JSON.parse(sget(SHEET_KEY) || "null"); return c && c.url && c.token ? c : null; } catch (e) { return null; } }
  function tripDay() {
    var d = new Date(Date.now() + 9 * 3600 * 1000).toISOString().slice(0, 10); // 일본/한국 시간 날짜
    return { "2026-11-14": "DAY 1", "2026-11-15": "DAY 2", "2026-11-16": "DAY 3" }[d] || (d < "2026-11-14" ? "출국 전" : "DAY 3");
  }
  function guessCat(t) {
    t = String(t || "");
    var rules = [["stay", /숙소|숙박|호텔|료칸|온천세|입탕세/], ["transport", /교통|전철|지하철|열차|기차|버스|택시|로망스카|스이카|suica|pasmo|패스|케이블|로프웨이|게이세이|jr/i],
      ["donki", /돈키|돈키호테|면세|쇼핑/], ["food", /식|밥|점심|저녁|아침|간식|카페|커피|맥주|술|라멘|스시|초밥|편의점|도시락|빵|디저트/]];
    for (var i = 0; i < rules.length; i++) if (rules[i][1].test(t) && ledger.categories.some(function (c) { return c.id === rules[i][0]; })) return rules[i][0];
    return ledger.categories.some(function (c) { return c.id === "etc"; }) ? "etc" : (ledger.categories[0] || {}).id || "";
  }
  function sheetDay(d) { var m = /^DAY (\d)$/.exec(d || ""); return m ? m[1] + "일차" : (d || ""); }
  function setSheetStatus(msg, bad) { var el = $("lg-sheet-status"); if (el) { el.textContent = msg; el.className = "g-note" + (bad ? " neg" : ""); } }
  function post(cfg, body) {
    body.token = cfg.token;
    return fetch(cfg.url, { method: "POST", body: JSON.stringify(body) }) // text/plain → 사전요청 없음
      .then(function (r) { return r.json(); });
  }
  function sendEntry(e) {
    var cfg = sheetCfg();
    if (!cfg) return Promise.resolve(false);
    var k = toKRW(e);
    var catLabel = (ledger.categories.filter(function (c) { return c.id === e.cat; })[0] || {}).label || e.cat;
    e.sync = "sending"; updateBudget();
    return post(cfg, { action: "add", entry: {
      id: e.id, day: sheetDay(e.day), cat: catLabel, desc: e.desc, payer: e.payer, split: e.split,
      method: e.method || "", krw: k == null ? 0 : Math.round(k), jpy: e.currency === "JPY" ? e.amount : (e.jpy || ""), memo: e.viaImage ? "캡처 입력" + (e.date ? " · " + e.date : "") : "뷰어 입력"
    } }).then(function (res) {
      e.sync = res && res.ok ? "sent" : "fail";
      if (!(res && res.ok)) setSheetStatus("시트 추가 실패: " + ((res && res.error) || "응답 없음"), true);
      else setSheetStatus("시트에 추가했습니다" + (res.duplicate ? " (이미 있던 항목)" : "") + ".");
      return e.sync === "sent";
    }).catch(function () {
      e.sync = "fail"; setSheetStatus("시트에 보내지 못했습니다(인터넷 연결 또는 웹 앱 주소 확인). '안 보낸 지출 보내기'로 다시 보낼 수 있어요.", true);
      return false;
    }).then(function (ok) { saveLedger(); updateBudget(); return ok; });
  }
  function sendPending() {
    var list = ledger.expenses.filter(function (e) { return e.sync !== "sent"; });
    if (!sheetCfg()) { setSheetStatus("먼저 웹 앱 주소와 비밀 코드를 저장하세요.", true); return; }
    if (!list.length) { setSheetStatus("보낼 지출이 없습니다."); return; }
    list.reduce(function (p, e) { return p.then(function () { return sendEntry(e); }); }, Promise.resolve());
  }
  function toKRW(e) {
    if (e.currency === "KRW") return e.amount;
    return typeof ledger.krwPer100Yen === "number" ? e.amount * ledger.krwPer100Yen / 100 : null;
  }
  function won(n) { return n == null ? "–" : Math.round(n).toLocaleString("ko-KR") + "원"; }
  function yen(n) { return Math.round(n).toLocaleString("ko-KR") + "엔"; }

  function people() { return (G.budget && G.budget.people) || ["하이민", "하보"]; }
  function payerSelect(attr, val) {
    return '<select ' + attr + ' aria-label="결제자"><option value="">미지정</option>' + people().map(function (p) {
      return '<option' + (p === val ? " selected" : "") + ">" + esc(p) + "</option>";
    }).join("") + "</select>";
  }

  function capMsg(t, bad) { var el = $("lg-cap-msg"); if (el) { el.textContent = t; el.className = "g-note" + (bad ? " neg" : ""); } }
  function shrink(file) {
    return new Promise(function (res, rej) {
      var img = new Image(), url = URL.createObjectURL(file);
      img.onload = function () {
        var m = 1400, w = img.naturalWidth, h = img.naturalHeight, k = Math.min(1, m / Math.max(w, h));
        var c = document.createElement("canvas"); c.width = Math.round(w * k); c.height = Math.round(h * k);
        c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
        URL.revokeObjectURL(url);
        res(c.toDataURL("image/jpeg", 0.85).split(",")[1]);
      };
      img.onerror = function () { URL.revokeObjectURL(url); rej(new Error("이미지를 열지 못했습니다")); };
      img.src = url;
    });
  }
  function dayOf(date) { return { "2026-11-14": "DAY 1", "2026-11-15": "DAY 2", "2026-11-16": "DAY 3" }[date] || (date && date < "2026-11-14" ? "출국 전" : ""); }
  function readCapture(file) {
    var cfg = sheetCfg(), f = $("lg-form");
    if (!cfg) { capMsg("먼저 아래 '구글 시트 연동'에 웹 앱 주소와 비밀 코드를 저장하세요.", true); return; }
    capMsg("캡처를 읽는 중… (5~15초)");
    shrink(file).then(function (b64) {
      return post(cfg, { action: "extract", image: b64, mime: "image/jpeg" });
    }).then(function (res) {
      if (!res || !res.ok) throw new Error((res && res.error) || "응답 없음");
      var r = res.result || {}, rate = ledger.krwPer100Yen;
      var krw = typeof r.krw === "number" && r.krw > 0 ? r.krw : (typeof r.jpy === "number" && rate ? r.jpy * rate / 100 : null);
      if (r.desc) f.desc.value = r.desc;
      if (krw) f.amount.value = Math.round(krw);
      f.dataset.jpy = typeof r.jpy === "number" ? r.jpy : "";
      f.dataset.date = r.date || "";
      f.dataset.cat = ledger.categories.some(function (c) { return c.id === r.cat; }) ? r.cat : "";
      f.dataset.cap = "1";
      capMsg("읽은 내용: " + (r.desc || "사용처 모름") + " · " + (r.krw ? Math.round(r.krw).toLocaleString("ko-KR") + "원" : "") +
        (r.jpy ? (r.krw ? " / " : "") + Math.round(r.jpy).toLocaleString("ko-KR") + "엔" + (r.krw ? "" : " → " + won(krw) + " (환율 " + rate + ")") : "") +
        (r.date ? " · " + r.date : "") + " — 맞으면 '추가'를 누르세요." + (krw ? "" : " 금액을 읽지 못했어요. 직접 넣어 주세요."), !krw);
      f.amount.focus();
    }).catch(function (err) { capMsg("캡처를 읽지 못했습니다: " + err.message + " — 직접 입력해 주세요.", true); });
  }

  function renderBudget() {
    var b = G.budget || {};
    var methods = b.methods || ["SOL트래블 실물 카드", "Apple Pay", "Suica/PASMO", "현금(엔)", "기타"];
    var days = ["출국 전", "DAY 1", "DAY 2", "DAY 3"];
    var h = '<div class="g-inner"><header class="g-head"><h2>여행 예산표 · 2인 합산 ' + won(ledger.totalKRW) + "</h2>" +
      "<p>" + fmt(b.intro || "") + "</p></header>";
    h += '<section class="g-sec"><h3>환율</h3><div class="budget-rate"><label for="lg-rate">100엔 =</label>' +
      '<input id="lg-rate" type="number" inputmode="decimal" min="0" step="0.01" value="' + (ledger.krwPer100Yen || "") + '" placeholder="직접 입력"><span>원</span></div>' +
      (b.rateNote ? '<p class="g-note">' + fmt(b.rateNote) + "</p>" : "") + "</section>";
    h += '<section class="g-sec"><h3>항목별 계획 · 실제 · 잔여</h3><div class="g-table-wrap"><table class="g-table keep lg-cats"><thead><tr><th>항목</th><th>계획(원)</th><th>실제 지출(원 환산)</th><th>남은 예산</th></tr></thead><tbody id="lg-cat-body"></tbody>' +
      '<tfoot><tr><th>합계</th><td id="lg-plan-sum"></td><td id="lg-act-sum"></td><td id="lg-rem-sum"></td></tr></tfoot></table></div>' +
      '<p class="g-note" id="lg-plan-check"></p>' + (b.planNote ? '<p class="g-note">' + fmt(b.planNote) + "</p>" : "") + "</section>";
    var cfg = sheetCfg();
    h += '<section class="g-sec"><h3>지출 입력</h3>' +
      '<div class="lg-cap"><label class="btn primary lg-cap-btn">📷 결제 캡처로 입력<input type="file" id="lg-cap" accept="image/*" hidden></label>' +
      '<span class="g-note" id="lg-cap-msg">결제자를 고르고 카드 결제 알림·영수증 캡처를 올리면 내용과 금액을 채워 드려요. 확인 후 \'추가\'를 누르세요.</span></div>' +
      '<form id="lg-form" class="lg-form" autocomplete="off">' +
      '<label>결제자' + payerSelect('name="payer" required', people()[0]) + "</label>" +
      '<label class="wide">내용 / 사용처<input name="desc" list="lg-items" placeholder="예: 저녁 · 스이카 충전 · 돈키호테" required></label>' +
      '<datalist id="lg-items"><option>점심</option><option>저녁</option><option>간식·카페</option><option>편의점</option><option>교통</option><option>스이카 충전</option><option>돈키호테</option><option>기념품</option></datalist>' +
      '<label>결제금액(원)<input name="amount" type="number" inputmode="numeric" min="0" step="1" required></label>' +
      '<button type="submit" class="btn primary">추가</button></form>' +
      '<p class="g-note">날짜는 오늘 기준(11/14 → DAY 1)으로, 예산 항목은 입력한 단어로 자동 분류하고, 둘이 나눠 내는 2인 항목으로 저장합니다. 1인 항목은 아래 내역에서 바꿀 수 있어요.' +
      (cfg ? " 추가하면 구글 시트에도 바로 들어갑니다." : " 구글 시트 연동은 아래에서 설정하세요.") + "</p></section>";
    h += '<section class="g-sec"><h3>지출 내역</h3><div class="g-table-wrap"><table class="g-table"><thead><tr><th>날짜</th><th>항목</th><th>내용</th><th>엔화</th><th>원화 환산</th><th>결제수단</th><th>1인/2인</th><th>결제자</th><th>시트</th><th></th></tr></thead><tbody id="lg-exp-body"></tbody></table></div></section>';
    h += '<section class="g-sec"><h3>구글 시트 연동</h3><form id="lg-sheet" class="lg-form" autocomplete="off">' +
      '<label class="wide">웹 앱 주소<input name="url" type="url" placeholder="https://script.google.com/macros/s/…/exec" value="' + esc(cfg ? cfg.url : "") + '"></label>' +
      '<label>비밀 코드<input name="token" type="password" value="' + esc(cfg ? cfg.token : "") + '"></label>' +
      '<button type="submit" class="btn primary">저장 · 연결 확인</button>' +
      '<button type="button" class="btn" id="lg-sync-all">안 보낸 지출 보내기</button>' +
      '<button type="button" class="btn" id="lg-sheet-off">연동 끄기</button></form>' +
      '<p id="lg-sheet-status" class="g-note">' + (cfg ? "연동됨 · 이 기기에만 저장되어 있습니다." : "연동 안 됨") + '</p>' +
      '<p class="g-note">주소와 비밀 코드는 이 폰의 브라우저에만 저장되고 사이트에는 올라가지 않습니다. 뷰어에서 삭제하거나 결제자를 바꿔도 시트에는 반영되지 않으니 시트에서 직접 고쳐 주세요.</p></section>';
    h += '<section class="g-sec"><h3>사람별 결제 · 정산</h3><div id="lg-people"></div>' +
      '<p class="g-note">2인 항목은 반씩 나눠 부담하고, 1인 항목은 결제한 사람 몫으로 계산합니다. 결제자가 \'미지정\'인 항목은 정산에서 빠집니다.</p></section>';
    if (b.estimates) h += '<section class="g-sec"><h3>' + fmt(b.estimates.title) + "</h3>" + b.estimates.blocks.map(block).join("") + "</section>";
    return h + "</div>";
  }

  function updateBudget() {
    var body = $("lg-cat-body");
    if (!body) return;
    var actual = {}, unknown = 0;
    ledger.expenses.forEach(function (e) {
      var k = toKRW(e);
      if (k == null) { unknown++; return; }
      actual[e.cat] = (actual[e.cat] || 0) + k;
    });
    var planSum = 0, actSum = 0;
    body.innerHTML = ledger.categories.map(function (c) {
      var a = actual[c.id] || 0, rem = c.planKRW - a;
      planSum += c.planKRW; actSum += a;
      return '<tr><td data-label="항목">' + esc(c.label) + '</td><td data-label="계획(원)"><input type="number" inputmode="numeric" min="0" step="1000" data-plan="' + esc(c.id) + '" value="' + c.planKRW + '"></td>' +
        '<td data-label="실제 지출">' + won(a) + '</td><td data-label="남은 예산" class="' + (rem < 0 ? "neg" : "pos") + '">' + won(rem) + "</td></tr>";
    }).join("");
    $("lg-plan-sum").textContent = won(planSum);
    $("lg-act-sum").textContent = won(actSum);
    var rem = ledger.totalKRW - actSum;
    $("lg-rem-sum").innerHTML = '<span class="' + (rem < 0 ? "neg" : "pos") + '">' + won(rem) + "</span> (총예산 기준)";
    var diff = ledger.totalKRW - planSum;
    $("lg-plan-check").innerHTML = (diff === 0 ? "계획 합계가 총예산과 같습니다." :
      diff > 0 ? "계획 합계가 총예산보다 " + won(diff) + " 적습니다(미배정)." : '<span class="neg">계획 합계가 총예산보다 ' + won(-diff) + " 많습니다.</span>") +
      (unknown ? ' · <span class="neg">환율이 없어 원화로 환산하지 못한 엔화 지출 ' + unknown + "건</span>" : "");
    var catLabel = {};
    ledger.categories.forEach(function (c) { catLabel[c.id] = c.label; });
    $("lg-exp-body").innerHTML = ledger.expenses.length ? ledger.expenses.map(function (e) {
      var k = toKRW(e);
      return '<tr><td data-label="날짜">' + esc(e.day) + '</td><td data-label="항목">' + esc(catLabel[e.cat] || e.cat) + '</td><td data-label="내용">' + esc(e.desc) +
        '</td><td data-label="엔화">' + (e.currency === "JPY" ? yen(e.amount) : "–") + '</td><td data-label="원화 환산">' + won(k) +
        '</td><td data-label="결제수단">' + esc(e.method || "–") + '</td><td data-label="1인/2인"><select data-split="' + esc(e.id) + '" aria-label="1인/2인"><option' + (e.split === "2인" ? " selected" : "") + '>2인</option><option' + (e.split === "1인" ? " selected" : "") + '>1인</option></select>' +
        '</td><td data-label="결제자">' + payerSelect('data-payer="' + esc(e.id) + '"', e.payer) +
        '</td><td data-label="시트">' + (e.sync === "sent" ? "✓" : e.sync === "sending" ? "보내는 중" : e.sync === "fail" ? '<button type="button" class="btn sm" data-resend="' + esc(e.id) + '">다시 보내기</button>' : "–") +
        '</td><td><button type="button" class="btn sm" data-del="' + esc(e.id) + '" aria-label="삭제">삭제</button></td></tr>';
    }).join("") : '<tr><td colspan="10" class="g-note">아직 입력한 지출이 없습니다.</td></tr>';
    renderPeople();
  }

  function renderPeople() {
    var el = $("lg-people");
    if (!el) return;
    var ps = people();
    var stat = {}, unassigned = 0, unassignedKRW = 0, noRate = 0;
    ps.forEach(function (p) { stat[p] = { n: 0, paid: 0, share: 0 }; });
    ledger.expenses.forEach(function (e) {
      var k = toKRW(e);
      if (k == null) { noRate++; return; }
      if (!e.payer || !stat[e.payer]) { unassigned++; unassignedKRW += k; return; }
      stat[e.payer].n++; stat[e.payer].paid += k;
      if (e.split === "1인") stat[e.payer].share += k;
      else ps.forEach(function (p) { stat[p].share += k / ps.length; });
    });
    var h = '<div class="g-table-wrap"><table class="g-table"><thead><tr><th>사람</th><th>결제 건수</th><th>결제한 금액</th><th>부담할 금액</th><th>차액</th></tr></thead><tbody>' +
      ps.map(function (p) {
        var s = stat[p], d = s.paid - s.share;
        return '<tr><td data-label="사람">' + esc(p) + '</td><td data-label="결제 건수">' + s.n + '건</td><td data-label="결제한 금액">' + won(s.paid) + '</td><td data-label="부담할 금액">' + won(s.share) + '</td><td data-label="차액" class="' + (d < 0 ? "neg" : "pos") + '">' + (d >= 0 ? "+" : "") + won(d) + "</td></tr>";
      }).join("") + "</tbody></table></div>";
    if (ps.length === 2) {
      var a = ps[0], b = ps[1], diff = stat[a].paid - stat[a].share;
      h += '<div class="budget-total">' + (Math.round(diff) === 0 ? "정산할 금액이 없습니다." :
        diff > 0 ? "<strong>" + esc(b) + " → " + esc(a) + " " + won(diff) + "</strong> 보내면 정산 끝" :
        "<strong>" + esc(a) + " → " + esc(b) + " " + won(-diff) + "</strong> 보내면 정산 끝") + "</div>";
    }
    if (unassigned) h += '<p class="g-note neg">결제자 미지정 ' + unassigned + "건(" + won(unassignedKRW) + ")은 정산에서 빠져 있습니다. 지출 내역에서 결제자를 골라 주세요.</p>";
    if (noRate) h += '<p class="g-note neg">환율이 없어 계산하지 못한 엔화 지출 ' + noRate + "건</p>";
    el.innerHTML = h;
  }

  /* ---------- events ---------- */
  function bind() {
    window.addEventListener("hashchange", showView);
    var gv = $("guide-view");
    gv.addEventListener("click", function (e) {
      var t = e.target.closest("[data-toc]");
      if (t) {
        e.preventDefault();
        var target = $("g-" + currentView() + "-" + t.getAttribute("data-toc"));
        if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
        return;
      }
      var rs = e.target.closest("[data-resend]");
      if (rs) { var rid = rs.getAttribute("data-resend"); ledger.expenses.forEach(function (x) { if (x.id === rid) sendEntry(x); }); return; }
      if (e.target.id === "lg-sync-all") { sendPending(); return; }
      if (e.target.id === "lg-sheet-off") { try { localStorage.removeItem(SHEET_KEY); } catch (er) { /* ignore */ } renderView("budget"); return; }
      var d = e.target.closest("[data-del]");
      if (d) {
        var id = d.getAttribute("data-del");
        ledger.expenses = ledger.expenses.filter(function (x) { return x.id !== id; });
        saveLedger(); updateBudget();
      }
    });
    gv.addEventListener("change", function (e) {
      if (e.target.id === "lg-cap") { var fl = e.target.files && e.target.files[0]; if (fl) readCapture(fl); e.target.value = ""; return; }
      var sid = e.target.getAttribute("data-split");
      if (sid) { ledger.expenses.forEach(function (x) { if (x.id === sid) x.split = e.target.value; }); saveLedger(); renderPeople(); return; }
      var pid = e.target.getAttribute("data-payer");
      if (pid) {
        ledger.expenses.forEach(function (x) { if (x.id === pid) x.payer = e.target.value; });
        saveLedger(); renderPeople();
        return;
      }
      var c = e.target.getAttribute("data-check");
      if (c) {
        var saved = {};
        try { saved = JSON.parse(sget(CHECK_KEY) || "{}"); } catch (er) { saved = {}; }
        saved[c] = e.target.checked;
        sset(CHECK_KEY, JSON.stringify(saved));
      }
    });
    gv.addEventListener("input", function (e) {
      if (e.target.id === "lg-rate") {
        var v = parseFloat(e.target.value);
        ledger.krwPer100Yen = isFinite(v) && v > 0 ? v : null;
        saveLedger(); updateBudget();
      } else if (e.target.hasAttribute("data-plan")) {
        var id = e.target.getAttribute("data-plan"), n = parseFloat(e.target.value);
        ledger.categories.forEach(function (c) { if (c.id === id) c.planKRW = isFinite(n) && n >= 0 ? n : 0; });
        saveLedger();
        // 입력 중 포커스를 잃지 않도록 합계만 갱신
        var focused = document.activeElement && document.activeElement.getAttribute("data-plan");
        updateBudget();
        if (focused) { var el = document.querySelector('[data-plan="' + focused + '"]'); if (el) { el.focus(); var l = el.value.length; try { el.setSelectionRange(l, l); } catch (er) { /* number inputs */ } } }
      }
    });
    gv.addEventListener("submit", function (e) {
      var f = e.target;
      if (f.id === "lg-sheet") {
        e.preventDefault();
        var cfg = { url: f.url.value.trim(), token: f.token.value };
        if (!/^https:\/\/script\.google(usercontent)?\.com\//.test(cfg.url) || !cfg.token) { setSheetStatus("script.google.com 으로 시작하는 웹 앱 주소와 비밀 코드를 모두 넣어 주세요.", true); return; }
        setSheetStatus("연결 확인 중…");
        post(cfg, { action: "ping" }).then(function (res) {
          if (res && res.ok) { sset(SHEET_KEY, JSON.stringify(cfg)); setSheetStatus("연결됐습니다. 이제 지출을 추가하면 시트에도 들어갑니다."); }
          else setSheetStatus("연결 실패: " + ((res && res.error) || "응답 없음"), true);
        }).catch(function () { setSheetStatus("연결 실패: 주소를 확인하고, 배포 시 액세스 권한이 '모든 사용자'인지 확인하세요.", true); });
        return;
      }
      if (f.id !== "lg-form") return;
      e.preventDefault();
      var amt = parseFloat(f.amount.value);
      if (!isFinite(amt) || amt <= 0) return;
      var desc = f.desc.value.trim();
      var x = {
        id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
        day: tripDay(), cat: guessCat(desc), desc: desc, amount: Math.round(amt),
        currency: "KRW", method: "", split: "2인", payer: f.payer.value, sync: ""
      };
      if (f.dataset.cap === "1") {
        x.viaImage = true;
        if (f.dataset.jpy) x.jpy = +f.dataset.jpy;
        if (f.dataset.date) { x.date = f.dataset.date; x.day = dayOf(f.dataset.date) || x.day; }
        if (f.dataset.cat) x.cat = f.dataset.cat;
      }
      f.dataset.cap = ""; f.dataset.jpy = ""; f.dataset.date = ""; f.dataset.cat = "";
      ledger.expenses.push(x);
      saveLedger(); updateBudget();
      f.desc.value = ""; f.amount.value = "";
      sendEntry(x);
    });
  }

  window.TripGuide = {
    isView: function (v) { return VIEWS.indexOf(v) !== -1; },
    getLedger: function () { return clone(ledger); },
    setLedger: function (x) { ledger = defaultLedger(); mergeLedger(x); saveLedger(); if (currentView() === "budget") renderView("budget"); }
  };

  function boot() {
    loadLedger();
    bind();
    showView();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
