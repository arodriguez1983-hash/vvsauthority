
document.getElementById('year')?.append(new Date().getFullYear());
const menu=document.querySelector('.menu'); const links=document.querySelector('.links');
menu?.addEventListener('click',()=>links.classList.toggle('open'));
const search=document.querySelector('[data-search]');
if(search){search.addEventListener('input',e=>{const q=e.target.value.toLowerCase();document.querySelectorAll('[data-product]').forEach(card=>{card.style.display=card.innerText.toLowerCase().includes(q)?'block':'none'})})}
