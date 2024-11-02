import React from 'react';
import IssueList from './components/IssueList';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import IssueViewer from './components/IssueViewer';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<IssueList />} />
        <Route path="/issues/:id" element={<IssueViewer/>} />
      </Routes>
    </Router>
  );
}

export default App;
