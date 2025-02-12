/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
var __webpack_exports__ = {};

;// CONCATENATED MODULE: ./src/js/storage.js
class State {
  constructor(storage) {
    this.storage = storage;
  }
  save(state) {
    console.log("Сохранение данных в localStorage:", JSON.stringify(state));
    this.storage.setItem("state", JSON.stringify(state));
  }
  load() {
    try {
      const data = this.storage.getItem("state");
      return data ? JSON.parse(data) : {};
    } catch (err) {
      console.error("Ошибка загрузки состояния:", err);
      return err;
    }
  }
}
;// CONCATENATED MODULE: ./src/js/cards.js
class Cards {
  constructor(state) {
    if (!state) {
      console.error("Ошибка: объект state не передан в Cards.");
    }
    this.container = null;
    this.state = state; // объект для работы с localStorage
  }
  bindToDOM(container) {
    if (!(container instanceof HTMLElement)) {
      throw new Error("container is not HTMLElement");
    }
    this.container = container;
    this.init();
  }
  init() {
    console.log("Инициализация Cards");
    document.querySelectorAll(".column").forEach(column => {
      column.addEventListener("click", this.handleContainerClick.bind(this));
    });
    this.loadFromStorage();
  }
  handleContainerClick(e) {
    const target = e.target;
    console.log("Клик по элементу:", target);
    let cardColumn = target.closest(".container");
    if (!cardColumn) {
      console.warn("Попробуем найти через column...");
      cardColumn = target.closest(".column")?.parentElement;
    }
    if (!cardColumn) {
      console.warn("Попробуем найти через column__container...");
      cardColumn = target.closest(".column__container")?.parentElement;
    }
    if (!cardColumn) {
      console.warn("Упс! cardColumn все равно не найден!");
      return;
    }
    console.log("Найден column:", cardColumn);

    // Удаление карточки
    if (target.classList.contains("cross") && target.closest("li")) {
      console.log("Удаление карточки...");
      const li = target.closest("li");
      li.remove();
      this.saveToStorage();
      return;
    }

    // Показ формы ввода
    if (target.classList.contains("add-card")) {
      console.log("Показ формы ввода");
      const div = this.createTextarea();
      target.replaceWith(div);
      return;
    }

    // Закрытие формы
    if (target.classList.contains("cross") && target.closest(".textarea__container")) {
      console.log("Закрытие формы");
      target.closest(".textarea__container").replaceWith(this.createAddCardButton());
      return;
    }

    // Добавление новой карточки
    if (target.classList.contains("add")) {
      console.log("Добавление новой карточки");
      const div = target.closest(".textarea__container");
      const titleInput = div.querySelector(".title-input");
      const textInput = div.querySelector(".text-input");
      const title = titleInput.value.trim();
      const text = textInput.value.trim();
      if (title !== "" && text !== "") {
        const li = this.addNewCard(title, text);
        const ul = div.closest(".column").querySelector("ul");
        ul.appendChild(li);
        div.replaceWith(this.createAddCardButton());
        this.saveToStorage();
      }
    }
  }
  createAddCardButton() {
    const btn = document.createElement("button");
    btn.classList.add("add-card");
    btn.classList.add("btn");
    btn.textContent = "+ Add another card";
    return btn;
  }
  createTextarea() {
    const div = document.createElement("div");
    div.classList.add("textarea__container");
    div.insertAdjacentHTML("beforeend", `
      <input type="text" class="title-input" placeholder="Enter a title for this card...">
      <textarea class="text-input" placeholder="Enter task details..."></textarea>
      <button class="add btn">Add Card</button>
      <button class="cross btn">&#215</button>
    `);
    return div;
  }
  addNewCard(title, text) {
    const li = document.createElement("li");
    li.classList.add("item");
    li.insertAdjacentHTML("beforeend", `
      <div class="item__header">${title}</div>
      <div class="item__text">${text}</div>
      <button class="cross btn">&#215;</button>
    `);
    return li;
  }
  saveToStorage() {
    if (!this.state) {
      console.error("State is undefined. Cannot save.");
      return;
    }
    const state = {
      todo: [],
      inprogress: [],
      done: []
    };
    console.log("Сбор данных перед сохранением...");
    this.container.querySelectorAll(".column").forEach(column => {
      const category = column.dataset.category;
      if (!category) {
        console.warn("Колонка без категории:", column);
        return;
      }
      console.log(`Обрабатываем колонку: ${category}`);
      if (!category) return; // Пропускаем, если атрибут отсутствует

      const cards = [];
      column.querySelectorAll("li").forEach(li => {
        const title = li.querySelector(".item__header").textContent;
        const text = li.querySelector(".item__text").textContent;
        console.log(`Добавлена карточка: { title: "${title}", text: "${text}" }`);
        cards.push({
          title,
          text
        });
      });
      state[category] = cards;
    });
    this.state.save(state);
    console.log("Сохраненное состояние:", JSON.stringify(state, null, 2));
  }
  loadFromStorage(savedState = null) {
    const state = savedState || this.state.load();
    console.log("Загруженное состояние:", state);
    if (!state) return;
    Object.entries(state).forEach(([key, value]) => {
      console.log(`Обрабатываем колонку: ${key}, количество карточек: ${value.length}`);
      if (!key || key === "null") return;
      const column = this.container.querySelector(`[data-category="${key}"]`);
      if (!column) {
        console.warn(`Колонка '${key}' не найдена.`);
        return;
      }
      const ul = column.querySelector("ul");

      // очистка списка перед добавлением карточек (избежать дублирования)
      while (ul.firstChild) {
        ul.removeChild(ul.firstChild);
      }
      value.forEach(({
        title,
        text
      }) => {
        console.log(`Восстановлена карточка: { title: "${title}", text: "${text}" }`);
        const li = this.addNewCard(title, text);
        ul.appendChild(li);
      });
    });
    console.log("Финальное состояние после загрузки:", this.state.load());
  }
}
;// CONCATENATED MODULE: ./src/js/dragNdrop.js
// v2.5

class DragNDrop {
  constructor(cards, state) {
    this.cards = cards;
    this.draggedElem = null;
    this.placeholder = null;
    this.shiftX = 0;
    this.shiftY = 0;
    this.placeholderParent = null;

    // Привязка контекста (фиксируем `this`, чтобы не терялся в обработчиках)
    this.onPointerMove = this.onPointerMove.bind(this);
    this.onPointerUp = this.onPointerUp.bind(this);
  }
  init() {
    this.container = document.querySelector(".container");
    this.container.addEventListener("pointerdown", this.onPointerDown.bind(this));
    document.addEventListener("selectstart", event => event.preventDefault());
    document.addEventListener("dragstart", event => event.preventDefault());
  }
  onPointerDown(event) {
    if (!event.target.closest(".item") || event.target.classList.contains("cross")) {
      return;
    }
    this.draggedElem = event.target.closest(".item");
    this.shiftX = event.clientX - this.draggedElem.getBoundingClientRect().left;
    this.shiftY = event.clientY - this.draggedElem.getBoundingClientRect().top;

    // Создаём placeholder (промежуточный элемент)
    this.placeholder = document.createElement("li");
    this.placeholder.classList.add("empty");
    this.placeholder.style.height = `${this.draggedElem.offsetHeight}px`;

    // Клонируем элемент
    this.cloneElem = this.draggedElem.cloneNode(true);
    this.cloneElem.classList.add("dragging-clone");
    this.cloneElem.style.position = "absolute";
    this.cloneElem.style.width = `${this.draggedElem.offsetWidth}px`;
    this.cloneElem.style.height = `${this.draggedElem.offsetHeight}px`;
    this.cloneElem.style.pointerEvents = "none"; // Чтобы клон не мешал

    // Прячем оригинальный элемент
    this.draggedElem.style.visibility = "hidden";
    document.body.appendChild(this.cloneElem);
    this.moveAt(event.pageX, event.pageY);
    document.addEventListener("pointermove", this.onPointerMove);
    document.addEventListener("pointerup", this.onPointerUp);
  }
  moveAt(pageX, pageY) {
    if (!this.cloneElem) return;
    this.cloneElem.style.left = `${pageX - this.shiftX}px`;
    this.cloneElem.style.top = `${pageY - this.shiftY}px`;
  }
  onPointerMove(event) {
    this.moveAt(event.pageX, event.pageY);
    const elemBelow = document.elementFromPoint(event.clientX, event.clientY);
    if (!elemBelow) return;
    const closestColumn = elemBelow.closest(".column");
    if (closestColumn) {
      const ul = closestColumn.querySelector("ul");
      const closestItem = elemBelow.closest(".item");
      if (this.placeholderParent !== ul) {
        if (this.placeholderParent && this.placeholderParent.contains(this.placeholder)) {
          this.placeholderParent.removeChild(this.placeholder);
        }
        ul.appendChild(this.placeholder);
        this.placeholderParent = ul;
      }
      if (closestItem && closestItem !== this.placeholder) {
        ul.insertBefore(this.placeholder, closestItem);
      }
    }
  }
  onPointerUp() {
    if (!this.draggedElem || !this.placeholder) return;

    // Заменяем placeholder на оригинальный элемент
    if (this.placeholderParent) {
      this.placeholderParent.replaceChild(this.draggedElem, this.placeholder);
    }

    // Удаляем клон и показываем оригинал
    if (this.cloneElem) {
      this.cloneElem.remove();
      this.cloneElem = null;
    }
    this.draggedElem.style.visibility = "visible";

    // Сброс переменных
    this.draggedElem = null;
    this.placeholder = null;
    this.placeholderParent = null;

    // Сохранение состояния
    this.saveState();

    // Удаляем обработчики
    document.removeEventListener("pointermove", this.onPointerMove);
    document.removeEventListener("pointerup", this.onPointerUp);
  }
  saveState() {
    const columns = document.querySelectorAll(".column");
    const state = {};
    columns.forEach((col, index) => {
      const items = [...col.querySelectorAll(".item")].map(item => item.textContent.trim());
      state[`column-${index}`] = items;
    });
    console.log("Карточка перемещена");
    if (!this.cards || !this.cards.saveToStorage) {
      console.error("Ошибка: this.cards.saveToStorage не найден");
      return;
    }
    this.cards.saveToStorage(state);
  }
}

// export default class DragNDrop {
//   constructor(cards, state) {
//     this.cards = cards;
//     this.draggedElem = null;
//     this.placeholder = null;
//     this.shiftX = 0;
//     this.shiftY = 0;
//   }
//   init() {
//     this.container = document.querySelector(".container");
//     this.container.addEventListener(
//       "pointerdown",
//       this.onPointerDown.bind(this),
//     );
//   }
//   onPointerDown(event) {
//     if (
//       !event.target.closest(".item") ||
//       event.target.classList.contains("cross")
//     ) {
//       return;
//     }
//     this.draggedElem = event.target.closest(".item");
//     this.placeholder = document.createElement("li");
//     this.placeholder.classList.add("empty");
//     this.placeholder.style.height = `${this.draggedElem.offsetHeight}px`;
//     this.shiftX = event.clientX - this.draggedElem.getBoundingClientRect().left;
//     this.shiftY = event.clientY - this.draggedElem.getBoundingClientRect().top;
//     this.draggedElem.style.width = `${this.draggedElem.offsetWidth}px`;
//     this.draggedElem.classList.add("dragging");
//     document.body.appendChild(this.draggedElem);
//     this.moveAt(event.pageX, event.pageY);
//     document.addEventListener("pointermove", this.onPointerMove.bind(this));
//     document.addEventListener("pointerup", this.onPointerUp.bind(this));
//   }
//   moveAt(pageX, pageY) {
//     if (!this.draggedElem) {
//       console.error("Ошибка: draggedElem отсутствует!");
//       return;
//     }
//     this.draggedElem.style.left = `${pageX - this.shiftX}px`;
//     this.draggedElem.style.top = `${pageY - this.shiftY}px`;
//   }
//   onPointerMove(event) {
//     this.moveAt(event.pageX, event.pageY);
//     const elemBelow = document.elementFromPoint(event.clientX, event.clientY);
//     if (!elemBelow) return;
//     const closestColumn = elemBelow.closest(".column");
//     if (closestColumn) {
//       const ul = closestColumn.querySelector("ul");
//       const closestItem = elemBelow.closest(".item");
//       if (!closestItem) {
//         ul.appendChild(this.placeholder);
//       } else {
//         ul.insertBefore(this.placeholder, closestItem);
//       }
//     }
//   }
//   onPointerUp() {
//     if (!this.draggedElem) return;
//     const placeholderParent = this.placeholder.parentElement;
//     if (placeholderParent) {
//       placeholderParent.replaceChild(this.draggedElem, this.placeholder);
//     }
//     this.draggedElem.classList.remove("dragging");
//     this.draggedElem.style = "";
//     this.draggedElem = null;
//     this.placeholder.remove();
//     this.saveState();
//     document.removeEventListener("pointermove", this.onPointerMove.bind(this));
//     document.removeEventListener("pointerup", this.onPointerUp.bind(this));
//   }
//   saveState() {
//     const columns = document.querySelectorAll(".column");
//     const state = {};
//     columns.forEach((col, index) => {
//       const items = [...col.querySelectorAll(".item")].map((item) =>
//         item.textContent.trim(),
//       );
//       state[`column-${index}`] = items;
//     });
//     console.log("Карточка перемещена");
//     if (!this.cards.container) {
//       console.error("Ошибка: this.cards.container не привязан");
//       return;
//     }
//     this.cards.saveToStorage();
//   }
// }
;// CONCATENATED MODULE: ./src/js/app.js



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
;// CONCATENATED MODULE: ./src/index.js


/******/ })()
;