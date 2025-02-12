export default class Cards {
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
    document.querySelectorAll(".column").forEach((column) => {
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
    if (
      target.classList.contains("cross") &&
      target.closest(".textarea__container")
    ) {
      console.log("Закрытие формы");
      target
        .closest(".textarea__container")
        .replaceWith(this.createAddCardButton());
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
    div.insertAdjacentHTML(
      "beforeend",
      `
      <input type="text" class="title-input" placeholder="Enter a title for this card...">
      <textarea class="text-input" placeholder="Enter task details..."></textarea>
      <button class="add btn">Add Card</button>
      <button class="cross btn">&#215</button>
    `,
    );
    return div;
  }

  addNewCard(title, text) {
    const li = document.createElement("li");
    li.classList.add("item");

    li.insertAdjacentHTML(
      "beforeend",
      `
      <div class="item__header">${title}</div>
      <div class="item__text">${text}</div>
      <button class="cross btn">&#215;</button>
    `,
    );
    return li;
  }

  saveToStorage() {
    if (!this.state) {
      console.error("State is undefined. Cannot save.");
      return;
    }

    const state = { todo: [], inprogress: [], done: [] };
    console.log("Сбор данных перед сохранением...");

    this.container.querySelectorAll(".column").forEach((column) => {
      const category = column.dataset.category;
      if (!category) {
        console.warn("Колонка без категории:", column);
        return;
      }
      console.log(`Обрабатываем колонку: ${category}`);
      if (!category) return; // Пропускаем, если атрибут отсутствует

      const cards = [];
      column.querySelectorAll("li").forEach((li) => {
        const title = li.querySelector(".item__header").textContent;
        const text = li.querySelector(".item__text").textContent;
        console.log(
          `Добавлена карточка: { title: "${title}", text: "${text}" }`,
        );
        cards.push({ title, text });
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
      console.log(
        `Обрабатываем колонку: ${key}, количество карточек: ${value.length}`,
      );
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

      value.forEach(({ title, text }) => {
        console.log(
          `Восстановлена карточка: { title: "${title}", text: "${text}" }`,
        );
        const li = this.addNewCard(title, text);
        ul.appendChild(li);
      });
    });
    console.log("Финальное состояние после загрузки:", this.state.load());
  }
}
