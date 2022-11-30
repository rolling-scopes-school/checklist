import lang from '../lang/lang.json'
import { RenderTasks } from "./RenderTasks.js"
import { getLang, LANG } from './RenderView.js';

const start = document.querySelector('.start');
start && start.addEventListener("click", function(e) {
    e.stopPropagation();
    if(e.target.parentElement.tagName == "SECTION") e.target.parentElement.style.display = "none";
})
const header = document.querySelector('header');
const offsetTop = header.offsetTop;

window.onscroll = () => stickyHeader();
const langSelectorNode = document.querySelector('.lang-selector')
langSelectorNode.addEventListener(
  'click',
  langSelector
)
for (let node of langSelectorNode.children){
  if (node.textContent.trim() == getLang()) {
    node.classList.add('disabled-link')
  }
};

function stickyHeader() {
    if (window.pageYOffset > offsetTop + 100) {
        header.classList.add("sticky");
      } else {
        header.classList.remove("sticky");
      }
}

function langSelector(e) {
  const tagName = e.target.tagName.toString();
  const langText = e.target.textContent;
  const disabled = e.target.parentElement.classList.contains('disabled-link')

  if(tagName.toUpperCase() !== 'A' || disabled) return;
  localStorage.setItem(LANG, langText);
  window.location.reload();
}

const renderTasks = new RenderTasks('tasks-to-render.json');
renderTasks.initTasks();

const setTextWithLang = () => {
  const curLang = lang[ getLang() ];
  document.querySelector('.feedback button').textContent =
    curLang['show-review'];
  document.querySelector('.reset').textContent =
    curLang['reset'];
  document.querySelector('.total-points').innerHTML =
    curLang['total-points'];
  document.querySelector('.progress').innerHTML =
    `${curLang['checked']} <span class="done">0</span>${curLang['out-of']}<span class="total"></span>`;
}
setTextWithLang();
