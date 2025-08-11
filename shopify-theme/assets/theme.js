(function(){
  function $(sel, root){ return (root||document).querySelector(sel); }
  function $all(sel, root){ return Array.from((root||document).querySelectorAll(sel)); }

  function escapeHtml(str){
    const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
    return (str || '').replace(/[&<>"']/g, ch => map[ch]);
  }

  function formatMoney(cents){
    try { if (window.Shopify && typeof Shopify.formatMoney === 'function') { return Shopify.formatMoney(cents, window.themeMoneyFormat || '${{amount}}'); } } catch(e){}
    var currency = window.themeCurrency || 'USD';
    return new Intl.NumberFormat(undefined, { style: 'currency', currency }).format((cents||0)/100);
  }

  function track(eventName, payload){ try { window.dataLayer = window.dataLayer || []; window.dataLayer.push({ event: eventName, ecommerce: payload || {} }); } catch(e){} }

  const AB = (function(){
    const key = 'theme_ab_upsell_variant';
    let assigned;
    function assign(){
      if (!window.themeAB || !window.themeAB.enabled) return 'A';
      try { const saved = localStorage.getItem(key); if (saved) return saved; } catch(e){}
      const v = Math.random() < 0.5 ? 'A' : 'B';
      try { localStorage.setItem(key, v); } catch(e){}
      track('ab_assign', { variant: v });
      return v;
    }
    function get(){ if (!assigned) assigned = assign(); return assigned; }
    return { get };
  })();

  const AjaxCart = (function(){
    const selectors = {
      drawer: '[data-cart-drawer]', overlay: '[data-cart-overlay]', items: '[data-cart-items]', subtotal: '[data-cart-subtotal]', count: '[data-cart-count]', toggle: '[data-cart-toggle]', close: '[data-cart-close]', note: '[data-cart-note]', discountInput: '[data-cart-discount]', discountField: '[data-discount-field]', mini: '[data-mobile-minicart]', miniSubtotal: '[data-mini-subtotal]', miniCount: '[data-mini-count]', upsellAuto: '[data-upsell-auto]', upsellGrid: '[data-upsell-grid]'
    };
    let drawer, overlay, itemsEl, subtotalEl, closeBtn, toggles, noteEl, discountInputEl, discountFieldEl, miniEl, miniSubtotalEl, miniCountEl, upsellAutoEl, upsellGridEl;

    function open(){ if (!drawer) return; drawer.classList.add('is-open'); drawer.setAttribute('aria-hidden', 'false'); track('cart_drawer_open'); }
    function close(){ if (!drawer) return; drawer.classList.remove('is-open'); drawer.setAttribute('aria-hidden', 'true'); track('cart_drawer_close'); }

    async function getCart(){ const res = await fetch('/cart.js', { headers: { 'Accept':'application/json' } }); return await res.json(); }
    function updateCount(count){ const c = $(selectors.count); if (c) c.textContent = count; if (miniCountEl) miniCountEl.textContent = count; }

    function renderItem(item){
      const img = item.image ? `<img src="${item.image.replace(/\.(jpg|jpeg|png|gif)(\?.*)?$/i,'_200x.$1') }" alt="${escapeHtml(item.title)}">` : '';
      const variant = item.variant_title ? `<div class=\"cart-line-variant\">${escapeHtml(item.variant_title)}</div>` : '';
      return `<div class=\"cart-line\" data-key=\"${item.key}\"><a href=\"${item.url}\" class=\"cart-line-media\">${img}</a><div class=\"cart-line-info\"><a href=\"${item.url}\" class=\"cart-line-title\">${escapeHtml(item.product_title)}</a>${variant}<div class=\"cart-line-price\">${formatMoney(item.final_price)}</div><div class=\"cart-line-qty\"><button type=\"button\" class=\"qty-btn\" data-action=\"dec\" aria-label=\"Decrease quantity\">−</button><input type=\"number\" min=\"0\" value=\"${item.quantity}\" data-qty><button type=\"button\" class=\"qty-btn\" data-action=\"inc\" aria-label=\"Increase quantity\">+</button><button type=\"button\" class=\"remove-btn\" data-action=\"remove\" aria-label=\"Remove\">×</button></div></div></div>`;
    }

    function render(cart){
      if (!itemsEl || !subtotalEl) return;
      itemsEl.innerHTML = (!cart.items || cart.items.length === 0) ? `<p class=\"cart-empty\">${(window.themeStrings && window.themeStrings['cart.empty']) || 'Your cart is empty'}</p>` : cart.items.map(renderItem).join('');
      subtotalEl.textContent = formatMoney(cart.total_price);
      if (miniSubtotalEl) miniSubtotalEl.textContent = formatMoney(cart.total_price);
      updateCount(cart.item_count);
      if (noteEl) noteEl.value = cart.note || '';
      propagateDiscountToCheckout();
      autoUpsell(cart);
    }

    async function refresh(){ const cart = await getCart(); render(cart); return cart; }
    async function changeQty(key, quantity){ await fetch('/cart/change.js', { method: 'POST', headers: { 'Content-Type':'application/json', 'Accept':'application/json' }, body: JSON.stringify({ id: key, quantity: Math.max(0, quantity|0) }) }); await refresh(); }
    async function updateNote(note){ await fetch('/cart/update.js', { method: 'POST', headers: { 'Content-Type':'application/json', 'Accept':'application/json' }, body: JSON.stringify({ note: note || '' }) }); }
    function propagateDiscountToCheckout(){ if (!discountInputEl || !discountFieldEl) return; discountFieldEl.value = (discountInputEl.value || '').trim(); }

    async function onItemsClick(e){ const btn = e.target.closest('button[data-action]'); if (!btn) return; const line = e.target.closest('.cart-line'); if (!line) return; const key = line.getAttribute('data-key'); const qtyInput = line.querySelector('[data-qty]'); let qty = parseInt(qtyInput.value, 10) || 0; const action = btn.getAttribute('data-action'); if (action === 'inc') qty += 1; if (action === 'dec') qty = Math.max(0, qty - 1); if (action === 'remove') qty = 0; await changeQty(key, qty); }
    async function onItemsChange(e){ if (!e.target.matches('[data-qty]')) return; const line = e.target.closest('.cart-line'); if (!line) return; const key = line.getAttribute('data-key'); const qty = Math.max(0, parseInt(e.target.value, 10) || 0); await changeQty(key, qty); }
    async function onNoteInput(e){ await updateNote(e.target.value); }
    function onDiscountInput(){ propagateDiscountToCheckout(); }

    async function onProductFormSubmit(e){ const form = e.target; if (!form.matches('form.product-form')) return; e.preventDefault(); const formData = new FormData(form); const sellingPlan = form.querySelector('[name="selling_plan"]'); if (sellingPlan && sellingPlan.value) { formData.set('selling_plan', sellingPlan.value); } const res = await fetch('/cart/add.js', { method: 'POST', body: formData, headers: { 'Accept':'application/json' } }); if (!res.ok){ console.error('Add to cart failed'); return; } const added = await res.json(); track('upsell_add', { items: [{ item_id: added.product_id, item_variant: added.variant_id, price: added.price, quantity: added.quantity }] }); await refresh(); open(); }

    function attach(){ toggles.forEach(btn => btn.addEventListener('click', open)); if (closeBtn) closeBtn.addEventListener('click', close); if (overlay) overlay.addEventListener('click', close); if (itemsEl){ itemsEl.addEventListener('click', onItemsClick); itemsEl.addEventListener('change', onItemsChange); } if (noteEl) noteEl.addEventListener('input', onNoteInput); if (discountInputEl) discountInputEl.addEventListener('input', onDiscountInput); document.addEventListener('submit', onProductFormSubmit, true); }

    function productCardHTML(p){ const img = p.image ? `<img src="${p.image.replace(/\.(jpg|jpeg|png|gif)(\?.*)?$/i,'_400x.$1') }" alt="${escapeHtml(p.title)}">` : ''; return `<li class=\"upsell-item\"><a href=\"/products/${p.handle}\" data-upsell-link data-product-id=\"${p.id}\">${img}<span class=\"title\">${escapeHtml(p.title)}</span></a><div class=\"price\">${formatMoney(p.price)}</div><form method=\"post\" action=\"/cart/add\" class=\"product-form upsell-form\" data-upsell-form data-product-id=\"${p.id}\"><input type=\"hidden\" name=\"id\" value=\"${p.variants[0].id}\"><button type=\"submit\" data-upsell-add>${(window.themeStrings && window.themeStrings['products.product.add_to_cart']) || 'Add to cart'}</button></form></li>`; }

    function sortProducts(products){ const strat = (window.themeAB && window.themeAB.sort) || 'default'; if (strat === 'price_asc') return products.sort((a,b)=>a.price-b.price); if (strat === 'price_desc') return products.sort((a,b)=>b.price-a.price); return products; }

    async function fetchRecommendations(productId, limit){ const url = `/recommendations/products.json?product_id=${productId}&limit=${limit||4}`; const res = await fetch(url, { headers: { 'Accept': 'application/json' } }); if (!res.ok) return { products: [] }; return await res.json(); }

    async function autoUpsell(cart){ upsellAutoEl = upsellAutoEl || $(selectors.upsellAuto, drawer); upsellGridEl = upsellGridEl || $(selectors.upsellGrid, drawer); if (!upsellAutoEl || !upsellGridEl) return; if (!cart.items || cart.items.length === 0){ upsellGridEl.innerHTML = ''; return; } const lastItem = cart.items[cart.items.length - 1]; const baseLimit = parseInt(upsellAutoEl.getAttribute('data-upsell-limit') || '4', 10); const variant = AB.get(); const limit = (variant === 'B' && window.themeAB && window.themeAB.enabled) ? (window.themeAB.variantBLimit || baseLimit) : baseLimit; const recs = await fetchRecommendations(lastItem.product_id, limit); if (!recs || !recs.products || recs.products.length === 0){ upsellGridEl.innerHTML = ''; return; } const sorted = sortProducts(recs.products.slice()); upsellGridEl.innerHTML = sorted.map(productCardHTML).join(''); track('upsell_view', { items: sorted.map(p => ({ item_id: p.id })) , variant }); }

    function init(){ drawer = $(selectors.drawer); if (!drawer) return; overlay = $(selectors.overlay, drawer); itemsEl = $(selectors.items, drawer); subtotalEl = $(selectors.subtotal, drawer); closeBtn = $(selectors.close, drawer); toggles = $all(selectors.toggle); noteEl = $(selectors.note, drawer); discountInputEl = $(selectors.discountInput, drawer); discountFieldEl = $(selectors.discountField, drawer); miniEl = $(selectors.mini); miniSubtotalEl = $(selectors.miniSubtotal); miniCountEl = $(selectors.miniCount); attach(); refresh(); console.log('Ajax cart initialized'); }

    return { init, open, close, refresh };
  })();

  // Variant selector on product page
  document.addEventListener('change', function(e){
    if (e.target && e.target.matches('#variant-select')){
      try {
        var select = e.target;
        var priceEl = document.querySelector('.product-details .price');
        var selectedOption = select.options[select.selectedIndex];
        var priceText = selectedOption.textContent.match(/\-\s*(.*)$/);
        if (priceEl && priceText && priceText[1]){ priceEl.textContent = priceText[1]; }
      } catch(err){}
    }
  });

  // Predictive search
  (function(){
    var form = document.querySelector('[data-search-form]');
    if (!form) return;
    var input = form.querySelector('[data-search-input]');
    var box = form.querySelector('[data-search-suggest]');
    var controller;
    function clear(){ box.innerHTML=''; box.hidden = true; }
    input.addEventListener('input', async function(){
      var q = (input.value||'').trim();
      if (controller) controller.abort();
      if (q.length < 2){ clear(); return; }
      controller = new AbortController();
      try {
        var res = await fetch(`/search/suggest.json?q=${encodeURIComponent(q)}&resources[type]=product&resources[limit]=5`, { signal: controller.signal, headers: { 'Accept':'application/json' } });
        if (!res.ok) { clear(); return; }
        var data = await res.json();
        var products = (data.resources && data.resources.results && data.resources.results.products) || [];
        if (products.length === 0){ clear(); return; }
        var html = `<ul>` + products.map(p=>`<li><a href=\"${p.url}\">${escapeHtml(p.title)}</a></li>`).join('') + `</ul>`;
        box.innerHTML = html; box.hidden = false;
      } catch(e){ clear(); }
    });
    document.addEventListener('click', function(e){ if (!form.contains(e.target)) clear(); });
  })();

  document.addEventListener('DOMContentLoaded', function(){ AjaxCart.init(); });
})();