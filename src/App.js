import "./App.css";
import "antd/dist/antd.css";
import "toastr/build/toastr.min.css";
// import 'katex/dist/katex.min.css';
import "./Additional.css";
import "antd-css-utilities/utility.min.css";

import React, { useEffect } from "react";
import { BrowserRouter as Router, Route } from "react-router-dom";
import { createBrowserHistory } from "history";

import StudentRoutes from "./components/Navigations/studentRoutes";
import config from "./config";

function App() {
  useEffect(() => {
    document.title = config.title;
  }, []);

  const history = createBrowserHistory();

  if (window.location.href.includes("#!/")) {
    const path = window.location.href.split("#!/")[1];
    history.replace(path);
  }

  return (
    <Router>
      <Route path="/" component={StudentRoutes} />
    </Router>
  );
}
export default App;
