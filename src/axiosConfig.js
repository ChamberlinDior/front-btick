import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://51.178.42.116:8085/api', // Remplacez par l'adresse IP du serveur si nécessaire
  headers: {
    'Content-Type': 'application/json',
  },
});


export default axiosInstance;