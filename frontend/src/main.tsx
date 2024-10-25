import React from "react";
import ReactDOM from "react-dom/client";
//import { VisibilityProvider } from "./providers/VisibilityProvider";
import { store } from "./store";
import { Provider } from "react-redux";
import App from "./components/AppHandler";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
        {/* <VisibilityProvider> */}
            <Provider store={store}>
                <App />
            </Provider>
        {/* </VisibilityProvider> */}
    </React.StrictMode>
);
