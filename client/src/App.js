import useStore from './store';

import './App.css';
import './Print.css';

import Staff from './components/staff';
import Table from './components/table';
import Result from './components/result';
import Print from './components/print';
import Modal from './components/modal';

function App() {
  const print = useStore((state) => state.print);

  return (
    <div className="App">
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
      {print && (
        <div className="print-container">
          <Print />
        </div>
      )}
    </div>
  );
}

export default App;
