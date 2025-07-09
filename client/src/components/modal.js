import { useState } from 'react';

import moment from 'moment-jalaali';

import useStore from '../store';

const Modal = () => {
  const [hour, setHour] = useState(0);
  const [minute, setMinute] = useState(0);

  const isModalOpen = useStore((state) => state.isModalOpen);
  const setIsModalOpen = useStore((state) => state.setIsModalOpen);
  const activeDay = useStore((state) => state.activeDay);
  const activeStaffId = useStore((state) => state.activeStaffId);
  const setStepToUpdate = useStore((state) => state.setStepToUpdate);

  const onKeyDownHandler = (e) => {
    if (e.key === 'Escape') {
      setIsModalOpen(false);
    }

    if (e.key === 'Enter') {
      addTransitHandler();
    }
  };

  const addTransitHandler = () => {
    let dateStr = `${activeDay} ${String(hour).padStart(2, '0')}:${minute}:00`;

    const m = new moment(dateStr, 'jYYYY-jMM-jDD HH:mm:ss');

    fetch(
      `http://localhost:5000/api/add-transit?id=${activeStaffId}&dateStr=${m.format(
        'YYYY-MM-DD HH:mm:ss'
      )}`
    )
      .then()
      .then(() => {
        setStepToUpdate();
        setIsModalOpen(false);
      });
  };

  const onHourChangeHandler = (e) => {
    setHour(e.target.value);
  };

  const onMinuteChangeHandler = (e) => {
    setMinute(e.target.value);
  };

  const on8Clicked = () => {
    setHour(8);
  };
  const on20Clicked = () => {
    setHour(20);
  };

  return (
    <div
      tabIndex="0"
      className={isModalOpen ? 'modal-container open' : 'modal-container close'}
      onKeyDown={onKeyDownHandler}
    >
      <div className="modal">
        <span onClick={() => setIsModalOpen(false)}>X</span>
        <div className="date">
          {new moment(activeDay, 'jYYYY-jMM-jDD').format('jYYYY-jMM-jDD')}
        </div>
        <div className="hour">
          <input
            type="number"
            min={0}
            max={23}
            value={hour}
            onChange={onHourChangeHandler}
          />
          <span style={{ fontSize: 30, margin: 'auto 10px' }}>:</span>
          <input
            type="number"
            min={0}
            max={59}
            value={minute}
            onChange={onMinuteChangeHandler}
          />
          <button className="add-btn" onClick={addTransitHandler}>
            Add
          </button>
          <br />
          <button className="add-8-btn" onClick={on8Clicked}>
            8
          </button>
          <button className="add-20-btn" onClick={on20Clicked}>
            20
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
