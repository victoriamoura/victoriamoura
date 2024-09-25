import {
  cartRecovery,
  collectionRecovery,
  toggleCartVisibility,
  handleItemOnCart,
  cartDeleteAPI,
  deleteAllCartsAPI
} from '../../src/js/cartUtils.js';

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
customElements.define("collection-grid", CollectionGrid);

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

    // Cria o objeto do produto
    const newProduct = {
      product: this.productId,
      sku: this.productSku,
      name: this.productName,
      image: this.productImage,
      price: this.productPrice,
      quantity: 1
    };

    // Passa a função como uma referência, não executando-a imediatamente
    if (this.btnAddToCart) {
      this.btnAddToCart.addEventListener("click", () => {
        this.btnAddToCart.querySelector(".loading-spinner").classList.remove("visibility-hidden")
        handleItemOnCart(newProduct, 'add')
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
customElements.define('product-module', ProductModule);


document.addEventListener('DOMContentLoaded', () => {
  const closeModalButtons = document.querySelectorAll('.js-close-modal');
  closeModalButtons.forEach(function(button) {
    button.addEventListener('click', function() {
      document.querySelectorAll('.modal-alert').forEach(function(modal) {
        window.location.reload(true);
      });
    });
  });
  
  const cartElem = document.querySelector(".js-cart")
  const cartOpenBtn = document.querySelector(".js-cart-open")
  const cart = JSON.parse(localStorage.getItem('cart'));
  const cartID = localStorage.getItem('cartID');
  const cartCloseBtn = document.querySelector(".js-cart-close");
  const modalSuccess = document.querySelector(".js-modal-order-success");
  const modalError = document.querySelector(".js-modal-order-error");
  const checkoutBtn = document.querySelector(".js-cart-btn");
  const isCartEmpty = !cartID || cartID.length === 0 || !cart || typeof cart !== 'object' || (Array.isArray(cart) && cart.length === 0);

  cartOpenBtn.addEventListener('click', () => {
    cartElem.classList.add("cart-opened")
    document.body.classList.add("no-scroll");
  });
  
  cartCloseBtn.addEventListener('click', () => {
    cartElem.classList.remove("cart-opened")
    document.body.classList.add("no-scroll");
  });


  toggleCartVisibility(isCartEmpty);
  if (!isCartEmpty) {
    cartRecovery(cartID);
    
    checkoutBtn.addEventListener('click', async () => {
      console.log(cart, cartID);
      const spinner = checkoutBtn.querySelector(".loading-spinner");
      console.log(spinner)
      spinner.classList.remove("visibility-hidden");
      const deleteSuccess = await cartDeleteAPI(cartID);
    
      if (deleteSuccess) {
        modalSuccess.classList.remove("visibility-hidden");
        localStorage.clear();
      } else {
        console.error('Erro ao finalizar a compra. Não foi possível deletar o carrinho.');
        modalError.classList.remove("visibility-hidden")
      }
    });
  }
});
