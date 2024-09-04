import React, { useState, useEffect } from 'react';
import { Form, Input, Button, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../axiosConfig';
import './Login.css';

const Login = ({ setIsAuthenticated }) => {
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Récupérer tous les utilisateurs depuis le backend
    const fetchUsers = async () => {
      try {
        const response = await axiosInstance.get('/utilisateurs');
        setUsers(response.data);
      } catch (error) {
        message.error("Erreur lors de la récupération des utilisateurs.");
      }
    };
    fetchUsers();
  }, []);

  const handleLogin = (values) => {
    setLoading(true);
    const { uniqueUserNumber, nom } = values;

    // Vérification des identifiants sans sélection du rôle
    const user = users.find(
      (user) => user.uniqueUserNumber === uniqueUserNumber && user.nom.toLowerCase() === nom.toLowerCase()
    );

    if (user) {
      message.success('Connexion réussie!');
      setIsAuthenticated(true);
      navigate('/home'); // Rediriger vers la page d'accueil après la connexion
    } else {
      message.error('Identifiant incorrect.');
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <Form onFinish={handleLogin} className="login-form">
        <h2>Connexion</h2>
        <Form.Item
          name="uniqueUserNumber"
          rules={[{ required: true, message: 'Veuillez entrer votre numéro unique!' }]}
        >
          <Input placeholder="Numéro unique" />
        </Form.Item>
        <Form.Item
          name="nom"
          rules={[{ required: true, message: 'Veuillez entrer votre nom!' }]}
        >
          <Input placeholder="Nom" />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} className="login-button">
            Connexion
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default Login;
