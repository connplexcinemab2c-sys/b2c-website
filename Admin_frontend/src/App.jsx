import "./App.css";
import Routes from "./routes/Routes";
import "./assests/styles/admin.css";
// import "./assests/styles/meet.css";
import "./container/pages/admin/blogManagement/BlogManagement.css";
import "./assests/styles/responsive.css";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";
import "./container/pages/admin/blogManagement/ckeditor.css";
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/firebase-messaging-sw.js")
      .then((registration) => {})
      .catch((error) => {});
  });
}
function App() {
  return (
    <div className="App">
      <ToastContainer
        limit={1}
        autoClose={500}
        hideProgressBar
        closeButton={false}
      />
      <Routes />
    </div>
  );
}

export default App;
