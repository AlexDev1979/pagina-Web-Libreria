// carrito.js - Versión corregida
const CART_KEY = 'cart';
const modal = document.getElementById('cart-modal');
const closeCartBtn = document.getElementById('close-cart');
const contentProducts = document.getElementById('contentProducts');
const cartTotal = document.getElementById('cart-total');

// Mostrar/ocultar carrito
function toggleCart() {
  loadCart();
  modal.style.display = 'block';
}

if (closeCartBtn) {
  closeCartBtn.addEventListener('click', () => {
    modal.style.display = 'none';
  });
}

// Obtener carrito
function getCart() {
  return JSON.parse(localStorage.getItem(CART_KEY)) || [];
}

// Guardar carrito
function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

// Agregar producto (mantenido igual)
function addToCart(product) {
  // Añade estos console.log al inicio de la función
  console.log("--- Depuración addToCart ---");
  console.log("Producto recibido (carrito.js):", product);
  console.log("Stock actual del producto (product.stockActual):", product.stockActual);

  if (!product) return;

  if (product.stock === 'agotado') {
    showCartAlert('Producto agotado', 'error');
    return;
  }

  const cart = getCart();
  const existingItem = cart.find(item => item.id === product.id);

  if (existingItem) {
    // Añade este console.log si el producto ya está en el carrito
    console.log("Producto ya en carrito. Cantidad existente:", existingItem.quantity);
    if (existingItem.quantity < product.stockActual) {
      existingItem.quantity++;
      console.log("Cantidad incrementada. Nueva cantidad:", existingItem.quantity);
    } else {
      console.log("FALLO: Cantidad existente (" + existingItem.quantity + ") >= Stock actual (" + product.stockActual + ")");
      showCartAlert('No hay más stock disponible', 'error');
      return;
    }
  } else {
    // Añade este console.log si es la primera vez que se agrega el producto
    console.log("Producto no estaba en carrito. Agregando por primera vez.");
    cart.push({
      id: product.id,
      name: product.nombre,
      price: product.precio,
      img: product.imagen,
      quantity: 1,
      stockMax: product.stockActual
    });
  }

  saveCart(cart);
  updateCartCount();
  showCartAlert(`${product.nombre} agregado al carrito`);
  console.log("--- Fin Depuración addToCart ---");
}

// Cargar/actualizar carrito (versión unificada)
function loadCart() {
    console.log("--- INICIO loadCart ---");
    const cart = getCart();
    console.log("Carrito actual en loadCart:", cart);

    // Asegúrate de que contentProducts se inicialice aquí
    const contentProducts = document.getElementById('contentProducts');
    // Asegúrate de que cartTotal se inicialice aquí (para el total de la tabla)
    const cartTotal = document.getElementById('cart-total'); 
    // Asegúrate de que cartFooterTotal se inicialice aquí (para el total del pie del modal)
    const cartFooterTotal = document.getElementById('cart-footer-total'); 


    if (!contentProducts) { // Añade esta comprobación por si acaso
        console.error("Error: Elemento 'contentProducts' no encontrado. La tabla del carrito no se puede renderizar.");
        return; 
    }

    contentProducts.innerHTML = ''; // Limpia el cuerpo de la tabla
    console.log("contentProducts vaciado.");

     if (cart.length === 0) {
    contentProducts.innerHTML = '<tr><td colspan="6">Carrito vacío</td></tr>';
    if (cartTotal) cartTotal.textContent = '0.00';
    if (cartFooterTotal) cartFooterTotal.textContent = '0.00';
    updateCartCount();
    return;
  }

  let totalGeneral = 0;

  cart.forEach(item => {
    const subtotal = item.price * item.quantity;
    totalGeneral += subtotal;

    const row = document.createElement('tr');
    row.innerHTML = `
      <td><img src="${item.img}" alt="${item.name}" style="width: 50px;"></td>
      <td>${item.name}</td>
      <td class="item-price">Q${item.price.toFixed(2)}</td>
      <td>
        <input type="number" 
               value="${item.quantity}" 
               min="1" 
               data-product-id="${item.id}"
               class="quantity-input"
               onchange="updateItemSubtotal('${item.id}', this.value)">
      </td>
      <td>
        <button onclick="removeFromCart('${item.id}')" class="remove-btn">
          <i class="fas fa-trash"></i>
        </button>
      </td>
      <td class="item-subtotal">Q${subtotal.toFixed(2)}</td>
    `;
    contentProducts.appendChild(row);
  });

  if (cartTotal) cartTotal.textContent = totalGeneral.toFixed(2);
  if (cartFooterTotal) cartFooterTotal.textContent = totalGeneral.toFixed(2);
  updateCartCount();
    console.log("updateCartCount llamado.");
    updateCheckoutSummary();
    console.log("updateCheckoutSummary llamado desde loadCart.");
    console.log("--- FIN loadCart ---");
}

// Actualizar cantidad (versión corregida)
function updateQuantity(productId, newQuantity) {
  const cart = getCart();
  const itemIndex = cart.findIndex(item => item.id.toString() === productId.toString());
  
  if (itemIndex !== -1) {
    const item = cart[itemIndex];
    const parsedQuantity = parseInt(newQuantity);
    
    if (!isNaN(parsedQuantity) && parsedQuantity > 0) {
      // Verificar stock máximo
      if (parsedQuantity > item.stockMax) {
        showCartAlert(`No hay suficiente stock (máximo: ${item.stockMax})`, 'error');
        document.querySelector(`input[onchange*="${productId}"]`).value = item.quantity;
        return;
      }
      
      // Actualizar cantidad
      item.quantity = parsedQuantity;
      saveCart(cart);
      
      // Actualizar subtotal en la misma fila inmediatamente
      const row = document.querySelector(`input[onchange*="${productId}"]`).closest('tr');
      if (row) {
        const subtotalCell = row.querySelector('td:last-child');
        const subtotal = item.price * item.quantity;
        subtotalCell.textContent = `Q${subtotal.toFixed(2)}`;
      }
      
      // Actualizar totales
      updateCartTotals();
      showCartAlert('Cantidad actualizada');
    } else {
      // Restaurar valor anterior
      document.querySelector(`input[onchange*="${productId}"]`).value = item.quantity;
      showCartAlert('Ingrese una cantidad válida', 'error');
    }
  }
}
function updateItemSubtotal(productId, newQuantity) {
  const cart = getCart();
  const itemIndex = cart.findIndex(item => item.id.toString() === productId.toString());
  
  if (itemIndex === -1) return;

  const item = cart[itemIndex];
  const parsedQuantity = parseInt(newQuantity);

  // Validaciones
  if (isNaN(parsedQuantity) || parsedQuantity < 1) {
    document.querySelector(`input[data-product-id="${productId}"]`).value = item.quantity;
    showCartAlert('Cantidad no válida', 'error');
    return;
  }

  if (parsedQuantity > item.stockMax) {
    document.querySelector(`input[data-product-id="${productId}"]`).value = item.quantity;
    showCartAlert(`Stock máximo: ${item.stockMax}`, 'error');
    return;
  }

  // Actualizar cantidad
  item.quantity = parsedQuantity;
  saveCart(cart);

  // Calcular nuevo subtotal
  const newSubtotal = item.price * item.quantity;
  
  // Actualizar solo el subtotal de este item
  const row = document.querySelector(`input[data-product-id="${productId}"]`).closest('tr');
  if (row) {
    row.querySelector('.item-subtotal').textContent = `Q${newSubtotal.toFixed(2)}`;
  }

  // Recalcular el total general
  updateCartTotals();
  showCartAlert('Cantidad actualizada');
}

// Nueva función para actualizar solo los totales
function updateCartTotals() {
  const cart = getCart();
  let totalGeneral = 0;

  // Sumar todos los subtotales visibles
  document.querySelectorAll('.item-subtotal').forEach(subtotalElement => {
    const subtotalText = subtotalElement.textContent.replace('Q', '');
    totalGeneral += parseFloat(subtotalText);
  });

  // Actualizar totales generales
  const cartTotal = document.getElementById('cart-total');
  const cartFooterTotal = document.getElementById('cart-footer-total');
  
  if (cartTotal) cartTotal.textContent = totalGeneral.toFixed(2);
  if (cartFooterTotal) cartFooterTotal.textContent = totalGeneral.toFixed(2);
  
  updateCartCount();
}

function updateCheckoutSummary() {
    console.log("--- INICIO updateCheckoutSummary ---");
    const cart = getCart();
    console.log("Carrito en updateCheckoutSummary:", cart);

    const checkoutItems = document.getElementById('checkout-cart-items');
    const subtotalElement = document.getElementById('checkout-subtotal');
    const taxesElement = document.getElementById('taxes');
    const checkoutTotalElement = document.getElementById('checkout-total');
    const shippingElement = document.getElementById('shipping-cost'); // Asegúrate de tener este ID si lo usas

    console.log("Elementos HTML en updateCheckoutSummary:", {
        checkoutItems: !!checkoutItems, // True si existe, False si es null
        subtotalElement: !!subtotalElement,
        taxesElement: !!taxesElement,
        checkoutTotalElement: !!checkoutTotalElement,
        shippingElement: !!shippingElement
    });

    if (!checkoutItems) {
        console.error("ERROR: 'checkout-cart-items' no encontrado en el DOM.");
        return; // Detiene la ejecución si el elemento principal no está
    }

    checkoutItems.innerHTML = '';
    let subtotal = 0;

    cart.forEach(item => {
        const price = item.price || 0;
        const quantity = item.quantity || 1;
        const itemTotal = price * quantity;
        subtotal += itemTotal;
        // ... resto del forEach ...
        console.log(`Resumen Checkout: Añadiendo ${item.name} - Total Item: Q${itemTotal.toFixed(2)}`);
    });

    const shipping = 25.00;
    const taxes = subtotal * 0.12; // 12% IVA
    const total = subtotal + shipping + taxes;

    console.log("Valores calculados para Checkout:", {
        subtotal: subtotal.toFixed(2),
        taxes: taxes.toFixed(2),
        shipping: shipping.toFixed(2),
        total: total.toFixed(2)
    });

    // Actualiza los elementos, solo si existen
    if (subtotalElement) subtotalElement.textContent = subtotal.toFixed(2);
    if (taxesElement) taxesElement.textContent = taxes.toFixed(2);
    if (shippingElement) shippingElement.textContent = shipping.toFixed(2);
    if (checkoutTotalElement) checkoutTotalElement.textContent = total.toFixed(2);

    console.log("--- FIN updateCheckoutSummary ---");
}

// Función mejorada para eliminar productos del carrito
function removeFromCart(productId) {
  let cart = getCart();
  const initialCount = cart.length;
  
  // Filtrar el carrito para eliminar el producto
  cart = cart.filter(item => item.id.toString() !== productId.toString());
  
  if (cart.length < initialCount) {
    saveCart(cart);
    loadCart(); // Recargar la vista del carrito
    showCartAlert('Producto eliminado del carrito');
    updateCartCount();
    
    // Si el carrito queda vacío, ocultar la tabla
    if (cart.length === 0) {
      const contentProducts = document.getElementById('contentProducts');
      if (contentProducts) {
        contentProducts.innerHTML = '<tr><td colspan="6">Carrito vacío</td></tr>';
      }
    }
  } else {
    showCartAlert('No se encontró el producto en el carrito', 'error');
  }
}

// Actualizar contador
function updateCartCount() {
  const cart = getCart();
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);
  cartCount.textContent = count;
}

// Mostrar alertas
function showCartAlert(message, type = 'success') {
  const alert = document.createElement('div');
  alert.className = `cart-alert ${type}`;
  alert.textContent = message;
  document.body.appendChild(alert);
  
  setTimeout(() => {
    alert.classList.add('show');
    setTimeout(() => {
      alert.classList.remove('show');
      setTimeout(() => document.body.removeChild(alert), 300);
    }, 3000);
  }, 100);
}

// Exportar funciones
window.addToCart = addToCart;
window.toggleCart = toggleCart;
window.removeFromCart = removeFromCart;
window.updateQuantity = updateQuantity;
window.updateCartCount = updateCartCount;