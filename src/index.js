import React from "react";
import ReactDOM from "react-dom";
import "./index.css";

import App from "./App";
import reportWebVitals from "./reportWebVitals";

import store from "./stateManager/store";
import { Provider } from "react-redux";

import { initSocket, getSocket } from "./constants/socketInstance";
initSocket();

const socket = getSocket();

socket.on("error", (err) => {
  console.log(err.response);
});
socket.on("connect", () => {
  console.log("Connected");
});

socket.on("disconnect", () => {
  console.log("Disconnected In Index");
});

// if (process.env.NODE_ENV === 'production') {
// 	console.log = function () {};
// }

ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>,
  document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
