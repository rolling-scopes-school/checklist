"use strict";

var _RenderTasks = require("../js/RenderTasks.js");
var start = document.querySelector('.start');
start && start.addEventListener("click", function (e) {
  e.stopPropagation();
  if (e.target.parentElement.tagName == "SECTION") e.target.parentElement.style.display = "none";
});
var header = document.querySelector('header');
var offsetTop = header.offsetTop;
window.onscroll = function () {
  return stickyHeader();
};
function stickyHeader() {
  if (window.pageYOffset > offsetTop + 100) {
    header.classList.add("sticky");
  } else {
    header.classList.remove("sticky");
  }
}
var renderTasks = new _RenderTasks.RenderTasks('tasks-to-render.json');
renderTasks.initTasks();