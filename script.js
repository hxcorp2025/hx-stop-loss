/* ============================================================
   HX STOP LOSS · script
   - fio de progresso (vermelho -> verde depois do método)
   - reveals por IntersectionObserver
   - log de incidentes acendendo em sequência
   - captura e persistência de UTM + fbclid (90 dias)
   - formulário: pills, validação, envio JSON
   ============================================================ */
(function () {
  'use strict';

  var CONFIG = {
    // Endpoint do form (webhook n8n / função). Definir antes do tráfego.
    FORM_ENDPOINT: '',
    ATTRIB_TTL_DIAS: 90,
    ATTRIB_KEY: 'hx_stoploss_attrib'
  };

  /* ---------- atribuição: UTM + fbclid ---------- */
  function captureAttribution() {
    var params = new URLSearchParams(window.location.search);
    var keys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'fbclid', 'gclid'];
    var found = {};
    var has = false;
    keys.forEach(function (k) {
      var v = params.get(k);
      if (v) { found[k] = v; has = true; }
    });
    if (found.fbclid) {
      // formato oficial FBC: fb.1.{timestamp_ms}.{fbclid} — não hashear
      found.fbc = 'fb.1.' + Date.now() + '.' + found.fbclid;
    }
    var stored = {};
    try { stored = JSON.parse(localStorage.getItem(CONFIG.ATTRIB_KEY) || '{}'); } catch (e) {}
    var fresh = stored.ts && (Date.now() - stored.ts) < CONFIG.ATTRIB_TTL_DIAS * 864e5;
    if (has) {
      var merged = Object.assign({}, fresh ? stored.data : {}, found);
      try { localStorage.setItem(CONFIG.ATTRIB_KEY, JSON.stringify({ ts: Date.now(), data: merged })); } catch (e) {}
      return merged;
    }
    return fresh ? stored.data : {};
  }
  var attribution = captureAttribution();

  /* ---------- fio de progresso ---------- */
  var progressFill = document.getElementById('progressFill');
  var metodoEl = document.getElementById('metodo');
  function onScroll() {
    var doc = document.documentElement;
    var total = doc.scrollHeight - window.innerHeight;
    var pct = total > 0 ? (window.scrollY / total) * 100 : 0;
    progressFill.style.height = pct + '%';
    if (metodoEl) {
      var healed = window.scrollY + window.innerHeight * 0.5 > metodoEl.offsetTop + metodoEl.offsetHeight * 0.6;
      progressFill.classList.toggle('healed', healed);
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- reveals ---------- */
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.18, rootMargin: '0px 0px -6% 0px' });
  document.querySelectorAll('.reveal, .cell, .timeline, .cta-final').forEach(function (el) { io.observe(el); });

  /* ---------- log de incidentes: acende em sequência ---------- */
  var log = document.getElementById('logIncidentes');
  if (log) {
    var lit = false;
    var logIO = new IntersectionObserver(function (entries) {
      if (lit || !entries[0].isIntersecting) return;
      lit = true;
      logIO.disconnect();
      Array.prototype.forEach.call(log.children, function (li, i) {
        setTimeout(function () { li.classList.add('lit'); }, 180 * i);
      });
    }, { threshold: 0.35 });
    logIO.observe(log);
  }

  /* ---------- células do método: stagger ---------- */
  document.querySelectorAll('.grid9 .cell').forEach(function (cell, i) {
    cell.style.transitionDelay = (i % 3) * 90 + 'ms';
  });

  /* ---------- pills (selects do form) ---------- */
  var pillValues = {};
  document.querySelectorAll('.pills').forEach(function (group) {
    var name = group.getAttribute('data-name');
    group.querySelectorAll('button').forEach(function (btn) {
      btn.addEventListener('click', function () {
        group.querySelectorAll('button').forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        pillValues[name] = btn.textContent.trim();
        group.classList.remove('error');
      });
    });
  });

  /* ---------- formulário ---------- */
  var form = document.getElementById('formAplicacao');
  var feedback = document.getElementById('formFeedback');
  var btnEnviar = document.getElementById('btnEnviar');

  function setFeedback(msg, ok) {
    feedback.textContent = msg;
    feedback.className = 'form-feedback mono ' + (ok ? 'ok' : 'err');
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    var nome = form.nome.value.trim();
    var zap = form.whatsapp.value.trim();
    var valid = true;

    form.nome.classList.toggle('error', !nome);
    var zapDigits = zap.replace(/\D/g, '');
    var zapOk = zapDigits.length >= 10 && zapDigits.length <= 13;
    form.whatsapp.classList.toggle('error', !zapOk);
    if (!nome || !zapOk) valid = false;

    ['faturamento', 'estrutura', 'trafego'].forEach(function (k) {
      if (!pillValues[k]) {
        valid = false;
        document.querySelector('.pills[data-name="' + k + '"]').classList.add('error');
      }
    });

    if (!valid) {
      setFeedback('PREENCHE OS CAMPOS DESTACADOS PRA GENTE TE RESPONDER DIREITO.', false);
      return;
    }

    var payload = {
      nome: nome,
      whatsapp: zapDigits,
      instagram_site: form.instagram_site.value.trim(),
      faturamento: pillValues.faturamento,
      estrutura: pillValues.estrutura,
      investimento_trafego: pillValues.trafego,
      gargalo: form.gargalo.value.trim(),
      origem_pagina: window.location.href.split('?')[0],
      user_agent: navigator.userAgent,
      enviado_em: new Date().toISOString(),
      atribuicao: attribution
    };

    if (!CONFIG.FORM_ENDPOINT) {
      setFeedback('FORMULÁRIO AINDA NÃO CONECTADO AO CRM. VOLTA EM BREVE OU CHAMA A HX DIRETO.', false);
      return;
    }

    btnEnviar.disabled = true;
    btnEnviar.textContent = 'Enviando...';
    fetch(CONFIG.FORM_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).then(function (res) {
      if (!res.ok) throw new Error('HTTP ' + res.status);
      form.reset();
      document.querySelectorAll('.pills button.active').forEach(function (b) { b.classList.remove('active'); });
      Object.keys(pillValues).forEach(function (k) { delete pillValues[k]; });
      btnEnviar.textContent = 'Aplicação enviada ✓';
      setFeedback('RECEBEMOS SUA APLICAÇÃO. RESPOSTA EM ATÉ 2 DIAS ÚTEIS.', true);
      if (typeof fbq === 'function') fbq('track', 'Lead');
      if (window.dataLayer) window.dataLayer.push({ event: 'lead_stoploss' });
    }).catch(function () {
      btnEnviar.disabled = false;
      btnEnviar.textContent = 'Enviar aplicação';
      setFeedback('DEU RUIM NO ENVIO. TENTA DE NOVO EM UM MINUTO.', false);
    });
  });
})();
