import State from "./storage";
import Cards from "./cards.js";
import DragNDrop from "./dragNdrop";

document.addEventListener("DOMContentLoaded", () => {
  const state = new State(localStorage);
  const creatingCards = new Cards(state);

  // Привязываем к DOM (чтобы `this.container` не был `null`)
  const boardContainer = document.querySelector(".container");
  creatingCards.bindToDOM(boardContainer);

  const dnd = new DragNDrop(creatingCards, state);
  dnd.init();

  creatingCards.bindToDOM(document.querySelector(".container"));

  window.addEventListener("unload", () => {
    console.log("Перед сохранением состояния:", creatingCards.createObj());
    state.save(creatingCards.createObj());
  });

  const loader = state.load();
  if (loader) {
    creatingCards.loadFromStorage(loader);
  }
});
