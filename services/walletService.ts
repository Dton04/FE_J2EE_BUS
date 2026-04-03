import { api } from './api';

export const walletService = {
  getWallet() {
    return api.get('/wallet').then(res => res.data);
  },
  getTransactions() {
    return api.get('/wallet/transactions').then(res => res.data);
  },
  deposit(amount: number) {
    return api.post('/wallet/deposit', { amount }).then(res => res.data);
  }
};
