import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://192.168.1.79:8080/api', // Remplacez par l'adresse IP du serveur si nécessaire
  headers: {
    'Content-Type': 'application/json',
  },
});


export default axiosInstance;