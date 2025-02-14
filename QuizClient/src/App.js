import "./App.css";
import Login from "./components/Login";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Quiz from "./components/Quiz";
import Result from "./components/Result";
import Layout from "./components/Layout";
import Authenticate from "./components/Authenticate";
import ErrorBoundary from "./components/ErrorBoundary";

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route element={<Authenticate />}>
            <Route path="/" element={<Layout />}>
              <Route path="/quiz" element={<Quiz />}></Route>
              <Route path="/result" element={<Result />}></Route>
            </Route>
          </Route>
        </Routes>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
