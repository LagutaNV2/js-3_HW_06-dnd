// v2.5
import Cards from "./cards.js";

export default class DragNDrop {
  constructor(cards, state) {
    this.cards = cards;
    this.draggedElem = null;
    this.placeholder = null;
    this.shiftX = 0;
    this.shiftY = 0;
    this.placeholderParent = null;
  }

  init() {
    this.container = document.querySelector(".container");
    this.container.addEventListener(
      "pointerdown",
      this.onPointerDown.bind(this)
    );

    document.addEventListener("selectstart", (event) => event.preventDefault());
    document.addEventListener("dragstart", (event) => event.preventDefault());
  }

  onPointerDown(event) {
    if (
      !event.target.closest(".item") ||
      event.target.classList.contains("cross")
    ) {
      return;
    }

    this.draggedElem = event.target.closest(".item"); // Перемещаемая карточка
    this.shiftX = event.clientX - this.draggedElem.getBoundingClientRect().left;
    this.shiftY = event.clientY - this.draggedElem.getBoundingClientRect().top;

    // Создание placeholder (заглушка)
    this.placeholder = this.draggedElem.cloneNode(true);
    this.placeholder.classList.add("empty");
    this.placeholder.style.height = `${this.draggedElem.offsetHeight}px`;
    this.placeholder.style.visibility = "hidden";

    this.draggedElem.style.width = `${this.draggedElem.offsetWidth}px`;
    this.draggedElem.style.height = `${this.draggedElem.offsetHeight}px`;

    this.draggedElem.classList.add("dragging");
    this.draggedElem.style.willChange = "transform"; // Для анимации
    document.body.appendChild(this.draggedElem);
    this.moveAt(event.pageX, event.pageY);
    document.addEventListener("pointermove", this.onPointerMove.bind(this)); // ~ mousemove
    document.addEventListener("pointerup", this.onPointerUp.bind(this)); // ~ mouseup
  }

  moveAt(pageX, pageY) {
    if (!this.draggedElem) {
      console.error("Ошибка: draggedElem отсутствует!");
      return;
    }
    this.draggedElem.style.position = "fixed";
    this.draggedElem.style.left = `${pageX - this.shiftX}px`;
    this.draggedElem.style.top = `${pageY - this.shiftY}px`;
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
        if (this.placeholderParent) {
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

    // Убираем placeholder
    if (this.placeholderParent) {
      this.placeholderParent.removeChild(this.placeholder);
    }

    // Вставляем draggedElem на место placeholder
    const placeholderParent = this.placeholderParent;
    if (placeholderParent) {
      placeholderParent.replaceChild(this.draggedElem, this.placeholder);
    }

    // Восстанавливаем свойства карточки
    this.draggedElem.style.transition = "opacity 0.1s ease-out";
    this.draggedElem.style.opacity = "0.8"; // для анимации

    setTimeout(() => {
      if (!this.draggedElem) return;
      this.draggedElem.classList.remove("dragging");
      this.draggedElem.style.removeProperty("position");
      this.draggedElem.style.removeProperty("left");
      this.draggedElem.style.removeProperty("top");
      this.draggedElem.style.removeProperty("opacity");
      this.draggedElem.style.removeProperty("transition");

      this.draggedElem = null;
    }, 50);

    // Сохраняем состояние после перемещения
    this.saveState();

    // Убираем обработчики событий
    document.removeEventListener("pointermove", this.onPointerMove.bind(this));
    document.removeEventListener("pointerup", this.onPointerUp.bind(this));
  }

  saveState() {
    const columns = document.querySelectorAll(".column");
    const state = {};
    columns.forEach((col, index) => {
      const items = [...col.querySelectorAll(".item")].map((item) =>
        item.textContent.trim(),
      );
      state[`column-${index}`] = items;
    });
    console.log("Карточка перемещена");
    if (!this.cards.container) {
      console.error("Ошибка: this.cards.container не привязан");
      return;
    }
    this.cards.saveToStorage();
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
