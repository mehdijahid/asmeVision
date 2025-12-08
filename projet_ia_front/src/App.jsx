import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './navbar';
import Section from './section';
import Upload from './ai_analyze';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <nav>
        <Navbar />
      </nav>
      <section>
        <Routes>
          <Route path="/" element={<Section />} />
          <Route path="/upload" element={<Upload />} />
        </Routes>
      </section>
    </BrowserRouter>
  );
}

export default App;