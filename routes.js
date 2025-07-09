const express = require('express');

const {
  getAllStaff,
  getDaysInMonth,
  getTransitsByIdAndDate,
  getCalculatedTransits,
  deleteTransit,
  addTransit,
  addStaff,
  deleteStaff,
  changeStaffIsActive,
  resetTransitsInMonth,
  setYear,
} = require('./controllers');

const router = express.Router();

router.route('/staff').get(getAllStaff);
router.route('/add-staff').get(addStaff);
router.route('/change-active-staff').get(changeStaffIsActive);
router.route('/delete-staff').get(deleteStaff);
router.route('/get-days-in-month').get(getDaysInMonth);
router.route('/get-transits-by-id-and-date').get(getTransitsByIdAndDate);
router.route('/get-calculated-transits').get(getCalculatedTransits);
router.route('/reset-transits-in-month').get(resetTransitsInMonth);
router.route('/delete-transit').get(deleteTransit);
router.route('/add-transit').get(addTransit);
router.route('/set-year').get(setYear);

module.exports = router;
