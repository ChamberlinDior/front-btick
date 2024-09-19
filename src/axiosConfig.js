import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://172.23.128.1:8080/api', // Remplacez par l'adresse IP du serveur si nécessaire
  headers: {
    'Content-Type': 'application/json',
  },
});


export default axiosInstance;