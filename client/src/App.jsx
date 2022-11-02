import { Routes, Route } from "react-router-dom";
import Home from "./components/home/Home";
import NewFundraiser from "./components/fundraiser/New";
import DetailFundraiser from "./components/fundraiser/Detail";
import IndexFundraiser from "./components/fundraiser/Index";
import Header from "./components/default/Header";
import NotFound from "./components/default/NotFound";
import "./App.css";

const App = () => {
  return (
    <div className="wrapper">
      <div className="content">
        <Header />
        <div className="container mt-4">
          <Routes>
            <Route path="/" exact element={<Home />} />
            <Route path="new" element={<NewFundraiser />} />
            <Route path="funds" element={<IndexFundraiser />} />
            <Route path="funds/new" element={<NewFundraiser />} />
            <Route path="funds/:fundId" element={<DetailFundraiser />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default App;
