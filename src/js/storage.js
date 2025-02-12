export default class State {
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
