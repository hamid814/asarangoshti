import moment from 'moment-jalaali';
import useStore from '../store';

const Print = () => {
  const data = useStore((state) => state.wholeData);
  const month = useStore((state) => state.month);
  const staff = useStore((state) => state.staff);
  const daysInMonth = useStore((state) => state.daysInMonth);

  const monthNames = [
    'فروردین',
    'اردیبهشت',
    'خرداد',
    'تیر',
    'مرداد',
    'شهریور',
    'مهر',
    'آبان',
    'آذر',
    'دی',
    'بهمن',
    'اسفند',
  ];

  return (
    <>
      {data.map((item) => {
        if (item.total.days > 0) {
          return (
            <div className="print-item">
              <div>
                <span>نام و نام خانوادگی:</span>{' '}
                {staff.length > 0 &&
                  staff.filter((s) => {
                    return Number(s.id) === Number(item.id);
                  })[0].name}
                {' - '}
                <span>جدول محاسبه کارکرد دوره {monthNames[month - 1]} ماه</span>
              </div>
              <table>
                <thead>
                  <tr>
                    <th>تاریخ</th>
                    <th>روزهفته</th>
                    <th>ورود و خروج</th>
                    <th>کارکرد</th>
                    <th>شبکاری</th>
                    <th>تعطیلی</th>
                  </tr>
                </thead>
                <tbody>
                  {daysInMonth.map((day, i) => {
                    const dayM = new moment(day.dayStr, 'jYYYY-jMM-jDD');

                    return (
                      <tr className={day.isHoliday ? 'holiday' : ''}>
                        <td>{day.dayStr}</td>{' '}
                        <td>
                          {dayM.format('dddd')} {day.isHoliday && 'تعطیل'}
                        </td>{' '}
                        <td>
                          {item.transits
                            .filter((transit) => {
                              const transitM = new moment(transit.dateStr);

                              return (
                                transitM.format('jMM-jDD') ===
                                dayM.format('jMM-jDD')
                              );
                            })
                            .map((transit) => {
                              const transitM = new moment(transit.dateStr);

                              return (
                                <span className="transit-in-print-table">
                                  {transitM.format('HH:mm')}
                                </span>
                              );
                            })}
                        </td>
                        {item.shifts
                          .filter((shift) => {
                            const shiftEndM = new moment(shift.endStr);

                            return (
                              shiftEndM.format('jMM-jDD') ===
                              dayM.format('jMM-jDD')
                            );
                          })
                          .map((shift) => {
                            return (
                              <>
                                <td>{shift.duration}</td>
                                <td>{shift.nightDuration}</td>
                                <td>{shift.holidayDuration}</td>
                              </>
                            );
                          })}{' '}
                      </tr>
                    );
                  })}
                  <tr>
                    <td>روز کارکرد</td>
                    <td>{item.total.days}</td>
                    <td>جمع</td>
                    <td>{item.total.duration}</td>
                    <td>{item.total.nightDuration}</td>
                    <td>{item.total.holidayDuration}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          );
        }
      })}
    </>
  );
};

export default Print;
