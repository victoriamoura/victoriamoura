# Insider Store | Teste Front End

## Do teste 🎯

Toda a documentação para elaboração do teste se encontra [aqui](https://us-central1-insider-integrations.cloudfunctions.net/front-end-api-interviews/v1/instructions).

## Do projeto 🕹️

### Inicialização

O projeto pode ser acessado em [www.victoriamoura.com.br/insider](https://www.victoriamoura.com.br/insider)

Para inicializar o projeto é necessário apenas que ele esteja em alguma porta local, por exemplo ao utilizar o LiveReload.

Caso seja necessária a visualização do funcionamento do gulp, basta seguir os passos.

1. Entrar na pasta `/assets`
2. Instalar as dependências com `npm i`
3. Rodar o comando `gulp`

**Passo a passo no no terminal:**
```
cd assets
npm i
gulp
```

**Versões utilizadas:**
NPM: `10.8.2`
Node: `v20.17.0`

### Estrutura de pasta 🗂️

O projeto possui a seguinte estrutura:

📁 **insider-tes**  
---- 📁 **assets**  
---- ---- 📁 **dist**  
---- ---- ---- 📁 **css**  
---- ---- ---- 📁 **img**  
---- ---- ---- 📁 **js**  
---- ---- 📁 **fonts**  
---- ---- 📁 **src**  
---- ---- ---- 📁 **img**  
---- ---- ---- 📁 **js**  
---- ---- ---- 📁 **scss**  
---- ---- 📄 **gulpfile.js**  
---- ---- 📄 **package.json**  
---- 📄 **index.html**

O gulp compila todos os arquivos de `src` para `dist` de forma minificada para otimização.

### Lista de Produtos 🛍️

A API foi populada com base nos produtos atuais disponíveis no e-commerce.
Segue tabela com alguns cadastrados:

| Item                          | Preço   | Código                |
|-------------------------------|---------|-----------------------|
| Undershirt Anti Suor          | R$ 159  | IgrYSmir6F0ifIwJJYj2  |
| Tech T-Shirt                  | R$ 154  | XxSHZFsBNeCE62zFgmfI  |
| Performance T-Shirt 2.0       | R$ 249  | EHBX5rTFbengGFnYH3vO  |
| Lighter Jogger                | R$ 419  | jKtzo8ZJSuFcI9ERxzcE  |
| Calça FutureForm              | R$ 499  | B1UqCTPWhumjykLucI5A  |
| Cueca Performance             | R$ 83   | 0OGE92HBupt8nI7m1A59  |
| Hybrid Jogger                 | R$ 459  | 2ZqS491Hwsnwg8zRMAr4  |

## Do Layout 🌟

O layout do figma foi aprimorado, trazendo um visual mais semelhante ao e-commerce.

Foram realizadas as seguintes melhorias:
1. Carrinho fixo na lateral;
2. Tag em produtos com baixo estoque;
3. Barra de anúncios informando o produto brinde;
4. Fontes atuais utilizadas na identidade da marca;
5. Responsividade com carrinho escondido para melhor usabilidade em celulares;
6. Modal informativo trazendo feedbacks:
    - Envio do carrinho como finalização de pedido;
    - Erro de finalização de pedido;
    - Manutenção no site;
7. Efeitos de hovers em imagens e botões;
8. Efeito espelhado no logotipo trazendo elegância;
9. Efeito de carregamento de coleção dos produtos;
10. Loading de retorno de cliques/eventos;
11. Exibição de tags informativas em produtos:
    - Tag `volta Logo` quando quantidade zerada;
    - Tag `Ultimas Unidades` quando quantidade menor que 15;
12. Informativo de frete simbólico no carrinho;

## Do código 💻

Principais linguagens:
- HTML
- CSS
- Javascript

### Overview do javascript

### 📄 index.js

✒️ **Import Functions**

Importa funções utilizadas nos elementos customizados e afins.

✒️ **ProductModule - customElement**

Cria elemento de módulo de produto com principais itens de interação e atualização.

✒️ **CollectionGrid - customElement**

Cria elemento de coleção trazendo os produtos da API.

✒️ **DOMContentLoaded** 

Traz eventos de carregamento de página:
1. Verificação de existência de carrinho;
2. Listeners de cliques em botões;

### 📄 cartUtils.js

⚙️ **handleItemOnCart(product, action)**

Manipula o item no carrinho adicionando ou removendo da API

⚙️ **cartUpdateAPI(products, id)**

Atualizar ou criar carrinho na API recebendo lista de produtos do carrinho e seu ID

⚙️ **cartUpdateUI(cart)**

Atualiza carrinho na UI recebendo o carrinho

⚙️ **addGiftsOnCart()**

Adicionar ou remover brindes do carrinho caso o valor total seja R$250

⚙️ **cartRecovery(cartID)**

Recuperar o carrinho da API recebendo o ID

⚙️ **collectionRecovery(boxLoadingPage)**

Recupera produtos na API para popular a página

⚙️ **pagePopulate(product)**

Popula a página com os produtos

⚙️ **getCartsAPI()**

Recupera todos os carrinhos na API

⚙️ **cartDeleteAPI(id)**

Função para deletar um carrinho específico pelo seu ID

⚙️ **deleteAllCartsAPI()**

Deleta todos os carrinhos retornados pela API

⚙️ **toggleCartVisibility(isEmpty)**

Manipula a visibilidade dos elementos do carrinho