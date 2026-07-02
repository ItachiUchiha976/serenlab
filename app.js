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
  /* BOS — Umami funnel event. Defensif, jamais bloquant. Ajout 02/07/2026. */
  try { if (window.umami && typeof umami.track === 'function') umami.track('add_to_cart', { produit: name, prix: Number(price || 0), boutique: 'serenlab' }); } catch (e) {}
  /* BOS — Pinterest tag (pintrk), consentement CNIL requis (bos-consent.js). Ajout 02/07/2026. */
  try { if (window.pintrk) window.pintrk('track', 'addtocart', { value: Number(price || 0), currency: 'EUR', order_quantity: 1 }); } catch (e) {}
}

/* ---- Lot de 2 — Duo Voyage (masque Bluetooth) — ajout dedie, ne modifie pas addToCart() ---- */
function addDuoToCart() {
  const id = 'masque-bluetooth-duo';
  const name = 'Masque Bluetooth Sommeil — Duo Voyage (Lot de 2)';
  const price = 69;
  const emoji = '🎧';
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
  /* BOS — Umami funnel event, prop dediee au lot (produit=slug, prix=69). Ajout 02/07/2026. */
  try { if (window.umami && typeof umami.track === 'function') umami.track('add_to_cart', { produit: 'masque-bluetooth-duo', prix: 69, boutique: 'serenlab' }); } catch (e) {}
  /* BOS — Pinterest tag (pintrk), consentement CNIL requis (bos-consent.js). Ajout 02/07/2026. */
  try { if (window.pintrk) window.pintrk('track', 'addtocart', { value: 69, currency: 'EUR', order_quantity: 1 }); } catch (e) {}
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

/* ---- Email capture & checkout — Web3Forms (AJAX) ---- */
function showFormSuccess(form) {
  // Checkout (panier) : on bascule sur l'état succès dédié + vide le panier
  if (form.id === 'checkout-form') {
    saveCart([]);
    updateCartUI();
    renderCartPage();
    const stub    = document.getElementById('checkout-stub');
    const success = document.getElementById('checkout-success');
    if (stub)    stub.style.display = 'none';
    if (success) success.classList.add('show');
    return;
  }
  // Capture email générique : message inline, on cache le formulaire
  const msg = document.createElement('div');
  msg.className = 'form-success';
  msg.innerHTML = "<strong>Merci ! Tu es inscrit·e.</strong><br>On te tient au courant de nos nouveautés et prochains produits.";
  form.style.display = 'none';
  if (form.parentNode) form.parentNode.insertBefore(msg, form.nextSibling);
}

function initWeb3Forms() {
  document.querySelectorAll('form.web3-form').forEach(form => {
    form.addEventListener('submit', async function(e) {
      e.preventDefault();

      const emailInput = form.querySelector('input[type="email"]');
      const email = emailInput ? emailInput.value.trim() : '';
      if (!email || !email.includes('@')) { showToast('Email invalide.'); return; }

      // CGV obligatoires sur le checkout
      const cgv = form.querySelector('#cgv-check');
      if (cgv && !cgv.checked) { showToast('Veuillez accepter les CGV pour continuer.'); return; }

      // Sérialiser le panier dans un champ caché (checkout)
      if (form.id === 'checkout-form') {
        const cartField = form.querySelector('input[name="panier"]');
        if (cartField) {
          const cart = getCart();
          cartField.value = cart.length
            ? cart.map(i => `${i.name} x${i.qty} (${i.price}€)`).join(' | ')
            : 'Panier vide';
        }
      }

      const btn = form.querySelector('button[type="submit"]');
      const origText = btn ? btn.textContent : '';
      if (btn) { btn.disabled = true; btn.textContent = 'Envoi…'; }

      try {
        const res = await fetch(form.action, {
          method: 'POST',
          headers: { 'Accept': 'application/json' },
          body: new FormData(form)
        });
        const data = await res.json().catch(() => ({}));
        if (res.ok && (data.success === undefined || data.success)) {
          showFormSuccess(form);
        } else {
          if (btn) { btn.disabled = false; btn.textContent = origText; }
          showToast('Oups, un souci est survenu. Réessaie dans un instant.');
        }
      } catch (err) {
        if (btn) { btn.disabled = false; btn.textContent = origText; }
        showToast('Connexion impossible. Vérifie ta connexion et réessaie.');
      }
    });
  });
}

/* ---- Sticky CTA bar (pages produit) ---- */
function initStickyCTA() {
  const hero = document.querySelector('.product-hero');
  if (!hero) return;

  // Cible réelle de l'action : le bouton "Ajouter au panier" du produit s'il existe,
  // sinon la section de capture email (peu importe le suffixe de son id : serenlab-vip,
  // serenlab-vip-gua, serenlab-vip-bt, serenlab-vip-gel...) — la barre doit s'afficher
  // et fonctionner sur TOUTES les fiches produit, pas seulement celles avec id="serenlab-vip".
  const buyBtn = hero.querySelector('.product-ctas button[onclick*="addToCart("]')
              || document.querySelector('.product-ctas button[onclick*="addToCart("]');
  const vipSection = document.querySelector('[id^="serenlab-vip"]');
  const target = buyBtn || vipSection;
  if (!target) return;

  const titleEl = document.querySelector('.product-title');
  const priceEl = document.querySelector('.price-main');
  const title = titleEl ? titleEl.textContent.replace(/\s+/g, ' ').trim() : 'SérénLab';
  const price = priceEl ? priceEl.textContent.trim() : '';

  // Aucune réduction n'existe sur la boutique : le CTA pointe vers l'achat réel (pas une fausse promo).
  const ctaLabel = buyBtn ? 'Ajouter au panier' : 'Être informé(e)';

  const bar = document.createElement('div');
  bar.className = 'sticky-cta';
  bar.innerHTML =
    '<div class="sticky-cta__info">' +
      '<span class="sticky-cta__name">' + escHtml(title) + '</span>' +
      (price ? '<span class="sticky-cta__price">' + escHtml(price) + '</span>' : '') +
    '</div>' +
    '<button type="button" class="btn btn--primary sticky-cta__btn">' + escHtml(ctaLabel) + '</button>';
  document.body.appendChild(bar);

  bar.querySelector('.sticky-cta__btn').addEventListener('click', () => {
    target.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });

  const onScroll = () => {
    if (window.scrollY > 500) bar.classList.add('show');
    else bar.classList.remove('show');
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
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
  initWeb3Forms();
  initQty();
  renderCartPage();
  initStickyCTA();
});

/* BOS — expose panier pour checkout PayPal cross-page (fix isolation cart multi-boutique, 01/07/2026) */
try { window.getCart = getCart; window.BOS_CART_KEY = CART_KEY; } catch (e) {}
