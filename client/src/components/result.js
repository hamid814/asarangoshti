import { useState, useEffect } from 'react';

import useStore from '../store';
import { jsonToExcel, tableToJson } from '../clientUtils';

const Result = () => {
  const [loading, setLoading] = useState(false);
  const [displayMonth, setDisplayMonth] = useState(null);
  const [calculationTime, setCalculationTime] = useState(0);
  const [tableMode, setTableMode] = useState('sepidar');

  const month = useStore((state) => state.month);
  const data = useStore((state) => state.wholeData);
  const setData = useStore((state) => state.setWholeData);
  const staff = useStore((state) => state.staff);
  const setActiveStaffId = useStore((state) => state.setActiveStaffId);
  const print = useStore((state) => state.print);
  const setPrint = useStore((state) => state.setPrint);
  const setTheme = useStore((state) => state.setTheme);
  const theme = useStore((state) => state.theme);

  // number of hours [movazaf] in a month
  const movazafiList = [
    160, 200, 184, 200, 200, 192, 208, 200, 200, 192, 192, 184,
  ];
  const monthNames = [
    'Farvardin',
    'Ordibehesht',
    'Khordad',
    'Tir',
    'Mordad',
    'Shahrivar',
    'Mehr',
    'Aban',
    'Azar',
    'Dey',
    'Bahman',
    'Esfand',
  ];

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

  const handleTableMode = (e) => {
    setTableMode(e.target.value);
  };

  const saveExcel = () => {
    const json = tableToJson();
    jsonToExcel(
      json,
      `${monthNames[month - 1]}-${tableMode}.${
        tableMode === 'sepidar' ? 'xls' : 'xlsx'
      }`
    );
  };

  const displayHour = (number) => {
    if (tableMode === 'sepidar') {
      return ('00' + Math.ceil(number)).slice(-3) + '00';
    } else {
      return (Math.round(number * 100) / 100).toFixed(2);
      return Math.ceil(number);
    }
  };

  return (
    <>
      <button onClick={getResult}>
        {loading ? 'loading...' : '🔄به‌روز جدول'}
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
      <select name="tableMode" onChange={handleTableMode}>
        <option value="man">Me</option>
        <option value="excel">Excel</option>
        <option value="sepidar">Sepidar</option>
      </select>
      <select
        name="theme"
        value={theme}
        onChange={(e) => setTheme(e.target.value)}
      >
        <option value="original">Original</option>
        <option value="modern">Modern</option>
        <option value="retro">Retro</option>
      </select>
      <span>ماه:‌ {displayMonth}</span>
      <span className="calculation-time">{calculationTime}ms</span>
      <table>
        <thead>
          <tr>
            <th>{tableMode === 'sepidar' ? 'كد' : 'id'}</th>
            {tableMode === 'man' && (
              <>
                <th>name</th>
                <th>nc</th>
              </>
            )}
            <th>{tableMode === 'sepidar' ? 'كاركرد روزانه' : 'days'}</th>
            {tableMode !== 'sepidar' && <th>duration</th>}
            <th>{tableMode === 'sepidar' ? 'كاركرد اضافه كاري' : 'ezafe'}</th>
            <th>{tableMode === 'sepidar' ? 'كاركرد شب‌كاري' : 'night'}</th>
            <th>
              {tableMode === 'sepidar' ? 'كاركرد تعطيلي ساعتي' : 'holiday'}
            </th>
            <th>تعداد شیفت</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) =>
            item.total.duration +
            item.total.nightDuration +
            item.total.holidayDuration ? (
              <tr key={index} onClick={() => setActiveStaffId(Number(item.id))}>
                <td>{tableMode === 'sepidar' ? '3' + item.id : item.id}</td>
                {tableMode === 'man' && (
                  <>
                    <td className="name">
                      {
                        staff.filter((s) => Number(s.id) === Number(item.id))[0]
                          .name
                      }
                    </td>
                    <td className={item.incompleteTransits.length && 'red'}>
                      {item.incompleteTransits.length}
                    </td>
                  </>
                )}
                <td>{item.total.days}</td>
                {tableMode !== 'sepidar' && (
                  <td>{displayHour(item.total.duration)}</td>
                )}
                <td>
                  {displayHour(
                    Math.max(0, item.total.duration - movazafiList[month - 1])
                  )}
                </td>
                <td>{displayHour(item.total.nightDuration)}</td>
                <td>{displayHour(item.total.holidayDuration)}</td>
                <td>{item.total.shiftsCount}</td>
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
