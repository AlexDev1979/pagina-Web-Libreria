// productos.js - Adaptado con claves estandarizadas en inglés

// =============================
// VARIABLES GLOBALES
// =============================
let allProducts = [];
let filteredProducts = [];
let cart = [];
let categories = new Set();
let brands = new Set();

// Claves del localStorage
const CART_KEY = 'cart';
const PRODUCTS_KEY = 'products';

// =============================
// ELEMENTOS DEL DOM
// =============================
const searchInput = document.getElementById('searchInput');
const productsContainer = document.getElementById('productsContainer');
const productsCount = document.getElementById('productsCount');
const sortSelect = document.getElementById('sortSelect');
const cartCount = document.getElementById('cartCount');
const quickCategoryFilter = document.getElementById('quickCategoryFilter');
const quickBrandFilter = document.getElementById('quickBrandFilter');

// =============================
// FUNCIONES DEL CARRITO
// =============================
function initializeCart() {
  const savedCart = localStorage.getItem(CART_KEY);
  if (savedCart) {
    try {
      const parsed = JSON.parse(savedCart);
      if (Array.isArray(parsed)) {
        cart = parsed.filter(item =>
          item && typeof item === 'object' &&
          item.id && typeof item.name === 'string' &&
          typeof item.price === 'number' &&
          typeof item.quantity === 'number' && item.quantity > 0
        );
      }
    } catch (e) {
      cart = [];
    }
  }
  updateCartCount();
}

function getProductById(id) {
  return allProducts.find(p => p.id === id) ||
         (JSON.parse(localStorage.getItem(PRODUCTS_KEY)) || []).find(p => p.id === id);
}

function addToCart(productId, quantity = 1) {
    const product = allProducts.find(p => p.id === productId) || getProductById(productId);
    if (!product) {
        showAlert('error', 'Producto no encontrado');
        return;
    }
    
    if (product.stock === 'agotado' || product.stock <= 0) {
        showAlert('error', 'Producto agotado');
        return;
    }
    
    const existingItem = cart.find(item => item.id === productId);

    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.push({
            id: product.id,
            name: product.name || product.nombre,
            price: product.price || product.precio,
            img: product.img || product.imagen,
            marca: product.marca || product.brand,
            quantity: quantity
        });
    }
    
    saveCart();
    updateCartCount();
    updateCartSummary();
    showAlert('success', `${quantity} ${product.name || product.nombre} agregado${quantity > 1 ? 's' : ''} al carrito`);
}

function updateCartSummary() {
    const cartSummary = document.getElementById('cart-summary');
    if (!cartSummary) return;
    
    if (cart.length === 0) {
        cartSummary.innerHTML = '<p style="text-align: center; color: #666;">Tu carrito está vacío</p>';
        return;
    }
    
    let html = `
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <thead>
                <tr style="border-bottom: 1px solid #eee;">
                    <th style="text-align: left; padding: 10px;">Producto</th>
                    <th style="text-align: right; padding: 10px;">Precio</th>
                    <th style="text-align: center; padding: 10px;">Cantidad</th>
                    <th style="text-align: right; padding: 10px;">Subtotal</th>
                    <th style="text-align: center; padding: 10px;">Eliminar</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    let total = 0;
    
    cart.forEach(item => {
        const product = getProductById(item.id) || item;
        const subtotal = item.price * item.quantity;
        total += subtotal;
        
        html += `
            <tr style="border-bottom: 1px solid #eee;">
                <td style="padding: 10px; vertical-align: middle;">
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <img src="${product.img || product.imagen || 'img/sin-imagen.jpg'}" 
                             alt="${product.name || product.nombre}" 
                             style="width: 50px; height: 50px; object-fit: cover; border-radius: 5px;">
                        <div>
                            <strong>${product.name || product.nombre}</strong><br>
                            <small style="color: #666;">${product.marca || product.brand || ''}</small>
                        </div>
                    </div>
                </td>
                <td style="text-align: right; padding: 10px; vertical-align: middle;">Q${item.price.toFixed(2)}</td>
                <td style="text-align: center; padding: 10px; vertical-align: middle;">
                    <input type="number" value="${item.quantity}" min="1" 
                           style="width: 50px; text-align: center; padding: 5px; border: 1px solid #ddd; border-radius: 4px;"
                           onchange="updateCartItemQuantity(${item.id}, this.value)">
                </td>
                <td style="text-align: right; padding: 10px; vertical-align: middle;">Q${subtotal.toFixed(2)}</td>
                <td style="text-align: center; padding: 10px; vertical-align: middle;">
                    <button onclick="removeFromCart(${item.id})" 
                            style="background: #ff4444; color: white; border: none; border-radius: 50%; width: 25px; height: 25px; cursor: pointer;">
                        ×
                    </button>
                </td>
            </tr>
        `;
    });
    
    html += `
            </tbody>
        </table>
        <div style="display: flex; justify-content: space-between; align-items: center; font-size: 1.2rem; font-weight: 600; border-top: 2px solid #667eea; padding-top: 10px;">
            <span>Total:</span>
            <span style="color: #667eea;">Q${total.toFixed(2)}</span>
        </div>
    `;
    
    cartSummary.innerHTML = html;
}
function updateCartItemQuantity(productId, newQuantity) {
    newQuantity = parseInt(newQuantity) || 1;
    if (newQuantity < 1) newQuantity = 1;
    
    const itemIndex = cart.findIndex(item => item.id === productId);
    if (itemIndex !== -1) {
        cart[itemIndex].quantity = newQuantity;
        saveCart();
        updateCartSummary();
        updateCartCount();
    }
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCart();
    updateCartSummary();
    updateCartCount();
    showAlert('info', 'Producto eliminado del carrito');
}
function saveCart() {
    try {
        localStorage.setItem('cart', JSON.stringify(cart));
        notifyMainCart();
    } catch (error) {
        console.error('Error al guardar carrito:', error);
    }
}

function updateCartCount() {
  const count = cart.reduce((acc, item) => acc + item.quantity, 0);
  if (cartCount) {
    cartCount.textContent = count;
    cartCount.style.display = count > 0 ? 'inline-block' : 'none';
  }
}

// =============================
// FUNCIONES DE PRODUCTOS
// =============================
function loadProducts() {
  const saved = localStorage.getItem(PRODUCTS_KEY);
  if (saved) {
    try {
      allProducts = JSON.parse(saved);
      processProducts();
    } catch (e) {
      allProducts = [];
    }
  }
  displayProducts();
}

function processProducts() {
  categories.clear();
  brands.clear();
  allProducts.forEach(p => {
    if (p.category) categories.add(p.category);
    if (p.brand) brands.add(p.brand);
  });
  updateFilters();
}

function updateFilters() {
  if (quickCategoryFilter) {
    quickCategoryFilter.innerHTML = '<option value="">All categories</option>';
    categories.forEach(cat => {
      const opt = document.createElement('option');
      opt.value = cat;
      opt.textContent = cat;
      quickCategoryFilter.appendChild(opt);
    });
  }
  if (quickBrandFilter) {
    quickBrandFilter.innerHTML = '<option value="">All brands</option>';
    brands.forEach(br => {
      const opt = document.createElement('option');
      opt.value = br;
      opt.textContent = br;
      quickBrandFilter.appendChild(opt);
    });
  }
}

function filterProducts() {
  const term = searchInput?.value.toLowerCase() || '';
  const cat = quickCategoryFilter?.value || '';
  const brand = quickBrandFilter?.value || '';

  filteredProducts = allProducts.filter(p => {
    const matchSearch = !term ||
      p.name.toLowerCase().includes(term) ||
      p.description?.toLowerCase().includes(term) ||
      p.category?.toLowerCase().includes(term) ||
      p.brand?.toLowerCase().includes(term);

    const matchCat = !cat || p.category === cat;
    const matchBrand = !brand || p.brand === brand;
    return matchSearch && matchCat && matchBrand;
  });
  displayProducts();
}

function displayProducts() {
  const list = filteredProducts.length > 0 ? filteredProducts : allProducts;
  if (productsCount) productsCount.textContent = `${list.length} products found`;
  if (!productsContainer) return;
  productsContainer.innerHTML = list.map(p => `
    <div class="product-card">
      <img src="${p.image || 'img/sin-imagen.jpg'}" alt="${p.name}" loading="lazy">
      <h3>${p.name}</h3>
      <p class="price">Q${parseFloat(p.price).toFixed(2)}</p>
      <p class="stock">Stock: ${p.stock}</p>
      <button onclick="addToCart(${p.id})" ${p.stock <= 0 ? 'disabled' : ''}>
        ${p.stock <= 0 ? 'Out of stock' : 'Add to cart'}
      </button>
    </div>
  `).join('');
}

function clearAllFilters() {
  if (searchInput) searchInput.value = '';
  if (quickCategoryFilter) quickCategoryFilter.value = '';
  if (quickBrandFilter) quickBrandFilter.value = '';
  filterProducts();
}

// =============================
// EVENTOS Y CARGA INICIAL
// =============================
document.addEventListener('DOMContentLoaded', () => {
  initializeCart();
  loadProducts();

  if (searchInput) searchInput.addEventListener('input', filterProducts);
  if (sortSelect) sortSelect.addEventListener('change', filterProducts);
  if (quickCategoryFilter) quickCategoryFilter.addEventListener('change', filterProducts);
  if (quickBrandFilter) quickBrandFilter.addEventListener('change', filterProducts);
});

// =============================
// EXPORTAR FUNCIONES GLOBALES
// =============================
window.addToCart = addToCart;
window.clearAllFilters = clearAllFilters;
window.filterProducts = filterProducts;
