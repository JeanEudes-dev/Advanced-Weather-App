import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import V1 from './V1';
import V2 from './V2';
import Footer from './Footer';

const App: React.FC = () => {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<V1 />} />
          <Route path="/advanced" element={<V2 />} />
        </Routes>
      </Router>
      <Footer />
    </>
  );
};

export default App;