import { create } from 'zustand';

const useStore = create((set, get) => ({
  staff: [],
  activeStaffId: 8483,
  month: 2,
  year: 1404,
  activeDay: null, // 1404-01-01
  isModalOpen: false,
  stepToUpdate: 0,
  setStaff: (staff) => set((state) => ({ staff })),
  setActiveStaffId: (id) => set((state) => ({ activeStaffId: id })),
  setMonth: (num) => set((state) => ({ month: num })),
  setYear: (num) => set((state) => ({ year: num })),
  setActiveDay: (str) => set((state) => ({ activeDay: str })),
  setIsModalOpen: (bool) => set((state) => ({ isModalOpen: bool })),
  setStepToUpdate: () =>
    set((state) => ({ stepToUpdate: state.stepToUpdate + 1 })),
}));

export default useStore;
