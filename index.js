'use strict';

async function init() {
  const price =
    document
      .querySelector(
        'div.ui-pdp-price__second-line > span > span.price-tag-amount > span.price-tag-fraction'
      )
      ?.innerText.replace('.', '') || '0';

  const cents =
    document.querySelector(
      'div.ui-pdp-price__second-line > span > span.price-tag-amount > span.price-tag-cents'
    )?.innerText || '0';

  const sold = Number(document.querySelector('.ui-pdp-header__subtitle')?.innerText.split(' ')[4]);

  const container = document.querySelector('.ui-pdp-header__title-container');

  const adId = document
    .querySelector('meta[name="twitter:app:url:iphone"]')
    ?.content.split('id=')[1];

  const mlResponse = await handleMlApi(`https://api.mercadolibre.com/items?ids=${adId}`);

  const {
    body: {category_id, listing_type_id, start_time},
  } = mlResponse[0] || null;

  const {sale_fee_amount} =
    (await handleMlApi(
      `https://api.mercadolibre.com/sites/MLB/listing_prices?price=${price}&listing_type_id=${listing_type_id}&category_id=${category_id}`
    )) || {};

  const total = Number(price + '.' + cents) * sold;
  const unitReceipt = price - sale_fee_amount;
  const receipt = unitReceipt * sold;
  const startTime = new Date(start_time);
  const today = new Date();
  const oneDay = 24 * 60 * 60 * 1000; // h m s m
  const diffDays = Math.round(Math.abs(startTime - today) / oneDay);
  const daySellAvg = receipt / diffDays;

  setTimeout(() => {
    container?.insertAdjacentHTML(
      'beforebegin',
      `
        <ul class="mlext-container">
          <li>Receita bruta: <span>${formatMoney(total)}</span></li>
          <li>Receita líquida: <span>${formatMoney(receipt)}</span></li>
          <li>Receita por unidade: <span>${formatMoney(unitReceipt)}</span></li>
          <li>Receita média diária: <span>${formatMoney(daySellAvg)}</span></li>
          <li>Comissão do ML: <span>${formatMoney(sale_fee_amount)}</span></li>
          <li>Criado em: <span>${formatDate(startTime)} - ${diffDays} dias atrás</span></li>
        </ul>
    `
    );
  }, 1500);
}

function formatMoney(value) {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

function formatDate(date) {
  const day = date.getDate().toString().padStart(2, '0'),
    month = (date.getMonth() + 1).toString().padStart(2, '0'),
    year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

async function handleMlApi(url) {
  try {
    const config = {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    };

    const response = await fetch(url, config);
    const finalRes = await response.json();
    return finalRes;
  } catch (err) {
    console.log('Erro na requisição:', err);
  }
}

init();
