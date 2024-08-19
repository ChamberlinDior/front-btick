import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:8080/api', // Remplacez par l'adresse IP du serveur si nécessaire
  headers: {
    'Content-Type': 'application/json',
  },
});


export default axiosInstance;
