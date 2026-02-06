// Sample compost data from buildings
const compostData = [
    {
        id: 1,
        buildingName: "Green Valley Apartments",
        buildingType: "Residential Complex",
        quality: "Premium",
        qualityClass: "quality-premium",
        pricePerKg: 45,
        icon: "🏢",
        description: "High-quality compost from organic kitchen waste"
    },
    {
        id: 2,
        buildingName: "Eco Corporate Tower",
        buildingType: "Commercial Building",
        quality: "High",
        qualityClass: "quality-high",
        pricePerKg: 38,
        icon: "🏗️",
        description: "Office garden waste compost"
    },
    {
        id: 3,
        buildingName: "Sunshine Residency",
        buildingType: "Apartment Complex",
        quality: "Medium",
        qualityClass: "quality-medium",
        pricePerKg: 32,
        icon: "🏠",
        description: "Mixed organic waste compost"
    },
    {
        id: 4,
        buildingName: "Tech Park Plaza",
        buildingType: "IT Campus",
        quality: "Premium",
        qualityClass: "quality-premium",
        pricePerKg: 50,
        icon: "🌳",
        description: "Landscaping waste compost with high nutrients"
    },
    {
        id: 5,
        buildingName: "Harmony Heights",
        buildingType: "Residential Society",
        quality: "High",
        qualityClass: "quality-high",
        pricePerKg: 40,
        icon: "🏡",
        description: "Garden and kitchen waste blend"
    },
    {
        id: 6,
        buildingName: "Metro Mall Complex",
        buildingType: "Shopping Center",
        quality: "Medium",
        qualityClass: "quality-medium",
        pricePerKg: 28,
        icon: "🏬",
        description: "Food court and landscape waste compost"
    }
];

// Cart state
let cart = [];

// DOM Elements
const productsGrid = document.getElementById('productsGrid');
const cartSidebar = document.getElementById('cartSidebar');
const cartOverlay = document.getElementById('cartOverlay');
const cartItems = document.getElementById('cartItems');
const cartTotal = document.getElementById('cartTotal');
const cartCount = document.querySelector('.cart-count');
const closeCartBtn = document.getElementById('closeCart');
const cartIcon = document.querySelector('.cart-icon');
const checkoutBtn = document.getElementById('checkoutBtn');

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    renderProducts();
    setupEventListeners();
});

// Render products
function renderProducts() {
    productsGrid.innerHTML = compostData.map(product => `
        <div class="product-card" data-id="${product.id}">
            <div class="product-image">
                ${product.icon}
            </div>
            <div class="product-info">
                <h3 class="building-name">${product.buildingName}</h3>
                <p class="building-type">${product.buildingType}</p>
                <div class="quality-badge ${product.qualityClass}">
                    <i class="fas fa-star"></i>
                    ${product.quality} Quality
                </div>
                <div class="price-section">
                    <span class="price">₹${product.pricePerKg}</span>
                    <span class="per-kg">/kg</span>
                </div>
                <div class="quantity-section">
                    <label>Quantity (kg):</label>
                    <div class="quantity-input-wrapper">
                        <button class="quantity-btn minus" data-id="${product.id}">-</button>
                        <input type="number" class="quantity-input" id="qty-${product.id}" value="1" min="1" max="1000">
                        <button class="quantity-btn plus" data-id="${product.id}">+</button>
                    </div>
                </div>
                <button class="add-to-cart-btn" data-id="${product.id}">
                    <i class="fas fa-shopping-cart"></i>
                    Add to Cart
                </button>
            </div>
        </div>
    `).join('');

    // Add event listeners to quantity buttons and add to cart buttons
    setupProductEventListeners();
}

// Setup product event listeners
function setupProductEventListeners() {
    // Quantity buttons
    document.querySelectorAll('.quantity-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = parseInt(e.target.dataset.id);
            const input = document.getElementById(`qty-${id}`);
            let value = parseInt(input.value);
            
            if (e.target.classList.contains('minus')) {
                if (value > 1) input.value = value - 1;
            } else if (e.target.classList.contains('plus')) {
                if (value < 1000) input.value = value + 1;
            }
        });
    });

    // Add to cart buttons
    document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = parseInt(e.currentTarget.dataset.id);
            const quantity = parseInt(document.getElementById(`qty-${id}`).value);
            addToCart(id, quantity);
        });
    });

    // Quantity input validation
    document.querySelectorAll('.quantity-input').forEach(input => {
        input.addEventListener('change', (e) => {
            let value = parseInt(e.target.value);
            if (value < 1) e.target.value = 1;
            if (value > 1000) e.target.value = 1000;
        });
    });
}

// Setup general event listeners
function setupEventListeners() {
    // Cart icon click
    cartIcon.addEventListener('click', openCart);
    
    // Close cart button
    closeCartBtn.addEventListener('click', closeCart);
    
    // Cart overlay click
    cartOverlay.addEventListener('click', closeCart);
    
    // Checkout button
    checkoutBtn.addEventListener('click', () => {
        if (cart.length > 0) {
            alert(`Thank you for your order! Total: ₹${calculateTotal().toFixed(2)}\n\nThis is a demo. In production, this would redirect to payment gateway.`);
            cart = [];
            updateCartUI();
            closeCart();
        } else {
            alert('Your cart is empty!');
        }
    });

    // Smooth scroll for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Add item to cart
function addToCart(id, quantity) {
    const product = compostData.find(p => p.id === id);
    const existingItem = cart.find(item => item.id === id);
    
    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.push({
            id: product.id,
            name: product.buildingName,
            price: product.pricePerKg,
            quantity: quantity,
            icon: product.icon
        });
    }
    
    updateCartUI();
    openCart();
    
    // Show success animation
    showNotification(`${quantity}kg of ${product.buildingName} compost added to cart!`);
}

// Remove item from cart
function removeFromCart(id) {
    cart = cart.filter(item => item.id !== id);
    updateCartUI();
}

// Update cart item quantity
function updateCartItemQuantity(id, newQuantity) {
    const item = cart.find(item => item.id === id);
    if (item) {
        if (newQuantity < 1) {
            removeFromCart(id);
        } else {
            item.quantity = newQuantity;
            updateCartUI();
        }
    }
}

// Calculate total
function calculateTotal() {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
}

// Update cart UI
function updateCartUI() {
    // Update cart count
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;
    
    // Update cart items display
    if (cart.length === 0) {
        cartItems.innerHTML = `
            <div class="empty-cart">
                <i class="fas fa-shopping-basket"></i>
                <p>Your cart is empty</p>
                <p style="font-size: 0.9rem; margin-top: 10px;">Add some compost to get started!</p>
            </div>
        `;
    } else {
        cartItems.innerHTML = cart.map(item => `
            <div class="cart-item">
                <div class="cart-item-image">${item.icon}</div>
                <div class="cart-item-details">
                    <div class="cart-item-name">${item.name}</div>
                    <div class="cart-item-price">₹${item.price}/kg</div>
                    <div class="cart-item-quantity">
                        <div class="quantity-input-wrapper" style="margin-top: 10px;">
                            <button class="quantity-btn minus" onclick="updateCartItemQuantity(${item.id}, ${item.quantity - 1})">-</button>
                            <input type="number" class="quantity-input" value="${item.quantity}" 
                                onchange="updateCartItemQuantity(${item.id}, parseInt(this.value))" 
                                style="width: 60px; height: 35px;">
                            <button class="quantity-btn plus" onclick="updateCartItemQuantity(${item.id}, ${item.quantity + 1})">+</button>
                        </div>
                    </div>
                </div>
                <button class="remove-item" onclick="removeFromCart(${item.id})" title="Remove item">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `).join('');
    }
    
    // Update total
    cartTotal.textContent = `₹${calculateTotal().toFixed(2)}`;
}

// Open cart sidebar
function openCart() {
    cartSidebar.classList.add('open');
    cartOverlay.classList.add('open');
    document.body.style.overflow = 'hidden';
}

// Close cart sidebar
function closeCart() {
    cartSidebar.classList.remove('open');
    cartOverlay.classList.remove('open');
    document.body.style.overflow = '';
}

// Show notification
function showNotification(message) {
    // Create notification element
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        bottom: 30px;
        right: 30px;
        background: var(--primary-color);
        color: white;
        padding: 15px 25px;
        border-radius: 10px;
        box-shadow: 0 5px 20px rgba(0,0,0,0.2);
        z-index: 3000;
        font-weight: 500;
        animation: slideIn 0.3s ease;
    `;
    notification.textContent = message;
    
    // Add animation styles
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(400px);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideIn 0.3s ease reverse';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// Make functions globally accessible for inline onclick handlers
window.updateCartItemQuantity = updateCartItemQuantity;
window.removeFromCart = removeFromCart;
