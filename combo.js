/* ════════════════════════════════════════════════════════════
   Box Collection — Combo Detail Page Logic
   Depends on: data.js (BUNDLES global must be loaded first)
   ════════════════════════════════════════════════════════════ */

// ── 1. Constants & State ──────────────────────────────────────────
const CART_KEY = 'bc_cart';
const GOOGLE_SHEETS_URL = 'https://script.google.com/macros/s/AKfycbzuGmJiTrVeiDnqjY3gaJwLtkqqmDdFoaG1Gspqge3EVKLima4TaHronO3ukAcbZm6MHQ/exec';

let cart = [];
let comboQty = 1;
let currentBundle = null;
let toastTimer = null;

// ── 2. Cart — localStorage persistence ───────────────────────────
function loadCart() {
  try { cart = JSON.parse(localStorage.getItem(CART_KEY) || '[]'); }
  catch { cart = []; }
}

function saveCart() {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

function addBundleToCart(bundleId, qty) {
  qty = qty || 1;
  const bundle = BUNDLES.find(function(b) { return b.id === bundleId; });
  if (!bundle) return;

  const existing = cart.find(function(item) { return item.id === bundleId && item.type === 'bundle'; });
  if (existing) {
    existing.qty += qty;
    showToast(bundle.name + ' quantity updated! 🛒');
  } else {
    cart.push({
      type: 'bundle',
      id: bundleId,
      name: bundle.name,
      subtitle: bundle.subtitle,
      price: bundle.comboPrice,
      books: bundle.books.map(function(b) { return b.title; }),
      qty: qty,
    });
    showToast(bundle.name + ' added to cart! 🛒');
  }
  saveCart();
  updateCartUI();
}

function removeFromCart(id) {
  cart = cart.filter(function(item) { return item.id !== id; });
  saveCart();
  updateCartUI();
}

// ── 3. Cart UI ────────────────────────────────────────────────────
function updateCartUI() {
  var totalItems = cart.reduce(function(sum, item) { return sum + item.qty; }, 0);
  var totalPrice = cart.reduce(function(sum, item) { return sum + item.price * item.qty; }, 0);

  // Badge
  var badge = document.getElementById('cartBadge');
  if (badge) {
    badge.textContent = totalItems;
    badge.classList.toggle('visible', totalItems > 0);
  }

  // Cart button aria label
  var cartBtn = document.getElementById('cartBtn');
  if (cartBtn) cartBtn.setAttribute('aria-label', 'View cart (' + totalItems + ' item' + (totalItems !== 1 ? 's' : '') + ')');

  var cartItemsEl = document.getElementById('cartItems');
  var cartEmptyEl = document.getElementById('cartEmpty');
  var cartFooterEl = document.getElementById('cartFooter');

  if (cart.length === 0) {
    if (cartItemsEl) cartItemsEl.innerHTML = '';
    if (cartEmptyEl) cartEmptyEl.style.display = 'flex';
    if (cartFooterEl) cartFooterEl.style.display = 'none';
  } else {
    if (cartEmptyEl) cartEmptyEl.style.display = 'none';
    if (cartFooterEl) cartFooterEl.style.display = 'block';

    if (cartItemsEl) {
      cartItemsEl.innerHTML = cart.map(function(item) {
        var bundleData = BUNDLES.find(function(b) { return b.id === item.id; });
        var icon = bundleData ? bundleData.tag : '📦';
        var previewBooks = item.books.slice(0, 3).join(', ') + (item.books.length > 3 ? ' +' + (item.books.length - 3) + ' more' : '');
        return [
          '<div class="cart-item">',
          '  <div class="cart-item-icon">' + icon + '</div>',
          '  <div class="cart-item-info">',
          '    <strong>' + item.name + '</strong>',
          '    <small>' + item.subtitle + (item.qty > 1 ? ' &times; ' + item.qty : '') + '</small>',
          '    <div class="cart-item-books">' + previewBooks + '</div>',
          '  </div>',
          '  <div class="cart-item-right">',
          '    <span class="cart-item-price">' + (item.price * item.qty) + ' Tk</span>',
          '    <button class="cart-remove" onclick="removeFromCart(\'' + item.id + '\')" aria-label="Remove ' + item.name + '">\u2715 Remove</button>',
          '  </div>',
          '</div>',
        ].join('');
      }).join('');
    }
  }

  var cartTotalEl = document.getElementById('cartTotal');
  if (cartTotalEl) cartTotalEl.textContent = totalPrice + ' Tk';

  updateOrderCartSummary(totalPrice);
  updateOrderBundleSelect();

  // Sticky CTA total
  var stickyTotal = document.getElementById('stickyCtaTotal');
  if (stickyTotal) stickyTotal.textContent = totalPrice + ' Tk';
}

function updateOrderCartSummary(totalPrice) {
  var summaryEl = document.getElementById('orderCartSummary');
  var itemsEl = document.getElementById('orderCartItems');
  var totalEl = document.getElementById('orderCartTotal');
  if (!summaryEl) return;

  if (cart.length === 0) {
    summaryEl.style.display = 'none';
    return;
  }
  summaryEl.style.display = 'block';
  if (itemsEl) {
    itemsEl.innerHTML = cart.map(function(item) {
      return '<div class="order-cart-item">' +
        '<span class="order-cart-item-name">' + item.name + ' &times; ' + item.qty + '</span>' +
        '<span class="order-cart-item-price">' + (item.price * item.qty) + ' Tk</span>' +
        '</div>';
    }).join('');
  }
  if (totalEl) totalEl.textContent = totalPrice + ' Tk';
}

function updateOrderBundleSelect() {
  var select = document.getElementById('orderBundleSelect');
  if (!select) return;

  var bundleOptions = BUNDLES.map(function(b) {
    return '<option value="' + b.id + '">' + b.name + ' — ' + b.comboPrice + ' Tk</option>';
  }).join('');

  select.innerHTML = '<option value="">— Choose what you\'re ordering —</option>' +
    '<optgroup label="Ready-Made Bundles">' + bundleOptions + '</optgroup>';

  // Pre-select current bundle
  if (currentBundle) select.value = currentBundle.id;
}

function openCart() {
  var sidebar = document.getElementById('cartSidebar');
  var overlay = document.getElementById('cartOverlay');
  if (sidebar) { sidebar.classList.add('open'); sidebar.setAttribute('aria-hidden', 'false'); }
  if (overlay) overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeCart() {
  var sidebar = document.getElementById('cartSidebar');
  var overlay = document.getElementById('cartOverlay');
  if (sidebar) { sidebar.classList.remove('open'); sidebar.setAttribute('aria-hidden', 'true'); }
  if (overlay) overlay.classList.remove('open');
  document.body.style.overflow = '';
}

// ── 4. Quantity Selector ──────────────────────────────────────────
function changeQty(delta) {
  comboQty = Math.max(1, comboQty + delta);
  var display = document.getElementById('qtyDisplay');
  if (display) display.textContent = comboQty;

  var subtotalEl = document.getElementById('comboSubtotal');
  if (subtotalEl && currentBundle) {
    subtotalEl.textContent = (currentBundle.comboPrice * comboQty) + ' Tk';
  }
}

// ── 5. CTA Actions ────────────────────────────────────────────────
function addToCartClick() {
  if (!currentBundle) return;
  addBundleToCart(currentBundle.id, comboQty);
  openCart();
}

function buyNowClick() {
  if (!currentBundle) return;
  addBundleToCart(currentBundle.id, comboQty);
  closeCart();
  var orderSection = document.getElementById('order');
  if (orderSection) {
    var top = orderSection.getBoundingClientRect().top + window.scrollY - 80;
    window.scrollTo({ top: top, behavior: 'smooth' });
  }
}

// ── 6. Page Rendering ─────────────────────────────────────────────
function renderComboPage(bundle) {
  // Update page title & meta description
  document.title = bundle.name + ' — Box Collection';
  var metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc) metaDesc.setAttribute('content', bundle.name + ': ' + bundle.strategy + ' Get ' + bundle.books.length + ' books for ' + bundle.comboPrice + ' Tk.');

  var originalTotal = bundle.books.reduce(function(sum, b) { return sum + b.price; }, 0);
  var savings = originalTotal - bundle.comboPrice;
  var savingsPct = Math.round((savings / originalTotal) * 100);

  renderHero(bundle, originalTotal, savings, savingsPct);
  renderBookList(bundle, originalTotal);
  renderRelatedCombos(bundle);
}

function renderHero(bundle, originalTotal, savings, savingsPct) {
  var heroInner = document.getElementById('comboHeroInner');
  if (!heroInner) return;

  heroInner.innerHTML = [
    '<div class="combo-hero-image-wrap">',
    '  <img src="' + bundle.image + '" alt="' + bundle.name + ' — ' + bundle.subtitle + '" class="combo-hero-img" onerror="this.style.display=\'none\'" />',
    '  <div class="combo-savings-flag">Save ' + savingsPct + '%</div>',
    '</div>',
    '<div class="combo-hero-details">',
    '  <a href="index.html" class="combo-breadcrumb">&#8592; Back to all combos</a>',
    '  <div class="combo-tag">' + bundle.tag + ' ' + bundle.subtitle + '</div>',
    '  <h1 class="combo-title">' + bundle.name + '</h1>',
    '  <p class="combo-strategy">"' + bundle.strategy + '"</p>',

    '  <div class="combo-price-block">',
    '    <div class="combo-original-price">',
    '      <span class="combo-orig-label">Original value:</span>',
    '      <span class="combo-orig-val"><s>' + originalTotal + ' Tk</s></span>',
    '    </div>',
    '    <div class="combo-current-price">',
    '      <span class="combo-price-label">Combo Price</span>',
    '      <span class="combo-price-val">' + bundle.comboPrice + ' Tk</span>',
    '    </div>',
    '    <div class="combo-savings-pill">&#127881; You save ' + savings + ' Tk (' + savingsPct + '% off!)</div>',
    '  </div>',

    '  <div class="combo-qty-row">',
    '    <span class="combo-qty-label">Quantity:</span>',
    '    <div class="qty-selector">',
    '      <button class="qty-btn" onclick="changeQty(-1)" aria-label="Decrease quantity">&#8722;</button>',
    '      <span class="qty-display" id="qtyDisplay">1</span>',
    '      <button class="qty-btn" onclick="changeQty(1)" aria-label="Increase quantity">+</button>',
    '    </div>',
    '    <span class="combo-subtotal" id="comboSubtotal">' + bundle.comboPrice + ' Tk</span>',
    '  </div>',

    '  <div class="combo-cta-group">',
    '    <button class="btn btn-ghost btn-lg combo-cart-btn" onclick="addToCartClick()">&#128722; Add to Cart</button>',
    '    <button class="btn btn-primary btn-lg combo-buy-btn" onclick="buyNowClick()">&#9889; Buy Now &#8594;</button>',
    '  </div>',

    '  <div class="combo-trust-mini">',
    '    <span>&#128230; Fast delivery</span>',
    '    <span>&#128181; Cash on delivery</span>',
    '    <span>&#128260; 7-day exchange</span>',
    '    <span>&#128222; We confirm by phone</span>',
    '  </div>',
    '</div>',
  ].join('');
}

function renderBookList(bundle, originalTotal) {
  var booksInner = document.getElementById('comboBooksInner');
  if (!booksInner) return;

  var bookRows = bundle.books.map(function(book, i) {
    return [
      '<div class="combo-book-row">',
      '  <div class="combo-book-num">' + String(i + 1).padStart(2, '0') + '</div>',
      '  <div class="combo-book-info">',
      '    <span class="combo-book-title">' + book.title + '</span>',
      '    <span class="combo-book-author">by ' + book.author + '</span>',
      '  </div>',
      '  <div class="combo-book-price">' + book.price + ' Tk</div>',
      '</div>',
    ].join('');
  }).join('');

  booksInner.innerHTML = [
    '<div class="section-head">',
    '  <span class="section-eyebrow">What\'s Inside</span>',
    '  <h2 class="section-title">Books in This Combo</h2>',
    '  <p class="section-sub">' + bundle.books.length + ' carefully selected titles. Retail value: <strong>' + originalTotal + ' Tk</strong> — yours for just <strong style="color:var(--clr-accent-hov)">' + bundle.comboPrice + ' Tk</strong>.</p>',
    '</div>',
    '<div class="combo-books-list">',
    bookRows,
    '  <div class="combo-books-total-row">',
    '    <span>Total individual price</span>',
    '    <span><s>' + originalTotal + ' Tk</s></span>',
    '  </div>',
    '  <div class="combo-books-save-row">',
    '    <span>Your combo price</span>',
    '    <strong>' + bundle.comboPrice + ' Tk</strong>',
    '  </div>',
    '</div>',
    '<div class="combo-books-cta">',
    '  <button class="btn btn-primary btn-lg" onclick="buyNowClick()">&#9889; Order This Combo — ' + bundle.comboPrice + ' Tk</button>',
    '</div>',
  ].join('');
}

function renderRelatedCombos(bundle) {
  var relatedGrid = document.getElementById('relatedCombosGrid');
  if (!relatedGrid) return;

  var related = BUNDLES.filter(function(b) { return b.id !== bundle.id; }).slice(0, 3);

  relatedGrid.innerHTML = related.map(function(b) {
    var origTotal = b.books.reduce(function(sum, bk) { return sum + bk.price; }, 0);
    var sav = origTotal - b.comboPrice;
    var bookItems = b.books.map(function(bk) {
      return '<li><span class="book-title-text">' + bk.title + '</span></li>';
    }).join('');

    return [
      '<article class="bundle-card" aria-label="' + b.name + '">',
      '  <div class="card-img-wrap">',
      '    <img src="' + b.image + '" alt="' + b.name + '" loading="lazy" onerror="this.style.display=\'none\'" />',
      '    <span class="card-tag">' + b.tag + ' ' + b.subtitle + '</span>',
      '    <div class="savings-badge">Save ' + sav + ' Tk</div>',
      '  </div>',
      '  <div class="card-body">',
      '    <h3 class="card-name">' + b.name + '</h3>',
      '    <p class="card-strategy">"' + b.strategy + '"</p>',
      '    <ul class="card-books" aria-label="Books in this bundle">' + bookItems + '</ul>',
      '    <div class="card-footer">',
      '      <div class="price-info">',
      '        <span class="original-total">Was: <s>' + origTotal + ' Tk</s></span>',
      '        <div>',
      '          <span class="card-combo-label">Combo Price</span>',
      '          <span class="card-combo-price">' + b.comboPrice + ' Tk</span>',
      '        </div>',
      '      </div>',
      '      <div class="card-actions">',
      '        <button class="btn btn-ghost btn-sm" onclick="addBundleToCart(\'' + b.id + '\')">&#128722; Add to Cart</button>',
      '        <a href="combo.html?id=' + b.id + '" class="btn btn-primary btn-sm">View Details &#8594;</a>',
      '      </div>',
      '    </div>',
      '  </div>',
      '</article>',
    ].join('');
  }).join('');
}

// ── 7. Order Form ─────────────────────────────────────────────────
function validateForm() {
  var valid = true;
  var fields = [
    { id: 'orderName',         errId: 'errName',    msg: 'Please enter your full name.' },
    { id: 'orderPhone',        errId: 'errPhone',   msg: 'Please enter a valid phone number.' },
    { id: 'orderAddress',      errId: 'errAddress', msg: 'Please enter your delivery address.' },
    { id: 'orderBundleSelect', errId: 'errBundle',  msg: "Please select what you'd like to order." },
  ];
  fields.forEach(function(f) {
    var el = document.getElementById(f.id);
    var errEl = document.getElementById(f.errId);
    if (!el || !el.value.trim()) {
      if (el) el.classList.add('invalid');
      if (errEl) errEl.textContent = f.msg;
      valid = false;
    } else {
      if (el) el.classList.remove('invalid');
      if (errEl) errEl.textContent = '';
    }
  });
  return valid;
}

function handleOrderSubmit(e) {
  e.preventDefault();
  if (!validateForm()) return;

  var submitBtn = document.getElementById('formSubmitBtn');
  var btnText = submitBtn ? submitBtn.querySelector('.btn-text') : null;
  var btnLoader = submitBtn ? submitBtn.querySelector('.btn-loader') : null;
  if (btnText) btnText.style.display = 'none';
  if (btnLoader) btnLoader.style.display = 'inline';
  if (submitBtn) submitBtn.disabled = true;

  var name = document.getElementById('orderName').value;
  var phone = document.getElementById('orderPhone').value;
  var address = document.getElementById('orderAddress').value;
  var bundleSelect = document.getElementById('orderBundleSelect');
  var payment = document.querySelector('input[name="payment"]:checked');
  var notes = document.getElementById('orderNotes').value;

  var selectedBundleText = bundleSelect.options[bundleSelect.selectedIndex].text;
  var paymentMethod = payment ? payment.value.toUpperCase() : 'COD';
  var cartSummary = cart.length > 0
    ? cart.map(function(item) { return item.name + ' (' + item.subtitle + ') x' + item.qty; }).join('; ')
    : selectedBundleText;
  var totalPrice = cart.reduce(function(sum, item) { return sum + item.price * item.qty; }, 0);

  var orderData = {
    timestamp: new Date().toLocaleString('en-US', { timeZone: 'Asia/Dhaka' }),
    name: name,
    phone: phone,
    address: address,
    bundle: selectedBundleText,
    cartItems: cartSummary || 'Single Item Selection',
    totalPrice: totalPrice ? (totalPrice + ' Tk') : 'N/A',
    paymentMethod: paymentMethod,
    notes: notes || 'N/A',
  };

  function showSuccess() {
    var formWrap = document.getElementById('orderFormWrap');
    var successEl = document.getElementById('orderSuccess');
    if (formWrap) formWrap.style.display = 'none';
    if (successEl) {
      successEl.style.display = 'block';
      var detailsEl = document.getElementById('successDetails');
      if (detailsEl) {
        detailsEl.innerHTML =
          '<strong>&#128211; Name:</strong> ' + name + '<br>' +
          '<strong>&#128222; Phone:</strong> ' + phone + '<br>' +
          '<strong>&#128230; Order:</strong> ' + selectedBundleText + '<br>' +
          '<strong>&#128179; Payment:</strong> ' + paymentMethod + '<br>' +
          '<strong>&#127968; Address:</strong> ' + address +
          (notes ? '<br><strong>&#128221; Notes:</strong> ' + notes : '');
      }
      successEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    // Clear cart after successful order
    cart = [];
    saveCart();
    updateCartUI();
  }

  fetch(GOOGLE_SHEETS_URL, {
    method: 'POST',
    mode: 'no-cors',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(orderData),
  }).then(showSuccess).catch(showSuccess);
}

function resetOrderForm() {
  var formWrap = document.getElementById('orderFormWrap');
  var successEl = document.getElementById('orderSuccess');
  var orderForm = document.getElementById('orderForm');
  var submitBtn = document.getElementById('formSubmitBtn');
  if (formWrap) formWrap.style.display = 'block';
  if (successEl) successEl.style.display = 'none';
  if (orderForm) orderForm.reset();
  updateOrderBundleSelect();
  if (submitBtn) {
    submitBtn.disabled = false;
    var btnText = submitBtn.querySelector('.btn-text');
    var btnLoader = submitBtn.querySelector('.btn-loader');
    if (btnText) btnText.style.display = 'inline';
    if (btnLoader) btnLoader.style.display = 'none';
  }
}

// ── 8. Toast ──────────────────────────────────────────────────────
function showToast(msg) {
  var toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(function() { toast.classList.remove('show'); }, 3000);
}

// ── 9. Header Scroll ──────────────────────────────────────────────
window.addEventListener('scroll', function() {
  var header = document.querySelector('.site-header');
  if (header) header.classList.toggle('scrolled', window.scrollY > 10);
}, { passive: true });

// ── 10. Hamburger Menu ────────────────────────────────────────────
(function() {
  var hamburger = document.getElementById('hamburger');
  var mobileNav = document.getElementById('mobileNav');
  var mobileNavClose = document.getElementById('mobileNavClose');

  if (hamburger && mobileNav) {
    hamburger.addEventListener('click', function() {
      var isOpen = mobileNav.classList.toggle('open');
      mobileNav.setAttribute('aria-hidden', String(!isOpen));
      hamburger.setAttribute('aria-expanded', String(isOpen));
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });
  }

  if (mobileNavClose && mobileNav) {
    mobileNavClose.addEventListener('click', function() {
      mobileNav.classList.remove('open');
      mobileNav.setAttribute('aria-hidden', 'true');
      if (hamburger) hamburger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    });
  }

  document.querySelectorAll('.mobile-nav-link').forEach(function(link) {
    link.addEventListener('click', function() {
      if (mobileNav) mobileNav.classList.remove('open');
      document.body.style.overflow = '';
    });
  });
})();

// ── 11. Cart Events ───────────────────────────────────────────────
(function() {
  var cartBtn = document.getElementById('cartBtn');
  var cartCloseBtn = document.getElementById('cartCloseBtn');
  var cartOverlay = document.getElementById('cartOverlay');
  var cartCheckoutBtn = document.getElementById('cartCheckoutBtn');

  if (cartBtn) cartBtn.addEventListener('click', openCart);
  if (cartCloseBtn) cartCloseBtn.addEventListener('click', closeCart);
  if (cartOverlay) cartOverlay.addEventListener('click', closeCart);

  if (cartCheckoutBtn) {
    cartCheckoutBtn.addEventListener('click', function() {
      closeCart();
      var orderSection = document.getElementById('order');
      if (orderSection) {
        var top = orderSection.getBoundingClientRect().top + window.scrollY - 80;
        window.scrollTo({ top: top, behavior: 'smooth' });
      }
    });
  }
})();

// ── 12. Order Form Submission ─────────────────────────────────────
(function() {
  var orderForm = document.getElementById('orderForm');
  if (orderForm) orderForm.addEventListener('submit', handleOrderSubmit);
})();

// ── 13. Sticky Mobile CTA ─────────────────────────────────────────
(function initStickyCta() {
  var bar = document.getElementById('stickyCta');
  var heroEl = document.getElementById('comboHero');
  var orderEl = document.getElementById('order');
  if (!bar || !heroEl || !orderEl) return;

  var heroGone = false;
  var orderVisible = false;

  function updateBar() {
    var shouldShow = heroGone && !orderVisible;
    bar.classList.toggle('visible', shouldShow);
    bar.setAttribute('aria-hidden', String(!shouldShow));
  }

  new IntersectionObserver(function(entries) {
    heroGone = !entries[0].isIntersecting;
    updateBar();
  }, { threshold: 0.1 }).observe(heroEl);

  new IntersectionObserver(function(entries) {
    orderVisible = entries[0].isIntersecting;
    updateBar();
  }, { threshold: 0.15 }).observe(orderEl);
})();

// ── 14. Init ──────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', function() {
  loadCart();

  var params = new URLSearchParams(window.location.search);
  var id = params.get('id');
  currentBundle = BUNDLES.find(function(b) { return b.id === id; });

  if (!currentBundle) {
    // Redirect to home if combo not found
    window.location.href = 'index.html';
    return;
  }

  renderComboPage(currentBundle);
  updateCartUI();

  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
});
