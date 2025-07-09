import './App.css';
import Staff from './components/staff';
import Table from './components/table';
import Result from './components/result';
import Modal from './components/modal';

function App() {
  return (
    <div className="App">
      <div></div>
      <div className="main-container">
        <div className="staff-container">
          <Staff />
        </div>
        <div className="table-container">
          <Table />
        </div>
        <div className="result-container">
          <Result />
        </div>
        <Modal />
      </div>
    </div>
  );
}

export default App;
