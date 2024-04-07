import React from "react";
import MycroftMessageBus from "./mycroft_message_bus_elements/mycroft_message_bus";
import "bootstrap/dist/css/bootstrap.min.css";
import "./app.css";

window.onerror = function (message, source, lineno, colno, error) {
  console.error('An error occurred:', { message, source, lineno, colno, error });
  return false; // Do not prevent the default handler
};

export function App() {
  return <MycroftMessageBus />;
}

export default App;
