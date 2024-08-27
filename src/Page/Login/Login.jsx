import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Input, Button, message } from 'antd';

const Login = ({ setUserRole }) => {
    const [email, setEmail] = useState('');
    const navigate = useNavigate();

    const handleLogin = () => {
        if (email === "admin@example.com") {
            setUserRole('admin');
            navigate('/');
        } else if (email === "user@example.com") {
            setUserRole('user');
            navigate('/');
        } else {
            message.error("E-mail non reconnu.");
        }
    };

    return (
        <div style={styles.container}>
            <h1 style={styles.title}>Connexion</h1>
            <Form onFinish={handleLogin} style={styles.form}>
                <Form.Item label="E-mail" rules={[{ required: true, message: 'Veuillez entrer votre e-mail.' }]}>
                    <Input value={email} onChange={(e) => setEmail(e.target.value)} />
                </Form.Item>
                <Form.Item>
                    <Button type="primary" htmlType="submit" style={styles.button}>
                        Se connecter
                    </Button>
                </Form.Item>
            </Form>
        </div>
    );
};

const styles = {
    container: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        backgroundColor: '#f0f4f7',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 40,
    },
    form: {
        width: 300,
    },
    button: {
        width: '100%',
    },
};

export default Login;
