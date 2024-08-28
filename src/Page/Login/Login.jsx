import React, { useState } from 'react';
import { Form, Input, Button, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import './Login.css';

const Login = ({ setIsAuthenticated }) => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = (values) => {
    setLoading(true);
    const { username, password } = values;

    // Vérification des identifiants
    if (username === 'Dior' && password === 'Dior') {
      message.success('Connexion réussie!');
      setIsAuthenticated(true);
      navigate('/home'); // Rediriger vers la page d'accueil après la connexion
    } else {
      message.error('Identifiant ou mot de passe incorrect.');
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <Form onFinish={handleLogin} className="login-form">
        <h2>Connexion</h2>
        <Form.Item
          name="username"
          rules={[{ required: true, message: 'Veuillez entrer votre nom d’utilisateur!' }]}
        >
          <Input placeholder="Nom d’utilisateur" />
        </Form.Item>
        <Form.Item
          name="password"
          rules={[{ required: true, message: 'Veuillez entrer votre mot de passe!' }]}
        >
          <Input.Password placeholder="Mot de passe" />
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
