/* ==========================================
   BRASA & CRAFT — CARDÁPIO DIGITAL
   script.js — Lógica do carrinho e interações
   ========================================== */

// ──────────────────────────────────────────
// ESTADO DO CARRINHO
// ──────────────────────────────────────────

/** @type {{ id: number, name: string, price: number, qty: number }[]} */
let cart = [];

// ──────────────────────────────────────────
// ADICIONAR AO CARRINHO
// ──────────────────────────────────────────

/**
 * Adiciona um item ao carrinho ou incrementa a quantidade.
 * @param {number} id - ID único do produto
 * @param {string} name - Nome do produto
 * @param {number} price - Preço do produto
 */
function addToCart(id, name, price) {
  const existing = cart.find(item => item.id === id);

  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ id, name, price, qty: 1 });
  }

  renderCart();
  updateBadge();
  showToast(`✅ ${name} adicionado!`);
}

// ──────────────────────────────────────────
// REMOVER / DECREMENTAR DO CARRINHO
// ──────────────────────────────────────────

/**
 * Decrementa a quantidade de um item. Remove se chegar a 0.
 * @param {number} id
 */
function removeFromCart(id) {
  const idx = cart.findIndex(item => item.id === id);
  if (idx === -1) return;

  if (cart[idx].qty > 1) {
    cart[idx].qty -= 1;
  } else {
    cart.splice(idx, 1);
  }

  renderCart();
  updateBadge();
}

// ──────────────────────────────────────────
// RENDERIZAR ITENS DO CARRINHO
// ──────────────────────────────────────────

function renderCart() {
  const list    = document.getElementById('cartList');
  const empty   = document.getElementById('cartEmpty');
  const footer  = document.getElementById('cartFooter');
  const total   = document.getElementById('cartTotal');
  const grand   = document.getElementById('cartGrandTotal');

  list.innerHTML = '';

  if (cart.length === 0) {
    empty.style.display  = 'flex';
    footer.style.display = 'none';
    return;
  }

  empty.style.display  = 'none';
  footer.style.display = 'flex';

  let subtotal = 0;

  cart.forEach(item => {
    subtotal += item.price * item.qty;

    const li = document.createElement('li');
    li.className = 'cart-item';
    li.innerHTML = `
      <div class="cart-item__info">
        <div class="cart-item__name">${item.name}</div>
        <div class="cart-item__price">${formatBRL(item.price * item.qty)}</div>
      </div>
      <div class="cart-item__qty">
        <button class="qty-btn" onclick="removeFromCart(${item.id})" aria-label="Diminuir">−</button>
        <span class="qty-val">${item.qty}</span>
        <button class="qty-btn" onclick="addToCart(${item.id}, '${escapeQuotes(item.name)}', ${item.price})" aria-label="Aumentar">+</button>
      </div>
    `;
    list.appendChild(li);
  });

  const delivery = 6.00;
  total.textContent = formatBRL(subtotal);
  grand.textContent = formatBRL(subtotal + delivery);
}

// ──────────────────────────────────────────
// ATUALIZAR BADGE DO CARRINHO
// ──────────────────────────────────────────

function updateBadge() {
  const badge = document.getElementById('cartBadge');
  const total = cart.reduce((acc, item) => acc + item.qty, 0);
  badge.textContent = total;

  if (total > 0) {
    badge.classList.add('visible');
  } else {
    badge.classList.remove('visible');
  }
}

// ──────────────────────────────────────────
// ABRIR / FECHAR DRAWER DO CARRINHO
// ──────────────────────────────────────────

function openCart() {
  document.getElementById('cartDrawer').classList.add('open');
  document.getElementById('cartOverlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeCart() {
  document.getElementById('cartDrawer').classList.remove('open');
  document.getElementById('cartOverlay').classList.remove('open');
  document.body.style.overflow = '';
}

document.getElementById('cartTrigger').addEventListener('click', () => {
  if (document.getElementById('cartDrawer').classList.contains('open')) {
    closeCart();
  } else {
    openCart();
  }
});

// ──────────────────────────────────────────
// FINALIZAR PEDIDO VIA WHATSAPP
// ──────────────────────────────────────────

function finalizarPedido() {
  if (cart.length === 0) {
    showToast('🛒 Seu carrinho está vazio!');
    return;
  }

  // Verificação de pedido mínimo (R$ 30,00)
  const subtotal = cart.reduce((acc, item) => acc + item.price * item.qty, 0);
  if (subtotal < 30) {
    showToast(`⚠️ Pedido mínimo: R$ 30,00 (faltam ${formatBRL(30 - subtotal)})`);
    return;
  }

  // Montagem da mensagem
  const linhas = cart.map(item =>
    `• ${item.qty}x ${item.name} — ${formatBRL(item.price * item.qty)}`
  ).join('\n');

  const delivery = 6.00;
  const total    = subtotal + delivery;

  const mensagem =
    `Olá! Quero fazer um pedido no *Brasa & Craft* 🍔🔥\n\n` +
    `*Itens do pedido:*\n${linhas}\n\n` +
    `Subtotal: ${formatBRL(subtotal)}\n` +
    `Taxa de entrega: ${formatBRL(delivery)}\n` +
    `*Total: ${formatBRL(total)}*\n\n` +
    `Aguardo a confirmação! 😊`;

  // Número do WhatsApp (troque pelo número real)
  const numero = '5511999999999';
  const url    = `https://wa.me/${numero}?text=${encodeURIComponent(mensagem)}`;

  window.open(url, '_blank', 'noopener');
}

// ──────────────────────────────────────────
// TOAST NOTIFICATION
// ──────────────────────────────────────────

let toastTimer = null;

/**
 * Exibe uma notificação toast por 2.5 segundos.
 * @param {string} msg
 */
function showToast(msg) {
  let toast = document.getElementById('appToast');

  // Cria o elemento se ainda não existir
  if (!toast) {
    toast = document.createElement('div');
    toast.id        = 'appToast';
    toast.className = 'toast';
    document.body.appendChild(toast);
  }

  toast.textContent = msg;
  toast.classList.add('show');

  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.remove('show');
  }, 2500);
}

// ──────────────────────────────────────────
// FAQ ACCORDION
// ──────────────────────────────────────────

/**
 * Alterna abertura/fechamento dos itens do FAQ.
 * @param {HTMLButtonElement} btn
 */
function toggleFaq(btn) {
  const answer = btn.nextElementSibling;
  const isOpen = answer.classList.contains('open');

  // Fecha todos
  document.querySelectorAll('.faq-a').forEach(a => a.classList.remove('open'));
  document.querySelectorAll('.faq-q').forEach(q => q.classList.remove('open'));

  // Abre o clicado (se estava fechado)
  if (!isOpen) {
    answer.classList.add('open');
    btn.classList.add('open');
  }
}

// ──────────────────────────────────────────
// NAVEGAÇÃO POR CATEGORIAS
// ──────────────────────────────────────────

document.querySelectorAll('.cat-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    // Atualiza botão ativo
    document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    // Scroll suave até a seção alvo
    const target = document.getElementById(btn.dataset.target);
    if (target) {
      // Offset: header + cat-nav (aprox. 130px)
      const offset = 130;
      const y = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  });
});

// ──────────────────────────────────────────
// ATUALIZA BOTÃO DE CATEGORIA AO SCROLLAR
// ──────────────────────────────────────────

const sections = ['hamburgueres', 'combos', 'porcoes', 'bebidas', 'sobremesas'];

function updateActiveCategory() {
  const offset = 160;
  let current = sections[0];

  sections.forEach(id => {
    const el = document.getElementById(id);
    if (el && el.getBoundingClientRect().top < offset) {
      current = id;
    }
  });

  document.querySelectorAll('.cat-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.target === current);
  });
}

window.addEventListener('scroll', updateActiveCategory, { passive: true });

// ──────────────────────────────────────────
// SCROLL REVEAL ANIMATION
// ──────────────────────────────────────────

function initReveal() {
  // Adiciona a classe reveal aos cards e elementos
  const targets = document.querySelectorAll(
    '.card, .dif-card, .review-card, .faq-item, .section-header'
  );
  targets.forEach(el => el.classList.add('reveal'));

  // IntersectionObserver para ativar animação
  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
  );

  targets.forEach(el => observer.observe(el));
}

// ──────────────────────────────────────────
// HEADER SCROLL EFFECT
// ──────────────────────────────────────────

function initHeaderScroll() {
  const header = document.getElementById('header');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 20) {
      header.style.boxShadow = '0 4px 24px rgba(0,0,0,.4)';
    } else {
      header.style.boxShadow = '';
    }
  }, { passive: true });
}

// ──────────────────────────────────────────
// HELPERS
// ──────────────────────────────────────────

/**
 * Formata um número como moeda brasileira.
 * @param {number} value
 * @returns {string}
 */
function formatBRL(value) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

/**
 * Escapa aspas simples para uso em atributos HTML inline.
 * @param {string} str
 * @returns {string}
 */
function escapeQuotes(str) {
  return str.replace(/'/g, "\\'");
}

// ──────────────────────────────────────────
// INICIALIZAÇÃO
// ──────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  initReveal();
  initHeaderScroll();
  renderCart(); // Garante estado inicial correto
});
