import { RenderTasks } from "../js/RenderTasks.js"

const start = document.querySelector('.start');
start && start.addEventListener("click", function(e) {
    e.stopPropagation();
    if(e.target.parentElement.tagName == "SECTION") e.target.parentElement.style.display = "none";
})
const header = document.querySelector('header');
const offsetTop = header.offsetTop;

window.onscroll = () => stickyHeader();

function stickyHeader() {
    if (window.pageYOffset > offsetTop + 100) {
        header.classList.add("sticky");
      } else {
        header.classList.remove("sticky");
      }
}

const renderTasks = new RenderTasks('tasks-to-render.json');
renderTasks.initTasks();

