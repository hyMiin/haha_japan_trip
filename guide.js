/* 하하커플 4주년 일본여행 — 가이드 메뉴(교통·예산·Wallet·예약·비상 대응)
 * 내용은 guide-data.js(window.GUIDE_DATA)에 있고, 이 파일은 화면 전환·렌더링·예산 장부만 담당한다.
 */
(function () {
  "use strict";

  var VIEWS = ["transport", "budget", "wallet", "tickets", "food", "emergency"];
  var LEDGER_KEY = "haha-trip-ledger-v7";
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
          payer: typeof e.payer === "string" ? e.payer : ""
        };
      });
    }
  }
  function saveLedger() { sset(LEDGER_KEY, JSON.stringify(ledger)); }
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
    h += '<section class="g-sec"><h3>지출 입력</h3><form id="lg-form" class="lg-form" autocomplete="off">' +
      '<label>날짜<select name="day">' + days.map(function (d) { return "<option>" + d + "</option>"; }).join("") + "</select></label>" +
      '<label>항목<select name="cat">' + ledger.categories.map(function (c) { return '<option value="' + esc(c.id) + '">' + esc(c.label) + "</option>"; }).join("") + "</select></label>" +
      '<label class="wide">내용<input name="desc" placeholder="예: 로망스카 특급권 2인"></label>' +
      '<label>금액<input name="amount" type="number" inputmode="decimal" min="0" step="1" required></label>' +
      '<label>통화<select name="currency"><option value="JPY">엔</option><option value="KRW">원</option></select></label>' +
      '<label>결제수단<select name="method">' + methods.map(function (m) { return "<option>" + esc(m) + "</option>"; }).join("") + "</select></label>" +
      '<label>구분<select name="split"><option>2인</option><option>1인</option></select></label>' +
      '<label>결제자' + payerSelect('name="payer"', "") + "</label>" +
      '<button type="submit" class="btn primary">추가</button></form></section>';
    h += '<section class="g-sec"><h3>지출 내역</h3><div class="g-table-wrap"><table class="g-table"><thead><tr><th>날짜</th><th>항목</th><th>내용</th><th>엔화</th><th>원화 환산</th><th>결제수단</th><th>1인/2인</th><th>결제자</th><th></th></tr></thead><tbody id="lg-exp-body"></tbody></table></div></section>';
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
        '</td><td data-label="결제수단">' + esc(e.method) + '</td><td data-label="1인/2인">' + esc(e.split) +
        '</td><td data-label="결제자">' + payerSelect('data-payer="' + esc(e.id) + '"', e.payer) +
        '</td><td><button type="button" class="btn sm" data-del="' + esc(e.id) + '" aria-label="삭제">삭제</button></td></tr>';
    }).join("") : '<tr><td colspan="9" class="g-note">아직 입력한 지출이 없습니다.</td></tr>';
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
      var d = e.target.closest("[data-del]");
      if (d) {
        var id = d.getAttribute("data-del");
        ledger.expenses = ledger.expenses.filter(function (x) { return x.id !== id; });
        saveLedger(); updateBudget();
      }
    });
    gv.addEventListener("change", function (e) {
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
      if (e.target.id !== "lg-form") return;
      e.preventDefault();
      var f = e.target;
      var amt = parseFloat(f.amount.value);
      if (!isFinite(amt) || amt < 0) return;
      ledger.expenses.push({
        id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
        day: f.day.value, cat: f.cat.value, desc: f.desc.value.trim(), amount: amt,
        currency: f.currency.value, method: f.method.value, split: f.split.value, payer: f.payer.value
      });
      saveLedger(); updateBudget();
      f.desc.value = ""; f.amount.value = "";
      f.amount.focus();
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
