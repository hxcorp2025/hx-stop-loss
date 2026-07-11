/* ============================================================
   HX STOP LOSS · carrossel de headlines (modo apresentação)
   10 variações da copy V2 (LP_STOPLOSS_APLICACAO_V2.md).
   Clique na headline, nas setas ou use ← → do teclado. Em loop.
   Remover este arquivo (e os controles .hv-*) antes do tráfego.
   ============================================================ */
(function () {
  'use strict';

  var VARIANTES = [
    { id: 'A', html: 'Lucrar mais nem sempre é vender mais. Quase sempre é parar de <span class="serif gold">rasgar o dinheiro</span> que você já investe.' },
    { id: 'B', html: 'Se o seu negócio já investe em aquisição todo mês, existe <span class="serif gold">lucro preso</span> na sua operação. Nós entramos e soltamos.' },
    { id: 'C', html: 'Se você já vende e já investe, eu te mostro em 30 dias onde o seu dinheiro está sendo desperdiçado. <span class="serif gold">Com número, não com opinião.</span>' },
    { id: 'D', html: 'O lucro que falta no seu caixa <span class="serif gold">já está dentro da sua operação.</span> O que falta é nível técnico pra soltar ele.' },
    { id: 'E', html: 'Mais lucro com o mesmo investimento. <span class="serif gold">Sem verba nova, sem funil novo,</span> sem mais uma mentoria.' },
    { id: 'F', html: 'Um real a menos de desperdício é <span class="serif gold">um real inteiro de lucro.</span> A gente encontra onde ele escapa e conserta.' },
    { id: 'G', html: 'Intervenção operacional: o time que geriu mais de R$ 250 milhões em mídia entra na sua operação e conserta <span class="serif gold">o que come o seu lucro.</span>' },
    { id: 'H', html: 'Seu marketing não precisa de mais uma opinião. Precisa de <span class="serif gold">mãos com nível técnico</span> dentro dele.' },
    { id: 'I', html: 'Quanto do seu investimento vira lucro? Se a resposta não é um número, <span class="serif gold">uma parte dele está sendo rasgada.</span>' },
    { id: 'J', html: 'Escalar o que está quebrado só escala o prejuízo. Primeiro a gente conserta. <span class="serif gold">Depois o mesmo investimento devolve mais.</span>' }
  ];

  var h1 = document.getElementById('hvH1');
  var label = document.getElementById('hvLabel');
  var btnPrev = document.getElementById('hvPrev');
  var btnNext = document.getElementById('hvNext');
  if (!h1 || !label) return;

  var atual = 0;
  var animando = false;

  function render(i) {
    atual = (i + VARIANTES.length) % VARIANTES.length;
    var v = VARIANTES[atual];
    h1.innerHTML = v.html;
    label.textContent = 'Variação ' + v.id + ' · ' + (atual + 1) + '/' + VARIANTES.length;
  }

  function trocar(delta) {
    if (animando) return;
    animando = true;
    h1.classList.add('hv-fade');
    setTimeout(function () {
      render(atual + delta);
      h1.classList.remove('hv-fade');
      animando = false;
    }, 220);
  }

  btnNext.addEventListener('click', function () { trocar(1); });
  btnPrev.addEventListener('click', function () { trocar(-1); });
  h1.addEventListener('click', function () { trocar(1); });
  h1.style.cursor = 'pointer';

  document.addEventListener('keydown', function (e) {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    if (e.key === 'ArrowRight') trocar(1);
    if (e.key === 'ArrowLeft') trocar(-1);
  });
})();
