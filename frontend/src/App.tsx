import IssueList from "./components/IssueList";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import IssueViewer from "./components/IssueViewer";
import IssueCreator from "./components/IssueCreator";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<IssueList />} />
        <Route path="/issues/:id" element={<IssueViewer/>} />
        <Route path="/create" element={<IssueCreator/>} />
      </Routes>
    </Router>
  );
}

export default App;
