// FUNCIONES FALTANTES PARA EL CHECKOUT - Agregar a tu archivo

// 1. FUNCIÓN PARA CREAR EL MODAL DE CHECKOUT
function createCheckoutModal() {
    const modal = document.createElement('div');
    modal.id = 'checkout-overlay';
    modal.className = 'checkout-overlay hidden';
    
    modal.innerHTML = `
        <!-- Añade esto en tu HTML (normalmente al final del body) -->
<div id="checkout-overlay" class="checkout-overlay">
  <div id="checkout-modal" class="checkout-modal" tabindex="-1" hidden>
    <button id="checkout-close" class="checkout-close" aria-label="Cerrar checkout">
      <i class="fas fa-times"></i>
    </button>
    
    <div class="checkout-header">
      <h2>Finalizar Compra</h2>
    </div>
    
    <div class="checkout-content">
      <form id="checkout-form" class="checkout-form">
        <!-- Sección de información del cliente -->
        <div class="checkout-section">
          <h3>Información de contacto</h3>
          <div class="form-group">
            <label for="checkout-email">Correo electrónico</label>
            <input type="email" id="checkout-email" required>
          </div>
        </div>
        
        <!-- Sección de envío -->
        <div class="checkout-section">
          <h3>Dirección de envío</h3>
          <div class="form-row">
            <div class="form-group">
              <label for="checkout-first-name">Nombre</label>
              <input type="text" id="checkout-first-name" required>
            </div>
            <div class="form-group">
              <label for="checkout-last-name">Apellido</label>
              <input type="text" id="checkout-last-name" required>
            </div>
          </div>
          
          <div class="form-group">
            <label for="checkout-address">Dirección</label>
            <input type="text" id="checkout-address" required>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label for="checkout-city">Ciudad</label>
              <input type="text" id="checkout-city" required>
            </div>
            <div class="form-group">
              <label for="checkout-zip">Código postal</label>
              <input type="text" id="checkout-zip" required>
            </div>
          </div>
          
          <div class="form-group">
            <label for="checkout-country">País</label>
            <select id="checkout-country" required>
              <option value="">Seleccionar...</option>
              <option value="ES">España</option>
              <!-- Más opciones de países -->
            </select>
          </div>
          
          <div class="form-group">
            <label for="checkout-phone">Teléfono</label>
            <input type="tel" id="checkout-phone" required>
          </div>
        </div>
        
        <!-- Sección de pago -->
        <div class="checkout-section">
          <h3>Método de pago</h3>
          <div class="payment-methods">
            <div class="payment-method">
              <input type="radio" id="payment-card" name="payment" value="card" checked>
              <label for="payment-card">Tarjeta de crédito/débito</label>
            </div>
            <div class="payment-method">
              <input type="radio" id="payment-paypal" name="payment" value="paypal">
              <label for="payment-paypal">PayPal</label>
            </div>
          </div>
          
          <div id="card-details" class="card-details">
            <div class="form-group">
              <label for="card-number">Número de tarjeta</label>
              <input type="text" id="card-number" placeholder="1234 5678 9012 3456">
            </div>
            
            <div class="form-row">
              <div class="form-group">
                <label for="card-expiry">Fecha de expiración</label>
                <input type="text" id="card-expiry" placeholder="MM/AA">
              </div>
              <div class="form-group">
                <label for="card-cvc">CVC</label>
                <input type="text" id="card-cvc" placeholder="123">
              </div>
            </div>
            
            <div class="form-group">
              <label for="card-name">Nombre en la tarjeta</label>
              <input type="text" id="card-name">
            </div>
          </div>
        </div>
        
        <!-- Resumen del pedido -->
        <div class="checkout-summary">
          <h3>Resumen del pedido</h3>
          <div class="summary-items">
            <!-- Los ítems se añadirán dinámicamente -->
          </div>
          <div class="summary-totals">
            <div class="summary-row">
              <span>Subtotal</span>
              <span id="checkout-subtotal">€0.00</span>
            </div>
            <div class="summary-row">
              <span>Envío</span>
              <span id="checkout-shipping">€0.00</span>
            </div>
            <div class="summary-row total">
              <span>Total</span>
              <span id="checkout-total">€0.00</span>
            </div>
          </div>
        </div>
        
        <div class="checkout-actions">
          <button type="button" class="btn btn-secondary" id="checkout-back">Volver al carrito</button>
          <button type="submit" class="btn btn-primary" id="checkout-submit">Completar pedido</button>
        </div>
      </form>
    </div>
  </div>
</div>
    `;
    
    document.body.appendChild(modal);
    
    // Actualizar referencias DOM
    domElements.checkoutOverlay = modal;
    domElements.checkoutModal = modal.querySelector('#checkout-modal');
    
    // Event listener para cerrar
    const closeBtn = modal.querySelector('#checkout-close');
    closeBtn.addEventListener('click', closeCheckout);
    
    // Cerrar al hacer clic fuera del modal
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeCheckout();
        }
    });
}

// 2. FUNCIÓN PARA ACTUALIZAR ITEMS DEL CHECKOUT
function updateCheckoutItems() {
    const summaryItems = document.getElementById('summary-items');
    if (!summaryItems) return;
    
    summaryItems.innerHTML = '';
    
    orderData.items.forEach(item => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'summary-item';
        itemDiv.innerHTML = `
            <div class="item-info">
                <img src="${item.image}" alt="${item.name}" style="width: 40px; height: 40px; object-fit: cover;">
                <div class="item-details">
                    <span class="item-name">${item.name}</span>
                    <span class="item-quantity">Cantidad: ${item.quantity}</span>
                </div>
            </div>
            <div class="item-price">Q${(item.price * item.quantity).toFixed(2)}</div>
        `;
        summaryItems.appendChild(itemDiv);
    });
}

// 3. FUNCIÓN PARA FORMATEAR MONEDA
function formatCurrency(amount) {
    return `Q${amount.toFixed(2)}`;
}

// 4. FUNCIÓN PARA SELECCIONAR MÉTODO DE PAGO
function selectPaymentMethod(method) {
    selectedPaymentMethod = method;
    
    // Actualizar radio buttons
    const radioButtons = document.querySelectorAll('input[name="payment"]');
    radioButtons.forEach(radio => {
        radio.checked = radio.value === method;
    });
    
    // Mostrar/ocultar detalles de tarjeta
    const cardDetails = document.getElementById('card-details');
    if (cardDetails) {
        cardDetails.style.display = method === 'card' ? 'block' : 'none';
    }
}

// 5. FUNCIONES DE VALIDACIÓN
function validateCustomerInfo() {
    const email = document.getElementById('checkout-email')?.value;
    const firstName = document.getElementById('checkout-first-name')?.value;
    const lastName = document.getElementById('checkout-last-name')?.value;
    const address = document.getElementById('checkout-address')?.value;
    const city = document.getElementById('checkout-city')?.value;
    const zip = document.getElementById('checkout-zip')?.value;
    const phone = document.getElementById('checkout-phone')?.value;
    
    if (!email || !firstName || !lastName || !address || !city || !zip || !phone) {
        return false;
    }
    
    if (!validateEmail(email)) {
        showAlert('Por favor ingresa un email válido', 'error');
        return false;
    }
    
    return true;
}

function validatePaymentInfo() {
    if (selectedPaymentMethod === 'card') {
        const cardNumber = document.getElementById('card-number')?.value;
        const cardExpiry = document.getElementById('card-expiry')?.value;
        const cardCvc = document.getElementById('card-cvc')?.value;
        const cardName = document.getElementById('card-name')?.value;
        
        if (!cardNumber || !cardExpiry || !cardCvc || !cardName) {
            showAlert('Por favor completa todos los datos de la tarjeta', 'error');
            return false;
        }
    }
    
    return true;
}

// 6. FUNCIONES DE CONFIGURACIÓN
function setupFormValidation() {
    // Validación en tiempo real si es necesario
    const inputs = document.querySelectorAll('#checkout-form input');
    inputs.forEach(input => {
        input.addEventListener('blur', function() {
            if (this.hasAttribute('required') && !this.value) {
                this.style.borderColor = '#dc2626';
            } else {
                this.style.borderColor = '';
            }
        });
    });
}

function setupCardFormatting() {
    const cardNumberInput = document.getElementById('card-number');
    const cardExpiryInput = document.getElementById('card-expiry');
    
    if (cardNumberInput) {
        cardNumberInput.addEventListener('input', function() {
            let value = this.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
            let formattedValue = value.match(/.{1,4}/g)?.join(' ') || value;
            if (formattedValue.length > 19) formattedValue = formattedValue.substr(0, 19);
            this.value = formattedValue;
        });
    }
    
    if (cardExpiryInput) {
        cardExpiryInput.addEventListener('input', function() {
            let value = this.value.replace(/\D/g, '');
            if (value.length >= 2) {
                value = value.substring(0, 2) + '/' + value.substring(2, 4);
            }
            this.value = value;
        });
    }
}

function generateOrderNumber() {
    const orderNumber = 'ORD-' + Date.now();
    orderData.orderNumber = orderNumber;
}

function descontarStock(productosComprados) {
  const productos = JSON.parse(localStorage.getItem('productos')) || [];

  productosComprados.forEach(item => {
    const producto = productos.find(p => p.id === item.id);
    if (producto) {
      producto.stockActual -= item.quantity;
      if (producto.stockActual < 0) producto.stockActual = 0;
    }
  });

  localStorage.setItem('productos', JSON.stringify(productos));
}
// 7. MODAL DE ÉXITO
