
class Settings {
  
    constructor() {
      if (!Settings.instance) {
        this._data = {}; // An object to hold your static values
        Settings.instance = this;
      }
      return Settings.instance;
    }
  
    // Method to set a value
    set(key, value) {
      this._data[key] = value;
    }
  
    // Method to get a value
    get(key) {
      return this._data[key];
    }
  }
  
  const instance = new Settings();

  Object.freeze(instance);
  
  module.exports = instance;
  