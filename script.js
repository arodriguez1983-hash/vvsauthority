const products=[
 {name:'1.09 CT Marquise Lab Diamond',cat:'diamonds',cert:'IGI Certified',price:'$2,200',icon:'💎'},
 {name:'1.04 CT Emerald Lab Diamond',cat:'diamonds',cert:'IGI Certified',price:'$2,150',icon:'◇'},
 {name:'3.5 CT Moissanite Ring',cat:'moissanite',cert:'D Color',price:'$299.99',icon:'💍'},
 {name:'2 CT Moissanite Earrings',cat:'moissanite',cert:'GRA Certified',price:'$249.99',icon:'✨'},
 {name:'2.50 CT Pink Sapphire',cat:'gemstones',cert:'Loose Gemstone',price:'$189.99',icon:'💗'},
 {name:'2.30 CT Aquamarine Oval',cat:'gemstones',cert:'Loose Gemstone',price:'$159.99',icon:'💠'},
 {name:'Diamond Pendant',cat:'jewelry',cert:'Fine Jewelry',price:'Contact for price',icon:'📿'},
 {name:'Gold Chain',cat:'jewelry',cert:'Jewelry',price:'Contact for price',icon:'🔗'}
];
function productCard(p){return `<article class="product-card reveal" data-cat="${p.cat}"><div class="product-img">${p.icon}</div><div class="product-body"><h3>${p.name}</h3><p class="cert">${p.cert}</p><p class="price">${p.price}</p></div></article>`}
function renderProducts(targetId,filter='all'){const el=document.getElementById(targetId);if(!el)return;const list=products.filter(p=>filter==='all'||p.cat===filter);el.innerHTML=list.map(productCard).join('')}
renderProducts('featuredProducts');renderProducts('diamondProducts','diamonds');renderProducts('moissaniteProducts','moissanite');renderProducts('gemProducts','gemstones');renderProducts('jewelryProducts','jewelry');
document.querySelector('.menu-toggle')?.addEventListener('click',()=>document.querySelector('.nav').classList.toggle('open'));
const search=document.getElementById('productSearch');if(search){search.addEventListener('input',e=>{const term=e.target.value.toLowerCase();document.querySelectorAll('.product-card').forEach(card=>{card.style.display=card.textContent.toLowerCase().includes(term)?'block':'none'})})}
