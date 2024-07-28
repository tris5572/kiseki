import { create } from 'zustand';
import { AppState } from './types';

export const useAppState = create<AppState>((set) => ({
  dataList: [],

  addData(data) {
    set((state) => ({ dataList: [...state.dataList, data] }));
  },
}));
