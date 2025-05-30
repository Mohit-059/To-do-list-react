import logo from './logo.svg';
import List from './components/List/List'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import About from './components/About/About'
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path='/' element={<List/>}/>
        <Route path='/about' element={<About/>}/>
      </Routes>
    </Router>
  );
}

export default App;
