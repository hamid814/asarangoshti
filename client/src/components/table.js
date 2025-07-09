import { useState, useEffect } from 'react';
import moment from 'moment-jalaali';

import useStore from '../store';

moment.loadPersian({
  dialect: 'persian-modern',
});

const Table = () => {
  const [days, setDays] = useState([]);
  const [transits, setTransits] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [daysCount, setDaysCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const activeStaffId = useStore((state) => state.activeStaffId);
  const month = useStore((state) => state.month);
  const setMonth = useStore((state) => state.setMonth);
  const stepToUpdate = useStore((state) => state.stepToUpdate);
  const staff = useStore((state) => state.staff);

  useEffect(() => {
    handleUpdateTransits();
    handleGetMonth();
    // eslint-disable-next-line
  }, [stepToUpdate, activeStaffId, month]);

  const handleMonthChange = (e) => {
    const monthInputvalue = e.target.value;

    setMonth(monthInputvalue);
    if (1 > e.target.value || 12 < e.target.value) {
      e.target.value = 1;
      setMonth(1);
    }
  };

  const handleGetMonth = () => {
    fetch(`http://localhost:5000/api/get-days-in-month?monthNum=${month}`)
      .then((res) => res.json())
      .then((data) => setDays(data.data));
  };

  const handleUpdateTransits = () => {
    setLoading(true);
    fetch(
      `http://localhost:5000/api/get-calculated-transits?month=${month}&id=${activeStaffId}`
    )
      .then((res) => res.json())
      .then((data) => {
        setTransits(data.data[0].transits);
        setShifts(data.data[0].shifts);
        setDaysCount(data.data[0].total.days);
        setLoading(false);
      });
  };

  const handleDeleteTransit = (transit) => {
    fetch(
      `http://localhost:5000/api/delete-transit?id=${activeStaffId}&dateStr=${transit.dateStr}`
    )
      .then()
      .then(() => handleUpdateTransits());
  };

  const handleResetMonthTransits = () => {
    if (!isResetting) {
      setIsResetting(true);
    } else {
      fetch(
        `http://localhost:5000/api/reset-transits-in-month?id=${activeStaffId}&month=${month}`
      )
        .then()
        .then(() => {
          handleUpdateTransits();
          setIsResetting(false);
        });
    }
  };

  return (
    <>
      {loading && <div className="loading-elem"></div>}
      <div className="table-top-panel">
        <div>
          ماه:🌕
          <input onChange={handleMonthChange} value={month} type="number" />
          <button
            // mimic the value of the input element
            onClick={() => handleMonthChange({ target: { value: month + 1 } })}
            style={{ padding: '5px' }}
          >
            ➕
          </button>
          <button
            // mimic the value of the input element
            onClick={() => handleMonthChange({ target: { value: month - 1 } })}
            style={{ padding: '5px' }}
          >
            ➖
          </button>{' '}
          <button onClick={handleGetMonth} style={{ padding: '5px' }}>
            📅به‌روز تقویم
          </button>
          <button onClick={handleUpdateTransits} style={{ padding: '5px' }}>
            🏃‍♂️به‌روز ورود خروج
          </button>
          <button
            onClick={handleResetMonthTransits}
            onMouseLeave={() => setIsResetting(false)}
            style={{ padding: '5px' }}
          >
            {isResetting ? 'Sure?' : '🔄 ریست این ماه'}
          </button>
        </div>
        <div>
          {staff.filter((s) => Number(s.id) === Number(activeStaffId))[0] &&
            staff.filter((s) => Number(s.id) === Number(activeStaffId))[0].name}
          {' | '}
          ماه:{month}
          {' | '}
          کارکرد روز:{daysCount}
        </div>
      </div>
      <div className="days-of-month">
        {days.map((day, i) => (
          <SingleDay
            key={i}
            date={day}
            transits={transits}
            shifts={shifts}
            handleDeleteTransit={handleDeleteTransit}
          />
        ))}
      </div>
    </>
  );
};

const SingleDay = ({ date, transits, shifts, handleDeleteTransit }) => {
  const setActiveDay = useStore((state) => state.setActiveDay);
  const setIsModalOpen = useStore((state) => state.setIsModalOpen);

  const m = new moment(date.dayStr, 'jYYYY-jMM-jDD');

  const thisDaysTransits = transits.filter((t) => {
    const tm = new moment(t.dateStr);

    return tm.format('jMM-jDD') === m.format('jMM-jDD');
  });

  const thisDaysShifts = shifts.filter((s) => {
    const sm = new moment(s.endStr);

    return sm.format('jMM-jDD') === m.format('jMM-jDD');
  });

  const addTransitBtnHandler = () => {
    setActiveDay(m.format('jYYYY-jMM-jDD'));
    setIsModalOpen(true);
  };

  return (
    <div className="single-day">
      <div
        className={
          date.isHoliday ? 'single-day-date holiday' : 'single-day-date'
        }
      >
        {date.isHoliday && '🏖️'}
        {m.format('dddd - jMM/jDD')}
      </div>
      {thisDaysTransits.map((t, i) => (
        <SingleTransit
          transit={t}
          key={i}
          deleteTransit={handleDeleteTransit}
        />
      ))}
      {thisDaysShifts.map((s, i) => (
        <SingleShift shift={s} key={i} />
      ))}
      <div className="add-transit-btn" onClick={addTransitBtnHandler}>
        ➕
      </div>
    </div>
  );
};

const SingleTransit = ({ transit, deleteTransit }) => {
  const m = new moment(transit.dateStr, 'YYYY-MM-DD HH:mm:ss');

  const AM = 'ق.ظ';
  const isAM = m.format('a') === AM;

  return (
    <div
      className={isAM ? 'single-transit am' : 'single-transit pm'}
      style={{ backgroundColor: transit.color }}
    >
      <span onClick={() => deleteTransit(transit)}>❌</span>
      {m.format('HH:mm')}
    </div>
  );
};

const SingleShift = ({ shift }) => {
  const startM = new moment(shift.startStr);
  const endM = new moment(shift.endStr);

  return (
    <div className="single-shift" style={{ backgroundColor: shift.color }}>
      {startM.format('HH:mm')}
      {String(' => ')}
      {endM.format('HH:mm')}
      <span>
        🕒:{shift.duration}
        {' | '}
        🌑:{shift.nightDuration}
        {' | '}
        🏖️:{shift.holidayDuration}
      </span>
    </div>
  );
};

export default Table;
