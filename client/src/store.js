import { create } from 'zustand';

const useStore = create((set, get) => ({
  staff: [],
  activeStaffId: 8483,
  wholeData: [], // all of data of all staff for active month
  daysInMonth: [],
  month: 2,
  year: 1404, // year is not used in the client app - the backend has the year functionality (/api/set-year) and (config.js.year) - right now to change year => change to config.js file
  activeDay: null, // 1404-01-01
  isModalOpen: false,
  stepToUpdate: 0,
  print: true,
  setStaff: (staff) => set((state) => ({ staff })),
  setActiveStaffId: (id) => set((state) => ({ activeStaffId: id })),
  setWholeData: (wholeData) => set((state) => ({ wholeData })),
  setMonth: (num) => set((state) => ({ month: num })),
  setDaysInMonth: (daysInMonth) => set((state) => ({ daysInMonth })),
  setYear: (num) => set((state) => ({ year: num })),
  setActiveDay: (str) => set((state) => ({ activeDay: str })),
  setIsModalOpen: (bool) => set((state) => ({ isModalOpen: bool })),
  setPrint: () => set((state) => ({ print: !state.print })),
  setStepToUpdate: () =>
    set((state) => ({ stepToUpdate: state.stepToUpdate + 1 })),
}));

export default useStore;
