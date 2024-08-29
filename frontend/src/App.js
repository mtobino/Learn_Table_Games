import './App.css';
import {BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from './components/Navbar';
import HomePage from "./pages/HomePage";
import AboutPage from "./pages/AboutPage";
import BlackjackPage from "./pages/BlackjackPage";
import NotFoundPage from "./pages/NotFoundPage";

function App() {

  return (
    <BrowserRouter>
      <div className={"App"}>
        <Navbar/>
        <div className={"page-body"}>
          <Routes>
            <Route path={"/"} element={<HomePage/>} />
            <Route path={"/about"} element={<AboutPage/>} />
            <Route path={"/blackjack"} element={<BlackjackPage/>} />
            <Route path={"*"} element={<NotFoundPage/>} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
