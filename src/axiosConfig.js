import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080/api',
});

export const getAllClients = async () => {
  return await api.get('/clients');
};

export const createClient = async (clientData) => {
  return await api.post('/clients', clientData);
};

export const rechargeClientByRfid = async (rfid, planType) => {
  return await api.post('/cards/recharge-by-rfid', null, {
    params: { rfid, planType },
  });
};

export const updateClientPlanType = async (clientId, clientData) => {
  return await api.put(`/clients/${clientId}`, clientData);
};

export const checkCardValidity = async (rfid) => {
  return await api.get(`/cards/check-validity?rfid=${rfid}`);
};
