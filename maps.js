/* 지도 엔진 어댑터: 구글 지도(Maps JavaScript API) / OpenStreetMap(Leaflet)
 * app.js는 이 인터페이스만 사용한다.
 *   clear(), addMarker(o) → { openPopup() }, addLine(pts, color, tip), fit(bounds), flyTo(latlng, zoom),
 *   getZoom(), invalidate(), closePopup(), destroy()
 * 구글 키는 브라우저에 노출되는 키이며, Google Cloud에서 hymiin.github.io 리퍼러와 Maps JavaScript API로 제한해 둔다.
 */
(function () {
  "use strict";

  var GOOGLE_KEY = "AIzaSyBE7NjR9jApv3i0C6TqX--NexVSIZeiSP4";
  var DEFAULT_CENTER = [35.45, 139.55];

  /* ---------- OpenStreetMap (Leaflet) ---------- */
  function createOSM(el) {
    if (typeof L === "undefined") return Promise.reject(new Error("Leaflet 없음"));
    var map = L.map(el, { zoomControl: true, scrollWheelZoom: true, zoomSnap: 0.25, wheelPxPerZoomLevel: 90, tapTolerance: 20 });
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors'
    }).addTo(map);
    L.control.scale({ imperial: false }).addTo(map);
    var lines = L.layerGroup().addTo(map);
    var markers = L.layerGroup().addTo(map);
    map.setView(DEFAULT_CENTER, 9);
    return Promise.resolve({
      kind: "osm",
      clear: function () { markers.clearLayers(); lines.clearLayers(); },
      addMarker: function (o) {
        var icon = L.divIcon({
          className: "pin-icon",
          html: '<div class="' + o.classes.join(" ") + '" style="--c:' + o.color + '">' + o.labelHtml + "</div>",
          iconSize: [30, 30], iconAnchor: [15 - o.shift, 15], popupAnchor: [o.shift, -14]
        });
        var m = L.marker([o.lat, o.lng], { icon: icon, title: o.title, alt: o.title, keyboard: true, zIndexOffset: o.zIndex });
        m.bindPopup(o.popupHtml, { maxWidth: 260, autoPanPadding: [20, 60] });
        m.on("click", o.onClick);
        m.addTo(markers);
        return { openPopup: function () { m.openPopup(); } };
      },
      addLine: function (pts, color, tip) {
        L.polyline(pts, { color: color, weight: 3, opacity: 0.75, dashArray: "6 8", interactive: true })
          .bindTooltip(tip, { sticky: true, className: "line-label" }).addTo(lines);
      },
      fit: function (b) {
        map.invalidateSize(false);
        if (b.length === 1) map.setView(b[0], 15);
        else map.fitBounds(b, { padding: [40, 40], maxZoom: 16 });
      },
      flyTo: function (ll, z) { map.flyTo(ll, z, { duration: 0.6 }); },
      getZoom: function () { return map.getZoom(); },
      invalidate: function () { map.invalidateSize(false); },
      closePopup: function () { map.closePopup(); },
      destroy: function () { map.remove(); }
    });
  }

  /* ---------- Google Maps ---------- */
  var gLoad = null;
  function loadGoogle() {
    if (gLoad) return gLoad;
    gLoad = new Promise(function (resolve, reject) {
      var done = false;
      var timer = setTimeout(function () { if (!done) { done = true; reject(new Error("시간 초과")); } }, 10000);
      window.gm_authFailure = function () {
        // 키 오류·리퍼러 제한 등. 이미 지도가 떴더라도 OSM으로 전환하도록 알린다.
        if (!done) { done = true; clearTimeout(timer); reject(new Error("인증 실패")); }
        document.dispatchEvent(new CustomEvent("trip-map-auth-failure"));
      };
      window.__tripGmReady = function () {
        Promise.all([google.maps.importLibrary("maps"), google.maps.importLibrary("marker"), google.maps.importLibrary("core")])
          .then(function () { if (!done) { done = true; clearTimeout(timer); resolve(); } })
          .catch(function (e) { if (!done) { done = true; clearTimeout(timer); reject(e); } });
      };
      var s = document.createElement("script");
      s.src = "https://maps.googleapis.com/maps/api/js?key=" + encodeURIComponent(GOOGLE_KEY) +
        "&callback=__tripGmReady&loading=async&language=ko&region=JP&v=weekly";
      s.async = true;
      s.onerror = function () { if (!done) { done = true; clearTimeout(timer); reject(new Error("스크립트 로드 실패")); } };
      document.head.appendChild(s);
    });
    gLoad.catch(function () { gLoad = null; });
    return gLoad;
  }

  function pinSvg(o, size) {
    var c = o.color, cls = o.classes;
    var transit = cls.indexOf("transit") !== -1 || cls.indexOf("optional") !== -1;
    var ref = cls.indexOf("ref") !== -1, booked = cls.indexOf("booked") !== -1, optional = cls.indexOf("optional") !== -1;
    var S = size, r = transit ? S * 0.36 : S * 0.40, cx = S / 2;
    var fs = String(o.label).length > 3 ? 10 : 13;
    var out = '<svg xmlns="http://www.w3.org/2000/svg" width="' + S + '" height="' + S + '" viewBox="0 0 ' + S + " " + S + '">';
    if (ref) out += '<circle cx="' + cx + '" cy="' + cx + '" r="' + (S / 2 - 1.5) + '" fill="none" stroke="' + c + '" stroke-width="2" stroke-dasharray="3 3"/>';
    if (booked) out += '<circle cx="' + cx + '" cy="' + cx + '" r="' + (r + 3) + '" fill="none" stroke="#C99A3B" stroke-width="3"/>';
    out += '<circle cx="' + cx + '" cy="' + cx + '" r="' + r + '" fill="' + (transit ? "#fff" : c) + '" stroke="' + (transit ? c : "#fff") +
      '" stroke-width="2"' + (optional ? ' stroke-dasharray="2 2"' : "") + "/>";
    out += '<text x="' + cx + '" y="' + (cx + fs * 0.36) + '" text-anchor="middle" font-family="Arial,sans-serif" font-weight="700" font-size="' + fs +
      '" fill="' + (transit ? c : "#fff") + '">' + String(o.label).replace(/[<&>]/g, "") + "</text></svg>";
    return "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(out);
  }

  function createGoogle(el) {
    return loadGoogle().then(function () {
      var g = google.maps;
      el.innerHTML = "";
      var map = new g.Map(el, {
        center: { lat: DEFAULT_CENTER[0], lng: DEFAULT_CENTER[1] }, zoom: 9,
        mapTypeControl: false, streetViewControl: false, fullscreenControl: false,
        scaleControl: true, clickableIcons: false, gestureHandling: "greedy"
      });
      var markers = [], lines = [];
      var info = new g.InfoWindow({ maxWidth: 260 });
      function ll(p) { return { lat: p[0], lng: p[1] }; }
      return {
        kind: "google",
        clear: function () {
          markers.forEach(function (m) { m.setMap(null); }); lines.forEach(function (l) { l.setMap(null); });
          markers = []; lines = [];
        },
        addMarker: function (o) {
          var active = o.classes.indexOf("active") !== -1;
          var S = active ? 40 : 32;
          var m = new g.Marker({
            map: map, position: { lat: o.lat, lng: o.lng }, title: o.title,
            icon: { url: pinSvg(o, S), scaledSize: new g.Size(S, S), anchor: new g.Point(S / 2 - o.shift, S / 2) },
            opacity: o.classes.indexOf("dim") !== -1 ? 0.25 : 1,
            zIndex: 1000 + o.zIndex
          });
          function open() {
            info.setContent('<div class="gm-pop">' + o.popupHtml + "</div>");
            info.setOptions({ pixelOffset: new g.Size(o.shift, -S / 2 + 4) });
            info.open({ map: map, anchor: null, shouldFocus: false });
            info.setPosition({ lat: o.lat, lng: o.lng });
          }
          m.addListener("click", function () { open(); o.onClick(); });
          markers.push(m);
          return { openPopup: open };
        },
        addLine: function (pts, color, tip) {
          var line = new g.Polyline({
            map: map, path: pts.map(ll), strokeOpacity: 0, clickable: false,
            icons: [{ icon: { path: "M 0,-1 0,1", strokeOpacity: 0.8, strokeColor: color, strokeWeight: 3, scale: 3 }, offset: "0", repeat: "14px" }]
          });
          lines.push(line);
        },
        fit: function (b) {
          if (b.length === 1) { map.setCenter(ll(b[0])); map.setZoom(15); return; }
          var bounds = new g.LatLngBounds();
          b.forEach(function (p) { bounds.extend(ll(p)); });
          map.fitBounds(bounds, 40);
          g.event.addListenerOnce(map, "idle", function () { if (map.getZoom() > 16) map.setZoom(16); });
        },
        flyTo: function (p, z) { map.panTo(ll(p)); map.setZoom(Math.round(z)); },
        getZoom: function () { return map.getZoom() || 9; },
        invalidate: function () { /* 구글 지도는 컨테이너 크기 변화를 자동 처리 */ },
        closePopup: function () { info.close(); },
        destroy: function () { info.close(); g.event.clearInstanceListeners(map); el.innerHTML = ""; }
      };
    });
  }

  window.TripMap = {
    hasGoogleKey: !!GOOGLE_KEY,
    create: function (provider, el) {
      return provider === "google" ? createGoogle(el) : createOSM(el);
    }
  };
})();
