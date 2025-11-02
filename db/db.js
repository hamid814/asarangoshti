const fs = require('fs');
const readline = require('readline');

const { FSDB } = require('file-system-db');
const moment = require('moment-jalaali');

// reset db
// db.set('staff', []);
// db.set('originalTransits', []);
// db.set('transits', []);

const getStaff = () => {
  const db = new FSDB('C:/Users/Hamid/Desktop/asarangoshti/db/db', false);

  return db.get('staff');
};

const getStaffById = (id) => {
  const db = new FSDB('C:/Users/Hamid/Desktop/asarangoshti/db/db', false);

  return db.get('staff').filter((s) => s.id == id)[0];
};

const addStaff = (id, name, shiftDuration) => {
  const db = new FSDB('C:/Users/Hamid/Desktop/asarangoshti/db/db', false);

  if (getStaffById(id)) {
    return 0;
  }

  db.push('staff', { id, name, shiftDuration, isActive: true });

  return 1;
};

const changeStaffIsActive = (id) => {
  const idNumber = Number(id);

  const db = new FSDB('C:/Users/Hamid/Desktop/asarangoshti/db/db', false);

  db.set(
    'staff',
    db.get('staff').map((s) => {
      if (idNumber == s.id) {
        return {
          ...s,
          isActive: !s.isActive,
        };
      } else {
        return { ...s };
      }
    })
  );
};

const deleteStaff = (id) => {
  const db = new FSDB('C:/Users/Hamid/Desktop/asarangoshti/db/db', false);

  db.set(
    'staff',
    db.get('staff').filter((s) => s.id != id)
  );
};

const getTransitById = (id) => {
  const db = new FSDB('C:/Users/Hamid/Desktop/asarangoshti/db/db', false);

  const deletedTransits = db.get('deletedTransits').filter((t) => t[0] == id);
  const addedTransits = db.get('addedTransits').filter((t) => t[0] == id);

  return db
    .get('originalTransits')
    .filter((t) => t[0] == id)
    .concat(addedTransits)
    .filter((t) => {
      let isNotDeleted = true;

      deletedTransits.forEach((dt) => {
        if (dt[1] === t[1]) {
          isNotDeleted = false;
        }
      });

      return isNotDeleted;
    });
};

const addDeletedtransit = (id, dateStr) => {
  const db = new FSDB('C:/Users/Hamid/Desktop/asarangoshti/db/db', false);

  const deletedTransit = [id, dateStr];

  db.push('deletedTransits', deletedTransit);

  const addedTransits = db.get('addedTransits');

  db.set(
    'addedTransits',
    addedTransits.filter((t) => !(t[0] === id && t[1] === dateStr))
  );
};

const addAddedTransit = (id, dateStr) => {
  const db = new FSDB('C:/Users/Hamid/Desktop/asarangoshti/db/db', false);

  const addedTransit = [id, dateStr];

  db.push('addedTransits', addedTransit);

  // remove the transit if its in the deleted list
  const deletedTransits = db.get('deletedTransits');

  db.set(
    'deletedTransits',
    deletedTransits.filter((t) => !(t[0] === id && t[1] === dateStr))
  );
};

const resetTransitsInMonth = (id, month, year) => {
  const db = new FSDB('C:/Users/Hamid/Desktop/asarangoshti/db/db', false);

  const twoDigitMonth = ('0' + month).slice(-2);

  const monthM = new moment(`${year}-${twoDigitMonth}`, 'jYYYY-jMM');
  const startM = monthM.clone().startOf('jMonth').subtract(1, 'day');
  const endM = monthM.clone().endOf('jMonth').add(1, 'day');

  db.set(
    'deletedTransits',
    db.get('deletedTransits').filter((dt) => {
      if (Number(dt[0]) !== Number(id)) return true;
      if (new moment(dt[1]).isBetween(startM, endM)) {
        return false;
      } else {
        return true;
      }
    })
  );
  db.set(
    'addedTransits',
    db.get('addedTransits').filter((dt) => {
      if (Number(dt[0]) !== Number(id)) return true;
      if (new moment(dt[1]).isBetween(startM, endM)) {
        return false;
      } else {
        return true;
      }
    })
  );
};

const importFromLog = async () => {
  const fileStream = fs.createReadStream('./log.txt');

  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity, // To handle different line endings (CRLF, LF, CR)
  });

  let num = 0;

  const originalTransits = [];

  for await (const line of rl) {
    num++;
    const splited = line.split('	');
    splited[0] = Number(splited[0].trim());
    const id = splited[0];
    splited.pop();
    splited.pop();
    splited.pop();
    splited.pop();

    if (id == 1) continue;
    originalTransits.push(splited);
  }

  const db = new FSDB('C:/Users/Hamid/Desktop/asarangoshti/db/db', false);
  db.set('originalTransits', originalTransits);

  console.log('imported originalTransits from log.txt file successfuly!');
};
// importFromLog();

const backup = () => {
  const db = new FSDB('C:/Users/Hamid/Desktop/asarangoshti/db/db', false);

  db.backup('C:/Users/Hamid/Desktop/asarangoshti/db/db-backup.json', false);

  console.log('backed up successfuly!');
};
// backup();

// const db = new FSDB('C:/Users/Hamid/Desktop/asarangoshti/db/db', false);
// db.set('deletedTransits', []);
// db.set('staff', []);
// db.set('originalTransits', []);
// db.set('transits', []);

module.exports = {
  getStaffById,
  addStaff,
  deleteStaff,
  getStaff,
  getTransitById,
  addDeletedtransit,
  addAddedTransit,
  changeStaffIsActive,
  resetTransitsInMonth,
};
