const moment = require('moment-jalaali');

const app = require('./server');
const holidaysList = require('./holidayslist');

const genShift = (startDateStr, endDateStr, month, year, shiftDuration) => {
  const twoDigitMonth = ('0' + month).slice(-2);

  let startM = new moment(startDateStr);
  let endM = new moment(endDateStr);

  const startHour = Number(startM.format('HH'));
  const endHour = Number(endM.format('HH'));

  // round early enters and late leaves
  const morningHours = [6, 7, 8, 9];
  const eveningHours = [18, 19, 20, 21];

  if (morningHours.includes(startHour) || eveningHours.includes(endHour)) {
    // day shift
    const shiftStartM = startM.clone();
    shiftStartM.hour(8);
    shiftStartM.minute(15);
    const shiftEndM = endM.clone();
    shiftEndM.hour(19);
    shiftEndM.minute(45);

    if (shiftStartM.isAfter(startM)) {
      startM.hour(7);
      startM.minute(59);
      startM.second(59);
    }
    if (shiftEndM.isBefore(endM)) {
      endM.hour(20);
      endM.minute(0);
      endM.second(1);
    }
  } else if (
    eveningHours.includes(startHour) ||
    morningHours.includes(endHour)
  ) {
    // night shift
    const shiftStartM = startM.clone();
    shiftStartM.hour(20);
    shiftStartM.minute(15);
    const shiftEndM = endM.clone();
    shiftEndM.hour(7);
    shiftEndM.minute(45);

    if (shiftStartM.isAfter(startM)) {
      startM.hour(19);
      startM.minute(59);
      startM.second(59);
    }
    if (shiftEndM.isBefore(endM)) {
      endM.hour(8);
      endM.minute(0);
      endM.second(1);
    }
  }

  // round start and end of month
  const monthStartM = new moment(
    `${year}-${twoDigitMonth}`,
    'jYYYY-jMM'
  ).startOf('jMonth');
  const monthEndM = new moment(`${year}-${twoDigitMonth}`, 'jYYYY-jMM').endOf(
    'jMonth'
  );

  startM = startM.isAfter(monthStartM) ? startM : monthStartM;
  startM = startM.isAfter(monthEndM) ? monthEndM : startM;
  endM = endM.isAfter(monthEndM) ? monthEndM : endM;
  endM = endM.isAfter(monthStartM) ? endM : monthStartM;

  let duration = Math.min(endM.diff(startM, 'minute') / 60, shiftDuration);
  duration = duration > shiftDuration - 0.51 ? shiftDuration : duration;
  duration = parseFloat(duration.toFixed(2));

  let nightDuration = 0;
  let holidayDuration = 0;

  const nightRanges = getNightRange(startM, endM);

  nightRanges.forEach((nightRange) => {
    nightDuration += parseFloat(
      getIntersectionDuration(
        startM.clone(),
        endM.clone(),
        nightRange.start,
        nightRange.end
      ).toFixed(2)
    );
  });

  const holidayRanges = getHolidayRanges(startM, endM, year);

  holidayRanges.forEach((holidayrange) => {
    holidayDuration += getIntersectionDuration(
      startM,
      endM,
      holidayrange.start,
      holidayrange.end
    );
  });

  holidayDuration =
    holidayDuration > shiftDuration - 0.51 ? shiftDuration : holidayDuration;
  holidayDuration = parseFloat(holidayDuration.toFixed(2));

  return {
    startStr: startDateStr,
    endStr: endDateStr,
    duration,
    nightDuration,
    holidayDuration,
  };
};

const getNightRange = (startM, endM) => {
  const nightRanges = [];

  const startDay = startM.format('DD');
  const endDay = endM.format('DD');

  if (startDay === endDay) {
    // morning nightRange 00:00 => 06:00
    nightRanges.push({
      start: startM.clone().hour(0).startOf('hour').subtract(1, 'second'),
      end: startM.clone().hour(6).startOf('hour').add(1, 'second'),
    });
    // night nightRange 00:10 => 00:00
    nightRanges.push({
      start: startM.clone().hour(22).startOf('hour').subtract(1, 'second'),
      end: startM.clone().hour(23).endOf('hour').add(1, 'second'),
    });
  } else {
    nightRanges.push({
      start: startM.clone().hour(0).startOf('hour').subtract(1, 'second'),
      end: startM.clone().hour(6).startOf('hour').add(1, 'second'),
    });
    nightRanges.push({
      start: startM.clone().hour(22).startOf('hour').subtract(1, 'second'),
      end: startM.clone().hour(23).endOf('hour').add(1, 'second'),
    });
    nightRanges.push({
      start: endM.clone().hour(0).startOf('hour').subtract(1, 'second'),
      end: endM.clone().hour(6).startOf('hour').add(1, 'second'),
    });
    nightRanges.push({
      start: endM.clone().hour(22).startOf('hour').subtract(1, 'second'),
      end: endM.clone().hour(23).endOf('hour').add(1, 'second'),
    });
  }

  return nightRanges;
};

const getIntersectionDuration = (s1, e1, s2, e2) => {
  if (s1.isBefore(s2) && e1.isBefore(s2)) return 0;
  if (s1.isAfter(e2) && e1.isAfter(e2)) return 0;

  const rangeStart = s1.isSameOrBefore(s2) ? s2 : s1;
  const rangeEnd = e1.isSameOrBefore(e2) ? e1 : e2;

  return rangeEnd.diff(rangeStart, 'minute') / 60;
};

const getHolidayRanges = (startM, endM, year) => {
  const holidayRanges = [];

  const startDay = Number(startM.format('jDD'));
  const endDay = Number(endM.format('jDD'));

  const startDayHoliday = isHoliday(startM, year);

  if (startDayHoliday) {
    holidayRanges.push(startDayHoliday);
  }

  if (startDay === endDay) {
    return holidayRanges;
  } else {
    const endDayHoliday = isHoliday(endM, year);

    if (endDayHoliday) {
      holidayRanges.push(endDayHoliday);
    }
  }

  return holidayRanges;
};

const isHoliday = (
  MOMENT /* capital because moment is already defined */,
  year,
  returnBoolean
) => {
  const day = Number(MOMENT.format('jDD'));
  const month = Number(MOMENT.format('jMM'));
  const dayOfWeek = MOMENT.format('dddd');

  let returnValue = false;

  holidaysList.forEach((holiday) => {
    if (
      (holiday.day === day && holiday.month === month) ||
      dayOfWeek === 'Friday'
    ) {
      const holidayM = new moment(`${year}-${month}-${day}`, 'jYYYY-jMM-jDD');

      if (returnBoolean) {
        returnValue = true;
        return;
      }

      returnValue = {
        start: holidayM.clone().startOf('day'),
        end: holidayM.clone().endOf('day'),
      };
    }
  });

  return returnValue;
};

module.exports = { genShift, isHoliday };
