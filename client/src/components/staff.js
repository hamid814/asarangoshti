import { useState } from 'react';

import useStore from '../store';

const Staff = () => {
  const [id, setId] = useState('');
  const [name, setName] = useState('');
  const [shiftDuration, setShiftDuration] = useState(12);
  const [message, setMessage] = useState('');

  const activeStaffId = useStore((state) => state.activeStaffId);
  const setActiveStaffId = useStore((state) => state.setActiveStaffId);
  const staff = useStore((state) => state.staff);
  const setStaff = useStore((state) => state.setStaff);

  const getStaff = () => {
    fetch('http://localhost:5000/api/staff')
      .then((res) => res.json())
      .then((data) => setStaff(data.data));
  };

  const addStaffHandler = () => {
    if (!id || !name) {
      setMessage('please provide id and name');
      setTimeout(() => {
        setMessage('👋');
        setTimeout(() => {
          setMessage('');
        }, 1500);
      }, 4000);
      return;
    }
    fetch(
      `http://localhost:5000/api/add-staff?id=${id}&name=${name}&shiftDuration=${shiftDuration}`
    )
      .then()
      .then(() => {
        setId('');
        setName('');
        getStaff();
      });
  };

  return (
    <>
      <button onClick={getStaff}>Get Staff</button>
      <div className="add-staff-form">
        <span>
          <input
            type="number"
            placeholder="id"
            value={id}
            onChange={(e) => setId(e.target.value)}
          />
        </span>
        <span>
          <input
            type="text"
            placeholder="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </span>
        <span>
          <input
            type="number"
            min={12}
            max={24}
            step={12}
            placeholder="shift duration"
            value={shiftDuration}
            onChange={(e) => setShiftDuration(e.target.value)}
          />
        </span>
      </div>
      {message}
      <button onClick={addStaffHandler}>➕Add Staff</button>
      {staff
        .sort((a, b) => b.isActive - a.isActive)
        .map((staff, i) => (
          <SingleStaff
            key={i}
            staff={staff}
            handleClick={setActiveStaffId}
            activeStaffId={activeStaffId}
          />
        ))}
    </>
  );
};

const SingleStaff = ({ staff, handleClick, activeStaffId }) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const setStaff = useStore((state) => state.setStaff);

  const deleteStaffHandler = () => {
    if (!isDeleting) {
      setTimeout(() => {
        setIsDeleting(true);
        setTimeout(() => {
          setIsDeleting(false);
        }, 1500);
      }, 1500);
    } else {
      fetch(`http://localhost:5000/api/delete-staff?id=${staff.id}`)
        .then()
        .then(() => {
          fetch('http://localhost:5000/api/staff')
            .then((res) => res.json())
            .then((data) => setStaff(data.data));
        });
    }
  };

  const staffActiveChanger = () => {
    fetch(`http://localhost:5000/api/change-active-staff?id=${staff.id}`)
      .then()
      .then(() => {
        fetch('http://localhost:5000/api/staff')
          .then((res) => res.json())
          .then((data) => setStaff(data.data));
      });
  };

  const handleSingleStaffClick = (e) => {
    // console.log();

    if (![...e.target.classList].includes('activate-btn')) {
      if (![...e.target.classList].includes('delete-btn')) {
        handleClick(staff.id);
      }
    }
  };

  return (
    <div
      className={`single-staff ${staff.id === activeStaffId && 'active'} ${
        !staff.isActive && 'dark'
      }`}
      onClick={handleSingleStaffClick}
      onMouseLeave={() => setIsDeleting(false)}
    >
      <span className="activate-btn btn" onClick={staffActiveChanger}>
        {staff.isActive ? 'Deactivate' : 'Activate'}
      </span>
      <span
        className="delete-btn btn"
        onMouseLeave={() => setIsDeleting(false)}
        onClick={deleteStaffHandler}
      >
        {isDeleting ? 'Sure?' : '❌'}
      </span>
      <span>{staff.id}</span>
      <span>{staff.name}</span>
      <span>{staff.shiftDuration}</span>
    </div>
  );
};

export default Staff;
