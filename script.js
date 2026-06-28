document.addEventListener('DOMContentLoaded', () => {
  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  const menu = document.querySelector('.menu');
  const links = document.querySelector('.links');
  if (menu && links) {
    menu.addEventListener('click', () => links.classList.toggle('open'));
  }

  const products = document.querySelectorAll('[data-product]');
  const search = document.querySelector('#search');
  const category = document.querySelector('#category');
  const stone = document.querySelector('#stone');
  const maxPrice = document.querySelector('#maxPrice');

  function filterProducts(){
    const q = (search?.value || '').toLowerCase();
    const cat = category?.value || 'all';
    const st = stone?.value || 'all';
    const max = Number(maxPrice?.value || 999999999);
    products.forEach(card => {
      const text = card.innerText.toLowerCase();
      const cardCat = card.dataset.category;
      const cardStone = card.dataset.stone;
      const price = Number(card.dataset.price || 0);
      const show = text.includes(q) && (cat==='all' || cardCat===cat) && (st==='all' || cardStone===st) && price <= max;
      card.style.display = show ? '' : 'none';
    });
  }
  [search, category, stone, maxPrice].forEach(el => el && el.addEventListener('input', filterProducts));
});
