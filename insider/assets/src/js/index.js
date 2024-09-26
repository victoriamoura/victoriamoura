import {
  cartRecovery,
  collectionRecovery,
  toggleCartVisibility,
  handleItemOnCart,
  cartDeleteAPI,
  deleteAllCartsAPI
} from './cartUtils.min.js';

// Hack para deletar todos os carrinhos e reiniciar testes;
// Descomente e salve para limpar;
// deleteAllCartsAPI()

class CollectionGrid extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.boxLoadingPage = document.querySelector('.loading-products');
    collectionRecovery(this.boxLoadingPage);
  }
}

if (!customElements.get('collection-grid')) {
  customElements.define('collection-grid', CollectionGrid);
}

class ProductModule extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.btnAddToCart = this.querySelector('.js-add-to-cart');
    this.btnAddUnit = this.querySelector('.js-add-qty-cart');
    this.btnRmvUnit = this.querySelector('.js-rmv-qty-cart');
    this.btnRmvAll = this.querySelector('.js-rmv-all-cart');
    this.productId = this.getAttribute('data-product');
    this.productSku = this.getAttribute('data-sku');
    this.productName = this.getAttribute('data-name');
    this.productImage = this.getAttribute('data-image');
    this.productPrice = parseFloat(this.getAttribute('data-price'));
    const cartElem = document.querySelector(".js-cart")

    const newProduct = {
      product: this.productId,
      sku: this.productSku,
      name: this.productName,
      image: this.productImage,
      price: this.productPrice,
      quantity: 1
    };

    if (this.btnAddToCart) {
      this.btnAddToCart.addEventListener("click", () => {
        this.btnAddToCart.querySelector(".loading-spinner").classList.remove("visibility-hidden")
        handleItemOnCart(newProduct, 'add');
        cartElem.classList.add("cart-opened");
      });
    }

    if (this.btnAddUnit) {
      this.btnAddUnit.addEventListener("click", () => {
        const parentElement = this.btnAddUnit.closest('.js-cart-item-infos');
        const spinner = parentElement.querySelector('.loading-spinner');
        spinner.classList.remove("visibility-hidden");
        handleItemOnCart(newProduct, 'add');
      });
    }

    if (this.btnRmvUnit) {
      this.btnRmvUnit.addEventListener("click", () => {
        const parentElement = this.btnRmvUnit.closest('.js-cart-item-infos');
        const spinner = parentElement.querySelector('.loading-spinner');
        spinner.classList.remove("visibility-hidden");
        handleItemOnCart(newProduct, 'remove')
      });
    }

    if (this.btnRmvAll) {
      this.btnRmvAll.addEventListener("click", () => {
        const parentElement = this.btnRmvAll.closest('.js-cart-item-infos');
        const spinner = parentElement.querySelector('.loading-spinner');
        spinner.classList.remove("visibility-hidden");
        handleItemOnCart(newProduct, 'removeAll');
      });
    }
  }
}

if (!customElements.get('product-module')) {
  customElements.define('product-module', ProductModule);
}

document.addEventListener('DOMContentLoaded', () => {
  const closeModalButtons = document.querySelectorAll('.js-close-modal');  
  const cartElem = document.querySelector(".js-cart")
  const cartOpenBtn = document.querySelector(".js-cart-open")
  const cart = JSON.parse(localStorage.getItem('cart'));
  const cartID = localStorage.getItem('cartID');
  const cartCloseBtn = document.querySelector(".js-cart-close");
  const checkoutBtn = document.querySelector(".js-cart-btn");
  const isCartEmpty = !cartID || cartID.length === 0 || !cart || typeof cart !== 'object' || (Array.isArray(cart) && cart.length === 0);
  
  closeModalButtons.forEach(function(button) {
    button.addEventListener('click', function() {
      document.querySelectorAll('.modal-alert').forEach(function(modal) {
        window.location.reload(true);
      });
    });
  });

  cartOpenBtn.addEventListener('click', () => {
    cartElem.classList.add("cart-opened")
  });
  
  cartCloseBtn.addEventListener('click', () => {
    cartElem.classList.remove("cart-opened")
  });

  checkoutBtn.addEventListener('click', async () => {
    const spinner = checkoutBtn.querySelector(".loading-spinner");
    spinner.classList.remove("visibility-hidden");
    let cartID = localStorage.getItem('cartID');
    cartDeleteAPI(cartID);
  });

  toggleCartVisibility(isCartEmpty);
  if (!isCartEmpty) {
    cartRecovery(cartID);
  }
});