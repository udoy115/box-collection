/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   Box Collection â€” Main JavaScript
   Data (BUNDLES, ALL_BOOKS) is loaded from data.js
   which must appear before this script in index.html.
   â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */

// â”€â”€ 1. Cart Key (shared with combo.js via localStorage) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const CART_KEY = 'bc_cart';

function loadCartFromStorage() {
  try { return JSON.parse(localStorage.getItem(CART_KEY) || '[]'); }
  catch { return []; }
}

function saveCart() {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}
// (BUNDLES and ALL_BOOKS globals come from data.js)
// â”€â”€ 2. State â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
let cart = loadCartFromStorage();
let selectedBookIds = new Set();
let activeCategory = 'All';

// â”€â”€ 3. Intersection Observer (reveal) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const revealObs = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObs.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

function observeReveal(el, delay = 0) {
  el.classList.add('reveal');
  if (delay) el.style.transitionDelay = `${delay}ms`;
  revealObs.observe(el);
}

// â”€â”€ 4. Bundle Rendering â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function renderBundles() {
  const grid = document.getElementById('bundlesGrid');
  if (!grid) return;

  grid.innerHTML = '';

  BUNDLES.forEach((bundle, i) => {
    const originalTotal = bundle.books.reduce((sum, b) => sum + b.price, 0);
    const savings = originalTotal - bundle.comboPrice;

    const card = document.createElement('article');
    card.className = 'bundle-card';
    card.setAttribute('aria-label', bundle.name);
    card.innerHTML = `
      <div class="card-img-wrap">
        <img src="${bundle.image}" alt="${bundle.name} â€” ${bundle.subtitle}" loading="lazy" onerror="this.style.display='none'" />
        <span class="card-tag">${bundle.tag} ${bundle.subtitle}</span>
        <div class="savings-badge">Save ${savings} Tk</div>
      </div>
      <div class="card-body">
        <h3 class="card-name">${bundle.name}</h3>
        <p class="card-strategy">"${bundle.strategy}"</p>
        <ul class="card-books" aria-label="Books in this bundle">
          ${bundle.books.map(b => `
            <li>
              <span class="book-title-text">${b.title}</span>
            </li>
          `).join('')}
        </ul>
        <div class="card-footer">
          <div class="price-info">
            <span class="original-total">Was: <s>${originalTotal} Tk</s></span>
            <div>
              <span class="card-combo-label">Combo Price</span>
              <span class="card-combo-price">${bundle.comboPrice} Tk</span>
            </div>
          </div>
          <div class="card-actions">
            <button class="btn btn-ghost btn-sm" id="cart-btn-${bundle.id}" onclick="addBundleToCart('${bundle.id}')">
              ðŸ›’ Add to Cart
            </button>
            <a href="combo.html?id=${bundle.id}" class="btn btn-primary btn-sm">
              View Details â†’
            </a>
          </div>
        </div>
      </div>
    `;

    grid.appendChild(card);
    observeReveal(card, (i % 3) * 80);
  });

  // Append 7th card for Customized Combo
  const customCard = document.createElement('article');
  customCard.className = 'bundle-card custom-option-card';
  customCard.setAttribute('aria-label', 'Build Your Own Customized Combo');
  customCard.innerHTML = `
    <div class="custom-card-header">
      <div class="custom-card-icon">âœ¨</div>
      <span class="custom-card-badge">Customized Combo</span>
    </div>
    <div class="card-body">
      <h3 class="card-name">Build Your Own Combo</h3>
      <p class="card-strategy">"Pick any 5 or more books from our entire collection across all genres to create your custom reading bundle."</p>
      <ul class="card-books" aria-label="Custom combo features">
        <li><span class="book-title-text">ðŸ“š 29 Bestsellers to pick from</span></li>
        <li><span class="book-title-text">ðŸŽ¨ Choose from any genre</span></li>
        <li><span class="book-title-text">âš¡ Minimum 5 books required</span></li>
      </ul>
      <div class="card-footer">
        <div class="price-info">
          <span class="card-combo-label">Pricing Strategy</span>
          <span class="card-combo-price" style="font-size: 1.15rem; color: var(--clr-custom);">Pay Per Book</span>
        </div>
        <div class="card-actions" style="grid-template-columns: 1fr;">
          <button class="btn btn-custom btn-md" onclick="openCustomBuilder()">
            âœ¨ Create Custom Combo
          </button>
        </div>
      </div>
    </div>
  `;

  grid.appendChild(customCard);
  observeReveal(customCard, (BUNDLES.length % 3) * 80);
}

function openCustomBuilder() {
  const section = document.getElementById('custom-bundle');
  if (section) {
    section.style.display = 'block';
    const top = section.getBoundingClientRect().top + window.scrollY - 80;
    window.scrollTo({ top, behavior: 'smooth' });
  }
}

// â”€â”€ 5. Custom Bundle Builder â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function renderCustomBuilder() {
  renderCategoryFilters();
  renderBookGrid();
  updateCustomBuilderStats();
}

function renderCategoryFilters() {
  const container = document.getElementById('categoryFilters');
  if (!container) return;

  const categories = ['All', ...new Set(ALL_BOOKS.map(b => b.category))];
  container.innerHTML = categories.map(cat => `
    <button
      class="cat-filter-btn ${cat === activeCategory ? 'active' : ''}"
      onclick="setCategory('${cat}')"
      aria-pressed="${cat === activeCategory}"
    >${cat}</button>
  `).join('');
}

function setCategory(cat) {
  activeCategory = cat;
  renderCustomBuilder();
}

function renderBookGrid() {
  const container = document.getElementById('customBuilderBooks');
  if (!container) return;

  const filtered = activeCategory === 'All'
    ? ALL_BOOKS
    : ALL_BOOKS.filter(b => b.category === activeCategory);

  container.innerHTML = filtered.map(book => `
    <div
      class="book-select-card ${selectedBookIds.has(book.id) ? 'selected' : ''}"
      id="book-card-${book.id}"
      onclick="toggleBook('${book.id}')"
      role="checkbox"
      aria-checked="${selectedBookIds.has(book.id)}"
      tabindex="0"
      onkeydown="if(event.key==='Enter'||event.key===' ')toggleBook('${book.id}')"
    >
      <div class="book-select-check">${selectedBookIds.has(book.id) ? 'âœ“' : ''}</div>
      <div class="book-select-cat">${book.category}</div>
      <h4 class="book-select-title">${book.title}</h4>
      <p class="book-select-author">${book.author}</p>
      <span class="book-select-price">${book.price} Tk</span>
    </div>
  `).join('');
}

function toggleBook(bookId) {
  if (selectedBookIds.has(bookId)) {
    selectedBookIds.delete(bookId);
  } else {
    selectedBookIds.add(bookId);
  }
  // Efficiently update just the changed card without re-rendering grid
  const card = document.getElementById(`book-card-${bookId}`);
  if (card) {
    const isSelected = selectedBookIds.has(bookId);
    card.classList.toggle('selected', isSelected);
    card.setAttribute('aria-checked', isSelected);
    card.querySelector('.book-select-check').textContent = isSelected ? 'âœ“' : '';
  }
  updateCustomBuilderStats();
}

function getSelectedBooks() {
  return ALL_BOOKS.filter(b => selectedBookIds.has(b.id));
}

function updateCustomBuilderStats() {
  const selected = getSelectedBooks();
  const total = selected.reduce((sum, b) => sum + b.price, 0);
  const count = selected.length;
  const remaining = Math.max(0, 5 - count);

  const counterEl = document.getElementById('selectionCounter');
  const totalEl = document.getElementById('customTotal');
  const addBtn = document.getElementById('addCustomToCartBtn');
  const hintEl = document.getElementById('selectionHint');

  if (counterEl) counterEl.textContent = count;
  if (totalEl) totalEl.textContent = total + ' Tk';

  if (hintEl) {
    if (remaining > 0) {
      hintEl.textContent = `Select ${remaining} more book${remaining !== 1 ? 's' : ''} to continue`;
      hintEl.className = 'selection-hint warn';
    } else {
      hintEl.textContent = `${count} books selected â€” ready to add to cart!`;
      hintEl.className = 'selection-hint ok';
    }
  }

  if (addBtn) addBtn.disabled = count < 5;
}

function clearCustomSelection() {
  selectedBookIds.clear();
  renderBookGrid();
  updateCustomBuilderStats();
}

function addCustomBundleToCart() {
  const selected = getSelectedBooks();
  if (selected.length < 5) {
    showToast('Please select at least 5 books first!');
    return;
  }

  const total = selected.reduce((sum, b) => sum + b.price, 0);
  const id = 'custom-' + Date.now();

  cart.push({
    type: 'custom',
    id,
    name: 'Custom Bundle',
    subtitle: `${selected.length} books`,
    price: total,
    books: selected.map(b => b.title),
    qty: 1,
  });

  saveCart();
  updateCartUI();
  openCart();
  showToast(`Custom bundle (${selected.length} books) added to cart!`);

  // Optionally clear selection after adding
  selectedBookIds.clear();
  renderBookGrid();
  updateCustomBuilderStats();
}

// â”€â”€ 6. Cart â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function addBundleToCart(bundleId) {
  const bundle = BUNDLES.find(b => b.id === bundleId);
  if (!bundle) return;

  const existing = cart.find(item => item.id === bundleId && item.type === 'bundle');
  if (existing) {
    existing.qty++;
    showToast(`${bundle.name} qty updated in cart.`);
  } else {
    cart.push({
      type: 'bundle',
      id: bundleId,
      name: bundle.name,
      subtitle: bundle.subtitle,
      price: bundle.comboPrice,
      books: bundle.books.map(b => b.title),
      qty: 1,
    });
    showToast(`${bundle.name} added to cart! ðŸ›’`);
  }

  saveCart();
  updateCartUI();
  openCart();
}

function removeFromCart(id) {
  cart = cart.filter(item => item.id !== id);
  saveCart();
  updateCartUI();
  if (cart.length === 0) {
    const footerEl = document.getElementById('cartFooter');
    const emptyEl = document.getElementById('cartEmpty');
    if (footerEl) footerEl.style.display = 'none';
    if (emptyEl) emptyEl.style.display = 'flex';
  }
}

function updateCartUI() {
  const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  // Cart badge in header
  const badge = document.getElementById('cartBadge');
  if (badge) {
    badge.textContent = totalItems;
    badge.classList.toggle('visible', totalItems > 0);
  }

  // Aria label on cart button
  const cartBtn = document.getElementById('cartBtn');
  if (cartBtn) cartBtn.setAttribute('aria-label', `View cart (${totalItems} item${totalItems !== 1 ? 's' : ''})`);

  // Cart items list
  const cartItemsEl = document.getElementById('cartItems');
  const cartEmptyEl = document.getElementById('cartEmpty');
  const cartFooterEl = document.getElementById('cartFooter');

  if (cart.length === 0) {
    if (cartItemsEl) cartItemsEl.innerHTML = '';
    if (cartEmptyEl) cartEmptyEl.style.display = 'flex';
    if (cartFooterEl) cartFooterEl.style.display = 'none';
  } else {
    if (cartEmptyEl) cartEmptyEl.style.display = 'none';
    if (cartFooterEl) cartFooterEl.style.display = 'block';

    if (cartItemsEl) {
      cartItemsEl.innerHTML = cart.map(item => {
        const icon = item.type === 'bundle'
          ? (BUNDLES.find(b => b.id === item.id)?.tag || 'ðŸ“¦')
          : 'âœ¨';
        const previewBooks = item.books.slice(0, 3).join(', ') + (item.books.length > 3 ? ` +${item.books.length - 3} more` : '');

        return `
          <div class="cart-item">
            <div class="cart-item-icon">${icon}</div>
            <div class="cart-item-info">
              <strong>${item.name}</strong>
              <small>${item.subtitle}</small>
              <div class="cart-item-books">${previewBooks}</div>
            </div>
            <div class="cart-item-right">
              <span class="cart-item-price">${item.price * item.qty} Tk</span>
              <button class="cart-remove" onclick="removeFromCart('${item.id}')" aria-label="Remove ${item.name}">âœ• Remove</button>
            </div>
          </div>
        `;
      }).join('');
    }
  }

  // Cart total
  const cartTotalEl = document.getElementById('cartTotal');
  if (cartTotalEl) cartTotalEl.textContent = totalPrice + ' Tk';

  // Update order section cart summary
  updateOrderCartSummary(totalPrice);

  // Update the bundle select dropdown
  updateOrderBundleSelect();
}

function updateOrderCartSummary(totalPrice) {
  const summaryEl = document.getElementById('orderCartSummary');
  const itemsEl = document.getElementById('orderCartItems');
  const totalEl = document.getElementById('orderCartTotal');

  if (!summaryEl) return;

  if (cart.length === 0) {
    summaryEl.style.display = 'none';
    return;
  }

  summaryEl.style.display = 'block';
  if (itemsEl) {
    itemsEl.innerHTML = cart.map(item => `
      <div class="order-cart-item">
        <span class="order-cart-item-name">${item.name} Ã— ${item.qty}</span>
        <span class="order-cart-item-price">${item.price * item.qty} Tk</span>
      </div>
    `).join('');
  }
  if (totalEl) totalEl.textContent = totalPrice + ' Tk';
}

function openCart() {
  const sidebar = document.getElementById('cartSidebar');
  const overlay = document.getElementById('cartOverlay');
  if (sidebar) { sidebar.classList.add('open'); sidebar.setAttribute('aria-hidden', 'false'); }
  if (overlay) overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeCart() {
  const sidebar = document.getElementById('cartSidebar');
  const overlay = document.getElementById('cartOverlay');
  if (sidebar) { sidebar.classList.remove('open'); sidebar.setAttribute('aria-hidden', 'true'); }
  if (overlay) overlay.classList.remove('open');
  document.body.style.overflow = '';
}

function proceedToOrder() {
  closeCart();
  const orderSection = document.getElementById('order');
  if (orderSection) {
    const top = orderSection.getBoundingClientRect().top + window.scrollY - 80;
    window.scrollTo({ top, behavior: 'smooth' });
  }
}

// â”€â”€ 7. Order Form â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function updateOrderBundleSelect() {
  const select = document.getElementById('orderBundleSelect');
  if (!select) return;

  const bundleOptions = BUNDLES.map(b =>
    `<option value="${b.id}">${b.name} â€” ${b.comboPrice} Tk</option>`
  ).join('');

  const cartCustomOptions = cart
    .filter(item => item.type === 'custom')
    .map(item =>
      `<option value="${item.id}">Custom Bundle (${item.subtitle}) â€” ${item.price} Tk</option>`
    ).join('');

  select.innerHTML = `
    <option value="">â€” Choose what you're ordering â€”</option>
    <optgroup label="Ready-Made Bundles">${bundleOptions}</optgroup>
    ${cartCustomOptions ? `<optgroup label="Your Custom Bundle">${cartCustomOptions}</optgroup>` : ''}
  `;

  if (window.__preselectedBundle) {
    select.value = window.__preselectedBundle;
    window.__preselectedBundle = null;
  }
}

function orderBundle(bundleId) {
  window.__preselectedBundle = bundleId;
  proceedToOrder();
  setTimeout(updateOrderBundleSelect, 300);
  showToast('Scroll down to fill in your details!');
}

// Form validation
function validateForm() {
  let valid = true;

  const name = document.getElementById('orderName');
  const phone = document.getElementById('orderPhone');
  const address = document.getElementById('orderAddress');
  const bundle = document.getElementById('orderBundleSelect');

  const fields = [
    { el: name, errId: 'errName', msg: 'Please enter your full name.' },
    { el: phone, errId: 'errPhone', msg: 'Please enter a valid phone number.' },
    { el: address, errId: 'errAddress', msg: 'Please enter your delivery address.' },
    { el: bundle, errId: 'errBundle', msg: 'Please select what you\'d like to order.' },
  ];

  fields.forEach(({ el, errId, msg }) => {
    const errEl = document.getElementById(errId);
    if (!el || !el.value.trim()) {
      if (el) el.classList.add('invalid');
      if (errEl) errEl.textContent = msg;
      valid = false;
    } else {
      if (el) el.classList.remove('invalid');
      if (errEl) errEl.textContent = '';
    }
  });

  return valid;
}

// â”€â”€ Google Sheets Configuration â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Paste your Google Apps Script Web App URL below after deploying:
const GOOGLE_SHEETS_WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbzuGmJiTrVeiDnqjY3gaJwLtkqqmDdFoaG1Gspqge3EVKLima4TaHronO3ukAcbZm6MHQ/exec';

function handleOrderSubmit(e) {
  e.preventDefault();
  if (!validateForm()) return;

  const submitBtn = document.getElementById('formSubmitBtn');
  const btnText = submitBtn.querySelector('.btn-text');
  const btnLoader = submitBtn.querySelector('.btn-loader');

  if (btnText) btnText.style.display = 'none';
  if (btnLoader) btnLoader.style.display = 'inline';
  submitBtn.disabled = true;

  const name = document.getElementById('orderName').value;
  const phone = document.getElementById('orderPhone').value;
  const address = document.getElementById('orderAddress').value;
  const bundle = document.getElementById('orderBundleSelect');
  const payment = document.querySelector('input[name="payment"]:checked');
  const notes = document.getElementById('orderNotes').value;

  const selectedBundle = bundle.options[bundle.selectedIndex].text;
  const paymentMethod = payment ? payment.value.toUpperCase() : 'COD';
  const cartSummary = cart.map(item => `${item.name} (${item.subtitle}) x${item.qty}`).join('; ');
  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  const orderData = {
    timestamp: new Date().toLocaleString('en-US', { timeZone: 'Asia/Dhaka' }),
    name: name,
    phone: phone,
    address: address,
    bundle: selectedBundle,
    cartItems: cartSummary || 'Single Item Selection',
    totalPrice: totalPrice ? `${totalPrice} Tk` : 'N/A',
    paymentMethod: paymentMethod,
    notes: notes || 'N/A'
  };

  const showSuccessUI = () => {
    document.getElementById('orderFormWrap').style.display = 'none';
    const successEl = document.getElementById('orderSuccess');
    successEl.style.display = 'block';

    document.getElementById('successDetails').innerHTML = `
      <strong>ðŸ“› Name:</strong> ${name}<br>
      <strong>ðŸ“ž Phone:</strong> ${phone}<br>
      <strong>ðŸ“¦ Order:</strong> ${selectedBundle}<br>
      <strong>ðŸ’³ Payment:</strong> ${paymentMethod}<br>
      <strong>ðŸ  Address:</strong> ${address}${notes ? `<br><strong>ðŸ“ Notes:</strong> ${notes}` : ''}
    `;

    successEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  if (GOOGLE_SHEETS_WEB_APP_URL) {
    fetch(GOOGLE_SHEETS_WEB_APP_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData)
    })
      .then(() => {
        showSuccessUI();
      })
      .catch((err) => {
        console.error('Google Sheets submission error:', err);
        showSuccessUI(); // Fallback so user still sees order confirmation
      });
  } else {
    setTimeout(showSuccessUI, 1000);
  }
}

function resetOrderForm() {
  document.getElementById('orderFormWrap').style.display = 'block';
  document.getElementById('orderSuccess').style.display = 'none';
  document.getElementById('orderForm').reset();
  updateOrderBundleSelect();
  const submitBtn = document.getElementById('formSubmitBtn');
  if (submitBtn) {
    submitBtn.disabled = false;
    const btnText = submitBtn.querySelector('.btn-text');
    const btnLoader = submitBtn.querySelector('.btn-loader');
    if (btnText) btnText.style.display = 'inline';
    if (btnLoader) btnLoader.style.display = 'none';
  }
}

// â”€â”€ 8. Toast Notification â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
let toastTimer = null;
function showToast(msg) {
  let toast = document.getElementById('toastEl');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toastEl';
    toast.className = 'toast';
    toast.setAttribute('role', 'status');
    toast.setAttribute('aria-live', 'polite');
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2800);
}

// â”€â”€ 9. Header scroll shadow â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const header = document.querySelector('.site-header');
const onScroll = () => header && header.classList.toggle('scrolled', window.scrollY > 10);
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

// â”€â”€ 10. Mobile nav â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const hamburger = document.getElementById('hamburger');
const mobileNav = document.getElementById('mobileNav');
const mobileClose = document.getElementById('mobileNavClose');
const mobileLinks = document.querySelectorAll('.mobile-nav-link, .mobile-nav-cta');

function openMobileNav() {
  mobileNav.classList.add('open');
  mobileNav.setAttribute('aria-hidden', 'false');
  hamburger.setAttribute('aria-expanded', 'true');
  document.body.style.overflow = 'hidden';
}
function closeMobileNav() {
  mobileNav.classList.remove('open');
  mobileNav.setAttribute('aria-hidden', 'true');
  hamburger.setAttribute('aria-expanded', 'false');
  document.body.style.overflow = '';
}

if (hamburger) hamburger.addEventListener('click', openMobileNav);
if (mobileClose) mobileClose.addEventListener('click', closeMobileNav);
mobileLinks.forEach(link => link.addEventListener('click', closeMobileNav));
document.addEventListener('keydown', e => { if (e.key === 'Escape') { closeMobileNav(); closeCart(); } });

// â”€â”€ 11. Cart interactions â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
document.getElementById('cartBtn')?.addEventListener('click', openCart);
document.getElementById('cartCloseBtn')?.addEventListener('click', closeCart);
document.getElementById('cartOverlay')?.addEventListener('click', closeCart);
document.getElementById('cartCheckoutBtn')?.addEventListener('click', proceedToOrder);
document.getElementById('addCustomToCartBtn')?.addEventListener('click', addCustomBundleToCart);
document.getElementById('clearSelectionBtn')?.addEventListener('click', clearCustomSelection);

// â”€â”€ 12. Order form â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
document.getElementById('orderForm')?.addEventListener('submit', handleOrderSubmit);

// Remove invalid class on input
['orderName', 'orderPhone', 'orderAddress', 'orderBundleSelect'].forEach(id => {
  document.getElementById(id)?.addEventListener('input', function () {
    this.classList.remove('invalid');
    const errId = 'err' + id.replace('order', '').replace('Bundle', 'Bundle').replace('Select', '');
    const errEl = document.getElementById(errId);
    if (errEl) errEl.textContent = '';
  });
});

// â”€â”€ 13. Smooth scroll for anchor links â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const href = this.getAttribute('href');
    if (href === '#custom-bundle') {
      e.preventDefault();
      openCustomBuilder();
      return;
    }
    const target = document.querySelector(href);
    if (target) {
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  });
});

// â”€â”€ 14. Reveal static elements â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
document.querySelectorAll('.step-card, .perk, .order-left, .order-right').forEach((el, i) => {
  observeReveal(el, el.classList.contains('step-card') ? (i % 3) * 80 : 0);
});

// â”€â”€ 15. Footer year â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
document.getElementById('year').textContent = new Date().getFullYear();

// â”€â”€ 16. URL param pre-select â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const preselected = new URLSearchParams(window.location.search).get('bundle');
if (preselected) window.__preselectedBundle = preselected;

// â”€â”€ 17. Init â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
renderBundles();
renderCustomBuilder();
updateCartUI();
updateOrderBundleSelect();

// â”€â”€ 18. Live Sales Ticker â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
(function initSalesTicker() {
  const tickerEl = document.getElementById('tickerText');
  if (!tickerEl) return;

  const cities = [
    'Dhaka', 'Chittagong', 'Sylhet', 'Rajshahi', 'Khulna',
    'Comilla', 'Mymensingh', 'Narsingdi', 'Gazipur', 'Bogura'
  ];
  const bundleNames = BUNDLES.map(b => b.name);

  function randomFrom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }
  function randomMinutes() {
    return Math.floor(Math.random() * 18) + 1;
  }
  function randomOrders() {
    return Math.floor(Math.random() * 8) + 2;
  }

  // Pool of message templates
  const templates = [
    () => `âš¡ Someone from ${randomFrom(cities)} just ordered "${randomFrom(bundleNames)}" â€” ${randomMinutes()} min ago`,
    () => `ðŸ”¥ ${randomOrders()} bundles ordered in the last hour â€” spots filling fast!`,
    () => `âš¡ "${randomFrom(bundleNames)}" is trending today â€” ordered ${randomOrders()} times already`,
    () => `ðŸ“¦ A reader from ${randomFrom(cities)} just completed their order â€” ${randomMinutes()} min ago`,
    () => `âœ… ${randomOrders()} happy readers placed orders today. Join them!`,
    () => `âš¡ Someone from ${randomFrom(cities)} picked "${randomFrom(bundleNames)}" â€” ${randomMinutes()} min ago`,
  ];

  let currentIdx = 0;

  function nextMessage() {
    // Fade out
    tickerEl.classList.add('fade-out');
    tickerEl.classList.remove('fade-in');

    setTimeout(() => {
      currentIdx = (currentIdx + 1) % templates.length;
      tickerEl.textContent = templates[currentIdx]();
      tickerEl.classList.remove('fade-out');
      tickerEl.classList.add('fade-in');
    }, 370);
  }

  // Show first message immediately
  tickerEl.textContent = templates[0]();
  tickerEl.classList.add('fade-in');

  // Rotate every 5 seconds
  setInterval(nextMessage, 5000);
})();

// â”€â”€ 19. Sticky Mobile CTA Bar â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
(function initStickyCta() {
  const bar       = document.getElementById('stickyCta');
  const totalEl   = document.getElementById('stickyCtaTotal');
  const heroEl    = document.getElementById('hero');
  const orderEl   = document.getElementById('order');

  if (!bar || !heroEl || !orderEl) return;

  let heroGone  = false;
  let orderVisible = false;

  function updateBar() {
    // Sync total from main cart total
    const cartTotalEl = document.getElementById('cartTotal');
    if (cartTotalEl && totalEl) {
      totalEl.textContent = cartTotalEl.textContent || '0 Tk';
    }

    const shouldShow = heroGone && !orderVisible;
    bar.classList.toggle('visible', shouldShow);
    bar.setAttribute('aria-hidden', String(!shouldShow));
  }

  // Watch hero leaving viewport (so bar appears after scrolling past it)
  const heroObs = new IntersectionObserver(
    ([entry]) => { heroGone = !entry.isIntersecting; updateBar(); },
    { threshold: 0.1 }
  );
  heroObs.observe(heroEl);

  // Watch order section entering viewport (so bar hides near form)
  const orderObs = new IntersectionObserver(
    ([entry]) => { orderVisible = entry.isIntersecting; updateBar(); },
    { threshold: 0.15 }
  );
  orderObs.observe(orderEl);

  // Re-sync total whenever cart changes (hook into existing updateCartUI)
  const origUpdateCartUI = window.updateCartUI;
  if (typeof origUpdateCartUI === 'function') {
    window.updateCartUI = function(...args) {
      origUpdateCartUI(...args);
      updateBar();
    };
  }

  // Also update on scroll for total sync
  document.addEventListener('scroll', updateBar, { passive: true });
})();
