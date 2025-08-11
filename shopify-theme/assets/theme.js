(function(){
  function $(sel, root){ return (root||document).querySelector(sel); }
  function $all(sel, root){ return Array.from((root||document).querySelectorAll(sel)); }

  function escapeHtml(str){
    const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
    return (str || '').replace(/[&<>"']/g, ch => map[ch]);
  }

  function formatMoney(cents){
    try {
      if (window.Shopify && typeof Shopify.formatMoney === 'function') {
        return Shopify.formatMoney(cents, window.themeMoneyFormat || '${{amount}}');
      }
    } catch(e){}
    var currency = window.themeCurrency || 'USD';
    return new Intl.NumberFormat(undefined, { style: 'currency', currency }).format((cents||0)/100);
  }

  const AjaxCart = (function(){
    const selectors = {
      drawer: '[data-cart-drawer]',
      overlay: '[data-cart-overlay]',
      items: '[data-cart-items]',
      subtotal: '[data-cart-subtotal]',
      count: '[data-cart-count]',
      toggle: '[data-cart-toggle]',
      close: '[data-cart-close]'
    };

    let drawer, overlay, itemsEl, subtotalEl, closeBtn, toggles;

    function open(){ if (!drawer) return; drawer.classList.add('is-open'); drawer.setAttribute('aria-hidden', 'false'); }
    function close(){ if (!drawer) return; drawer.classList.remove('is-open'); drawer.setAttribute('aria-hidden', 'true'); }

    async function getCart(){ const res = await fetch('/cart.js', { headers: { 'Accept':'application/json' } }); return await res.json(); }

    function updateCount(count){ const c = $(selectors.count); if (c) c.textContent = count; }

    function renderItem(item){
      const img = item.image ? `<img src="${item.image.replace(/\.(jpg|jpeg|png|gif)(\?.*)?$/i,'_200x.$1') }" alt="${escapeHtml(item.title)}">` : '';
      const variant = item.variant_title ? `<div class="cart-line-variant">${escapeHtml(item.variant_title)}</div>` : '';
      return `
      <div class="cart-line" data-key="${item.key}">
        <a href="${item.url}" class="cart-line-media">${img}</a>
        <div class="cart-line-info">
          <a href="${item.url}" class="cart-line-title">${escapeHtml(item.product_title)}</a>
          ${variant}
          <div class="cart-line-price">${formatMoney(item.final_price)}</div>
          <div class="cart-line-qty">
            <button type="button" class="qty-btn" data-action="dec" aria-label="Decrease quantity">−</button>
            <input type="number" min="0" value="${item.quantity}" data-qty>
            <button type="button" class="qty-btn" data-action="inc" aria-label="Increase quantity">+</button>
            <button type="button" class="remove-btn" data-action="remove" aria-label="Remove">×</button>
          </div>
        </div>
      </div>`;
    }

    function render(cart){
      if (!itemsEl || !subtotalEl) return;
      if (!cart.items || cart.items.length === 0){
        itemsEl.innerHTML = `<p class="cart-empty">${(window.themeStrings && window.themeStrings['cart.empty']) || 'Your cart is empty'}</p>`;
      } else {
        itemsEl.innerHTML = cart.items.map(renderItem).join('');
      }
      subtotalEl.textContent = formatMoney(cart.total_price);
      updateCount(cart.item_count);
    }

    async function refresh(){ const cart = await getCart(); render(cart); return cart; }

    async function changeQty(key, quantity){
      await fetch('/cart/change.js', {
        method: 'POST',
        headers: { 'Content-Type':'application/json', 'Accept':'application/json' },
        body: JSON.stringify({ id: key, quantity: Math.max(0, quantity|0) })
      });
      await refresh();
    }

    async function onItemsClick(e){
      const btn = e.target.closest('button[data-action]');
      if (!btn) return;
      const line = e.target.closest('.cart-line');
      if (!line) return;
      const key = line.getAttribute('data-key');
      const qtyInput = line.querySelector('[data-qty]');
      let qty = parseInt(qtyInput.value, 10) || 0;
      const action = btn.getAttribute('data-action');
      if (action === 'inc') qty += 1;
      if (action === 'dec') qty = Math.max(0, qty - 1);
      if (action === 'remove') qty = 0;
      await changeQty(key, qty);
    }

    async function onItemsChange(e){
      if (!e.target.matches('[data-qty]')) return;
      const line = e.target.closest('.cart-line');
      if (!line) return;
      const key = line.getAttribute('data-key');
      const qty = Math.max(0, parseInt(e.target.value, 10) || 0);
      await changeQty(key, qty);
    }

    async function onProductFormSubmit(e){
      const form = e.target;
      if (!form.matches('form.product-form')) return;
      e.preventDefault();
      const formData = new FormData(form);
      const res = await fetch('/cart/add.js', { method: 'POST', body: formData, headers: { 'Accept':'application/json' } });
      if (!res.ok){ console.error('Add to cart failed'); return; }
      await refresh();
      open();
    }

    function attach(){
      toggles.forEach(btn => btn.addEventListener('click', open));
      if (closeBtn) closeBtn.addEventListener('click', close);
      if (overlay) overlay.addEventListener('click', close);
      if (itemsEl){
        itemsEl.addEventListener('click', onItemsClick);
        itemsEl.addEventListener('change', onItemsChange);
      }
      document.addEventListener('submit', onProductFormSubmit, true);
    }

    function init(){
      drawer = $(selectors.drawer);
      if (!drawer) return;
      overlay = $(selectors.overlay, drawer);
      itemsEl = $(selectors.items, drawer);
      subtotalEl = $(selectors.subtotal, drawer);
      closeBtn = $(selectors.close, drawer);
      toggles = $all(selectors.toggle);
      attach();
      refresh();
      console.log('Ajax cart initialized');
    }

    return { init, open, close, refresh };
  })();

  document.addEventListener('DOMContentLoaded', function(){ AjaxCart.init(); });
})();