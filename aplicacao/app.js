/* ============================================================
   HX STOP LOSS · /aplicacao/ V3 — motion + carrossel de headlines
   ============================================================ */
(function () {
  'use strict';

  /* ---------- reveals com stagger ---------- */
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
  document.querySelectorAll('.reveal').forEach(function (el) { io.observe(el); });
  ['.stat-row .cell', '.quotes .quote', '.leak', '.step', '.chips span', '.logos span'].forEach(function (sel) {
    document.querySelectorAll(sel).forEach(function (el, i) { el.style.transitionDelay = Math.min(i * 65, 400) + 'ms'; });
  });

  /* ---------- count-up no número gigante ---------- */
  var num = document.querySelector('[data-count]');
  if (num) {
    var done = false;
    var co = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting && !done) {
          done = true;
          var target = parseFloat(num.getAttribute('data-count'));
          var suffix = num.getAttribute('data-suffix') || '';
          var t0 = null, dur = 1600;
          function step(ts) {
            if (!t0) t0 = ts;
            var p = Math.min((ts - t0) / dur, 1);
            var eased = 1 - Math.pow(1 - p, 3);
            var v = (target * eased);
            num.firstChild.nodeValue = 'R$ ' + v.toFixed(0) + ' ';
            if (p < 1) requestAnimationFrame(step);
            else num.firstChild.nodeValue = 'R$ ' + target.toFixed(0) + ' ';
          }
          requestAnimationFrame(step);
        }
      });
    }, { threshold: 0.5 });
    co.observe(num);
  }

  /* ---------- carrossel de headlines (modo apresentação) ---------- */
  var VARIANTES = [
    { id: '3 · Proclamação', html: 'A maioria das operações digitais desperdiça, todo mês, <em>mais lucro do que gastaria pra consertar o problema de vez.</em>' },
    { id: '1 · Mecanismo', html: 'Todo trader profissional opera com um stop loss. A sua operação de marketing <em>não tem nenhum.</em>' },
    { id: '2 · Segredo', html: 'Existe um tipo de prejuízo na sua operação que <em>nenhum dashboard te mostra.</em>' },
    { id: '4 · História', html: 'No maior lançamento da história do Brasil, eu descobri onde o dinheiro de verdade se ganha ou se perde. <em>Não é na oferta. É dentro da operação.</em>' },
    { id: '5 · Problema', html: 'Você não precisa de mais tráfego. Precisa <em>parar de perder o que o tráfego que você já paga já está trazendo.</em>' }
  ];
  var h1 = document.getElementById('hvH1');
  var label = document.getElementById('hvLabel');
  var prev = document.getElementById('hvPrev');
  var next = document.getElementById('hvNext');
  if (!h1 || !label) return;
  var i = 0, busy = false;
  function render(k) {
    i = (k + VARIANTES.length) % VARIANTES.length;
    h1.innerHTML = VARIANTES[i].html;
    label.innerHTML = 'Lead <b>' + VARIANTES[i].id + '</b> · ' + (i + 1) + '/' + VARIANTES.length;
  }
  function go(d) {
    if (busy) return; busy = true;
    h1.style.transition = 'opacity .22s ease, transform .22s ease';
    h1.style.opacity = '0'; h1.style.transform = 'translateY(10px)';
    setTimeout(function () {
      render(i + d);
      h1.style.opacity = '1'; h1.style.transform = 'none'; busy = false;
    }, 220);
  }
  next.addEventListener('click', function () { go(1); });
  prev.addEventListener('click', function () { go(-1); });
  h1.addEventListener('click', function () { go(1); });
  h1.style.cursor = 'pointer';
  document.addEventListener('keydown', function (e) {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    if (e.key === 'ArrowRight') go(1);
    if (e.key === 'ArrowLeft') go(-1);
  });

  /* ---------- atribuição UTM + fbclid (90 dias) ---------- */
  var CFG = { FORM_ENDPOINT: '', TTL: 90, KEY: 'hx_stoploss_attrib' };
  var attribution = (function () {
    var params = new URLSearchParams(window.location.search);
    var keys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'fbclid', 'gclid'];
    var found = {}, has = false;
    keys.forEach(function (k) { var v = params.get(k); if (v) { found[k] = v; has = true; } });
    if (found.fbclid) found.fbc = 'fb.1.' + Date.now() + '.' + found.fbclid;
    var stored = {};
    try { stored = JSON.parse(localStorage.getItem(CFG.KEY) || '{}'); } catch (e) {}
    var fresh = stored.ts && (Date.now() - stored.ts) < CFG.TTL * 864e5;
    if (has) {
      var merged = Object.assign({}, fresh ? stored.data : {}, found);
      try { localStorage.setItem(CFG.KEY, JSON.stringify({ ts: Date.now(), data: merged })); } catch (e) {}
      return merged;
    }
    return fresh ? stored.data : {};
  })();

  /* ---------- pills + formulário ---------- */
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

  var form = document.getElementById('formAplicacao');
  if (!form) return;
  var feedback = document.getElementById('formFeedback');
  var btnEnviar = document.getElementById('btnEnviar');
  function setFeedback(msg, ok) { feedback.textContent = msg; feedback.className = 'form-feedback ' + (ok ? 'ok' : 'err'); }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var nome = form.nome.value.trim();
    var zapDigits = form.whatsapp.value.replace(/\D/g, '');
    var zapOk = zapDigits.length >= 10 && zapDigits.length <= 13;
    var valid = true;
    form.nome.classList.toggle('error', !nome);
    form.whatsapp.classList.toggle('error', !zapOk);
    if (!nome || !zapOk) valid = false;
    ['faturamento', 'investimento_aquisicao', 'estrutura'].forEach(function (k) {
      if (!pillValues[k]) { valid = false; document.querySelector('.pills[data-name="' + k + '"]').classList.add('error'); }
    });
    if (!valid) { setFeedback('Preenche os campos destacados pra gente te responder direito.', false); return; }

    var payload = {
      nome: nome, whatsapp: zapDigits, instagram_site: form.instagram_site.value.trim(),
      faturamento: pillValues.faturamento, investimento_aquisicao: pillValues.investimento_aquisicao,
      estrutura: pillValues.estrutura, gargalo: form.gargalo.value.trim(),
      origem_pagina: window.location.href.split('?')[0], user_agent: navigator.userAgent,
      enviado_em: new Date().toISOString(), atribuicao: attribution
    };
    if (!CFG.FORM_ENDPOINT) { setFeedback('Formulário ainda não conectado ao CRM. Volta em breve ou chama a HX direto.', false); return; }
    btnEnviar.disabled = true; btnEnviar.textContent = 'Enviando...';
    fetch(CFG.FORM_ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      .then(function (res) {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        form.reset();
        document.querySelectorAll('.pills button.active').forEach(function (b) { b.classList.remove('active'); });
        Object.keys(pillValues).forEach(function (k) { delete pillValues[k]; });
        btnEnviar.textContent = 'Aplicação enviada';
        setFeedback('Recebemos sua aplicação. Um sócio da HX responde com prioridade.', true);
        if (typeof fbq === 'function') fbq('track', 'Lead');
        if (window.dataLayer) window.dataLayer.push({ event: 'lead_stoploss' });
      })
      .catch(function () { btnEnviar.disabled = false; btnEnviar.textContent = 'Enviar aplicação'; setFeedback('Deu ruim no envio. Tenta de novo em um minuto.', false); });
  });
})();
