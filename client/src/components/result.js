import { useState, useEffect } from 'react';

import useStore from '../store';
import { jsonToExcel, tableToJson } from '../clientUtils';

const Result = () => {
  const [loading, setLoading] = useState(false);
  const [displayMonth, setDisplayMonth] = useState(null);
  const [calculationTime, setCalculationTime] = useState(0);

  const month = useStore((state) => state.month);
  const data = useStore((state) => state.wholeData);
  const setData = useStore((state) => state.setWholeData);
  const staff = useStore((state) => state.staff);
  const setActiveStaffId = useStore((state) => state.setActiveStaffId);
  const print = useStore((state) => state.print);
  const setPrint = useStore((state) => state.setPrint);

  useEffect(() => {
    getResult();
    // eslint-disable-next-line
  }, [month]);

  const getResult = () => {
    const queryString = staff
      .map((s) => s.id)
      .map((id) => `id=${id}`)
      .join('&');

    setLoading(true);
    fetch(
      `http://localhost:5000/api/get-calculated-transits?month=${month}&${queryString}`
    )
      .then((res) => res.json())
      .then((data) => {
        setLoading(false);
        setData(data.data);
        setCalculationTime(parseInt(data.calculationTime));
        setDisplayMonth(month);
      });
  };

  const saveExcel = () => {
    const json = tableToJson();
    jsonToExcel(json, month);
  };

  return (
    <>
      <button onClick={getResult}>
        {loading ? 'loading...' : '🔄دریافت اطلاعات کلی'}
        {loading && <div className="loading-elem"></div>}
      </button>
      <button onClick={saveExcel}>👈xlsx👉</button>
      <button
        onClick={() => {
          setPrint();
        }}
        className={print ? 'print-btn print-active' : 'print-btn'}
      >
        {print ? 'Print Active' : 'Not Printing'}
      </button>
      <span>ماه:‌ {displayMonth}</span>
      <span className="calculation-time">{calculationTime}ms</span>
      <table>
        <thead>
          <tr>
            <th>id</th>
            <th>name</th>
            <th>nc</th>
            <th>days</th>
            <th>duration</th>
            <th>night</th>
            <th>holiday</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) =>
            item.total.duration +
            item.total.nightDuration +
            item.total.holidayDuration ? (
              <tr key={index} onClick={() => setActiveStaffId(Number(item.id))}>
                <td>{item.id}</td>
                <td className="name">
                  {
                    staff.filter((s) => Number(s.id) === Number(item.id))[0]
                      .name
                  }
                </td>
                <td className={item.incompleteTransits.length && 'red'}>
                  {item.incompleteTransits.length}
                </td>
                <td>{item.total.days}</td>
                <td>{item.total.duration}</td>
                <td>{item.total.nightDuration}</td>
                <td>{item.total.holidayDuration}</td>
              </tr>
            ) : (
              ''
            )
          )}
        </tbody>
      </table>
    </>
  );
};

export default Result;
