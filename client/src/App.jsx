import { Routes, Route } from "react-router-dom";
import Home from "./components/home/Home";
import NewFundraiser from "./components/fundraiser/New";
import Header from "./components/header/Header";
import "./App.css";

const App = () => {
  return (
    <div className="wrapper">
      <div className="content">
        <Header />
        <div className="container mt-4">
          <Routes>
            <Route path="/" exact element={<Home />} />
            <Route path="/new" element={<NewFundraiser />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default App;
