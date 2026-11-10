/* 하하커플 4주년 일본여행 — 일정 지도 뷰어
 * 정적 사이트 · OpenStreetMap 타일 + Leaflet · 서버/API 키 불필요
 */
(function () {
  "use strict";

  var DATA_KEY = "haha-trip-imported-v1";
  var STATUS = {
    booked: { label: "예약 완료", cls: "st-booked" },
    fixed: { label: "고정 제약", cls: "st-fixed" },
    course: { label: "확정 코스", cls: "st-course" },
    transit: { label: "환승 지점", cls: "st-transit" },
    optional: { label: "선택", cls: "st-optional" }
  };
  var PRECISION = {
    landmark: "대표 좌표(근사)",
    area: "지역 대표 지점",
    reference: "임시 기준점 — 실제 장소 위치 아님"
  };

  var state = {
    data: null,
    day: "all",
    placeId: null,
    query: "",
    showLines: true,
    imported: false
  };

  var map = null, markersById = {}, mapProvider = "osm", PROVIDER_KEY = "haha-trip-map-provider";
  var $ = function (id) { return document.getElementById(id); };

  /* ---------- utils ---------- */
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function safeUrl(u) {
    u = String(u || "");
    return /^https?:\/\//i.test(u) ? u : "#";
  }
  function clone(o) { return JSON.parse(JSON.stringify(o)); }
  function hasCoord(p) { return typeof p.lat === "number" && typeof p.lng === "number" && isFinite(p.lat) && isFinite(p.lng); }
  function toast(msg) {
    var t = $("toast");
    t.textContent = msg; t.hidden = false;
    clearTimeout(toast._t);
    toast._t = setTimeout(function () { t.hidden = true; }, 2600);
  }
  function isMobile() { return window.matchMedia("(max-width: 899px)").matches; }
  function storageGet(k) { try { return window.localStorage.getItem(k); } catch (e) { return null; } }
  function storageSet(k, v) { try { window.localStorage.setItem(k, v); } catch (e) { /* ignore */ } }

  function dayById(id) {
    for (var i = 0; i < state.data.days.length; i++) if (state.data.days[i].id === id) return state.data.days[i];
    return null;
  }
  function allPlaces() {
    var out = [];
    state.data.days.forEach(function (d) {
      (d.places || []).forEach(function (p) { out.push({ day: d, place: p }); });
    });
    return out;
  }
  function findPlace(id) {
    var list = allPlaces();
    for (var i = 0; i < list.length; i++) if (list[i].place.id === id) return list[i];
    return null;
  }
  function visibleDays() {
    return state.day === "all" ? state.data.days : [dayById(state.day)].filter(Boolean);
  }
  function matches(entry, q) {
    if (!q) return true;
    var p = entry.place;
    var hay = [p.name, p.nameLocal, p.desc, p.time, (p.checks || []).join(" "), (STATUS[p.status] || {}).label,
      (p.checks && p.checks.length ? "확인 필요" : ""), p.precision === "reference" ? "기준점" : "", p.yoonha ? "윤일담 윤하" : "",
      entry.day.label].join(" ").toLowerCase();
    return q.toLowerCase().split(/\s+/).filter(Boolean).every(function (w) { return hay.indexOf(w) !== -1; });
  }

  /* ---------- map ---------- */
  var NO_MAP = { clear: function () {}, addMarker: function () { return { openPopup: function () {} }; }, addLine: function () {},
    fit: function () {}, flyTo: function () {}, getZoom: function () { return 9; }, invalidate: function () {}, closePopup: function () {}, destroy: function () {} };

  function providerLabel() { return mapProvider === "google" ? "구글 지도" : "OpenStreetMap"; }
  function updateProviderUi() {
    var b = $("btn-provider");
    if (b) {
      b.textContent = mapProvider === "google" ? "OSM으로 보기" : "구글 지도로 보기";
      b.hidden = !(window.TripMap && window.TripMap.hasGoogleKey);
    }
    var f = $("map-credit");
    if (f) f.innerHTML = mapProvider === "google"
      ? "지도 © Google · 지도 표시는 Google Maps Platform"
      : '지도 데이터 © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> 기여자 · 지도 라이브러리 <a href="https://leafletjs.com" target="_blank" rel="noopener">Leaflet</a> (BSD-2-Clause)';
  }

  function setProvider(want, quiet) {
    var el = $("map");
    if (map && map.destroy) { try { map.destroy(); } catch (e) { /* ignore */ } }
    map = NO_MAP;
    el.innerHTML = "";
    if (!window.TripMap) { el.innerHTML = "<p style='padding:16px'>지도를 불러오지 못했습니다. 일정 목록은 아래에서 볼 수 있습니다.</p>"; return Promise.resolve(); }
    return window.TripMap.create(want, el).then(function (m) {
      map = m; mapProvider = m.kind;
    }, function (err) {
      if (want === "google") {
        if (!quiet) toast("구글 지도를 불러오지 못해 OpenStreetMap으로 표시합니다.");
        return window.TripMap.create("osm", el).then(function (m) { map = m; mapProvider = "osm"; });
      }
      el.innerHTML = "<p style='padding:16px'>지도를 불러오지 못했습니다. 일정 목록은 아래에서 볼 수 있습니다.</p>";
    }).then(function () {
      updateProviderUi();
      renderMap(true);
      if (state.placeId) selectPlace(state.placeId, { from: "map" });
    });
  }

  function pinClasses(p) {
    var c = ["pin"];
    if (p.kind === "transit" || p.status === "transit" || p.status === "fixed") c.push("transit");
    if (p.status === "booked") c.push("booked");
    if (p.status === "optional") c.push("optional");
    if (p.precision === "reference") c.push("ref");
    return c;
  }

  function renderMap(fit) {
    if (!map) return;
    map.clear();
    markersById = {};
    var q = state.query.trim();
    var entries = [];
    visibleDays().forEach(function (d) {
      (d.places || []).forEach(function (p) { entries.push({ day: d, place: p }); });
    });

    // 같은 좌표를 공유하는 마커는 좌표는 그대로 두고 아이콘만 옆으로 벌려 표시
    var groups = {};
    entries.forEach(function (e) {
      if (!hasCoord(e.place)) return;
      var k = e.place.lat.toFixed(4) + "," + e.place.lng.toFixed(4);
      (groups[k] = groups[k] || []).push(e);
    });

    var bounds = [];
    Object.keys(groups).forEach(function (k) {
      var g = groups[k];
      g.forEach(function (e, i) {
        var p = e.place;
        var shift = (i - (g.length - 1) / 2) * 30;
        var cls = pinClasses(p);
        if (p.id === state.placeId) cls.push("active");
        if (q && !matches(e, q)) cls.push("dim");
        var label = state.day === "all" ? e.day.label.replace("DAY ", "") + "·" + p.order : p.order;
        markersById[p.id] = map.addMarker({
          lat: p.lat, lng: p.lng, shift: shift, classes: cls, color: esc(e.day.color),
          label: String(label), labelHtml: esc(label), title: p.name,
          zIndex: p.id === state.placeId ? 1000 : (p.kind === "transit" ? -100 : 0),
          popupHtml: popupHtml(e, g.length > 1),
          onClick: function () { selectPlace(p.id, { from: "map" }); }
        });
        bounds.push([p.lat, p.lng]);
      });
    });

    if (state.showLines) {
      visibleDays().forEach(function (d) {
        var pts = (d.places || []).filter(function (p) { return hasCoord(p) && p.status !== "optional"; }).slice().sort(function (a, b) { return a.order - b.order; })
          .map(function (p) { return [p.lat, p.lng]; });
        if (d.returnTo) {
          var r = (d.places || []).filter(function (p) { return p.id === d.returnTo; })[0];
          if (r && hasCoord(r)) pts.push([r.lat, r.lng]);
        }
        // 연속 중복 좌표 제거
        pts = pts.filter(function (pt, i) { return i === 0 || pt[0] !== pts[i - 1][0] || pt[1] !== pts[i - 1][1]; });
        if (pts.length < 2) return;
        map.addLine(pts, d.color, esc(d.label) + " 방문 순서 직선 연결 — 실제 이동 경로 아님");
      });
    }

    $("map-note").style.display = state.showLines ? "" : "none";
    if (fit) fitTo(bounds);
  }

  function fitTo(bounds) {
    if (!bounds || !bounds.length || !map) return;
    map.fit(bounds);
  }
  function currentBounds() {
    var b = [];
    visibleDays().forEach(function (d) { (d.places || []).filter(hasCoord).forEach(function (p) { b.push([p.lat, p.lng]); }); });
    return b;
  }

  function popupHtml(e, shared) {
    var p = e.place, st = STATUS[p.status] || { label: p.status || "", cls: "" };
    var h = "<b>" + esc(p.order + ". " + p.name) + "</b><br>";
    h += '<span class="chip ' + st.cls + '">' + esc(st.label) + "</span> ";
    if (p.checks && p.checks.length) h += '<span class="chip warn">확인 필요 ' + p.checks.length + "</span>";
    h += "<br>" + esc(e.day.label) + " · " + esc(p.time || "") + ' <small>(계획)</small>';
    if (p.precision === "reference") h += '<br><span class="pop-ref">⚠ ' + esc(p.precisionNote || PRECISION.reference) + "</span>";
    if (shared) h += '<br><small>같은 좌표를 쓰는 장소가 있어 마커만 옆으로 벌려 표시했습니다(좌표는 동일).</small>';
    if (isMobile()) h += '<br><a href="#detail" data-goto-detail="1">자세히 보기 ↓</a>';
    return h;
  }

  /* ---------- tabs ---------- */
  function renderTabs() {
    var el = $("day-tabs");
    var tabs = [{ id: "all", label: "전체", sub: state.data.meta.dates, color: "#1F4E79" }].concat(
      state.data.days.map(function (d) {
        return { id: d.id, label: d.label, sub: d.date.slice(5).replace("-", ".") + " (" + d.weekday + ")", color: d.color };
      })
    );
    el.innerHTML = tabs.map(function (t) {
      return '<button type="button" class="tab" role="tab" data-day="' + esc(t.id) + '" aria-selected="' + (state.day === t.id) +
        '" style="--tab-color:' + esc(t.color) + '">' + esc(t.label) + "<small>" + esc(t.sub) + "</small></button>";
    }).join("");
  }

  /* ---------- panel ---------- */
  function statusChips(p) {
    var st = STATUS[p.status] || { label: p.status || "", cls: "" };
    var h = '<span class="chip ' + st.cls + '">' + esc(st.label) + "</span>";
    if (p.checks && p.checks.length) h += '<span class="chip warn">확인 필요 ' + p.checks.length + "</span>";
    if (p.precision === "reference") h += '<span class="chip ref">기준점 표시</span>';
    if (p.yoonha) h += '<span class="chip yoonha">윤일담 · 촬영지 확인 필요</span>';
    if (!hasCoord(p)) h += '<span class="chip ref">지도 위치 없음</span>';
    return h;
  }

  function renderSummary() {
    var el = $("day-summary");
    if (state.day === "all") {
      var m = state.data.meta;
      el.style.setProperty("--day-color", "#1F4E79");
      el.innerHTML = "<h2>" + esc(m.title) + "</h2>" +
        "<p>" + esc(m.dates) + " · " + esc(m.travelers) + " · " + esc(m.subtitle) + "</p>" +
        "<p>" + esc(m.purpose) + "</p><p>" + esc(m.budgetNote) + "</p>" +
        state.data.days.map(function (d) {
          return '<p><b style="color:' + esc(d.color) + '">' + esc(d.label) + "</b> " + esc(d.title) + "</p>";
        }).join("");
      return;
    }
    var d = dayById(state.day);
    el.style.setProperty("--day-color", d.color);
    el.innerHTML = "<h2>" + esc(d.label + " · " + d.title) + "</h2>" +
      "<p>" + esc(d.date) + " (" + esc(d.weekday) + ")</p>" +
      "<p>숙박: " + esc(d.stay) + "</p>";
  }

  function renderPlaces() {
    var q = state.query.trim();
    var entries = q ? allPlaces() : [];
    if (!q) visibleDays().forEach(function (d) { (d.places || []).forEach(function (p) { entries.push({ day: d, place: p }); }); });
    entries = entries.filter(function (e) { return matches(e, q); });
    var showDay = q || state.day === "all";
    $("places-title").textContent = q ? "검색 결과 (" + entries.length + ")" : "장소 · 방문 순서";
    $("place-empty").hidden = entries.length > 0;
    $("place-list").innerHTML = entries.map(function (e) {
      var p = e.place;
      var numCls = ["num"];
      if (p.kind === "transit" || p.status === "transit" || p.status === "fixed") numCls.push("transit");
      if (p.status === "optional") numCls.push("optional");
      if (p.precision === "reference") numCls.push("ref");
      return '<li><button type="button" class="place-item' + (p.id === state.placeId ? " active" : "") + '" data-place="' + esc(p.id) +
        '" style="--c:' + esc(e.day.color) + '"><span class="' + numCls.join(" ") + '">' + esc(p.order) + "</span><span>" +
        '<span class="name">' + (showDay ? '<span class="daytag">' + esc(e.day.label) + "</span>" : "") + esc(p.name) +
        '<span class="local">' + esc(p.nameLocal || "") + "</span></span><br>" +
        '<span class="time">' + esc(p.time || "") + "</span>" +
        '<span class="chips">' + statusChips(p) + "</span></span></button></li>";
    }).join("");
  }

  function renderDetail() {
    var el = $("detail");
    var hit = state.placeId && findPlace(state.placeId);
    if (!hit) { el.hidden = true; el.innerHTML = ""; return; }
    var p = hit.place, d = hit.day;
    var osmUrl = hasCoord(p)
      ? "https://www.openstreetmap.org/?mlat=" + p.lat.toFixed(5) + "&mlon=" + p.lng.toFixed(5) + "#map=17/" + p.lat.toFixed(5) + "/" + p.lng.toFixed(5)
      : null;
    var osmSearch = "https://www.openstreetmap.org/search?query=" + encodeURIComponent(p.osmQuery || p.nameLocal || p.name);
    el.style.setProperty("--c", d.color);
    var h = '<div class="detail-head"><div><h3>' + esc(p.order + ". " + p.name) + "</h3>" +
      '<div class="local">' + esc(p.nameLocal || "") + "</div></div>" +
      '<button type="button" class="close" data-close-detail aria-label="닫기">×</button></div>';
    h += '<div class="chips" style="margin-top:6px;display:flex;flex-wrap:wrap;gap:4px">' + statusChips(p) + "</div>";
    h += "<dl>";
    h += "<dt>날짜</dt><dd>" + esc(d.label + " · " + d.date + " (" + d.weekday + ")") + "</dd>";
    h += "<dt>시간</dt><dd>" + esc(p.time || "미정") + '<span class="plan-tag">계획값 · 미검증</span></dd>';
    h += "<dt>상태</dt><dd>" + esc((STATUS[p.status] || {}).label || p.status || "") + statusExplain(p) + "</dd>";
    h += "<dt>설명</dt><dd>" + esc(p.desc || "") + "</dd>";
    h += "<dt>좌표</dt><dd>" + (hasCoord(p) ? esc(PRECISION[p.precision] || "근사") + (p.precisionNote ? " · " + esc(p.precisionNote) : "") : "지도에 표시할 위치 없음") + "</dd>";
    h += "</dl>";
    if (p.precision === "reference") {
      h += '<div class="refbox">⚠ 이 마커는 정확한 장소가 아닙니다. ' + esc(p.precisionNote || "근처 역·지역을 기준점으로 표시했습니다.") + "</div>";
    }
    if (p.checks && p.checks.length) {
      h += '<div class="checks"><strong>확인 필요</strong><ul>' + p.checks.map(function (c) { return "<li>" + esc(c) + "</li>"; }).join("") + "</ul></div>";
    }
    h += '<div class="actions">';
    if (osmUrl) h += '<a class="btn" href="' + esc(osmUrl) + '" target="_blank" rel="noopener">OpenStreetMap에서 열기</a>';
    h += '<a class="btn" href="' + esc(osmSearch) + '" target="_blank" rel="noopener">OSM에서 이름 검색</a>';
    (p.links || []).forEach(function (l) {
      h += '<a class="btn" href="' + esc(safeUrl(l.url)) + '" target="_blank" rel="noopener">' + esc(l.label) + "</a>";
    });
    h += "</div>";
    el.innerHTML = h;
    el.hidden = false;
  }

  function statusExplain(p) {
    var m = {
      booked: " — 숙소 예약은 확정, 시각은 계획",
      fixed: " — 항공편 시각은 최우선 제약",
      course: " — 방문 코스·순서 확정, 시각은 계획",
      transit: " — 관광 목적지가 아닌 환승 지점",
      optional: " — 시간이 허용될 때만"
    };
    return '<span style="color:var(--muted)">' + esc(m[p.status] || "") + "</span>";
  }

  function renderTimeline() {
    var days = visibleDays();
    var multi = days.length > 1;
    $("timeline").innerHTML = days.map(function (d) {
      return (d.schedule || []).map(function (s) {
        var text = esc(s.text);
        if (s.place && findPlace(s.place)) text = '<button type="button" class="linkish" data-place="' + esc(s.place) + '">' + text + "</button>";
        return '<li class="k-' + esc(s.kind || "") + '" style="--c:' + esc(d.color) + '">' +
          (multi ? '<span class="daytag">' + esc(d.label) + "</span>" : "") +
          '<span class="t">' + esc(s.time) + "</span>" + text + "</li>";
      }).join("");
    }).join("");
  }

  function renderIssues() {
    var list = (state.data.issues || []).filter(function (i) { return state.day === "all" || i.day === state.day || i.day === "all"; });
    $("issues-count").textContent = list.length;
    var lvName = { high: "우선 확인", mid: "주의", low: "참고" };
    $("issues").innerHTML = list.length ? list.map(function (i) {
      var d = dayById(i.day);
      return '<div class="issue"><h4><span class="lv lv-' + esc(i.level) + '">' + esc(lvName[i.level] || i.level) + "</span>" +
        (d ? '<span class="chip st-transit">' + esc(d.label) + "</span>" : '<span class="chip st-transit">전체</span>') +
        esc(i.title) + "</h4><p>" + esc(i.detail) + "</p>" +
        (i.options && i.options.length ? "<ul>" + i.options.map(function (o) { return "<li>" + esc(o) + "</li>"; }).join("") + "</ul>" : "") +
        "</div>";
    }).join("") : '<p class="empty">이 날짜에 기록된 점검 사항이 없습니다.</p>';
  }

  function renderVerification() {
    $("verified-at").textContent = "확인 시점 " + (state.data.meta.verifiedAt || "");
    $("verification").innerHTML = (state.data.verification || []).map(function (v) {
      var cls = /부분/.test(v.result) ? "res-part" : "res-no";
      return '<div class="ver"><h4>' + esc(v.item) + '<span class="res ' + cls + '">' + esc(v.result) + "</span></h4>" +
        "<div>" + esc(v.detail) + "</div>" +
        (v.sources && v.sources.length ? "<ul>" + v.sources.map(function (s) {
          return '<li><a href="' + esc(safeUrl(s.url)) + '" target="_blank" rel="noopener">' + esc(s.title) + "</a></li>";
        }).join("") + "</ul>" : "") + "</div>";
    }).join("");
  }

  function renderExcluded() {
    $("excluded").innerHTML = (state.data.excluded || []).map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("") +
      '<li style="list-style:none;margin-left:-18px;color:var(--muted);margin-top:4px">다이칸야마는 제외 대상이 아니며 DAY 2에 유지합니다.</li>';
  }

  /* ---------- selection & routing ---------- */
  function selectPlace(id, opts) {
    opts = opts || {};
    var hit = findPlace(id);
    if (!hit) return;
    // 다른 날짜 탭에 있는 장소면 해당 날짜로 전환 (검색 중에는 유지)
    if (state.day !== "all" && state.day !== hit.day.id && !state.query.trim()) {
      state.day = hit.day.id;
      state.placeId = id;
      renderAll(false);
    } else {
      state.placeId = id;
      if (state.query.trim() && state.day !== "all" && state.day !== hit.day.id) { state.day = "all"; renderTabs(); renderSummary(); renderTimeline(); renderIssues(); }
      renderMap(false);
      renderPlaces();
      renderDetail();
    }
    updateHash();
    var p = hit.place;
    if (hasCoord(p) && markersById[id]) {
      var target = Math.max(map.getZoom(), p.kind === "transit" && p.precision === "reference" ? 12 : 15);
      if (opts.from !== "map") map.flyTo([p.lat, p.lng], Math.min(target, 16));
      setTimeout(function () { if (markersById[id]) markersById[id].openPopup(); }, opts.from === "map" ? 0 : 650);
    }
    if (opts.from !== "map" && isMobile()) {
      document.querySelector(".map-wrap").scrollIntoView({ behavior: "smooth", block: "start" });
    } else if (!isMobile()) {
      $("detail").scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }

  function setDay(id) {
    state.day = id;
    state.placeId = null;
    if (map) map.closePopup();
    renderAll(true);
    updateHash();
  }

  function renderAll(fit) {
    renderTabs();
    renderSummary();
    renderPlaces();
    renderDetail();
    renderTimeline();
    renderIssues();
    renderMap(fit);
  }

  function updateHash() {
    if (isGuideHash()) return;
    var h = "#" + state.day + (state.placeId ? "/" + state.placeId : "");
    if (location.hash !== h) history.replaceState(null, "", h);
  }
  function isGuideHash() {
    var v = location.hash.replace(/^#/, "").split("/")[0];
    return !!(window.TripGuide && window.TripGuide.isView(v));
  }
  function readHash() {
    if (isGuideHash()) return;
    var parts = location.hash.replace(/^#/, "").split("/");
    if (parts[0] && (parts[0] === "all" || dayById(parts[0]))) state.day = parts[0];
    if (parts[1] && findPlace(parts[1])) state.placeId = parts[1];
  }

  /* ---------- import / export ---------- */
  function exportJson() {
    var out = clone(state.data);
    if (window.TripGuide) out.budgetLedger = window.TripGuide.getLedger();
    out.exportedAt = new Date().toISOString();
    var blob = new Blob([JSON.stringify(out, null, 2)], { type: "application/json" });
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "haha-japan-trip-" + new Date().toISOString().slice(0, 10) + ".json";
    document.body.appendChild(a);
    a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 0);
    toast("JSON 파일을 저장했습니다.");
  }

  function validate(d) {
    if (!d || typeof d !== "object") return "JSON 최상위가 객체가 아닙니다.";
    if (!Array.isArray(d.days) || !d.days.length) return "days 배열이 없습니다.";
    var ids = {};
    for (var i = 0; i < d.days.length; i++) {
      var day = d.days[i];
      if (!day.id || !day.label) return (i + 1) + "번째 day에 id/label이 없습니다.";
      if (!Array.isArray(day.places)) return day.id + "에 places 배열이 없습니다.";
      for (var j = 0; j < day.places.length; j++) {
        var p = day.places[j];
        if (!p.id || !p.name) return day.id + "의 장소 " + (j + 1) + "에 id/name이 없습니다.";
        if (ids[p.id]) return "장소 id가 중복됩니다: " + p.id;
        ids[p.id] = true;
        if (p.lat != null && (typeof p.lat !== "number" || p.lat < -90 || p.lat > 90)) return p.id + "의 lat 값이 올바르지 않습니다.";
        if (p.lng != null && (typeof p.lng !== "number" || p.lng < -180 || p.lng > 180)) return p.id + "의 lng 값이 올바르지 않습니다.";
        if (typeof p.order !== "number") p.order = j + 1;
      }
      day.color = /^#[0-9a-f]{3,8}$/i.test(day.color || "") ? day.color : "#2B8FD6";
      day.schedule = Array.isArray(day.schedule) ? day.schedule : [];
      day.weekday = day.weekday || "";
      day.date = day.date || "";
    }
    d.meta = d.meta || {};
    d.meta.title = d.meta.title || "여행 일정";
    d.meta.dates = d.meta.dates || "";
    return null;
  }

  function importJson(file) {
    var reader = new FileReader();
    reader.onload = function () {
      var parsed;
      try { parsed = JSON.parse(reader.result); } catch (e) { toast("JSON 형식이 올바르지 않습니다."); return; }
      var err = validate(parsed);
      if (err) { toast("가져오기 실패: " + err); return; }
      if (parsed.budgetLedger && window.TripGuide) window.TripGuide.setLedger(parsed.budgetLedger);
      state.data = parsed;
      state.day = "all"; state.placeId = null; state.query = ""; $("search-input").value = "";
      storageSet(DATA_KEY, JSON.stringify(parsed));
      state.imported = true;
      renderStatic();
      renderAll(true);
      updateHash();
      toast("일정을 불러왔습니다: " + (parsed.meta.title || ""));
    };
    reader.readAsText(file, "utf-8");
  }

  /* ---------- static blocks ---------- */
  function renderStatic() {
    var m = state.data.meta;
    $("trip-title").textContent = m.title || "";
    $("trip-dates").textContent = m.dates || "";
    $("trip-subtitle").textContent = m.subtitle || "";
    document.title = (m.title || "여행") + " · 일정 지도";
    $("notice-list").innerHTML = (state.data.notices || []).map(function (n) { return "<li>" + esc(n) + "</li>"; }).join("") +
      (state.imported ? '<li><b>가져온 JSON 일정을 표시 중입니다.</b> <button type="button" class="btn" data-reset-data>기본 일정으로 되돌리기</button></li>' : "");
    renderVerification();
    renderExcluded();
  }

  /* ---------- events ---------- */
  function bind() {
    $("day-tabs").addEventListener("click", function (e) {
      var b = e.target.closest("[data-day]");
      if (b) setDay(b.getAttribute("data-day"));
    });
    $("day-tabs").addEventListener("keydown", function (e) {
      if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
      var tabs = Array.prototype.slice.call(this.querySelectorAll(".tab"));
      var i = tabs.indexOf(document.activeElement);
      if (i < 0) return;
      var n = tabs[(i + (e.key === "ArrowRight" ? 1 : tabs.length - 1)) % tabs.length];
      n.focus(); n.click();
    });
    document.addEventListener("click", function (e) {
      var b = e.target.closest("[data-place]");
      if (b && !b.closest(".leaflet-container")) { selectPlace(b.getAttribute("data-place")); return; }
      if (e.target.closest("[data-close-detail]")) { state.placeId = null; map.closePopup(); renderDetail(); renderPlaces(); renderMap(false); updateHash(); return; }
      if (e.target.closest("[data-reset-data]")) {
        try { window.localStorage.removeItem(DATA_KEY); } catch (er) { /* ignore */ }
        state.data = clone(window.TRIP_DATA); state.imported = false;
        state.day = "all"; state.placeId = null; renderStatic(); renderAll(true); updateHash(); toast("기본 일정으로 되돌렸습니다."); return;
      }
      var g = e.target.closest("[data-goto-detail]");
      if (g) { e.preventDefault(); $("detail").scrollIntoView({ behavior: "smooth", block: "start" }); }
    });
    var t;
    $("search-input").addEventListener("input", function () {
      var v = this.value;
      clearTimeout(t);
      t = setTimeout(function () { state.query = v; renderPlaces(); renderMap(false); }, 120);
    });
    $("search-input").addEventListener("keydown", function (e) {
      if (e.key === "Enter") {
        var first = document.querySelector("#place-list [data-place]");
        if (first) selectPlace(first.getAttribute("data-place"));
      }
      if (e.key === "Escape") { this.value = ""; state.query = ""; renderPlaces(); renderMap(false); }
    });
    $("btn-provider").addEventListener("click", function () {
      var next = mapProvider === "google" ? "osm" : "google";
      storageSet(PROVIDER_KEY, next);
      setProvider(next, false);
    });
    $("btn-fit").addEventListener("click", function () { map.closePopup(); fitTo(currentBounds()); });
    $("btn-lines").addEventListener("click", function () {
      state.showLines = !state.showLines;
      this.setAttribute("aria-pressed", String(state.showLines));
      renderMap(false);
    });
    $("btn-export").addEventListener("click", exportJson);
    $("file-import").addEventListener("change", function () {
      if (this.files && this.files[0]) importJson(this.files[0]);
      this.value = "";
    });
    window.addEventListener("hashchange", function () {
      if (isGuideHash()) return;
      var before = state.day + "/" + state.placeId;
      readHash();
      if (before !== state.day + "/" + state.placeId) renderAll(true);
    });
    var rt, lastW = 0, lastH = 0;
    function onResize() {
      clearTimeout(rt);
      rt = setTimeout(function () {
        var el = $("map");
        if (!el.clientWidth || !el.clientHeight) return;
        var refit = !lastW || Math.abs(el.clientWidth - lastW) > 40 || Math.abs(el.clientHeight - lastH) > 40;
        lastW = el.clientWidth; lastH = el.clientHeight;
        map.invalidate();
        if (refit && !state.placeId) fitTo(currentBounds());
      }, 150);
    }
    window.addEventListener("resize", onResize);
    if (window.ResizeObserver) new ResizeObserver(onResize).observe($("map"));
    window.addEventListener("load", onResize);
    document.addEventListener("visibilitychange", function () { if (!document.hidden) onResize(); });
  }

  /* ---------- boot ---------- */
  function boot() {
    if (!window.TRIP_DATA) { document.body.insertAdjacentHTML("afterbegin", "<p style='padding:16px'>trip-data.js를 불러오지 못했습니다.</p>"); return; }
    state.data = clone(window.TRIP_DATA);
    var stored = storageGet(DATA_KEY);
    if (stored) {
      try {
        var sd = JSON.parse(stored);
        if (!validate(sd)) { state.data = sd; state.imported = true; }
      } catch (e) { /* ignore */ }
    }
    readHash();
    map = NO_MAP;
    renderStatic();
    bind();
    renderAll(false);
    var pref = storageGet(PROVIDER_KEY);
    var want = window.TripMap && window.TripMap.hasGoogleKey && pref !== "osm" ? "google" : "osm";
    setProvider(want, false);
    document.addEventListener("trip-map-auth-failure", function () {
      if (mapProvider === "google") { toast("구글 지도 키 인증에 실패해 OpenStreetMap으로 전환합니다."); setProvider("osm", true); }
    });
    window.__tripViewer = {
      state: state, selectPlace: selectPlace, setDay: setDay,
      provider: function () { return mapProvider; },
      refresh: function () { if (map) { map.invalidate(); if (!state.placeId) fitTo(currentBounds()); } }
    }; // 디버그·테스트용
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
