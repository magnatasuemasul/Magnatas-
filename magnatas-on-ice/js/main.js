// ═══════════════════════════════════════════════════════════
// Magnatas on Ice — comportamento da landing page
// ═══════════════════════════════════════════════════════════

// Configuração do evento. Preencha somente com informações confirmadas.
const EVENTO = {
  // Link oficial de venda de ingressos (https://...). Os links [data-ingressos] já vêm com ele
  // no HTML (funcionam sem JS); aqui ele é reaplicado. Se ficar vazio ou inválido, os links de
  // compra são ocultados, "Ingressos em breve" aparece e a barra fixa passa a oferecer o Instagram.
  ingressosUrl: 'https://www.sympla.com.br/evento/magnatas-on-ice/3632754?share_id=whatsapp'
};

const reduzirMovimento = window.matchMedia('(prefers-reduced-motion: reduce)');

// ── Ingressos ───────────────────────────────────────────────
function urlValida(valor) {
  try {
    const url = new URL(String(valor).trim());
    return url.protocol === 'https:' || url.protocol === 'http:';
  } catch {
    return false;
  }
}

const temIngressos = urlValida(EVENTO.ingressosUrl);

document.querySelectorAll('[data-ingressos]').forEach(link => {
  if (temIngressos) link.href = EVENTO.ingressosUrl.trim();
  else link.hidden = true;
});
// [data-sem-ingressos]: só faz sentido enquanto não há link de compra.
document.querySelectorAll('[data-sem-ingressos]').forEach(el => { el.hidden = temIngressos; });

// ── Menu: esconde links de seções ocultas ───────────────────
document.querySelectorAll('.nav [data-secao]').forEach(link => {
  const secao = document.getElementById(link.dataset.secao);
  if (!secao || secao.hidden) link.hidden = true;
});

// ── Menu do celular ─────────────────────────────────────────
const nav = document.getElementById('nav');
const toggle = document.getElementById('menuToggle');

function fecharMenu() {
  nav.classList.remove('aberto');
  toggle.setAttribute('aria-expanded', 'false');
  toggle.setAttribute('aria-label', 'Abrir menu');
}

toggle.addEventListener('click', () => {
  const abrir = !nav.classList.contains('aberto');
  nav.classList.toggle('aberto', abrir);
  toggle.setAttribute('aria-expanded', String(abrir));
  toggle.setAttribute('aria-label', abrir ? 'Fechar menu' : 'Abrir menu');
});
nav.querySelectorAll('a').forEach(a => a.addEventListener('click', fecharMenu));
document.addEventListener('keydown', e => { if (e.key === 'Escape') fecharMenu(); });

// ── Fundo do menu ao rolar ──────────────────────────────────
const topbar = document.querySelector('.topbar');
const atualizarTopbar = () => topbar.classList.toggle('rolou', window.scrollY > 24);
window.addEventListener('scroll', atualizarTopbar, { passive: true });
atualizarTopbar();

// ── Fundo: percorre a arte conforme a rolagem ───────────────
// Só atualiza uma variável usada em transform (sem relayout); o CSS ignora com movimento reduzido.
(function fundoRolagem() {
  const raiz = document.documentElement;
  let pendente = false;
  const atualizar = () => {
    pendente = false;
    const max = raiz.scrollHeight - window.innerHeight;
    raiz.style.setProperty('--fundo-progresso', max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)).toFixed(4) : '0');
  };
  const agendar = () => { if (!pendente) { pendente = true; requestAnimationFrame(atualizar); } };
  window.addEventListener('scroll', agendar, { passive: true });
  window.addEventListener('resize', agendar);
  atualizar();
})();

// ── Ano do rodapé ───────────────────────────────────────────
document.querySelectorAll('[data-ano]').forEach(el => { el.textContent = new Date().getFullYear(); });

// ── Contagem regressiva ─────────────────────────────────────
// Alvo e término vêm do HTML (data-alvo/data-fim, ISO 8601 com -03:00, horário de Brasília),
// então o resultado é o mesmo em qualquer fuso do aparelho. Um único temporizador, alinhado
// ao segundo e pausado com a aba oculta; ao chegar a zero, para e mostra o estado final.
(function contagem() {
  const secao = document.getElementById('contagem');
  if (!secao) return;
  const alvo = Date.parse(secao.dataset.alvo);
  const fim = Date.parse(secao.dataset.fim);
  if (Number.isNaN(alvo)) return;

  const campos = {};
  secao.querySelectorAll('[data-unidade]').forEach(el => { campos[el.dataset.unidade] = el; });
  const sub = secao.querySelector('[data-contagem-sub]');
  const doisDigitos = n => String(n).padStart(2, '0');
  let temporizador = null;

  function atualizar() {
    temporizador = null;
    const agora = Date.now();
    const restante = Math.max(0, alvo - agora);
    const s = Math.floor(restante / 1000);
    const valores = { dias: Math.floor(s / 86400), horas: Math.floor(s % 86400 / 3600), min: Math.floor(s % 3600 / 60), seg: s % 60 };
    for (const unidade in campos) {
      const texto = doisDigitos(valores[unidade]);
      if (campos[unidade].textContent !== texto) campos[unidade].textContent = texto;
    }
    if (restante === 0) {
      secao.classList.add('contagem-encerrada');
      if (sub) sub.textContent = agora < fim ? 'É hoje! O Magnatas on Ice já começou.' : 'O primeiro capítulo já foi escrito. Obrigado, stakeholders!';
      return;
    }
    if (!document.hidden) temporizador = setTimeout(atualizar, 1000 - (agora % 1000) + 15);
  }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden && temporizador !== null) { clearTimeout(temporizador); temporizador = null; }
    else if (!document.hidden && temporizador === null) atualizar();
  });
  atualizar();
})();

// ── Barra fixa do celular ───────────────────────────────────
// Visível só entre o fim dos botões do hero e a chamada final,
// para não repetir uma ação já visível nem cobrir a chamada final e o rodapé.
(function barraFixa() {
  const barra = document.querySelector('.barra-acao');
  const acoesHero = document.querySelector('.hero-acoes');
  const finais = document.querySelectorAll('.final, .rodape');
  if (!barra || !acoesHero || !('IntersectionObserver' in window)) return;

  let passouHero = false;
  const finaisVisiveis = new Set();
  const atualizar = () => barra.classList.toggle('visivel', passouHero && finaisVisiveis.size === 0);

  new IntersectionObserver(([e]) => {
    passouHero = !e.isIntersecting && e.boundingClientRect.bottom <= 0;
    atualizar();
  }).observe(acoesHero);

  const observarFinais = new IntersectionObserver(entradas => {
    entradas.forEach(e => e.isIntersecting ? finaisVisiveis.add(e.target) : finaisVisiveis.delete(e.target));
    atualizar();
  });
  finais.forEach(el => observarFinais.observe(el));
})();

// ── Neve (camada fixa sobre a página inteira) ───────────────
(function neve() {
  const canvas = document.querySelector('.neve');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const celular = window.matchMedia('(max-width: 900px), (pointer: coarse)');
  let largura, altura, particulas = [], rodando = false, visivel = true, quadro, ultimo = 0, intervalo = 0;

  // O bitmap do canvas precisa ter sempre o tamanho com que ele aparece na tela; se não,
  // o navegador estica a imagem e as partículas ficam ovais, grandes e fora do lugar.
  // A camada é fixa e tem o tamanho da tela: os flocos seguem caindo enquanto a página rola.
  // No celular a altura muda com a barra de endereço e com o giro da tela; por isso o tamanho
  // é observado no próprio canvas.
  function redimensionar() {
    const novaLargura = canvas.clientWidth, novaAltura = canvas.clientHeight;
    if (!novaLargura || !novaAltura) return;
    // No celular: resolução até 1,5x (nítida sem pesar), menos partículas e 30 quadros/s.
    const leve = celular.matches;
    const dpr = Math.min(window.devicePixelRatio || 1, leve ? 1.5 : 2);
    const mudouLargura = novaLargura !== largura;
    if (!mudouLargura && altura) {
      // só a altura mudou: mantém as partículas onde estavam (proporcionalmente), sem reiniciar a neve
      for (const p of particulas) p.y *= novaAltura / altura;
    }
    largura = novaLargura; altura = novaAltura;
    canvas.width = Math.round(largura * dpr); canvas.height = Math.round(altura * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    intervalo = leve ? 1000 / 30 : 0;
    if (mudouLargura || !particulas.length) {
      const total = Math.round(leve ? Math.min(28, largura / 18) : Math.min(110, largura / 12));
      particulas = Array.from({ length: total }, () => nova(true, leve));
    }
  }

  function nova(inicio, leve = celular.matches) {
    return {
      x: Math.random() * largura,
      y: inicio ? Math.random() * altura : -10,
      // no celular, sem partículas menores que ~1px (cintilam) e um pouco mais lentas
      r: leve ? Math.random() * 1.4 + 0.8 : Math.random() * 1.8 + 0.4,
      vy: (Math.random() * 0.5 + 0.2) * (leve ? 0.8 : 1),
      vx: Math.random() * 0.3 - 0.15,
      a: Math.random() * 0.6 + 0.2
    };
  }

  function desenhar(agora = 0) {
    quadro = requestAnimationFrame(desenhar);
    if (intervalo && agora - ultimo < intervalo - 4) return;
    // com menos quadros, cada partícula anda proporcionalmente mais, mantendo a mesma velocidade
    const passo = intervalo && ultimo ? Math.min((agora - ultimo) / (1000 / 60), 3) : 1;
    ultimo = agora;
    ctx.clearRect(0, 0, largura, altura);
    for (const p of particulas) {
      p.y += p.vy * passo; p.x += p.vx * passo;
      if (p.y > altura + 10) Object.assign(p, nova(false));
      // o vento lateral não leva as partículas para fora da tela: reaparecem do outro lado
      if (p.x < -5) p.x += largura + 10; else if (p.x > largura + 5) p.x -= largura + 10;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(220, 240, 255, ${p.a})`;
      ctx.fill();
    }
  }

  function atualizar() {
    const deveRodar = visivel && !reduzirMovimento.matches && !document.hidden;
    if (deveRodar && !rodando) { rodando = true; ultimo = 0; desenhar(); }
    if (!deveRodar && rodando) { rodando = false; cancelAnimationFrame(quadro); ctx.clearRect(0, 0, largura, altura); }
  }

  redimensionar();
  // Um único ajuste por quadro, mesmo com vários avisos seguidos (rolagem no celular, giro da tela).
  let ajustePendente = false;
  const agendarAjuste = () => {
    if (ajustePendente) return;
    ajustePendente = true;
    requestAnimationFrame(() => { ajustePendente = false; redimensionar(); });
  };
  if ('ResizeObserver' in window) new ResizeObserver(agendarAjuste).observe(canvas);
  else window.addEventListener('resize', agendarAjuste);
  window.addEventListener('orientationchange', agendarAjuste);
  document.addEventListener('visibilitychange', atualizar);
  reduzirMovimento.addEventListener('change', atualizar);
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([e]) => { visivel = e.isIntersecting; atualizar(); }).observe(canvas);
  }
  atualizar();
})();
