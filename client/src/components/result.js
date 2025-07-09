import { useState, useEffect } from 'react';

import useStore from '../store';
import { jsonToExcel, tableToJson } from '../clientUtils';

const Result = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [displayMonth, setDisplayMonth] = useState(null);

  const month = useStore((state) => state.month);
  const staff = useStore((state) => state.staff);
  const setActiveStaffId = useStore((state) => state.setActiveStaffId);

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
        {loading ? 'loading...' : 'دریافت اطلاعات کلی'}
        {loading && <div className="loading-elem"></div>}
      </button>
      <button onClick={saveExcel}>xlsx</button>
      <span>ماه:‌ {displayMonth}</span>
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
