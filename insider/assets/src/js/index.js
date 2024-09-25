class CollectionGrid extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.boxLoadingPage = document.querySelector('.loading-products');
    this.apiProducts = 'https://us-central1-insider-integrations.cloudfunctions.net/front-end-api-interviews/v1/products';
    this.getProducts();
  }

  async getProducts() {
    try {
      const response = await fetch(this.apiProducts, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Erro na requisição: ${response.status}`);
      }

      const data = await response.json();
      const products = data.data;

      if (products && products.length > 0) {
        products.forEach(product => {
          product.tag = product.sku.inventory < parseFloat(15) ? 'show' : 'visibility-hidden';
          product.price = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(product.sku.price);
          this.pagePopulate(product);
        });
      } else {
        console.error('Nenhum produto encontrado.');
      }
    } catch (error) {
      console.error('Erro ao buscar os dados:', error);
    } finally {
      setTimeout(() => {
        this.boxLoadingPage.classList.add("visibility-hidden")
        setTimeout(() => {
          this.boxLoadingPage.remove()
        }, 500);
      },500);
    }
  }

  pagePopulate(product) {
    this.innerHTML += `
      <product-module class="collection__product-module" role="listitem">
        <picture class="collection__product-module__picture js-product-image">
          <div class="tag js-tag ${product.tag}">últimas unidades</div>
          <img class="js-product-image-elem" src="${product.image_url}&width=317" width="317px" alt="${product.name}" data-image-full="${product.image_url}">
        </picture>
        <h4 class="collection__product-module__title js-product-title">${product.name}</h4>
        <p class="collection__product-module__price js-product-price">${product.price}</p>
        <button
          type="button"
          class="btn collection__product-module__button js-add-to-cart"
          data-id="${product.id}"
          data-sku="${product.sku.id}"
          data-name="${product.name}"
          data-price="${product.sku.price}"
          data-image="${product.image_url}"
        >comprar</button>
      </product-module>
    `;
  }
}
customElements.define("collection-grid", CollectionGrid);

class ProductModule extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.btnAddToCart = this.querySelector('.js-add-to-cart');
    this.productId = this.btnAddToCart.getAttribute('data-id');
    this.productSku = this.btnAddToCart.getAttribute('data-sku');
    this.productName = this.btnAddToCart.getAttribute('data-name');
    this.productImage = this.btnAddToCart.getAttribute('data-image');
    this.productPrice = parseFloat(this.btnAddToCart.getAttribute('data-price'));
    this.btnAddToCart.addEventListener("click", this.addToCart.bind(this));
  }

  addToCart() {
    const productItem = {
      id: this.productId,
      sku: this.productSku,
      name: this.productName,
      price: this.productPrice,
      image: this.productImage,
      quantity: 1
    };
    this.updateCart(productItem);
  }

  updateCart(productItem) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const existingProduct = cart.find(item => item.id === productItem.id);
    existingProduct ? existingProduct.quantity += 1 : cart.push(productItem);
    localStorage.setItem('cart', JSON.stringify(cart));
    this.updateCartUI(cart);
  }

  updateCartUI(cart) {
    const cartSide = document.querySelector('cart-side');
    const cartBubble = document.querySelector('.js-cart-bubble');

    if (cartSide) {
      const cartItemsElem = cartSide.querySelector('.js-cart-items');
      cartItemsElem.innerHTML = '';
      let total = 0;

      const giftProduct = {
        id: 'gift001',
        sku: 'brinde',
        name: 'Spectrum Socks Low 2.0',
        price: 0,
        image: 'https://www.insiderstore.com.br/cdn/shop/files/preto02.jpg?v=1698679291&width=84', // Coloque aqui a URL da imagem do brinde
        quantity: 1
      };  
  
      let brindeExists = cart.find(item => item.id === giftProduct.id);
      total = cart.reduce((sum, item) => item.id !== giftProduct.id ? sum + item.price * item.quantity : sum, 0);
      total >= 250 && !brindeExists ? cart.unshift(giftProduct) : total < 250 && brindeExists && (cart = cart.filter(item => item.id !== giftProduct.id));


      cart.forEach(item => {
        cartItemsElem.innerHTML += `
          <div class="cart-item" data-id="${item.id}" data-sku="${item.sku}">
            <button class="cart-item__rmv-all" data-id="${item.id}">remover</button>
            <picture class="cart-item__picture">
              <img src="${item.image}&width=82" width="82px" alt="Produto ${item.id}">
            </picture>
            <div class="cart-item__infos">
              <h4 class="cart-item__infos__name">${item.name}</h4>
              <p class="cart-item__infos__brinde visibility-hidden">brinde</p>
              <p class="cart-item__infos__price">${Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(item.price)}</p>
              <div class="cart-item__infos__quantity">
                <button class="cart-item__infos__quantity-rmv" data-id="${item.id}">
                  <svg width="6" height="2" viewBox="0 0 6 2" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M0.96 1.464V0.456H5.76V1.464H0.96Z"/>
                  </svg>
                </button>
                <span class="cart-item__infos__quantity-curr">${item.quantity}</span>
                <button class="cart-item__infos__quantity-add" data-id="${item.id}">
                  <svg width="9" height="8" viewBox="0 0 9 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M4.112 7.896V4.744H0.96V3.736H4.112V0.584H5.12V3.736H8.264V4.744H5.12V7.896H4.112Z"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        `;
      });

      cartBubble.textContent = cart.length;
      cartSide.cartFooterTotalElem.textContent = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(total);

      const cartEmptyElem = cartSide.querySelector(".js-cart-empty");
      const cartFooterElem = cartSide.querySelector(".js-cart-footer");
      if (cart.length === 0) {
        cartEmptyElem.classList.remove("visibility-hidden");
        cartFooterElem.classList.add("visibility-hidden");
        cartItemsElem.classList.add("visibility-hidden");
      } else {
        cartEmptyElem.classList.add("visibility-hidden");
        cartFooterElem.classList.remove("visibility-hidden");
        cartItemsElem.classList.remove("visibility-hidden");
      }

      this.attachCartListeners(cart);
    }
  }

  attachCartListeners(cart) {
    const cartSide = document.querySelector('cart-side');
    const quantityAddButtons = cartSide.querySelectorAll('.cart-item__infos__quantity-add');
    const quantityRemoveButtons = cartSide.querySelectorAll('.cart-item__infos__quantity-rmv');
    const removeButtons = cartSide.querySelectorAll('.cart-item__rmv-all');

    quantityAddButtons.forEach(button => {
      button.addEventListener('click', () => {
        const itemId = button.dataset.id;
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        const item = cart.find(item => item.id === itemId);

        if (item) {
          item.quantity += 1;
          localStorage.setItem('cart', JSON.stringify(cart));
          this.updateCartUI(cart);
        }
      });
    });

    quantityRemoveButtons.forEach(button => {
      button.addEventListener('click', () => {
        const itemId = button.dataset.id;
        let cart = JSON.parse(localStorage.getItem('cart')) || [];
        const item = cart.find(item => item.id === itemId);

        if (item) {
          if (item.quantity > 1) {
            item.quantity -= 1;
          } else {
            cart = cart.filter(item => item.id !== itemId);
          }
          localStorage.setItem('cart', JSON.stringify(cart));
          this.updateCartUI(cart);
        }
      });
    });

    removeButtons.forEach(button => {
      button.addEventListener('click', () => {
        const itemId = button.dataset.id;
        let cart = JSON.parse(localStorage.getItem('cart')) || [];
        cart = cart.filter(item => item.id !== itemId);
        localStorage.setItem('cart', JSON.stringify(cart));
        this.updateCartUI(cart);
      });
    });
  }
}
customElements.define('product-module', ProductModule);

class CartSide extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.apiCarts = 'https://us-central1-insider-integrations.cloudfunctions.net/front-end-api-interviews/v1/carts';
    this.cartContentElem = this.querySelector(".js-cart-content")
    this.cartItemsElem = this.cartContentElem.querySelector(".js-cart-items");
    this.cartEmptyElem =  this.cartContentElem.querySelector(".js-cart-empty");
    this.cartFooterElem = this.cartContentElem.querySelector(".js-cart-footer");
    this.cartFooterTotalElem = this.cartFooterElem.querySelector(".js-cart-total");
    this.cartFooterBtnElem = this.cartFooterElem.querySelector(".js-cart-btn");
    this.cartFooterBtnElem.addEventListener('click', this.finalizePurchase.bind(this));

    this.headerCloseCartBtn = this.querySelector(".js-cart-close");
    this.headerCloseCartBtn.addEventListener('click', () => {
      this.classList.remove("cart-opened");
      document.body.classList.remove("no-scroll");
    });

    const openCartBtn = document.querySelector(".js-open-cart")
    openCartBtn.addEventListener('click', () => {
      this.classList.add("cart-opened")
      document.body.classList.add("no-scroll");
    });
    
    this.render();
  }

  render() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
  
    if (cart.length === 0) {
      this.cartEmptyElem.classList.remove("visibility-hidden");
      this.cartFooterElem.classList.add("visibility-hidden");
      this.cartItemsElem.classList.add("visibility-hidden");
    } else {
      this.cartEmptyElem.classList.add("visibility-hidden");
      this.cartFooterElem.classList.remove("visibility-hidden");
      this.cartItemsElem.classList.remove("visibility-hidden");
      this.updateCartUI(cart);
    }
  }

  updateCartUI(cart) {
    const cartBubble = document.querySelector(".js-cart-bubble");
    this.cartItemsElem.innerHTML = '';
    let total = 0;

    const giftProduct = {
      id: 'gift001',
      sku: 'brinde',
      name: 'Spectrum Socks Low 2.0',
      price: 0,
      image: 'https://www.insiderstore.com.br/cdn/shop/files/preto02.jpg?v=1698679291&width=84', // Coloque aqui a URL da imagem do brinde
      quantity: 1
    };

    let brindeExists = cart.find(item => item.id === giftProduct.id);
    total = cart.reduce((sum, item) => item.id !== giftProduct.id ? sum + item.price * item.quantity : sum, 0);
    total >= 250 && !brindeExists ? cart.unshift(giftProduct) : total < 250 && brindeExists && (cart = cart.filter(item => item.id !== giftProduct.id));

    cart.forEach(item => {
      this.cartItemsElem.innerHTML += `
        <div class="cart-item" data-id="${item.id}" data-sku="${item.sku}">
          <button class="cart-item__rmv-all" data-id="${item.id}">remover</button>
          <picture class="cart-item__picture">
            <img src="${item.image}&width=82" width="82px" alt="Produto ${item.id}">
          </picture>
          <div class="cart-item__infos">
            <h4 class="cart-item__infos__name">${item.name}</h4>
            <p class="cart-item__infos__brinde visibility-hidden">brinde</p>
            <p class="cart-item__infos__price">${Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(item.price)}</p>
            <div class="cart-item__infos__quantity">
              <button class="cart-item__infos__quantity-rmv" data-id="${item.id}">
                <svg width="6" height="2" viewBox="0 0 6 2" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M0.96 1.464V0.456H5.76V1.464H0.96Z"/>
                </svg>
              </button>
              <span class="cart-item__infos__quantity-curr">${item.quantity}</span>
              <button class="cart-item__infos__quantity-add" data-id="${item.id}">
                <svg width="9" height="8" viewBox="0 0 9 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M4.112 7.896V4.744H0.96V3.736H4.112V0.584H5.12V3.736H8.264V4.744H5.12V7.896H4.112Z"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      `;
    });

    cartBubble.textContent = cart.length;
    this.cartFooterTotalElem.textContent = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(total);
    this.attachCartListeners(cart);
  }

  attachCartListeners(cart) {
    const quantityAddButtons = this.cartItemsElem.querySelectorAll('.cart-item__infos__quantity-add');
    const quantityRemoveButtons = this.cartItemsElem.querySelectorAll('.cart-item__infos__quantity-rmv');
    const removeButtons = this.cartItemsElem.querySelectorAll('.cart-item__rmv-all');

    quantityAddButtons.forEach(button => {
      button.addEventListener('click', () => {
        const itemId = button.dataset.id;
        const item = cart.find(item => item.id === itemId);

        if (item) {
          item.quantity += 1;
          localStorage.setItem('cart', JSON.stringify(cart));
          this.updateCartUI(cart);
        }
      });
    });

    quantityRemoveButtons.forEach(button => {
      button.addEventListener('click', () => {
        const itemId = button.dataset.id;
        const item = cart.find(item => item.id === itemId);

        if (item) {
          if (item.quantity > 1) {
            item.quantity -= 1;
          } else {
            cart = cart.filter(item => item.id !== itemId);
          }
          localStorage.setItem('cart', JSON.stringify(cart));
          this.updateCartUI(cart);
        }
      });
    });

    removeButtons.forEach(button => {
      button.addEventListener('click', () => {
        const itemId = button.dataset.id;
        cart = cart.filter(item => item.id !== itemId);
        localStorage.setItem('cart', JSON.stringify(cart));
        this.updateCartUI(cart);
      });
    });
  }
  
  finalizePurchase() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    // console.log(cart)
    if (cart.length === 0) { return; }

    const cartData = {
      products: cart.map(item => ({
        product: item.id,
        sku: item.sku,
        quantity: item.quantity,
      })),
    };

    console.log(this.apiCarts)

    fetch(this.apiCarts, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(cartData),
    })
      .then(response => {
        if (!response.ok) {
          throw new Error(`Erro ao finalizar compra: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        document.querySelector('.js-modal-order-success').classList.remove("visibility-hidden")
        localStorage.removeItem('cart');
      })
      .catch(error => {
        document.querySelector('.js-modal-order-error').classList.remove("visibility-hidden")
      });
  }
}
customElements.define('cart-side', CartSide);

const closeModalButtons = document.querySelectorAll('.js-close-modal');
closeModalButtons.forEach(function(button) {
  button.addEventListener('click', function() {
    document.querySelectorAll('.modal-alert').forEach(function(modal) {
      window.location.reload(true);
    });
  });
});

document.addEventListener('DOMContentLoaded', () => {
  const cartSide = document.querySelector('cart-side');
  if (cartSide) {
    cartSide.render();
  }
});