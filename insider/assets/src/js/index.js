const apiCarts = 'https://us-central1-insider-integrations.cloudfunctions.net/front-end-api-interviews/v1/carts';


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
          product.tag = product.sku.inventory < parseFloat(15) ? 'show' : 'hidden';
          this.pagePopulate(product);
        });
      } else {
        console.error('Nenhum produto encontrado.');
      }
    } catch (error) {
      console.error('Erro ao buscar os dados:', error);
    } finally {
      setTimeout(() => {
        this.boxLoadingPage.classList.add("hidden")
        setTimeout(() => {
          this.boxLoadingPage.remove()
        }, 1000);
      }, 2000);
    }
  }

  pagePopulate(product) {
    const elemCollection = document.querySelector(".js-collection");
    if (!elemCollection) { return; }
    const priceFormatted = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(product.sku.price);

    elemCollection.innerHTML += `
      <product-module class="collection__product-module">
        <picture class="collection__product-module__picture js-product-image">
          <div class="tag js-tag ${product.tag}">últimas unidades</div>
          <img class="js-product-image-elem" src="${product.image_url}" alt="${product.name}" data-image-full="${product.image_url}">
        </picture>
        <p class="collection__product-module__title js-product-title">${product.name}</p>
        <p class="collection__product-module__price js-product-price">${priceFormatted}</p>
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
    this.init();
  }

  init() {
    this.btnAddToCart.addEventListener("click", this.addToCart.bind(this));
  }

  addToCart() {
    const productId = this.btnAddToCart.getAttribute('data-id');
    const productSku = this.btnAddToCart.getAttribute('data-sku');
    const productName = this.btnAddToCart.getAttribute('data-name');
    const productPrice = parseFloat(this.btnAddToCart.getAttribute('data-price'));
    const productImage = this.btnAddToCart.getAttribute('data-image');

    const productItem = {
      id: productId,
      sku: productSku,
      name: productName,
      price: productPrice,
      image: productImage,
      quantity: 1
    };

    this.updateCart(productItem);
  }

  updateCart(productItem) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];

    const existingProduct = cart.find(item => item.id === productItem.id);

    if (existingProduct) {
      existingProduct.quantity += 1;
    } else {
      cart.push(productItem);
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    this.updateCartUI(cart);
  }

  updateCartUI(cart) {
    const cartSide = document.querySelector('cart-side');

    if (cartSide) {
      const cartItemsContainer = cartSide.querySelector('.js-cart-items');
      cartItemsContainer.innerHTML = '';
      let total = 0;

      cart.forEach(item => {
        cartItemsContainer.innerHTML += `
          <div class="cart-item" data-id="${item.id}">
            <button class="cart-item__rmv-all" data-id="${item.id}">remover</button>
            <picture class="cart-item__picture">
              <img src="${item.image}" alt="Produto ${item.id}">
            </picture>
            <div class="cart-item__infos">
              <p class="cart-item__infos__name">${item.name}</p>
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
        total += item.price * item.quantity;
      });

      cartSide.footerTotal.textContent = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(total);

      const emptyCartMessage = cartSide.querySelector("#cart-empty");
      if (cart.length === 0) {
        emptyCartMessage.removeAttribute("hidden");
        cartSide.footer.hidden = true;
      } else {
        emptyCartMessage.setAttribute("hidden", "true");
        cartSide.footer.hidden = false;
      }

      this.attachCartListeners(cart);
    }
  }

  finalizePurchase() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    if (cart.length === 0) { return; }

    const cartData = {
      products: cart.map(item => ({
        product: item.id,
        sku: item.sku,
        quantity: item.quantity,
      })),
    };

    fetch(apiCarts, {
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
        document.querySelector('.js-modal-order-success').style.display = 'flex';
        localStorage.removeItem('cart');
      })
      .catch(error => {
        document.querySelector('.js-modal-order-error').style.display = 'flex';
      });
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
            cart = cart.filter(item => item.id !== itemId); // Remove o item se a quantidade chegar a zero
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
        cart = cart.filter(item => item.id !== itemId); // Remove o item do carrinho
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
    this.content = document.querySelector(".js-cart-content")
    this.cartItemsContainer = document.createElement('div');
    this.cartItemsContainer.classList.add('js-cart-items', 'cart-content__list-items');

    this.footer = document.createElement('div');
    this.footer.classList.add('cart-footer');

    this.footerTotal = document.createElement('p');
    this.footerTotal.classList.add('cart-footer__total');

    this.footerBtn = document.createElement('button');
    this.footerBtn.textContent = 'finalizar compra';
    this.footerBtn.classList.add('js-buy-products', 'btn');

    this.emptyMessage = document.createElement('p');
    this.emptyMessage.id = 'cart-empty';
    this.emptyMessage.innerHTML = `
      <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
        <rect width="64" height="64" fill="url(#pattern0_1_438)"/>
        <defs>
        <pattern id="pattern0_1_438" patternContentUnits="objectBoundingBox" width="1" height="1">
          <use xlink:href="#image0_1_438" transform="scale(0.0104167)"/>
        </pattern>
        <image id="image0_1_438" width="96" height="96" xlink:href="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGAAAABgCAYAAADimHc4AAAACXBIWXMAAAsTAAALEwEAmpwYAAAEA0lEQVR4nO2dz0tVQRTHv5UZFf0QiTZWEASRBilkf0FECkmLFq2UFhHZMtu3ChRDUYooUpD6C7JNaRshCGpjFgWly4qQ0soSa2JgHshD3z3v3rkzZ+aeDxx4mzf3O/O9d+49586bBwiCIAhCOKiEEMSAuFFyBYgBufIFwPyqWCGcdR8BbIQbVOxXwDKhk2tFuyN9KnYD/qQ04LEjfSp2A36nNOAfgEMO9KnYDfiV0gAdfQ70qdgN+JnBAH3T3pazPhW7AYsZDNDRVRADzgHYz9GAV4jfgAYzU+gHlkEAu2w2vhtA3aoon1KuEQahtYrjKc+RhrGyNnTudBlADRxQD2ApoVOjERtwDMDfddp6Z6am3BlN6NSSMSpGA54R2jyLnGkliOiJ0IAOQntvXE1FLxKEzAHYFJEBNQBmCO2dhiO6LNWHVCAGdBPamoRDtgL4miBoPBIDdgD4lNCOvjG3wDF9FupDKgADbhDauQ8PHKzwSFaKXsvHVJamlGqTrkrH1PWzffDEuOP6kHJsQHnStVZch0faHdeHlEMDKiVdpfgMYCc8sgHA+wSRLwM14CnheBfBgB6C0OOBGdDBKelKoo5woxoJyIAabkmXjfqQftW5JxADurklXRRaLNaHfBrANulyWR/yaQDbpMtWfaiNsQEN3JOuJLaYt0OVOvCIsQFj3JMuCr05rx9SORkQRNJF4QBhPant+lChki6O9aGsnAkp6aLQRuhQJ3gQZNLFrT5UuKSLW32okEkXp/pQIZMuCiOEpKbek7bgky4KzYQz7KonbVEkXTbqQ4ppBJF0UehkMJgqRQSTdNmoDylmEVTSReEug0FVVUTWii0r9prSgwok7iEyHjIYVEWM52bJZTScYjCoihC6RH7H3K+iQZ9JHxgMrlonvpl61BCAw4gQSpo/C2C7b6Ex0kTcc6Ldt9AY0bumTBEG/4FvobFygTD48+bxVMjh7J8tUprPjROEwZ9yuLlT4biUMPjL5gYteHoNqZ+5hRw5zyDBUjkHaygrpEMP9lDW2IQc7LnCYJBUkQ3Qj5gTDAZKFdWA0pKPtwwGSxXVgNLOW0mLdFWAERwnTeFtLsOmsIpRCIIgCEIwHDWbm74G8MOE/jzApDLKXV9q9BKPWwm/PFwBMAygVvTZH/zJKh7tJhybwF1fZm6neL4eEn325tSkHzyvNx01OjCBu77MDGbIMm+KPr/vA6YdGMBdn9f/H1gQfdlZyGDAdwcGcNcX/SU+w1xfZgYydLBf9GWnifj3h6os9HeOODCAuz4rDKfo4KDos0ctcQMkZeIJgM0ODeCuz1onhxIu9xVz5vvoHHd91mg0Ge60yREWzed+JnMqd32CIAiCIAiCICAu/gP3SA7LiMz4egAAAABJRU5ErkJggg=="/>
        </defs>
      </svg>
      <p>Seu carrinho está vazio.</p>
    `;
    this.emptyMessage.setAttribute('hidden', 'true');

    this.content.appendChild(this.cartItemsContainer);
    this.content.appendChild(this.emptyMessage);
    this.content.appendChild(this.footer);
    this.footer.appendChild(this.footerTotal);
    this.footer.appendChild(this.footerBtn);
  }

  connectedCallback() {
    this.render();

    const finalizeButton = this.querySelector('.js-buy-products'); // Assumindo que você tenha um botão com essa classe
    finalizeButton.addEventListener('click', () => {
      const productModule = document.querySelector('product-module');
      productModule.finalizePurchase();
    });

    const openCartBtn = document.querySelector(".js-open-cart")
    openCartBtn.addEventListener('click', () => {
      this.classList.add("cart-opened")
    });

    this.closeCartBtn = this.querySelector(".js-cart-close");
    this.closeCartBtn.addEventListener('click', () => {
      this.classList.remove("cart-opened");
    });
  }

  render() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];

    if (cart.length === 0) {
      this.emptyMessage.removeAttribute('hidden');
      this.footer.hidden = true;
    } else {
      this.emptyMessage.setAttribute('hidden', 'true');
      this.footer.hidden = false;
      this.updateCartUI(cart);
    }
  }

  updateCartUI(cart) {
    this.cartItemsContainer.innerHTML = '';
    let total = 0;

    cart.forEach(item => {
      this.cartItemsContainer.innerHTML += `
        <div class="cart-item" data-id="${item.id}">
          <button class="cart-item__rmv-all" data-id="${item.id}">remover</button>
          <picture class="cart-item__picture">
            <img src="${item.image}" alt="Produto ${item.id}">
          </picture>
          <div class="cart-item__infos">
            <p class="cart-item__infos__name">${item.name}</p>
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
      total += item.price * item.quantity;
    });

    this.footerTotal.textContent = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(total);
    this.attachCartListeners(cart);
  }

  attachCartListeners(cart) {
    const quantityAddButtons = this.cartItemsContainer.querySelectorAll('.cart-item__infos__quantity-add');
    const quantityRemoveButtons = this.cartItemsContainer.querySelectorAll('.cart-item__infos__quantity-rmv');
    const removeButtons = this.cartItemsContainer.querySelectorAll('.cart-item__rmv-all');

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
}

customElements.define('cart-side', CartSide);