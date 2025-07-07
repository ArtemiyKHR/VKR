import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import {loginSchema} from "../shema";
import '../styles/Login.css';
import loginImage from '../assets/notebook2.jpg';

const LoginModal = ({ onClose, onLoginSuccess, onSwitchToRegister, isClosing }) => {
    const navigate = useNavigate();
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (data) => {
        try {
            const response = await fetch('http://localhost:5000/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Неверный логин или пароль');
            }

            const result = await response.json();
            localStorage.setItem('token', result.token);
            localStorage.setItem('user', JSON.stringify(result.user));

            onLoginSuccess();
            navigate('/profile');
        } catch (error) {
            console.error('Ошибка входа:', error);
            alert(error.message);
        }
    };

    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, []);

    return (
        <div className={`login-modal-overlay ${isClosing ? 'fade-out' : 'fade-in'}`} onClick={onClose}>
            <div className={`login-modal ${isClosing ? 'popup-out' : 'popup-in'}`} onClick={(e) => e.stopPropagation()}>
                <div className='login-left'>
                    <img src={loginImage} alt='login visual' className='login-image' />
                    <button className='back-btn' onClick={onClose}>
                        Вернуться назад →
                    </button>
                </div>
                <div className='login-right'>
                    <h2>Вход в аккаунт</h2>
                    <p>
                        Нет аккаунта?{' '}
                        <span className='link' onClick={onSwitchToRegister}>
                            Зарегистрироваться
                        </span>
                    </p>

                    <form onSubmit={handleSubmit(onSubmit)} className='login-form'>
                        <input
                            type='email'
                            placeholder='Логин'
                            {...register('email')}
                            className='form-input'
                        />
                        {errors.email && <p className='form-error'>{errors.email.message}</p>}

                        <input
                            type='password'
                            placeholder='Пароль'
                            {...register('password')}
                            className='form-input'
                        />
                        {errors.password && <p className='form-error'>{errors.password.message}</p>}

                        <button type='submit' className='submit-btn'>
                            Войти
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default LoginModal;