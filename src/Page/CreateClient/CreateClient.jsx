import React, { useState } from 'react';
import { Form, Input, Button, message } from 'antd';
import axiosInstance from '../../axiosConfig';

const CreateClient = () => {
  const [loading, setLoading] = useState(false);

  const handleCreateClient = async (values) => {
    setLoading(true);
    try {
      const response = await axiosInstance.post('/clients', values);
      message.success('Client créé avec succès.');
      setLoading(false);
    } catch (error) {
      message.error('Erreur lors de la création du client.');
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Créer un nouveau client</h1>
      <Form onFinish={handleCreateClient} style={styles.form}>
        <Form.Item name="nom" label="Nom" rules={[{ required: true, message: 'Veuillez entrer le nom.' }]}>
          <Input />
        </Form.Item>
        <Form.Item name="prenom" label="Prénom" rules={[{ required: true, message: 'Veuillez entrer le prénom.' }]}>
          <Input />
        </Form.Item>
        <Form.Item name="quartier" label="Quartier" rules={[{ required: true, message: 'Veuillez entrer le quartier.' }]}>
          <Input />
        </Form.Item>
        <Form.Item name="ville" label="Ville" rules={[{ required: true, message: 'Veuillez entrer la ville.' }]}>
          <Input />
        </Form.Item>
        <Button type="primary" htmlType="submit" loading={loading} style={styles.button}>
          Créer
        </Button>
      </Form>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '600px',
    margin: '50px auto',
    padding: '20px',
    borderRadius: '8px',
    backgroundColor: '#fff',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
  },
  title: {
    fontSize: '24px',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: '20px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
  },
  button: {
    width: '100%',
    marginTop: '20px',
  },
};

export default CreateClient;
