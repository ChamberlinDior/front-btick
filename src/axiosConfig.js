import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'https://finalbus-backend-ex-66e647c8aeba.herokuapp.com', // Remplacez par l'adresse IP du serveur si nécessaire
  headers: {
    'Content-Type': 'application/json',
  },
});


export default axiosInstance;