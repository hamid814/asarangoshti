const moment = require('moment-jalaali');
const randomColor = require('randomcolor');

const config = require('./config');
const { genShift, isHoliday } = require('./utils');
const {
  getStaff,
  getStaffById,
  getTransitById,
  addDeletedtransit,
  addAddedTransit,
  addStaff: addStaffDB,
  deleteStaff: deleteStaffDB,
  changeStaffIsActive: changeStaffIsActiveDB,
  resetTransitsInMonth: resetTransitsInMonthDB,
} = require('./db/db');

const getAllStaff = (req, res, next) => {
  const staff = getStaff();

  res.send({
    success: true,
    data: staff,
  });
};

const addStaff = (req, res, next) => {
  const { id, name, shiftDuration } = req.query;

  const numberId = Number(id);
  const numberShiftDuration = Number(shiftDuration);

  addStaffDB(numberId, name, numberShiftDuration);

  res.send({ success: true });
};

const changeStaffIsActive = (req, res, next) => {
  const id = req.query.id;

  changeStaffIsActiveDB(id);

  res.send({ success: true });
};

const deleteStaff = (req, res, next) => {
  const { id } = req.query;

  deleteStaffDB(id);

  res.send({ success: true });
};

const getDaysInMonth = (req, res, next) => {
  const monthNum = Number(req.query.monthNum);

  const days = [];

  const currentDay = new moment(
    `${config.year}-${monthNum}-1`,
    'jYYYY-jMM-jDD'
  );

  // add one day before month to calculate
  days.push({
    dayStr: currentDay.clone().subtract(1, 'day').format('jYYYY-jMM-jDD'),
    isHoliday: isHoliday(currentDay, config.year, true),
  });

  while (monthNum === Number(currentDay.format('jMM'))) {
    days.push({
      dayStr: currentDay.format('jYYYY-jMM-jDD'),
      isHoliday: isHoliday(currentDay, config.year, true),
    });

    currentDay.add(1, 'day');
  }

  // add one day after month to calculate
  days.push({
    dayStr: currentDay.format('jYYYY-jMM-jDD'),
    isHoliday: isHoliday(currentDay, config.year, true),
  });

  res.send({
    success: true,
    data: days,
  });
};

const deleteTransit = (req, res, next) => {
  const id = req.query.id;
  const dateStr = req.query.dateStr;

  addDeletedtransit(id, dateStr);

  res.send({ success: true });
};

const addTransit = (req, res, next) => {
  const id = req.query.id;
  const dateStr = req.query.dateStr;

  addAddedTransit(id, dateStr);

  res.send({ success: true });
};

const resetTransitsInMonth = (req, res, next) => {
  const { id, month } = req.query;

  const idNum = Number(id);
  const monthNum = Number(month);

  resetTransitsInMonthDB(idNum, monthNum, config.year);

  res.send({ success: true });
};

const getTransitsByIdAndDate = (req, res, next) => {
  const id = req.query.id;
  const month = req.query.month;
  const year = config.year;

  const startOfMonth = new moment(`${year}-${month}`, 'jYYYY-jMM');
  startOfMonth.subtract(1, 'day');
  const endOfMonth = new moment(`${year}-${month}`, 'jYYYY-jMM').endOf(
    'jMonth'
  );
  endOfMonth.add(1, 'day');

  let transits = getTransitById(id);

  transits = transits.filter((transit) => {
    const m = new moment(transit[1]);

    return m.isBetween(startOfMonth, endOfMonth);
  });

  if (req.query.isRunningFromServer) {
    return transits;
  }

  res.send({
    success: true,
    data: transits,
  });
};

const getCalculatedTransits = (req, res, next) => {
  const calculationStartTime = performance.now();

  const idsArray =
    typeof req.query.id === 'string' ? [req.query.id] : req.query.id;
  const month = req.query.month;
  const year = config.year;

  const data = [];

  if (!req.query.id) {
    res.send({
      success: true,
      data,
    });

    return;
  }

  idsArray.forEach((id) => {
    // get transits by id
    const originalTransits = getTransitsByIdAndDate({
      query: { id, month, isRunningFromServer: true },
    });

    const thisStaff = getStaffById(id);
    const hoursAfterShift = 2;
    const hoursBeforeShift = 5;
    const validDurations = [thisStaff.shiftDuration];

    for (let i = 0; i < hoursAfterShift; i++) {
      validDurations.push(validDurations[validDurations.length - 1] + 1);
    }

    for (let i = 0; i < hoursBeforeShift; i++) {
      validDurations.unshift(validDurations[0] - 1);
    }

    const shifts = [];
    let shiftsCount = 0;
    const transits = [];
    const incompleteTransits = [];
    const days = new Set();

    // generate main structure
    originalTransits.forEach((transit) => {
      transits.push({
        dateStr: transit[1],
        inOuOut: null,
        dateOfTwin: null,
        hasTwin: false,
        color: '#f00',
      });
    });

    // sort by Date
    transits.sort((t1, t2) => {
      return new moment(t1.dateStr).diff(new moment(t2.dateStr));
    });

    // calc time distance between two adjacent transit
    // => if is bellow or above a certain value, its not a shift, else its a shift
    transits.forEach((transit, i) => {
      if (transit.hasTwin) return;
      if (i === transits.length - 1) return;

      const m1 = new moment(transit.dateStr);
      const m2 = new moment(transits[i + 1].dateStr);

      if (Number(month) === Number(m1.format('jMM'))) {
        days.add(m1.format('jDD'));
      }
      if (Number(month) === Number(m2.format('jMM'))) {
        days.add(m2.format('jDD'));
      }

      const diff = m2.diff(m1, 'hour');

      const color = randomColor({
        luminosity: 'light',
        seed: transit.dateStr + transits[i + 1].dateStr,
      });

      if (validDurations.includes(diff)) {
        transit.hasTwin = true;
        transit.dateOfTwin = transits[i + 1].dateStr;

        transits[i + 1].hasTwin = true;
        transits[i + 1].dateOfTwin = transit.dateStr;

        transit.color = color;
        transits[i + 1].color = color;

        const shift = genShift(
          transit.dateStr,
          transits[i + 1].dateStr,
          month,
          year,
          thisStaff.shiftDuration
        );
        shift.color = color;

        shifts.push(shift);
      }
    });

    // add incomplete transits
    transits.forEach((t) => {
      if (!t.hasTwin)
        if (Number(new moment(t.dateStr).format('jMM')) === Number(month))
          incompleteTransits.push({ ...t });
    });

    // count number of shifts in month ( if end of end of shift is in month )
    shifts.forEach((s) => {
      const shiftEndM = new moment(s.endStr);

      if (Number(shiftEndM.format('jMM')) === Number(month)) {
        shiftsCount++;
      }
    });

    const total = {
      days: days.size,
      shiftsCount,
      duration: parseFloat(
        shifts.reduce((acc, shift) => acc + shift.duration, 0).toFixed(2)
      ),
      nightDuration: parseFloat(
        shifts.reduce((acc, shift) => acc + shift.nightDuration, 0).toFixed(2)
      ),
      holidayDuration: parseFloat(
        shifts.reduce((acc, shift) => acc + shift.holidayDuration, 0).toFixed(2)
      ),
    };

    data.push({
      id,
      transits,
      shifts,
      total,
      incompleteTransits,
    });
  });

  const calculationEndTime = performance.now();

  const calculationTime = calculationEndTime - calculationStartTime;

  res.send({ success: true, data, calculationTime });
};

const setYear = (req, res, next) => {
  config.year = Number(req.query.year);

  res.send({ success: true });
};

module.exports = {
  getAllStaff,
  addStaff,
  changeStaffIsActive,
  deleteStaff,
  getDaysInMonth,
  getTransitsByIdAndDate,
  getCalculatedTransits,
  deleteTransit,
  addTransit,
  resetTransitsInMonth,
  setYear,
};
