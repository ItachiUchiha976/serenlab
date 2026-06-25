/* ================================================
   SÉRÉNLAB — JavaScript principal
   Cart, FAQ, mobile menu, toast, email capture
   ================================================ */

'use strict';

/* ---- Panier (localStorage) ---- */
const CART_KEY = 'serenlab_cart';

function getCart() {
  try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; }
  catch(e) { return []; }
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

function addToCart(id, name, price, emoji) {
  const cart = getCart();
  const existing = cart.find(i => i.id === id);
  if (existing) {
    existing.qty++;
  } else {
    cart.push({ id, name, price, emoji, qty: 1 });
  }
  saveCart(cart);
  updateCartUI();
  showToast(`${emoji} "${name}" ajouté au panier`);
}

function removeFromCart(id) {
  const cart = getCart().filter(i => i.id !== id);
  saveCart(cart);
  renderCartPage();
  updateCartUI();
}

function updateCartUI() {
  const cart = getCart();
  const total = cart.reduce((sum, i) => sum + i.qty, 0);
  document.querySelectorAll('.cart-count').forEach(el => {
    el.textContent = total;
    el.style.display = total > 0 ? 'flex' : 'none';
  });
}

/* ---- Render cart page ---- */
function renderCartPage() {
  const listEl     = document.getElementById('cart-list');
  const emptyEl    = document.getElementById('cart-empty');
  const summaryEl  = document.getElementById('cart-summary');
  if (!listEl) return;

  const cart = getCart();

  if (cart.length === 0) {
    listEl.innerHTML = '';
    if (emptyEl)   emptyEl.style.display = 'block';
    if (summaryEl) summaryEl.style.display = 'none';
    return;
  }
  if (emptyEl)   emptyEl.style.display = 'none';
  if (summaryEl) summaryEl.style.display = 'block';

  listEl.innerHTML = cart.map(item => `
    <div class="cart-item">
      <div class="cart-item-img" aria-hidden="true" style="font-size:1.8rem">${item.emoji}</div>
      <div>
        <div class="cart-item-name">${escHtml(item.name)}</div>
        <div class="cart-item-price">${(item.price * item.qty).toFixed(2).replace('.', ',')} €</div>
        <div style="font-size:.78rem;color:var(--text-light)">Qté : ${item.qty}</div>
      </div>
      <button class="cart-remove" onclick="removeFromCart('${item.id}')" aria-label="Retirer">&#x2715;</button>
    </div>
  `).join('');

  const subtotal  = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const shipping  = 0;
  const total     = subtotal + shipping;

  const subEl   = document.getElementById('cart-subtotal');
  const shipEl  = document.getElementById('cart-shipping');
  const totalEl = document.getElementById('cart-total');
  if (subEl)   subEl.textContent   = subtotal.toFixed(2).replace('.', ',') + ' €';
  if (shipEl)  shipEl.textContent  = shipping === 0 ? 'Gratuite' : shipping.toFixed(2) + ' €';
  if (totalEl) totalEl.textContent = total.toFixed(2).replace('.', ',') + ' €';
}

/* ---- Checkout stub ---- */
function initCheckout() {
  const form = document.getElementById('checkout-form');
  if (!form) return;

  // Pre-fill email from localStorage if known
  const savedEmail = localStorage.getItem('serenlab_email');
  if (savedEmail) {
    const emailInput = form.querySelector('input[type="email"]');
    if (emailInput) emailInput.value = savedEmail;
  }

  form.addEventListener('submit', function(e) {
    e.preventDefault();
    const email = form.querySelector('input[type="email"]').value.trim();
    const name  = form.querySelector('input[name="nom"]')?.value.trim() || '';
    if (!email) { showToast('Veuillez saisir votre email.'); return; }

    // Save intent
    const cart = getCart();
    const order = { email, name, cart, date: new Date().toISOString(), status: 'pre-order' };
    const orders = JSON.parse(localStorage.getItem('serenlab_orders') || '[]');
    orders.push(order);
    localStorage.setItem('serenlab_orders', JSON.stringify(orders));
    localStorage.setItem('serenlab_email', email);

    // Clear cart
    saveCart([]);
    updateCartUI();

    // Show success
    const stub = document.getElementById('checkout-stub');
    const success = document.getElementById('checkout-success');
    if (stub)    stub.style.display = 'none';
    if (success) success.classList.add('show');
    renderCartPage();
  });
}

/* ---- FAQ accordion ---- */
function initFaq() {
  document.querySelectorAll('.faq-item').forEach(item => {
    const q = item.querySelector('.faq-q');
    if (!q) return;
    q.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      // Close all
      document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
      if (!isOpen) item.classList.add('open');
    });
  });
}

/* ---- Mobile menu ---- */
function initMobileMenu() {
  const hamburger = document.querySelector('.hamburger');
  const menu      = document.querySelector('.mobile-menu');
  const closeBtn  = document.querySelector('.mobile-menu__close');
  if (!hamburger || !menu) return;

  hamburger.addEventListener('click', () => {
    menu.classList.toggle('open');
    hamburger.classList.toggle('open');
    document.body.style.overflow = menu.classList.contains('open') ? 'hidden' : '';
  });

  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      menu.classList.remove('open');
      hamburger.classList.remove('open');
      document.body.style.overflow = '';
    });
  }

  menu.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      menu.classList.remove('open');
      hamburger.classList.remove('open');
      document.body.style.overflow = '';
    });
  });
}

/* ---- Email capture ---- */
function initEmailCapture() {
  document.querySelectorAll('.email-form').forEach(form => {
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      const input = form.querySelector('input[type="email"]');
      const email = input?.value.trim();
      if (!email || !email.includes('@')) { showToast('Email invalide.'); return; }
      localStorage.setItem('serenlab_email', email);
      showToast('Merci ! Vous recevrez nos conseils bien-être très bientôt.');
      if (input) input.value = '';
    });
  });
}

/* ---- Quantity controls ---- */
function initQty() {
  document.querySelectorAll('.qty-ctrl').forEach(ctrl => {
    const dec = ctrl.querySelector('.qty-dec');
    const inc = ctrl.querySelector('.qty-inc');
    const val = ctrl.querySelector('.qty-val');
    if (!val) return;
    let qty = parseInt(val.textContent) || 1;

    if (dec) dec.addEventListener('click', () => {
      if (qty > 1) { qty--; val.textContent = qty; }
    });
    if (inc) inc.addEventListener('click', () => {
      if (qty < 10) { qty++; val.textContent = qty; }
    });
  });

  // Specific "add to cart" on product pages
  document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const pid    = btn.dataset.id;
      const pname  = btn.dataset.name;
      const pprice = parseFloat(btn.dataset.price);
      const pemoji = btn.dataset.emoji || '🛒';
      // Get qty from nearest qty-val
      const qtyEl = btn.closest('section, .product-hero-grid, .product-info, form, .product-ctas')
                      ?.querySelector('.qty-val');
      const qty = qtyEl ? parseInt(qtyEl.textContent) || 1 : 1;
      for (let i = 0; i < qty; i++) addToCart(pid, pname, pprice, pemoji);
    });
  });
}

/* ---- Toast ---- */
let toastTimer = null;
function showToast(msg) {
  let el = document.querySelector('.toast');
  if (!el) {
    el = document.createElement('div');
    el.className = 'toast';
    document.body.appendChild(el);
  }
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 3200);
}

/* ---- Escape HTML helper ---- */
function escHtml(str) {
  return String(str)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;')
    .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

/* ---- Init ---- */
document.addEventListener('DOMContentLoaded', () => {
  updateCartUI();
  initFaq();
  initMobileMenu();
  initEmailCapture();
  initQty();
  renderCartPage();
  initCheckout();
});
