// Manipula o item no carrinho adicionando ou removendo da API
export function handleItemOnCart(product, action) {
  let cart = JSON.parse(localStorage.getItem('cart')) || [];
  let cartID = localStorage.getItem('cartID');
  const existingProduct = cart.find(item => item.product === product.product);

  if (action === 'add') {
    existingProduct ? existingProduct.quantity += 1 : cart.push({ product: product.product, sku: product.sku, quantity: 1 });
  } else if (action === 'remove') {
    if (existingProduct) {
      existingProduct.quantity > 1 ? existingProduct.quantity -= 1 : cart = cart.filter(item => item.product !== product.product);
    }
  } else if (action === 'removeAll' && existingProduct) {
    cart = cart.filter(item => item.product !== product.product);
  }

  localStorage.setItem('cart', JSON.stringify(cart));
  const productsToSend = {
    products: cart.map(item => ({
      product: item.product,
      sku: item.sku,
      quantity: item.quantity
    }))
  };

  cartUpdateAPI(productsToSend, cartID)
    .then(data => {
      const newCartID = data.data ? data.data.id : null;
      if (!cartID && newCartID) {
        localStorage.setItem('cartID', newCartID);
      }
    })
    .catch(error => {
      console.error('[handleItemOnCart] Erro ao atualizar o carrinho na API:', error);
    });
}

// Atualizar ou criar carrinho na API
export function cartUpdateAPI(products, id) {
  const idPath = id ? `${id}` : '';
  const url = `https://us-central1-insider-integrations.cloudfunctions.net/front-end-api-interviews/v1/carts/${idPath}`;
  const method = id ? 'PUT' : 'POST';

  return fetch(url, {
    method: method,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(products),
  })
    .then(response => {
      if (!response.ok) {
        throw new Error(`[cartUpdateAPI] Erro ao ${id ? 'atualizar' : 'criar'} o carrinho com ID ${id}`);
      }
      return response.json();
    })
    .then(cart => {
      localStorage.setItem('cartID', cart.data.id);
      cartUpdateUI(cart.data)
      return cart;
    })
    .catch(error => {
      console.error('[cartUpdateAPI] Erro ao atualizar/criar o carrinho:', error);
      throw error;
    });
}

// Atualiza carrinho na UI
export function cartUpdateUI(cart) {
  const cartDrawer = document.querySelector('cart-side');
  const cartBubble = document.querySelector('.js-cart-bubble');
  const cartItemsElem = cartDrawer.querySelector('.js-cart-items');
  const cartItems = cart.products;
  const isCartEmpty = cart.skus_quantity < 1;
  toggleCartVisibility(isCartEmpty);
  cartBubble && (cartBubble.textContent = cart.skus_quantity);
  cartItemsElem.innerHTML = '';
  cartItems.forEach(item => {
    cartItemsElem.innerHTML += `
      <product-module
        data-product="${item.product.id}"
        data-sku="${item.sku.id}"
        data-name="${item.name}"
        data-price="${item.sku.price}"
        data-image="${item.image_url}"
        class="cart-item"
      >
        <picture class="cart-item__picture">
          <img src="${item.product.image_url}&width=82" width="82px" alt="Produto ${item.product.name}">
        </picture>
        <div class="cart-item__infos js-cart-item-infos">
          <button class="cart-item__rmv-all js-rmv-all-cart">remover</button>
          <svg class="loading-spinner visibility-hidden" width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M12,4a8,8,0,0,1,7.89,6.7A1.53,1.53,0,0,0,21.38,12h0a1.5,1.5,0,0,0,1.48-1.75,11,11,0,0,0-21.72,0A1.5,1.5,0,0,0,2.62,12h0a1.53,1.53,0,0,0,1.49-1.3A8,8,0,0,1,12,4Z" />
          </svg>
          <h4 class="cart-item__infos__name">${item.product.name}</h4>
          <p class="cart-item__infos__price">
            ${Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(item.price)}
          </p>
          <div class="cart-item__infos__quantity">
            <button class="cart-item__infos__quantity-rmv js-rmv-qty-cart">
              <svg width="6" height="2" viewBox="0 0 6 2" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M0.96 1.464V0.456H5.76V1.464H0.96Z"/>
              </svg>
            </button>
            <span class="cart-item__infos__quantity-curr">${item.quantity}</span>
            <button class="cart-item__infos__quantity-add js-add-qty-cart">
              <svg width="9" height="8" viewBox="0 0 9 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4.112 7.896V4.744H0.96V3.736H4.112V0.584H5.12V3.736H8.264V4.744H5.12V7.896H4.112Z"/>
              </svg>
            </button>
          </div>
        </div>
      </product-module>
    `;
  });

  const cartFooterTotalElem = cartDrawer.querySelector('.js-cart-total');
  cartFooterTotalElem.textContent = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL"
  }).format(cart.amount);

  const allLoadings = document.querySelectorAll('.loading-spinner');
  allLoadings.forEach(loadingSpinner => {
    loadingSpinner.classList.add('visibility-hidden');
  });
}

// Recuperar o carrinho da API
export async function cartRecovery(cartID) {
  try {
    const response = await fetch(`https://us-central1-insider-integrations.cloudfunctions.net/front-end-api-interviews/v1/carts/${cartID}`);
    if (!response.ok) {
      throw new Error('[cartRecovery] Erro ao recuperar o carrinho da API');
    }
    const cart = await response.json();
    cartUpdateUI(cart.data);
  } catch (error) {
    console.error('[cartRecovery] Erro ao recuperar o carrinho:', error);
  }
}

// Recupera produtos na API
export async function collectionRecovery(boxLoadingPage) {
  const url = `https://us-central1-insider-integrations.cloudfunctions.net/front-end-api-interviews/v1/products/`;
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`[collectionRecovery] Erro na requisição: ${response.status}`);
    }

    const data = await response.json();
    const products = data.data;
    if (products?.length) {
      products.forEach(product => {
        const { inventory } = product.sku;
        const isSoldOut = inventory === 0;
        const isLastUnits = inventory < 15;
        product.tag = isSoldOut ? 'sold-out' : isLastUnits ? 'last-units' : 'visibility-hidden';
        product.tagText = isSoldOut ? 'Volta logo' : isLastUnits ? 'últimas unidades' : '';
        product.available = !isSoldOut;
        product.price = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(product.sku.price);
        pagePopulate(product);
      });
    }
  } catch (error) {
    console.error('[collectionRecovery] Erro ao buscar os dados:', error);
    document.querySelector(".js-modal-store-error").classList.remove("visibility-hidden")
  } finally {
    setTimeout(() => {
      boxLoadingPage.classList.add("visibility-hidden");
      setTimeout(() => {
        boxLoadingPage.remove();
      }, 500);
    }, 500);
  }
}

// Popular a página com os produtos
export function pagePopulate(product) {
  const productsContainer = document.querySelector('.js-collection');
  productsContainer.innerHTML += `
    <product-module
      data-product="${product.id}"
      data-sku="${product.sku.id}"
      data-name="${product.name}"
      data-price="${product.sku.price}"
      data-image="${product.image_url}"
      data-available="${product.available}"
      class="collection__product-module"
      role="listitem"
    >
      <picture class="collection__product-module__picture">
        <div class="tag js-tag ${product.tag}">${product.tagText}</div>
        <img class="js-product-image-elem" src="${product.image_url}&width=317" width="317px" alt="${product.name}" data-image-full="${product.image_url}">
      </picture>
      <h4 class="collection__product-module__title">${product.name}</h4>
      <p class="collection__product-module__price">${product.price}</p>
      <button
        type="button"
        class="btn collection__product-module__button js-add-to-cart"
      >comprar
        <svg class="loading-spinner visibility-hidden" width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M12,4a8,8,0,0,1,7.89,6.7A1.53,1.53,0,0,0,21.38,12h0a1.5,1.5,0,0,0,1.48-1.75,11,11,0,0,0-21.72,0A1.5,1.5,0,0,0,2.62,12h0a1.53,1.53,0,0,0,1.49-1.3A8,8,0,0,1,12,4Z" />
        </svg>
      </button>
    </product-module>
  `;
}

// Recupera carrinhos na API
export function getCartsAPI() {
  const url = `https://us-central1-insider-integrations.cloudfunctions.net/front-end-api-interviews/v1/carts`;

  return fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })
    .then(response => {
      if (!response.ok) {
        throw new Error('[getCartsAPI] Erro na requisição');
      }
      return response.json();
    })
    .then(data => {
      return data.data;
    })
    .catch(error => {
      console.error('[getCartsAPI] Erro:', error);
      throw error;
    });
}

// Função para deletar um carrinho específico
export function cartDeleteAPI(id) {
  const url = `https://us-central1-insider-integrations.cloudfunctions.net/front-end-api-interviews/v1/carts/${id}`;

  return fetch(url, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  })
    .then(response => {
      if (!response.ok) {
        throw new Error(`[cartDeleteAPI] Erro ao deletar carrinho com ID ${id}`);
      }
      return true;
    })
    .catch(error => {
      console.error('[cartDeleteAPI] Erro ao deletar carrinho:', error);
      return false; 
    });
}

// Deleta todos os carrinhos retornados pela API
export function deleteAllCartsAPI() {
  getCartsAPI()
    .then(listCarts => {
      const carts = listCarts || [];
      if (carts.length === 0) {  return; }
      carts.forEach(cart => {
        cartDeleteAPI(cart.id);
      });
    })
    .catch(error => {
      console.error('[deleteAllCartsAPI] Erro ao buscar os carrinhos:', error);
    });
}

// Manipula a visibilidade dos elementos do carrinho
export function toggleCartVisibility(isEmpty) {
  const cartElem = document.querySelector('.js-cart');
  const cartEmptyMessage = document.querySelector('.js-cart-empty');
  const cartFooterElem = document.querySelector('.js-cart-footer');
  const cartItemsElem = document.querySelector('.js-cart-items');

  if (isEmpty) {
    cartElem.classList.remove('cart-opened');
    cartEmptyMessage.classList.remove('visibility-hidden');
    cartFooterElem.classList.add('visibility-hidden');
    cartItemsElem.classList.add('visibility-hidden');
  } else {
    cartEmptyMessage.classList.add('visibility-hidden');
    cartFooterElem.classList.remove('visibility-hidden');
    cartItemsElem.classList.remove('visibility-hidden');
  }
}