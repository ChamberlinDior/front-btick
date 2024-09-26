import React, { useState, useEffect } from 'react';
import { Form, Input, Button, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../axiosConfig';
import './Login.css';

const Login = ({ setIsAuthenticated, setConnectedUser }) => {
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]); // Stockage des utilisateurs récupérés
  const navigate = useNavigate();

  // Récupérer tous les utilisateurs depuis le backend
  useEffect(() => {
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

  const handleLogin = async (values) => {
    setLoading(true); // Activer l'indicateur de chargement

    const { uniqueUserNumber, nom } = values;

    // Trouver l'utilisateur correspondant
    const user = users.find(
      (user) => user.uniqueUserNumber === uniqueUserNumber && user.nom.toLowerCase() === nom.toLowerCase()
    );

    if (user) {
      // Si l'utilisateur est trouvé, connexion réussie
      message.success('Connexion réussie!');
      setIsAuthenticated(true);
      setConnectedUser(user); // Définir l'utilisateur connecté
      setLoading(false); // Désactiver le chargement
      navigate('/home'); // Rediriger vers la page d'accueil
    } else {
      // Si l'utilisateur n'est pas trouvé, afficher une erreur
      message.error('Identifiant ou nom incorrect.');
      setLoading(false); // Désactiver le chargement
    }
  };

  return (
    <div className="login-container">
      <Form onFinish={handleLogin} className="login-form">
        <h2>Connexion</h2>
        {/* Champ pour le numéro unique */}
        <Form.Item
          name="uniqueUserNumber"
          rules={[{ required: true, message: 'Veuillez entrer votre numéro unique!' }]}
        >
          <Input placeholder="Numéro unique" />
        </Form.Item>

        {/* Champ pour le nom */}
        <Form.Item
          name="nom"
          rules={[{ required: true, message: 'Veuillez entrer votre nom!' }]}
        >
          <Input placeholder="Nom" />
        </Form.Item>

        {/* Bouton de connexion */}
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
