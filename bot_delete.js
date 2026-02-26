// ════════════════════════════════════════════════════════════════════════════════
// bot_delete.js — Instagram Bot Follower Remover (UI Edition v4 — Advanced Engine)
// ════════════════════════════════════════════════════════════════════════════════
(function () {
    'use strict';
    if (window.__BD_LOADED__) { alert('Bot Delete already running!'); return; }
    window.__BD_LOADED__ = true;

    // ═══ CONFIG ═══
    const CONFIG = {
        // Fetch timing
        FETCH_DELAY_MIN: 800, FETCH_DELAY_MAX: 2200,
        FETCH_PER_PAGE: 12, FETCH_MAX_RETRIES: 5,
        // Remove timing
        REMOVE_DELAY_MIN: 22000, REMOVE_DELAY_MAX: 42000,
        // Micro-batch (smaller batches = more human-like pattern)
        BATCH_SIZE: 6, BATCH_PAUSE_MIN: 50000, BATCH_PAUSE_MAX: 110000,
        // Mega batch
        MEGA_BATCH_SIZE: 30, MEGA_PAUSE_MIN: 300000, MEGA_PAUSE_MAX: 540000,
        // Rate limit backoff
        RATE_LIMIT_INITIAL: 600000, RATE_LIMIT_MAX: 3600000, RATE_LIMIT_MULT: 1.8,
        MAX_ERRORS: 6, ERROR_PAUSE: 900000,
        // Adaptive throttle
        RT_WINDOW: 10, RT_SLOW_THRESHOLD: 1.8, RT_SLOWDOWN_MAX: 3.0,
        // Session health check interval (ms)
        HEALTH_CHECK_INTERVAL: 300000,
        // GraphQL API (faster follower fetching)
        GQL_FOLLOWERS_HASH: '37479f2b8209594dde7facb0d904896a',
        GQL_PER_PAGE: 50,
        GQL_RETRY_AFTER: 600000, // retry GraphQL after 10min if it failed
        // Storage
        STORAGE_PREFIX: 'bd_',
    };

    // ═══ i18n ═══
    const LANG = {
        tr: {
            title:'Bot Temizleyici', minimize:'Küçült', close:'Kapat',
            tabDash:'Panel', tabBots:'Bot Listesi', tabLog:'Log', tabWl:'Beyaz Liste', tabSettings:'Ayarlar',
            phaseReady:'Hazır — Başlat\'a tıkla', phaseFetchingFollowing:'Takip edilenler çekiliyor...',
            phaseScanning:'Taranıyor + çıkarılıyor...', phaseRemoving:'Bot çıkarma devam ediyor...',
            phasePaused:'Tarama duraklatıldı — silme devam ediyor', phaseResuming:'Devam ediyor...',
            phaseRateLimit:'Rate limit — bekleniyor...', phaseSessionError:'Oturum hatası — tekrar giriş yap',
            phaseSessionNotFound:'Oturum bulunamadı!', phaseDone:'Tamamlandı! {0} bot çıkarıldı',
            phaseStopped:'Durduruldu — {0} çıkarıldı, {1} kalan', phaseResumable:'Devam edilebilir — {0} sırada',
            phaseMegaPause:'Mega mola — {0}', phaseBatchPause:'Batch mola — {0}',
            phaseAdaptive:'Adaptif yavaşlama aktif — {0}x',
            statFollowing:'Takip Edilen', statFollowers:'Taranan', statBots:'Bot Tespit', statRemoved:'Çıkarılan', statQueue:'Sırada', statFailed:'Başarısız',
            speed:'Hız', btnStart:'BAŞLAT', btnPause:'TARAMAYI DURAKLAT', btnResume:'TARAMAYA DEVAM', btnStop:'DURDUR', btnExport:'RAPOR İNDİR',
            searchPlaceholder:'Kullanıcı adı ara...', botCount:'{0} bot',
            statusPending:'Bekliyor', statusRemoved:'Çıkarıldı', statusFailed:'Hata', statusQueue:'Sırada', statusWhitelist:'Korumalı',
            moreItems:'+{0} daha', noScanYet:'Henüz tarama yapılmadı', noResults:'Sonuç bulunamadı',
            filterAll:'Tümü', filterNoPic:'Resimsiz', filterHigh:'Yüksek Skor', filterSelected:'Seçili',
            selectAll:'Tümünü Seç', deselectAll:'Seçimi Kaldır', removeSelected:'SEÇİLİ {0} BOTU ÇİKAR',
            scoreLabel:'Skor', scoreLow:'Düşük', scoreMed:'Orta', scoreHigh:'Yüksek',
            wlTitle:'Beyaz Liste', wlDesc:'Bu listedeki hesaplar asla çıkarılmaz', wlAdd:'EKLE', wlPlaceholder:'@kullanıcı_adı',
            wlCount:'{0} korumalı hesap', wlRemove:'Çıkar', wlImport:'JSON İÇE AKTAR', wlExport:'DIŞA AKTAR', wlEmpty:'Beyaz liste boş',
            settFetchSpeed:'Fetch Hızı', settMinDelay:'Min gecikme (ms)', settMaxDelay:'Max gecikme (ms)', settPerPage:'Sayfa başı',
            settRemoveSpeed:'Silme Hızı', settBatchSize:'Batch boyutu', settBatchPauseMin:'Batch mola min (ms)', settBatchPauseMax:'Batch mola max (ms)',
            settMegaBatch:'Mega Batch', settMegaSize:'Mega batch boyutu', settMegaPauseMin:'Mega mola min (ms)', settMegaPauseMax:'Mega mola max (ms)',
            btnSaveSettings:'AYARLARI KAYDET', btnResetAll:'TÜM VERİYİ SIFIRLA',
            confirmClose:'İşlem devam ediyor. Kapatılsın mı?', confirmReset:'TÜM veri silinecek. Emin misiniz?',
            logReady:'Bot Temizleyici v4 hazır.', logSessionNotFound:'Oturum bulunamadı',
            logResumeQueue:'Devam: {0} bot sırada', logPhase1:'Phase 1: Following çekiliyor',
            logFollowingCache:'Following cache: {0}', logPhase23:'Phase 2+3: Tarama + silme',
            logScanDone:'Tarama bitti: {0} bot', logDone:'Tamamlandı: {0} çıkarıldı, {1} başarısız',
            logPaused:'Tarama duraklatıldı', logResumed:'Tarama devam', logStopped:'Durduruldu. Oturum: {0}',
            logRateLimit:'Rate limit ({0})', logSessionError:'Oturum hatası',
            logFetchRetry:'{0} hata ({1}), tekrar {2}/{3}', logFetchFail:'{0} fetch başarısız',
            logFetchDone:'{0} tamamlandı: {1}', logFetchProgress:'{0}: {1} çekildi',
            logScanProgress:'Tarama: {0} takipçi, {1} bot', logCsrfError:'CSRF bulunamadı',
            logRateLimitUser:'Rate limit @{0}', logSessionRefresh:'CSRF yenileniyor',
            logRemoved:'@{0} çıkarıldı [{1}] — {2} kalan', logRemoveFailed:'@{0} başarısız ({1})',
            logConsecutiveErrors:'{0} hata — {1} mola', logMegaPause:'Mega mola ({0}) — {1}',
            logBatchPause:'Batch mola ({0}) — {1}', logBackoff:'Backoff ({0}): {1}',
            logSettingsSaved:'Ayarlar kaydedildi', logResetDone:'Sıfırlandı', logExported:'Rapor indirildi',
            logStateLoaded:'Yüklendi: {0} çıkarılmış, {1} kalan', logError:'Hata: {0}',
            logWhitelisted:'@{0} beyaz listeye eklendi', logWlRemoved:'@{0} beyaz listeden çıkarıldı',
            logSkipWhitelist:'@{0} beyaz listede — atlandı', logSelectRemove:'{0} seçili bot çıkarılacak',
            logAdaptiveSlowdown:'Adaptif yavaşlama: {0}x — gecikme artırıldı',
            logSessionHealthOk:'Oturum sağlıklı',
            logSessionHealthFail:'Oturum sağlıksız — bekleniyor',
            logSoftRateLimit:'Soft rate limit algılandı — proaktif yavaşlama',
            logHealthCheck:'Oturum kontrolü yapılıyor...',
            logGqlStart:'GraphQL API ile tarama (50/sayfa)',
            logGqlToRest:'GraphQL limit — REST API\'ye geçildi (12/sayfa)',
            logRestToGql:'GraphQL API\'ye geri dönüldü (50/sayfa)',
            logGqlTotal:'Toplam takipçi: {0}',
            logApiMode:'API: {0} — {1}/sayfa',
            logGqlError:'GraphQL hata: {0}',
            durMin:'dk', durHour:'sa',
        },
        en: {
            title:'Bot Cleaner', minimize:'Minimize', close:'Close',
            tabDash:'Dashboard', tabBots:'Bot List', tabLog:'Log', tabWl:'Whitelist', tabSettings:'Settings',
            phaseReady:'Ready — Click Start', phaseFetchingFollowing:'Fetching following...',
            phaseScanning:'Scanning + removing...', phaseRemoving:'Removing bots...',
            phasePaused:'Scan paused — removal continues', phaseResuming:'Resuming...',
            phaseRateLimit:'Rate limited — waiting...', phaseSessionError:'Session error — log in again',
            phaseSessionNotFound:'Session not found!', phaseDone:'Done! {0} bots removed',
            phaseStopped:'Stopped — {0} removed, {1} remaining', phaseResumable:'Resumable — {0} in queue',
            phaseMegaPause:'Mega break — {0}', phaseBatchPause:'Batch break — {0}',
            phaseAdaptive:'Adaptive throttle active — {0}x',
            statFollowing:'Following', statFollowers:'Scanned', statBots:'Bots', statRemoved:'Removed', statQueue:'Queue', statFailed:'Failed',
            speed:'Speed', btnStart:'START', btnPause:'PAUSE SCAN', btnResume:'RESUME SCAN', btnStop:'STOP ALL', btnExport:'EXPORT REPORT',
            searchPlaceholder:'Search username...', botCount:'{0} bots',
            statusPending:'Pending', statusRemoved:'Removed', statusFailed:'Failed', statusQueue:'Queued', statusWhitelist:'Protected',
            moreItems:'+{0} more', noScanYet:'No scan yet', noResults:'No results',
            filterAll:'All', filterNoPic:'No Pic', filterHigh:'High Score', filterSelected:'Selected',
            selectAll:'Select All', deselectAll:'Deselect All', removeSelected:'REMOVE {0} SELECTED',
            scoreLabel:'Score', scoreLow:'Low', scoreMed:'Med', scoreHigh:'High',
            wlTitle:'Whitelist', wlDesc:'These accounts will never be removed', wlAdd:'ADD', wlPlaceholder:'@username',
            wlCount:'{0} protected', wlRemove:'Remove', wlImport:'IMPORT JSON', wlExport:'EXPORT', wlEmpty:'Whitelist empty',
            settFetchSpeed:'Fetch Speed', settMinDelay:'Min delay (ms)', settMaxDelay:'Max delay (ms)', settPerPage:'Per page',
            settRemoveSpeed:'Remove Speed', settBatchSize:'Batch size', settBatchPauseMin:'Batch pause min (ms)', settBatchPauseMax:'Batch pause max (ms)',
            settMegaBatch:'Mega Batch', settMegaSize:'Mega size', settMegaPauseMin:'Mega min (ms)', settMegaPauseMax:'Mega max (ms)',
            btnSaveSettings:'SAVE SETTINGS', btnResetAll:'RESET ALL DATA',
            confirmClose:'Process running. Close?', confirmReset:'ALL data will be deleted. Sure?',
            logReady:'Bot Cleaner v4 ready.', logSessionNotFound:'Session not found',
            logResumeQueue:'Resuming: {0} in queue', logPhase1:'Phase 1: Fetching following',
            logFollowingCache:'Following cache: {0}', logPhase23:'Phase 2+3: Scan + remove',
            logScanDone:'Scan done: {0} bots', logDone:'Done: {0} removed, {1} failed',
            logPaused:'Scan paused', logResumed:'Scan resumed', logStopped:'Stopped. Session: {0}',
            logRateLimit:'Rate limit ({0})', logSessionError:'Session error',
            logFetchRetry:'{0} error ({1}), retry {2}/{3}', logFetchFail:'{0} fetch failed',
            logFetchDone:'{0} done: {1}', logFetchProgress:'{0}: {1} fetched',
            logScanProgress:'Scan: {0} followers, {1} bots', logCsrfError:'CSRF not found',
            logRateLimitUser:'Rate limit @{0}', logSessionRefresh:'CSRF refreshing',
            logRemoved:'@{0} removed [{1}] — {2} left', logRemoveFailed:'@{0} failed ({1})',
            logConsecutiveErrors:'{0} errors — {1} break', logMegaPause:'Mega break ({0}) — {1}',
            logBatchPause:'Batch break ({0}) — {1}', logBackoff:'Backoff ({0}): {1}',
            logSettingsSaved:'Settings saved', logResetDone:'Reset done', logExported:'Report downloaded',
            logStateLoaded:'Loaded: {0} removed, {1} left', logError:'Error: {0}',
            logWhitelisted:'@{0} whitelisted', logWlRemoved:'@{0} removed from whitelist',
            logSkipWhitelist:'@{0} whitelisted — skipped', logSelectRemove:'{0} selected bots to remove',
            logAdaptiveSlowdown:'Adaptive slowdown: {0}x — delay increased',
            logSessionHealthOk:'Session healthy',
            logSessionHealthFail:'Session unhealthy — waiting',
            logSoftRateLimit:'Soft rate limit detected — proactive slowdown',
            logHealthCheck:'Running session health check...',
            logGqlStart:'Scanning via GraphQL API (50/page)',
            logGqlToRest:'GraphQL limited — switched to REST API (12/page)',
            logRestToGql:'Switched back to GraphQL API (50/page)',
            logGqlTotal:'Total followers: {0}',
            logApiMode:'API: {0} — {1}/page',
            logGqlError:'GraphQL error: {0}',
            durMin:'min', durHour:'h',
        },
    };
    let currentLang = 'tr';
    function t(key, ...args) {
        let s = (LANG[currentLang] && LANG[currentLang][key]) || LANG.tr[key] || key;
        args.forEach((v, i) => { s = s.replace(`{${i}}`, v); });
        return s;
    }

    // ═══ STATE ═══
    const state = {
        running: false, scanPaused: false, followingSet: new Set(), followingList: [],
        followersScanned: 0, botsFound: [], removalQueue: [], removedList: [], failedList: [],
        fetchComplete: false, currentBackoff: CONFIG.RATE_LIMIT_INITIAL, consecutiveErrors: 0,
        sessionRemoved: 0, startTime: 0, logs: [],
        whitelist: new Set(), whitelistUsers: [],
        selectedBots: new Set(), selectMode: false, botFilter: 'all',
    };
    const removedIds = new Set(), failedIds = new Set(), queueIds = new Set();

    // ═══ UTILS ═══
    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
    const rand = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;
    const rdelay = (a, b) => sleep(rand(a, b));

    // Box-Muller transform — Gaussian (normal) random distribution
    function gaussRand(mean, stddev) {
        let u1 = Math.random(), u2 = Math.random();
        while (u1 === 0) u1 = Math.random();
        const z = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
        return Math.max(0, Math.round(mean + z * stddev));
    }

    // Human-like delay: Gaussian distribution centered between min and max
    // 95% of values fall within [min, max], with occasional outliers for realism
    function humanDelay(min, max) {
        const mean = (min + max) / 2;
        const stddev = (max - min) / 4;
        const delay = gaussRand(mean, stddev);
        return Math.max(Math.round(min * 0.85), Math.min(Math.round(max * 1.25), delay));
    }

    function fmtDur(ms) {
        if (ms < 1000) return ms + 'ms';
        const s = Math.floor(ms / 1000);
        if (s < 60) return s + 's';
        const m = Math.floor(s / 60), rs = s % 60;
        if (m < 60) return m + t('durMin') + ' ' + rs + 's';
        return Math.floor(m / 60) + t('durHour') + ' ' + (m % 60) + t('durMin');
    }
    function fmtTime(d) { return d.toLocaleTimeString(currentLang === 'tr' ? 'tr-TR' : 'en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }); }
    function fmtNum(n) { return n.toLocaleString(currentLang === 'tr' ? 'tr-TR' : 'en-US'); }
    function escH(s) { const d = document.createElement('div'); d.textContent = s; return d.innerHTML; }

    // ═══ RESPONSE TIME TRACKER (Adaptive Throttle) ═══
    const responseTracker = {
        times: [],
        add(ms) {
            this.times.push(ms);
            if (this.times.length > CONFIG.RT_WINDOW) this.times.shift();
        },
        average() {
            if (this.times.length === 0) return 0;
            return this.times.reduce((a, b) => a + b, 0) / this.times.length;
        },
        isSlowing() {
            if (this.times.length < 3) return false;
            const avg = this.average();
            const recent = this.times.slice(-2);
            const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
            return recentAvg > avg * CONFIG.RT_SLOW_THRESHOLD;
        },
        getMultiplier() {
            if (!this.isSlowing()) return 1.0;
            const avg = this.average();
            const recent = this.times.slice(-2);
            const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
            return Math.min(CONFIG.RT_SLOWDOWN_MAX, recentAvg / avg);
        },
        reset() { this.times = []; },
    };

    // ═══ WEB SESSION ID ═══
    function getWebSessionId() {
        let sid = sessionStorage.getItem('bd-web-session-id');
        if (!sid) {
            const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
            const seg = () => { let s = ''; for (let i = 0; i < 6; i++) s += chars[Math.floor(Math.random() * chars.length)]; return s; };
            sid = `${seg()}:${seg()}:${seg()}`;
            sessionStorage.setItem('bd-web-session-id', sid);
        }
        return sid;
    }

    // ═══ BOT SCORE ═══
    function calcScore(u) {
        let s = 0;
        if (u.no_pic) s += 4;
        if (/^\d{5,}/.test(u.username) || (u.username.replace(/[^0-9]/g, '').length / u.username.length) > 0.5) s += 3;
        if (!u.full_name || u.full_name.trim().length === 0) s += 2;
        else if (u.full_name.toLowerCase() === u.username.toLowerCase()) s += 1;
        if (/_{3,}|\.{3,}/.test(u.username)) s += 1;
        if (u.is_private) s += 1;
        if (u.is_verified) s -= 10;
        return Math.max(0, s);
    }
    function scoreClass(s) { return s >= 6 ? 'high' : s >= 3 ? 'med' : 'low'; }

    // ═══ STORAGE ═══
    const store = {
        k: (n) => CONFIG.STORAGE_PREFIX + n,
        get(n, fb = null) { try { const r = localStorage.getItem(this.k(n)); return r !== null ? JSON.parse(r) : fb; } catch { return fb; } },
        set(n, v) { try { localStorage.setItem(this.k(n), JSON.stringify(v)); } catch {} },
        del(n) { localStorage.removeItem(this.k(n)); },
        clear() { Object.keys(localStorage).filter(k => k.startsWith(CONFIG.STORAGE_PREFIX)).forEach(k => localStorage.removeItem(k)); },
    };

    // ═══ AUTH & API ═══
    function getCookie(n) { const m = document.cookie.split(';').find(c => c.trim().startsWith(n + '=')); return m ? m.split('=')[1].trim() : null; }
    const getCsrf = () => getCookie('csrftoken');
    const getUid = () => getCookie('ds_user_id');

    // Full header set matching real Instagram web client
    function getHeaders(csrf) {
        return {
            'accept': '*/*',
            'x-asbd-id': '359341',
            'x-csrftoken': csrf,
            'x-ig-app-id': '936619743392459',
            'x-ig-www-claim': sessionStorage.getItem('www-claim-v2') || '0',
            'x-requested-with': 'XMLHttpRequest',
            'x-web-session-id': getWebSessionId(),
        };
    }
    function postHeaders(csrf) {
        return {
            ...getHeaders(csrf),
            'content-type': 'application/x-www-form-urlencoded',
        };
    }

    function saveClaim(r) { const c = r.headers.get('x-ig-set-www-claim'); if (c) sessionStorage.setItem('www-claim-v2', c); }

    // API calls with response time tracking
    async function apiGet(url, csrf) {
        const start = performance.now();
        const r = await fetch(url, {
            method: 'GET',
            headers: getHeaders(csrf),
            credentials: 'include',
            referrerPolicy: 'strict-origin-when-cross-origin',
        });
        responseTracker.add(performance.now() - start);
        saveClaim(r);
        return r;
    }
    async function apiPost(url, csrf) {
        const start = performance.now();
        const r = await fetch(url, {
            method: 'POST',
            headers: postHeaders(csrf),
            credentials: 'include',
            body: '',
            referrerPolicy: 'strict-origin-when-cross-origin',
        });
        responseTracker.add(performance.now() - start);
        saveClaim(r);
        return r;
    }

    // ═══ SESSION HEALTH CHECK ═══
    async function sessionHealthCheck(csrf) {
        const uid = getUid();
        if (!csrf || !uid) return false;
        try {
            const r = await fetch(`/api/v1/users/${uid}/info/`, {
                method: 'GET',
                headers: getHeaders(csrf),
                credentials: 'include',
                referrerPolicy: 'strict-origin-when-cross-origin',
            });
            saveClaim(r);
            return r.ok;
        } catch {
            return false;
        }
    }

    // ═══ CSS ═══
    function injectCSS() {
        const s = document.createElement('style');
        s.textContent = `
#bd-panel{position:fixed;top:20px;right:20px;width:440px;max-height:88vh;background:#0d0d1f;border:1px solid #2a2a4a;border-radius:16px;color:#e8e8e8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-size:13px;z-index:999999;box-shadow:0 8px 32px rgba(0,0,0,.6);display:flex;flex-direction:column;overflow:hidden;transition:all .3s}
#bd-panel.minimized{max-height:48px;width:320px;border-radius:24px}
#bd-panel.minimized .bd-body{display:none}
.bd-hdr{display:flex;align-items:center;padding:10px 14px;background:#12122a;cursor:move;user-select:none;border-bottom:1px solid #2a2a4a;min-height:44px;box-sizing:border-box;flex-shrink:0}
.bd-hdr-icon{font-size:16px;margin-right:6px}.bd-hdr-title{flex:1;font-weight:700;font-size:13px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.bd-hdr-badge{background:#e94560;color:#fff;font-size:10px;font-weight:700;padding:2px 7px;border-radius:10px;margin-right:6px}
.bd-hdr-btn{background:none;border:none;color:#888;font-size:16px;cursor:pointer;padding:2px 6px;transition:color .2s}.bd-hdr-btn:hover{color:#fff}
.bd-lang-toggle{display:flex;margin-right:6px;border:1px solid #2a2a4a;border-radius:5px;overflow:hidden}
.bd-lang-btn{background:none;border:none;color:#666;font-size:10px;font-weight:700;cursor:pointer;padding:3px 7px;transition:all .2s}.bd-lang-btn:hover{color:#aaa}.bd-lang-btn.active{background:#e94560;color:#fff}
.bd-tabs{display:flex;background:#0a0a18;border-bottom:1px solid #2a2a4a;flex-shrink:0}
.bd-tab{flex:1;padding:8px 2px;background:none;border:none;color:#666;font-size:10px;font-weight:600;cursor:pointer;border-bottom:2px solid transparent;transition:all .2s;text-transform:uppercase;letter-spacing:.3px}.bd-tab:hover{color:#aaa}.bd-tab.active{color:#e94560;border-bottom-color:#e94560}
.bd-body{flex:1;overflow:hidden;display:flex;flex-direction:column}
.bd-content{flex:1;overflow-y:auto;padding:14px;display:none}.bd-content.active{display:block}.bd-content::-webkit-scrollbar{width:4px}.bd-content::-webkit-scrollbar-thumb{background:#2a2a4a;border-radius:2px}
.bd-phase{text-align:center;padding:8px;margin-bottom:10px;background:#1a1a3a;border-radius:8px;font-weight:600;font-size:12px}
.bd-phase.running{background:#1a2a1a;color:#00e676}.bd-phase.paused{background:#2a2a1a;color:#ffab00}.bd-phase.error{background:#2a1a1a;color:#ff1744}.bd-phase.adaptive{background:#1a1a2a;color:#bb86fc}
.bd-stats{display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;margin-bottom:10px}
.bd-stat{background:#1a1a3a;border-radius:8px;padding:8px;text-align:center}
.bd-stat-val{font-size:18px;font-weight:700;display:block;margin-bottom:1px}.bd-stat-lbl{font-size:9px;color:#888;text-transform:uppercase;letter-spacing:.4px}
.bd-stat-val.accent{color:#e94560}.bd-stat-val.success{color:#00e676}.bd-stat-val.info{color:#00b4d8}.bd-stat-val.warn{color:#ffab00}
.bd-prog{margin-bottom:10px}.bd-prog-bar{height:6px;background:#1a1a3a;border-radius:3px;overflow:hidden;margin-bottom:4px}
.bd-prog-fill{height:100%;background:linear-gradient(90deg,#e94560,#ff6b81);border-radius:3px;transition:width .5s;width:0%}
.bd-prog-info{display:flex;justify-content:space-between;font-size:10px;color:#888}
.bd-ctrls{display:flex;gap:6px;margin-bottom:8px}
.bd-btn{flex:1;padding:8px;border:none;border-radius:8px;font-weight:700;font-size:11px;cursor:pointer;transition:all .2s;text-transform:uppercase;letter-spacing:.3px}.bd-btn:disabled{opacity:.3;cursor:not-allowed}
.bd-btn-start{background:#00e676;color:#0a0a1a}.bd-btn-start:hover:not(:disabled){background:#00ff88}
.bd-btn-pause{background:#ffab00;color:#0a0a1a}.bd-btn-pause:hover:not(:disabled){background:#ffc107}
.bd-btn-stop{background:#ff1744;color:#fff}.bd-btn-stop:hover:not(:disabled){background:#ff5252}
.bd-btn-export{background:#1a1a3a;color:#00b4d8;border:1px solid #2a2a4a}.bd-btn-export:hover:not(:disabled){background:#2a2a4a}
.bd-btn-wl{background:#1a1a3a;color:#bb86fc;border:1px solid #2a2a4a}.bd-btn-wl:hover{background:#2a2a4a}
.bd-btn-sel{background:#1a2a2a;color:#00e676;border:1px solid #1a3a2a}.bd-btn-sel:hover:not(:disabled){background:#1a3a2a}
.bd-speed{display:flex;justify-content:space-around;background:#1a1a3a;border-radius:8px;padding:6px;margin-bottom:10px;font-size:11px}.bd-speed span{color:#888}.bd-speed b{color:#e8e8e8}
.bd-search{width:100%;padding:8px 12px;background:#1a1a3a;border:1px solid #2a2a4a;border-radius:8px;color:#e8e8e8;font-size:12px;margin-bottom:8px;box-sizing:border-box;outline:none}.bd-search:focus{border-color:#e94560}.bd-search::placeholder{color:#555}
.bd-filters{display:flex;gap:4px;margin-bottom:8px}.bd-fbtn{padding:5px 10px;background:#1a1a3a;border:1px solid #2a2a4a;border-radius:6px;color:#888;font-size:10px;font-weight:600;cursor:pointer;transition:all .2s}.bd-fbtn:hover{color:#ccc}.bd-fbtn.active{background:#e94560;color:#fff;border-color:#e94560}
.bd-bulk-bar{display:flex;gap:4px;margin-bottom:8px;align-items:center}.bd-bulk-bar .bd-btn{padding:6px 8px;font-size:10px}
.bd-blist{max-height:calc(85vh - 280px);overflow-y:auto}
.bd-bitem{display:flex;align-items:center;padding:6px 8px;border-radius:6px;margin-bottom:3px;transition:background .2s}.bd-bitem:hover{background:#1a1a3a}
.bd-bitem-cb{width:16px;height:16px;margin-right:8px;cursor:pointer;accent-color:#e94560;flex-shrink:0}
.bd-bitem-avatar{width:32px;height:32px;border-radius:50%;margin-right:8px;background:#2a2a4a;object-fit:cover;flex-shrink:0}
.bd-bitem-info{flex:1;min-width:0}.bd-bitem-user{font-weight:600;font-size:12px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.bd-bitem-name{font-size:10px;color:#666;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.bd-bitem-score{font-size:9px;font-weight:700;padding:2px 6px;border-radius:4px;margin:0 4px;flex-shrink:0}
.bd-bitem-score.low{background:#1a2a1a;color:#00e676}.bd-bitem-score.med{background:#2a2a1a;color:#ffab00}.bd-bitem-score.high{background:#2a1a1a;color:#ff1744}
.bd-bitem-status{font-size:9px;font-weight:700;padding:2px 6px;border-radius:4px;flex-shrink:0}
.bd-bitem-status.pending{background:#2a2a1a;color:#ffab00}.bd-bitem-status.removed{background:#1a2a1a;color:#00e676}.bd-bitem-status.failed{background:#2a1a1a;color:#ff1744}.bd-bitem-status.queue{background:#1a1a2a;color:#00b4d8}.bd-bitem-status.whitelist{background:#1a1a2a;color:#bb86fc}
.bd-log-box{max-height:calc(85vh - 120px);overflow-y:auto;font-family:'SF Mono',Monaco,Consolas,monospace;font-size:10px;line-height:1.5}
.bd-log-line{padding:1px 0;border-bottom:1px solid #1a1a2a}.bd-log-time{color:#555;margin-right:4px}
.bd-log-ok{color:#00e676}.bd-log-warn{color:#ffab00}.bd-log-err{color:#ff1744}.bd-log-info{color:#00b4d8}.bd-log-dim{color:#555}
.bd-sgroup{margin-bottom:14px}.bd-sgroup-title{font-size:10px;font-weight:700;color:#e94560;text-transform:uppercase;letter-spacing:.4px;margin-bottom:6px}
.bd-srow{display:flex;align-items:center;justify-content:space-between;margin-bottom:4px;font-size:11px}.bd-srow label{color:#888;flex:1}
.bd-sinput{width:76px;padding:5px 8px;background:#1a1a3a;border:1px solid #2a2a4a;border-radius:5px;color:#e8e8e8;font-size:11px;text-align:right}.bd-sinput:focus{outline:none;border-color:#e94560}
.bd-sbtn{width:100%;padding:8px;border:none;border-radius:8px;font-weight:700;font-size:11px;cursor:pointer;margin-top:6px;text-transform:uppercase}
.bd-sbtn-reset{background:#2a1a1a;color:#ff1744}.bd-sbtn-reset:hover{background:#3a1a1a}
.bd-sbtn-save{background:#1a2a1a;color:#00e676}.bd-sbtn-save:hover{background:#1a3a1a}
.bd-empty{text-align:center;padding:30px;color:#555;font-size:12px}
.bd-queue-label{font-size:10px;color:#888;margin-bottom:6px;display:flex;justify-content:space-between}
.bd-wl-add{display:flex;gap:6px;margin-bottom:10px}.bd-wl-add input{flex:1}
.bd-wl-item{display:flex;align-items:center;padding:6px 8px;border-radius:6px;margin-bottom:3px}.bd-wl-item:hover{background:#1a1a3a}
.bd-wl-item span{flex:1;font-weight:600;font-size:12px}.bd-wl-rm{background:#2a1a1a;border:none;color:#ff1744;padding:4px 10px;border-radius:5px;cursor:pointer;font-size:10px;font-weight:700}.bd-wl-rm:hover{background:#3a1a1a}
.bd-nopic-icon{color:#ff1744;font-size:10px;margin-right:4px}
`;
        document.head.appendChild(s);
    }

    // ═══ UI BUILD ═══
    let panel, els = {};
    function buildUI() {
        panel = document.createElement('div');
        panel.id = 'bd-panel';
        panel.innerHTML = `
<div class="bd-hdr" id="bd-drag"><span class="bd-hdr-icon">🤖</span><span class="bd-hdr-title" data-i="title"></span><span class="bd-hdr-badge" id="bd-badge" style="display:none">0</span>
<div class="bd-lang-toggle"><button class="bd-lang-btn active" data-lang="tr">TR</button><button class="bd-lang-btn" data-lang="en">EN</button></div>
<button class="bd-hdr-btn" id="bd-min">─</button><button class="bd-hdr-btn" id="bd-close">✕</button></div>
<div class="bd-body"><div class="bd-tabs">
<button class="bd-tab active" data-tab="dash" data-i="tabDash"></button>
<button class="bd-tab" data-tab="bots" data-i="tabBots"></button>
<button class="bd-tab" data-tab="log" data-i="tabLog"></button>
<button class="bd-tab" data-tab="wl" data-i="tabWl"></button>
<button class="bd-tab" data-tab="settings" data-i="tabSettings"></button></div>

<div class="bd-content active" data-tab="dash">
<div class="bd-phase" id="bd-phase"></div>
<div class="bd-stats">
<div class="bd-stat"><span class="bd-stat-val info" id="bd-s-following">—</span><span class="bd-stat-lbl" data-i="statFollowing"></span></div>
<div class="bd-stat"><span class="bd-stat-val info" id="bd-s-followers">—</span><span class="bd-stat-lbl" data-i="statFollowers"></span></div>
<div class="bd-stat"><span class="bd-stat-val accent" id="bd-s-bots">0</span><span class="bd-stat-lbl" data-i="statBots"></span></div>
<div class="bd-stat"><span class="bd-stat-val success" id="bd-s-removed">0</span><span class="bd-stat-lbl" data-i="statRemoved"></span></div>
<div class="bd-stat"><span class="bd-stat-val warn" id="bd-s-queue">0</span><span class="bd-stat-lbl" data-i="statQueue"></span></div>
<div class="bd-stat"><span class="bd-stat-val" id="bd-s-failed">0</span><span class="bd-stat-lbl" data-i="statFailed"></span></div></div>
<div class="bd-prog"><div class="bd-prog-bar"><div class="bd-prog-fill" id="bd-prog-fill"></div></div>
<div class="bd-prog-info"><span id="bd-prog-pct">%0</span><span id="bd-prog-detail">—</span></div></div>
<div class="bd-speed"><span><span data-i="speed"></span>: <b id="bd-speed">—</b>/h</span><span>ETA: <b id="bd-eta">—</b></span></div>
<div class="bd-ctrls"><button class="bd-btn bd-btn-start" id="bd-start"></button><button class="bd-btn bd-btn-pause" id="bd-pause" disabled></button><button class="bd-btn bd-btn-stop" id="bd-stop" disabled></button></div>
<div class="bd-ctrls"><button class="bd-btn bd-btn-export" id="bd-export" data-i="btnExport"></button></div></div>

<div class="bd-content" data-tab="bots">
<input class="bd-search" id="bd-search" data-i-placeholder="searchPlaceholder">
<div class="bd-filters" id="bd-filters">
<button class="bd-fbtn active" data-filter="all" data-i="filterAll"></button>
<button class="bd-fbtn" data-filter="nopic" data-i="filterNoPic"></button>
<button class="bd-fbtn" data-filter="high" data-i="filterHigh"></button>
<button class="bd-fbtn" data-filter="selected" data-i="filterSelected"></button></div>
<div class="bd-bulk-bar" id="bd-bulk">
<button class="bd-btn bd-btn-sel" id="bd-sel-all" data-i="selectAll"></button>
<button class="bd-btn bd-btn-export" id="bd-desel-all" data-i="deselectAll"></button>
<button class="bd-btn bd-btn-stop" id="bd-rem-sel" disabled></button></div>
<div class="bd-queue-label"><span id="bd-blist-count"></span></div>
<div class="bd-blist" id="bd-blist"></div></div>

<div class="bd-content" data-tab="log"><div class="bd-log-box" id="bd-logbox"></div></div>

<div class="bd-content" data-tab="wl">
<div class="bd-sgroup"><div class="bd-sgroup-title" data-i="wlTitle"></div><div style="font-size:11px;color:#888;margin-bottom:8px" data-i="wlDesc"></div>
<div class="bd-wl-add"><input class="bd-search" id="bd-wl-input" data-i-placeholder="wlPlaceholder"><button class="bd-btn bd-btn-wl" id="bd-wl-add-btn" data-i="wlAdd" style="flex:0 0 60px"></button></div></div>
<div class="bd-queue-label"><span id="bd-wl-count"></span></div>
<div class="bd-blist" id="bd-wl-list"></div>
<div class="bd-ctrls" style="margin-top:10px"><button class="bd-btn bd-btn-export" id="bd-wl-import" data-i="wlImport"></button><button class="bd-btn bd-btn-export" id="bd-wl-export" data-i="wlExport"></button></div></div>

<div class="bd-content" data-tab="settings">
<div class="bd-sgroup"><div class="bd-sgroup-title" data-i="settFetchSpeed"></div>
<div class="bd-srow"><label data-i="settMinDelay"></label><input class="bd-sinput" data-cfg="FETCH_DELAY_MIN" value="${CONFIG.FETCH_DELAY_MIN}"></div>
<div class="bd-srow"><label data-i="settMaxDelay"></label><input class="bd-sinput" data-cfg="FETCH_DELAY_MAX" value="${CONFIG.FETCH_DELAY_MAX}"></div>
<div class="bd-srow"><label data-i="settPerPage"></label><input class="bd-sinput" data-cfg="FETCH_PER_PAGE" value="${CONFIG.FETCH_PER_PAGE}"></div></div>
<div class="bd-sgroup"><div class="bd-sgroup-title" data-i="settRemoveSpeed"></div>
<div class="bd-srow"><label data-i="settMinDelay"></label><input class="bd-sinput" data-cfg="REMOVE_DELAY_MIN" value="${CONFIG.REMOVE_DELAY_MIN}"></div>
<div class="bd-srow"><label data-i="settMaxDelay"></label><input class="bd-sinput" data-cfg="REMOVE_DELAY_MAX" value="${CONFIG.REMOVE_DELAY_MAX}"></div>
<div class="bd-srow"><label data-i="settBatchSize"></label><input class="bd-sinput" data-cfg="BATCH_SIZE" value="${CONFIG.BATCH_SIZE}"></div>
<div class="bd-srow"><label data-i="settBatchPauseMin"></label><input class="bd-sinput" data-cfg="BATCH_PAUSE_MIN" value="${CONFIG.BATCH_PAUSE_MIN}"></div>
<div class="bd-srow"><label data-i="settBatchPauseMax"></label><input class="bd-sinput" data-cfg="BATCH_PAUSE_MAX" value="${CONFIG.BATCH_PAUSE_MAX}"></div></div>
<div class="bd-sgroup"><div class="bd-sgroup-title" data-i="settMegaBatch"></div>
<div class="bd-srow"><label data-i="settMegaSize"></label><input class="bd-sinput" data-cfg="MEGA_BATCH_SIZE" value="${CONFIG.MEGA_BATCH_SIZE}"></div>
<div class="bd-srow"><label data-i="settMegaPauseMin"></label><input class="bd-sinput" data-cfg="MEGA_PAUSE_MIN" value="${CONFIG.MEGA_PAUSE_MIN}"></div>
<div class="bd-srow"><label data-i="settMegaPauseMax"></label><input class="bd-sinput" data-cfg="MEGA_PAUSE_MAX" value="${CONFIG.MEGA_PAUSE_MAX}"></div></div>
<button class="bd-sbtn bd-sbtn-save" id="bd-save-cfg" data-i="btnSaveSettings"></button>
<button class="bd-sbtn bd-sbtn-reset" id="bd-reset-all" data-i="btnResetAll"></button></div>
</div>`;
        document.body.appendChild(panel);
        cacheEls(); bindEvents(); applyLang(); loadSavedState();
    }

    function cacheEls() {
        const q = s => panel.querySelector(s);
        els = {
            phase: q('#bd-phase'), badge: q('#bd-badge'),
            sFollowing: q('#bd-s-following'), sFollowers: q('#bd-s-followers'), sBots: q('#bd-s-bots'),
            sRemoved: q('#bd-s-removed'), sQueue: q('#bd-s-queue'), sFailed: q('#bd-s-failed'),
            progFill: q('#bd-prog-fill'), progPct: q('#bd-prog-pct'), progDetail: q('#bd-prog-detail'),
            speed: q('#bd-speed'), eta: q('#bd-eta'),
            btnStart: q('#bd-start'), btnPause: q('#bd-pause'), btnStop: q('#bd-stop'), btnExport: q('#bd-export'),
            search: q('#bd-search'), blistCount: q('#bd-blist-count'), blist: q('#bd-blist'),
            logbox: q('#bd-logbox'), remSel: q('#bd-rem-sel'),
            wlInput: q('#bd-wl-input'), wlList: q('#bd-wl-list'), wlCount: q('#bd-wl-count'),
        };
    }

    // ═══ i18n APPLY ═══
    function applyLang() {
        panel.querySelectorAll('[data-i]').forEach(el => { el.textContent = t(el.dataset.i); });
        panel.querySelectorAll('[data-i-placeholder]').forEach(el => { el.placeholder = t(el.dataset.iPlaceholder); });
        panel.querySelector('#bd-min').title = t('minimize');
        panel.querySelector('#bd-close').title = t('close');
        panel.querySelectorAll('.bd-lang-btn').forEach(b => b.classList.toggle('active', b.dataset.lang === currentLang));
        setButtons(state.running ? (state.scanPaused ? 'scanPaused' : 'running') : 'idle');
        updateSelBtn();
    }
    function switchLang(lang) { if (lang === currentLang) return; currentLang = lang; store.set('lang', lang); applyLang(); renderBotList(); renderWhitelist(); ui_update(); }

    // ═══ EVENTS ═══
    function bindEvents() {
        panel.querySelectorAll('.bd-tab').forEach(tab => tab.addEventListener('click', () => {
            panel.querySelectorAll('.bd-tab').forEach(x => x.classList.remove('active'));
            panel.querySelectorAll('.bd-content').forEach(x => x.classList.remove('active'));
            tab.classList.add('active');
            panel.querySelector(`.bd-content[data-tab="${tab.dataset.tab}"]`).classList.add('active');
        }));
        panel.querySelectorAll('.bd-lang-btn').forEach(b => b.addEventListener('click', () => switchLang(b.dataset.lang)));
        // Drag
        let dragging = false, dx = 0, dy = 0;
        panel.querySelector('#bd-drag').addEventListener('mousedown', e => {
            if (e.target.closest('.bd-hdr-btn,.bd-lang-toggle')) return;
            dragging = true; dx = e.clientX - panel.offsetLeft; dy = e.clientY - panel.offsetTop; document.body.style.userSelect = 'none';
        });
        document.addEventListener('mousemove', e => { if (!dragging) return; panel.style.left = Math.max(0, e.clientX - dx) + 'px'; panel.style.top = Math.max(0, e.clientY - dy) + 'px'; panel.style.right = 'auto'; });
        document.addEventListener('mouseup', () => { dragging = false; document.body.style.userSelect = ''; });
        panel.querySelector('#bd-min').addEventListener('click', () => panel.classList.toggle('minimized'));
        panel.querySelector('#bd-close').addEventListener('click', () => { if (state.running && !confirm(t('confirmClose'))) return; state.running = false; panel.remove(); window.__BD_LOADED__ = false; });
        // Controls
        els.btnStart.addEventListener('click', startProcess);
        els.btnPause.addEventListener('click', toggleScanPause);
        els.btnStop.addEventListener('click', stopProcess);
        els.btnExport.addEventListener('click', exportReport);
        els.search.addEventListener('input', renderBotList);
        // Filters
        panel.querySelectorAll('.bd-fbtn').forEach(b => b.addEventListener('click', () => {
            panel.querySelectorAll('.bd-fbtn').forEach(x => x.classList.remove('active'));
            b.classList.add('active'); state.botFilter = b.dataset.filter; renderBotList();
        }));
        // Bulk select
        panel.querySelector('#bd-sel-all').addEventListener('click', () => { getFilteredBots().forEach(b => state.selectedBots.add(b.id)); renderBotList(); updateSelBtn(); });
        panel.querySelector('#bd-desel-all').addEventListener('click', () => { state.selectedBots.clear(); renderBotList(); updateSelBtn(); });
        els.remSel.addEventListener('click', removeSelectedOnly);
        // Whitelist
        panel.querySelector('#bd-wl-add-btn').addEventListener('click', addWhitelist);
        els.wlInput.addEventListener('keydown', e => { if (e.key === 'Enter') addWhitelist(); });
        panel.querySelector('#bd-wl-import').addEventListener('click', importWhitelist);
        panel.querySelector('#bd-wl-export').addEventListener('click', exportWhitelist);
        // Settings
        panel.querySelector('#bd-save-cfg').addEventListener('click', saveSettings);
        panel.querySelector('#bd-reset-all').addEventListener('click', resetAll);
    }

    // ═══ UI UPDATE ═══
    function ui_update() {
        els.sFollowing.textContent = fmtNum(state.followingList.length);
        els.sFollowers.textContent = fmtNum(state.followersScanned);
        els.sBots.textContent = fmtNum(state.botsFound.length);
        els.sRemoved.textContent = fmtNum(state.removedList.length);
        els.sQueue.textContent = fmtNum(state.removalQueue.length);
        els.sFailed.textContent = fmtNum(state.failedList.length);
        const total = state.botsFound.length, done = state.removedList.length;
        const pct = total > 0 ? Math.round((done / total) * 100) : 0;
        els.progFill.style.width = pct + '%';
        els.progPct.textContent = '%' + pct;
        els.progDetail.textContent = total > 0 ? `${fmtNum(done)} / ${fmtNum(total)}` : '—';
        els.badge.style.display = state.removalQueue.length > 0 ? '' : 'none';
        els.badge.textContent = state.removalQueue.length;
        if (state.sessionRemoved > 0 && state.startTime > 0) {
            const elapsed = Date.now() - state.startTime, rate = state.sessionRemoved / (elapsed / 3600000);
            els.speed.textContent = Math.round(rate);
            const rem = state.removalQueue.length;
            els.eta.textContent = rem > 0 && rate > 0 ? fmtDur((rem / rate) * 3600000) : '—';
        }
    }
    function setPhase(text, cls = '') { els.phase.textContent = text; els.phase.className = 'bd-phase ' + cls; }
    function addLog(msg, type = 'info') {
        const time = fmtTime(new Date());
        state.logs.push({ time, msg, type }); if (state.logs.length > 500) state.logs.shift();
        const line = document.createElement('div'); line.className = 'bd-log-line';
        line.innerHTML = `<span class="bd-log-time">${time}</span><span class="bd-log-${type}">${escH(msg)}</span>`;
        els.logbox.appendChild(line); els.logbox.scrollTop = els.logbox.scrollHeight;
    }
    function updateSelBtn() {
        const n = state.selectedBots.size;
        els.remSel.disabled = n === 0;
        els.remSel.textContent = t('removeSelected', n);
    }

    // ═══ BOT LIST ═══
    function getFilteredBots() {
        const q = (els.search.value || '').toLowerCase().trim();
        let list = state.botsFound;
        if (q) list = list.filter(b => b.username.toLowerCase().includes(q) || (b.full_name || '').toLowerCase().includes(q));
        if (state.botFilter === 'nopic') list = list.filter(b => b.no_pic);
        else if (state.botFilter === 'high') list = list.filter(b => (b.score || 0) >= 6);
        else if (state.botFilter === 'selected') list = list.filter(b => state.selectedBots.has(b.id));
        return list;
    }
    function renderBotList() {
        const list = getFilteredBots();
        els.blistCount.textContent = t('botCount', fmtNum(list.length));
        els.blist.innerHTML = '';
        const frag = document.createDocumentFragment(), max = Math.min(list.length, 200);
        for (let i = 0; i < max; i++) {
            const b = list[i];
            let stCls = 'pending', stTxt = t('statusPending');
            if (state.whitelist.has(b.id)) { stCls = 'whitelist'; stTxt = t('statusWhitelist'); }
            else if (removedIds.has(b.id)) { stCls = 'removed'; stTxt = t('statusRemoved'); }
            else if (failedIds.has(b.id)) { stCls = 'failed'; stTxt = t('statusFailed'); }
            else if (queueIds.has(b.id)) { stCls = 'queue'; stTxt = t('statusQueue'); }
            const sc = b.score || 0, scCls = scoreClass(sc);
            const noPicIcon = b.no_pic ? '<span class="bd-nopic-icon">&#x26D4;</span>' : '';
            const checked = state.selectedBots.has(b.id) ? 'checked' : '';
            const item = document.createElement('div'); item.className = 'bd-bitem';
            item.innerHTML = `<input type="checkbox" class="bd-bitem-cb" data-id="${b.id}" ${checked}>
${noPicIcon}<img class="bd-bitem-avatar" src="${b.pic || ''}" onerror="this.style.display='none'" alt="">
<div class="bd-bitem-info"><div class="bd-bitem-user">@${escH(b.username)}</div><div class="bd-bitem-name">${escH(b.full_name || '')}</div></div>
<span class="bd-bitem-score ${scCls}">${sc}</span>
<span class="bd-bitem-status ${stCls}">${stTxt}</span>`;
            frag.appendChild(item);
        }
        if (list.length > 200) { const m = document.createElement('div'); m.className = 'bd-empty'; m.textContent = t('moreItems', fmtNum(list.length - 200)); frag.appendChild(m); }
        if (list.length === 0) { const e = document.createElement('div'); e.className = 'bd-empty'; e.textContent = state.botsFound.length === 0 ? t('noScanYet') : t('noResults'); frag.appendChild(e); }
        els.blist.appendChild(frag);
        // Checkbox events
        els.blist.querySelectorAll('.bd-bitem-cb').forEach(cb => cb.addEventListener('change', () => {
            if (cb.checked) state.selectedBots.add(cb.dataset.id); else state.selectedBots.delete(cb.dataset.id);
            updateSelBtn();
        }));
    }

    // ═══ WHITELIST ═══
    function addWhitelist() {
        let name = (els.wlInput.value || '').trim().replace(/^@/, '');
        if (!name) return;
        const bot = state.botsFound.find(b => b.username.toLowerCase() === name.toLowerCase());
        const id = bot ? bot.id : 'wl_' + name.toLowerCase();
        if (state.whitelist.has(id)) return;
        state.whitelist.add(id);
        state.whitelistUsers.push({ id, username: bot ? bot.username : name, full_name: bot ? bot.full_name : '', pic: bot ? bot.pic : '' });
        if (queueIds.has(id)) {
            state.removalQueue = state.removalQueue.filter(b => b.id !== id);
            queueIds.delete(id);
        }
        saveWhitelist(); renderWhitelist(); renderBotList(); ui_update();
        addLog(t('logWhitelisted', name), 'info');
        els.wlInput.value = '';
    }
    function removeWhitelist(id) {
        state.whitelist.delete(id);
        state.whitelistUsers = state.whitelistUsers.filter(u => u.id !== id);
        const username = state.whitelistUsers.find(u => u.id === id)?.username || id;
        saveWhitelist(); renderWhitelist(); renderBotList();
        addLog(t('logWlRemoved', username), 'info');
    }
    function renderWhitelist() {
        els.wlCount.textContent = t('wlCount', state.whitelistUsers.length);
        els.wlList.innerHTML = '';
        if (state.whitelistUsers.length === 0) {
            els.wlList.innerHTML = `<div class="bd-empty">${t('wlEmpty')}</div>`;
            return;
        }
        const frag = document.createDocumentFragment();
        state.whitelistUsers.forEach(u => {
            const item = document.createElement('div'); item.className = 'bd-wl-item';
            item.innerHTML = `<img class="bd-bitem-avatar" src="${u.pic || ''}" onerror="this.style.display='none'" alt="" style="width:28px;height:28px;margin-right:8px">
<span>@${escH(u.username)}</span><button class="bd-wl-rm" data-id="${u.id}">${t('wlRemove')}</button>`;
            frag.appendChild(item);
        });
        els.wlList.appendChild(frag);
        els.wlList.querySelectorAll('.bd-wl-rm').forEach(b => b.addEventListener('click', () => removeWhitelist(b.dataset.id)));
    }
    function saveWhitelist() { store.set('whitelist', state.whitelistUsers); }
    function importWhitelist() {
        const input = document.createElement('input'); input.type = 'file'; input.accept = '.json';
        input.onchange = () => {
            const reader = new FileReader();
            reader.onload = () => {
                try {
                    const data = JSON.parse(reader.result);
                    const users = Array.isArray(data) ? data : (data.users || []);
                    users.forEach(u => {
                        const id = u.id || 'wl_' + (u.username || '').toLowerCase();
                        if (!state.whitelist.has(id)) {
                            state.whitelist.add(id);
                            state.whitelistUsers.push({ id, username: u.username || '', full_name: u.full_name || '', pic: u.pic || '' });
                        }
                    });
                    saveWhitelist(); renderWhitelist(); renderBotList();
                    addLog(`Whitelist imported: ${users.length}`, 'ok');
                } catch { addLog('JSON parse error', 'err'); }
            };
            reader.readAsText(input.files[0]);
        };
        input.click();
    }
    function exportWhitelist() {
        const blob = new Blob([JSON.stringify(state.whitelistUsers, null, 2)], { type: 'application/json' });
        const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
        a.download = 'whitelist.json'; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(a.href);
    }

    // ═══ SAVED STATE ═══
    function loadSavedState() {
        currentLang = store.get('lang', 'tr'); applyLang();
        const wl = store.get('whitelist', []);
        wl.forEach(u => { state.whitelist.add(u.id); state.whitelistUsers.push(u); });
        renderWhitelist();
        const saved = store.get('state');
        if (!saved) return;
        state.followingList = saved.followingList || [];
        state.followingSet = new Set(state.followingList.map(u => u.id));
        state.botsFound = saved.botsFound || [];
        state.removedList = saved.removedList || [];
        state.failedList = saved.failedList || [];
        state.followersScanned = saved.followersScanned || 0;
        state.fetchComplete = saved.fetchComplete || false;
        state.removedList.forEach(u => removedIds.add(u.id));
        state.failedList.forEach(u => failedIds.add(u.id));
        if (state.botsFound.length > 0) {
            const done = new Set([...removedIds, ...failedIds, ...state.whitelist]);
            state.removalQueue = state.botsFound.filter(b => !done.has(b.id));
            state.removalQueue.forEach(u => queueIds.add(u.id));
        }
        state.botsFound.forEach(b => { b.score = calcScore(b); });
        state.botsFound.sort((a, b) => (b.score || 0) - (a.score || 0));
        ui_update(); renderBotList();
        if (state.removedList.length > 0 || state.botsFound.length > 0) {
            addLog(t('logStateLoaded', state.removedList.length, state.removalQueue.length), 'info');
            setPhase(t('phaseResumable', state.removalQueue.length));
        }
        const cfg = store.get('config');
        if (cfg) { Object.assign(CONFIG, cfg); panel.querySelectorAll('.bd-sinput[data-cfg]').forEach(i => { if (CONFIG[i.dataset.cfg] !== undefined) i.value = CONFIG[i.dataset.cfg]; }); }
    }
    function saveState() {
        store.set('state', {
            followingList: state.followingList, botsFound: state.botsFound,
            removedList: state.removedList, failedList: state.failedList,
            followersScanned: state.followersScanned, fetchComplete: state.fetchComplete,
        });
    }

    // ═══ SETTINGS ═══
    function saveSettings() {
        panel.querySelectorAll('.bd-sinput[data-cfg]').forEach(i => { const v = parseInt(i.value, 10); if (!isNaN(v) && v > 0) CONFIG[i.dataset.cfg] = v; });
        store.set('config', CONFIG); addLog(t('logSettingsSaved'), 'ok');
    }
    function resetAll() {
        if (!confirm(t('confirmReset'))) return;
        state.running = false; state.scanPaused = false; store.clear();
        state.followingSet.clear(); state.followingList = []; state.followersScanned = 0;
        state.botsFound = []; state.removalQueue = []; state.removedList = []; state.failedList = [];
        state.fetchComplete = false; state.sessionRemoved = 0;
        state.whitelist.clear(); state.whitelistUsers = []; state.selectedBots.clear();
        removedIds.clear(); failedIds.clear(); queueIds.clear();
        responseTracker.reset();
        els.logbox.innerHTML = ''; state.logs = [];
        setPhase(t('phaseReady')); ui_update(); renderBotList(); renderWhitelist(); setButtons('idle');
        addLog(t('logResetDone'), 'warn');
    }
    function exportReport() {
        const data = { version: 'v4', engine: 'advanced', following: state.followingList.length, scanned: state.followersScanned, bots: state.botsFound.length, removed: state.removedList, failed: state.failedList, remaining: state.removalQueue.length, at: new Date().toISOString() };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
        a.download = `bot_report_${new Date().toISOString().slice(0, 10)}.json`; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(a.href);
        addLog(t('logExported'), 'ok');
    }

    // ═══ BUTTONS ═══
    function setButtons(mode) {
        els.btnStart.disabled = mode !== 'idle';
        els.btnPause.disabled = mode === 'idle' || mode === 'done';
        els.btnStop.disabled = mode === 'idle' || mode === 'done';
        els.btnPause.textContent = state.scanPaused ? t('btnResume') : t('btnPause');
        if (mode === 'idle' && state.removalQueue.length > 0) { els.btnStart.textContent = t('btnResume').replace('SCAN', '').replace('TARAMA', '').trim() || t('btnStart'); els.btnStart.disabled = false; }
        else els.btnStart.textContent = t('btnStart');
        els.btnStop.textContent = t('btnStop');
    }

    // ═══ CONTROLS ═══
    async function startProcess() {
        const csrf = getCsrf(), uid = getUid();
        if (!csrf || !uid) { setPhase(t('phaseSessionNotFound'), 'error'); addLog(t('logSessionNotFound'), 'err'); return; }
        state.running = true; state.scanPaused = false; state.startTime = Date.now(); state.sessionRemoved = 0;
        responseTracker.reset();
        setButtons('running');

        if (state.removalQueue.length > 0 && state.fetchComplete) {
            addLog(t('logResumeQueue', state.removalQueue.length), 'info');
            setPhase(t('phaseRemoving'), 'running');
            await runRemover(csrf); return;
        }

        if (state.followingList.length === 0) {
            setPhase(t('phaseFetchingFollowing'), 'running');
            addLog(t('logPhase1'), 'info');
            if (!await fetchFollowing(uid, csrf)) return;
        } else {
            state.followingSet = new Set(state.followingList.map(u => u.id));
            addLog(t('logFollowingCache', state.followingList.length), 'info');
        }

        setPhase(t('phaseScanning'), 'running');
        addLog(t('logPhase23'), 'info');
        const fetchDone = fetchFollowersAndQueue(uid, csrf);
        const removeDone = runRemover(csrf);
        await fetchDone;
        state.fetchComplete = true; saveState();
        addLog(t('logScanDone', state.botsFound.length), 'info');
        await removeDone;

        if (state.running) {
            setPhase(t('phaseDone', state.removedList.length), 'running');
            addLog(t('logDone', state.removedList.length, state.failedList.length), 'ok');
            state.running = false; setButtons('done');
        }
    }

    function toggleScanPause() {
        state.scanPaused = !state.scanPaused;
        if (state.scanPaused) {
            setPhase(t('phasePaused'), 'paused');
            addLog(t('logPaused'), 'warn');
        } else {
            setPhase(t('phaseResuming'), 'running');
            addLog(t('logResumed'), 'info');
        }
        setButtons(state.scanPaused ? 'scanPaused' : 'running');
    }

    function stopProcess() {
        state.running = false; state.scanPaused = false;
        setPhase(t('phaseStopped', state.removedList.length, state.removalQueue.length));
        addLog(t('logStopped', state.sessionRemoved), 'warn');
        saveState(); setButtons('idle');
    }

    async function waitScanPause() { while (state.scanPaused && state.running) await sleep(500); }

    // ═══ REMOVE SELECTED ONLY ═══
    async function removeSelectedOnly() {
        if (state.selectedBots.size === 0) return;
        const csrf = getCsrf();
        if (!csrf) { addLog(t('logCsrfError'), 'err'); return; }
        const selList = state.botsFound.filter(b => state.selectedBots.has(b.id) && !removedIds.has(b.id) && !failedIds.has(b.id) && !state.whitelist.has(b.id));
        addLog(t('logSelectRemove', selList.length), 'info');
        state.removalQueue = selList;
        queueIds.clear(); selList.forEach(b => queueIds.add(b.id));
        state.fetchComplete = true;
        state.running = true; state.scanPaused = false; state.startTime = Date.now(); state.sessionRemoved = 0;
        responseTracker.reset();
        setButtons('running');
        setPhase(t('phaseRemoving'), 'running');
        ui_update(); renderBotList();
        await runRemover(csrf);
        if (state.running) {
            state.running = false; setButtons('done');
            setPhase(t('phaseDone', state.removedList.length), 'running');
        }
        state.selectedBots.clear(); updateSelBtn(); renderBotList();
    }

    // ═══ PHASE 1: FETCH FOLLOWING ═══
    async function fetchFollowing(uid, csrf) {
        let cursor = null, hasMore = true, retries = 0;
        while (hasMore && state.running) {
            await waitScanPause(); if (!state.running) return false;
            let url = `/api/v1/friendships/${uid}/following/?count=${CONFIG.FETCH_PER_PAGE}&search_surface=follow_list_page`;
            if (cursor) url += `&max_id=${cursor}`;
            try {
                const r = await apiGet(url, csrf);
                if (r.status === 429) { addLog(t('logRateLimit', 'following'), 'warn'); await handleBackoff(); continue; }
                if (r.status === 401 || r.status === 403) { setPhase(t('phaseSessionError'), 'error'); addLog(t('logSessionError'), 'err'); state.running = false; setButtons('idle'); return false; }
                if (!r.ok) { retries++; if (retries > CONFIG.FETCH_MAX_RETRIES) { addLog(t('logFetchFail', 'Following'), 'err'); state.running = false; setButtons('idle'); return false; } addLog(t('logFetchRetry', 'Following', r.status, retries, CONFIG.FETCH_MAX_RETRIES), 'warn'); await sleep(30000); continue; }
                const data = await r.json(); retries = 0; resetBackoff();
                if (data.users) for (const u of data.users) { const id = String(u.pk || u.pk_id); if (!state.followingSet.has(id)) { state.followingSet.add(id); state.followingList.push({ id, username: u.username }); } }
                cursor = data.next_max_id || null; hasMore = !!cursor;
                els.sFollowing.textContent = fmtNum(state.followingList.length);
                addLog(t('logFetchProgress', 'Following', state.followingList.length), 'dim');
                if (hasMore) {
                    // Gaussian delay with adaptive multiplier
                    const mult = responseTracker.getMultiplier();
                    const delay = Math.round(humanDelay(CONFIG.FETCH_DELAY_MIN, CONFIG.FETCH_DELAY_MAX) * mult);
                    if (mult > 1.0) addLog(t('logAdaptiveSlowdown', mult.toFixed(1)), 'warn');
                    await sleep(delay);
                }
            } catch (e) { addLog(t('logError', e.message), 'err'); retries++; if (retries > CONFIG.FETCH_MAX_RETRIES) { state.running = false; return false; } await sleep(30000); }
        }
        addLog(t('logFetchDone', 'Following', state.followingList.length), 'ok'); saveState(); return true;
    }

    // ═══ PHASE 2: FETCH FOLLOWERS + QUEUE (Dual API: GraphQL primary → REST fallback) ═══

    // Normalize user data from either API into internal format
    function normalizeUser(u, source) {
        if (source === 'gql') {
            return {
                id: String(u.id), username: u.username,
                full_name: u.full_name || '', pic: u.profile_pic_url || '',
                is_private: u.is_private || false, is_verified: u.is_verified || false,
                no_pic: u.has_anonymous_profile_picture || false,
            };
        }
        return {
            id: String(u.pk || u.pk_id), username: u.username,
            full_name: u.full_name || '', pic: u.profile_pic_url || '',
            is_private: u.is_private || false, is_verified: u.is_verified || false,
            no_pic: u.has_anonymous_profile_picture || false,
        };
    }

    // Process fetched users into bot queue (shared by both APIs)
    function processFollowerBatch(users) {
        let newBots = 0;
        for (const u of users) {
            state.followersScanned++;
            if (!state.followingSet.has(u.id) && !state.whitelist.has(u.id)) {
                if (!removedIds.has(u.id) && !failedIds.has(u.id) && !queueIds.has(u.id)) {
                    const bot = { ...u };
                    bot.score = calcScore(bot);
                    state.botsFound.push(bot);
                    state.removalQueue.push(bot); queueIds.add(u.id);
                    newBots++;
                }
            }
        }
        if (newBots > 0) state.removalQueue.sort((a, b) => (b.score || 0) - (a.score || 0));
        return newBots;
    }

    async function fetchFollowersAndQueue(uid, csrf) {
        let useGQL = true;
        let gqlCursor = store.get('gql_cursor', null);
        let restCursor = store.get('followers_cursor', null);
        let gqlDisabledAt = 0;
        let hasMore = true, retries = 0;
        let totalReported = false;

        addLog(t('logGqlStart'), 'info');

        while (hasMore && state.running) {
            await waitScanPause(); if (!state.running) return;

            // Try switching back to GraphQL after cooldown
            if (!useGQL && gqlDisabledAt > 0 && Date.now() - gqlDisabledAt > CONFIG.GQL_RETRY_AFTER) {
                useGQL = true; gqlDisabledAt = 0;
                addLog(t('logRestToGql'), 'info');
            }

            let fetchedUsers = [];

            if (useGQL) {
                // ── GraphQL API (50/page — primary) ──
                const vars = { id: uid, first: CONFIG.GQL_PER_PAGE };
                if (gqlCursor) vars.after = gqlCursor;
                const url = `/graphql/query/?query_hash=${CONFIG.GQL_FOLLOWERS_HASH}&variables=${encodeURIComponent(JSON.stringify(vars))}`;

                try {
                    const r = await apiGet(url, csrf);

                    if (r.status === 429) {
                        // GraphQL rate limited — switch to REST (different rate limit bucket)
                        addLog(t('logGqlToRest'), 'warn');
                        useGQL = false; gqlDisabledAt = Date.now();
                        retries = 0;
                        continue;
                    }
                    if (r.status === 401 || r.status === 403) {
                        addLog(t('logSessionError'), 'err');
                        await sleep(5000); csrf = getCsrf();
                        if (!csrf) { state.running = false; return; }
                        continue;
                    }
                    if (!r.ok) {
                        retries++;
                        if (retries > 2) {
                            addLog(t('logGqlToRest'), 'warn');
                            useGQL = false; gqlDisabledAt = Date.now(); retries = 0;
                            continue;
                        }
                        addLog(t('logGqlError', r.status), 'warn');
                        await sleep(10000);
                        continue;
                    }

                    const data = await r.json();
                    const edge = data?.data?.user?.edge_followed_by;

                    if (!edge) {
                        addLog(t('logGqlToRest'), 'warn');
                        useGQL = false; gqlDisabledAt = Date.now();
                        continue;
                    }

                    retries = 0; resetBackoff();

                    // Report total follower count (once)
                    if (!totalReported && edge.count) {
                        addLog(t('logGqlTotal', fmtNum(edge.count)), 'info');
                        totalReported = true;
                    }

                    fetchedUsers = (edge.edges || []).map(e => normalizeUser(e.node, 'gql'));
                    hasMore = edge.page_info?.has_next_page || false;
                    gqlCursor = edge.page_info?.end_cursor || null;
                    store.set('gql_cursor', gqlCursor);

                } catch (e) {
                    addLog(t('logGqlError', e.message), 'warn');
                    useGQL = false; gqlDisabledAt = Date.now();
                    continue;
                }
            } else {
                // ── REST API fallback (12/page) ──
                let url = `/api/v1/friendships/${uid}/followers/?count=${CONFIG.FETCH_PER_PAGE}&search_surface=follow_list_page`;
                if (restCursor) url += `&max_id=${restCursor}`;

                try {
                    const r = await apiGet(url, csrf);

                    if (r.status === 429) {
                        addLog(t('logRateLimit', 'REST'), 'warn');
                        await handleBackoff();
                        continue;
                    }
                    if (r.status === 401 || r.status === 403) {
                        addLog(t('logSessionError'), 'err');
                        await sleep(5000); csrf = getCsrf();
                        if (!csrf) { state.running = false; return; }
                        continue;
                    }
                    if (!r.ok) {
                        retries++;
                        if (retries > CONFIG.FETCH_MAX_RETRIES) {
                            addLog(t('logFetchFail', 'Followers'), 'err');
                            return;
                        }
                        await sleep(30000);
                        continue;
                    }

                    const data = await r.json();
                    retries = 0; resetBackoff();

                    fetchedUsers = (data.users || []).map(u => normalizeUser(u, 'rest'));
                    hasMore = !!(data.next_max_id);
                    restCursor = data.next_max_id || null;
                    store.set('followers_cursor', restCursor);

                } catch (e) {
                    addLog(t('logError', e.message), 'err');
                    retries++;
                    if (retries > CONFIG.FETCH_MAX_RETRIES) return;
                    await sleep(30000);
                    continue;
                }
            }

            // ── Process fetched users (shared logic) ──
            if (fetchedUsers.length > 0) {
                processFollowerBatch(fetchedUsers);
                ui_update();
                if (state.followersScanned % 500 === 0) { saveState(); renderBotList(); }
                const apiLabel = useGQL ? 'GQL' : 'REST';
                addLog(t('logScanProgress', fmtNum(state.followersScanned), state.botsFound.length) + ` [${apiLabel}]`, 'dim');
            }

            if (hasMore) {
                const mult = responseTracker.getMultiplier();
                const delay = Math.round(humanDelay(CONFIG.FETCH_DELAY_MIN, CONFIG.FETCH_DELAY_MAX) * mult);
                if (mult > 1.0) addLog(t('logAdaptiveSlowdown', mult.toFixed(1)), 'warn');
                await sleep(delay);
            }
        }

        state.botsFound.sort((a, b) => (b.score || 0) - (a.score || 0));
        renderBotList();
    }

    // ═══ PHASE 3: REMOVER (Advanced Engine — micro-batch + adaptive + health check) ═══
    async function runRemover(csrf) {
        let batch = 0, mega = 0;
        let lastHealthCheck = Date.now();
        let adaptiveNotified = false;

        while (state.running) {
            if (!state.running) break;
            if (state.removalQueue.length === 0) { if (state.fetchComplete) break; await sleep(2000); continue; }

            // Session health check every HEALTH_CHECK_INTERVAL
            if (Date.now() - lastHealthCheck > CONFIG.HEALTH_CHECK_INTERVAL) {
                addLog(t('logHealthCheck'), 'dim');
                const fresh = getCsrf();
                if (fresh && await sessionHealthCheck(fresh)) {
                    addLog(t('logSessionHealthOk'), 'ok');
                } else {
                    addLog(t('logSessionHealthFail'), 'warn');
                    setPhase(t('phaseRateLimit'), 'paused');
                    await sleep(60000);
                    lastHealthCheck = Date.now();
                    continue;
                }
                lastHealthCheck = Date.now();
            }

            const bot = state.removalQueue[0];

            // Skip whitelisted
            if (state.whitelist.has(bot.id)) { state.removalQueue.shift(); queueIds.delete(bot.id); addLog(t('logSkipWhitelist', bot.username), 'dim'); continue; }

            const fresh = getCsrf();
            if (!fresh) { addLog(t('logCsrfError'), 'err'); setPhase(t('phaseSessionError'), 'error'); state.running = false; setButtons('idle'); break; }
            csrf = fresh;

            try {
                const r = await apiPost(`/api/v1/friendships/remove_follower/${bot.id}/`, csrf);

                // Check adaptive throttle AFTER the request
                const rtMult = responseTracker.getMultiplier();
                if (rtMult > 1.0 && !adaptiveNotified) {
                    addLog(t('logSoftRateLimit'), 'warn');
                    adaptiveNotified = true;
                } else if (rtMult <= 1.0) {
                    adaptiveNotified = false;
                }

                if (r.status === 429) {
                    addLog(t('logRateLimitUser', bot.username), 'warn');
                    setPhase(t('phaseRateLimit'), 'paused');
                    await handleBackoff();
                    if (state.running) setPhase(state.scanPaused ? t('phasePaused') : t('phaseResuming'), state.scanPaused ? 'paused' : 'running');
                    continue;
                }
                if (r.status === 401 || r.status === 403) { addLog(t('logSessionRefresh'), 'warn'); await sleep(5000); continue; }

                if (r.ok || r.status === 400) {
                    state.removalQueue.shift(); queueIds.delete(bot.id); removedIds.add(bot.id);
                    state.removedList.push({ id: bot.id, username: bot.username, at: new Date().toISOString() });
                    state.sessionRemoved++; batch++; mega++; resetBackoff();
                    addLog(t('logRemoved', bot.username, state.removedList.length, state.removalQueue.length), 'ok');
                    ui_update();
                    if (state.sessionRemoved % 10 === 0) { saveState(); renderBotList(); }

                    // Micro-batch pause logic
                    if (mega >= CONFIG.MEGA_BATCH_SIZE) {
                        const p = humanDelay(CONFIG.MEGA_PAUSE_MIN, CONFIG.MEGA_PAUSE_MAX);
                        addLog(t('logMegaPause', mega, fmtDur(p)), 'warn');
                        setPhase(t('phaseMegaPause', fmtDur(p)), 'paused'); await sleep(p); mega = 0; batch = 0;
                        responseTracker.reset(); adaptiveNotified = false;
                        if (state.running) setPhase(state.scanPaused ? t('phasePaused') : t('phaseResuming'), state.scanPaused ? 'paused' : 'running');
                    } else if (batch >= CONFIG.BATCH_SIZE) {
                        const p = humanDelay(CONFIG.BATCH_PAUSE_MIN, CONFIG.BATCH_PAUSE_MAX);
                        addLog(t('logBatchPause', batch, fmtDur(p)), 'info');
                        setPhase(t('phaseBatchPause', fmtDur(p)), 'paused'); await sleep(p); batch = 0;
                        if (state.running) setPhase(state.scanPaused ? t('phasePaused') : t('phaseResuming'), state.scanPaused ? 'paused' : 'running');
                    } else {
                        // Gaussian delay with adaptive multiplier
                        let delay = humanDelay(CONFIG.REMOVE_DELAY_MIN, CONFIG.REMOVE_DELAY_MAX);
                        delay = Math.round(delay * rtMult);
                        if (rtMult > 1.0) {
                            setPhase(t('phaseAdaptive', rtMult.toFixed(1)), 'adaptive');
                        }
                        await sleep(delay);
                        if (state.running && rtMult <= 1.0) {
                            setPhase(state.scanPaused ? t('phasePaused') : (state.fetchComplete ? t('phaseRemoving') : t('phaseScanning')), state.scanPaused ? 'paused' : 'running');
                        }
                    }
                } else {
                    state.removalQueue.shift(); queueIds.delete(bot.id); failedIds.add(bot.id);
                    state.failedList.push({ id: bot.id, username: bot.username, status: r.status });
                    addLog(t('logRemoveFailed', bot.username, r.status), 'err');
                    state.consecutiveErrors++;
                    if (state.consecutiveErrors >= CONFIG.MAX_ERRORS) { addLog(t('logConsecutiveErrors', CONFIG.MAX_ERRORS, fmtDur(CONFIG.ERROR_PAUSE)), 'err'); await sleep(CONFIG.ERROR_PAUSE); state.consecutiveErrors = 0; }
                    ui_update();
                }
            } catch (e) { addLog(t('logError', e.message), 'err'); state.consecutiveErrors++; if (state.consecutiveErrors >= CONFIG.MAX_ERRORS) { await sleep(CONFIG.ERROR_PAUSE); state.consecutiveErrors = 0; } }
        }
        saveState(); renderBotList();
    }

    // ═══ BACKOFF (with jitter for unpredictability) ═══
    async function handleBackoff() {
        // Add ±20% jitter to backoff time so it's not perfectly predictable
        const jitter = state.currentBackoff * (0.8 + Math.random() * 0.4);
        const w = Math.round(jitter);
        addLog(t('logBackoff', '', fmtDur(w)), 'warn');
        await sleep(w);
        state.currentBackoff = Math.min(state.currentBackoff * CONFIG.RATE_LIMIT_MULT, CONFIG.RATE_LIMIT_MAX);
    }
    function resetBackoff() { state.currentBackoff = CONFIG.RATE_LIMIT_INITIAL; state.consecutiveErrors = 0; }

    // ═══ INIT ═══
    injectCSS(); buildUI();
    addLog(t('logReady'), 'info');
    renderBotList(); setButtons('idle');
    setPhase(t('phaseReady'));
})();
