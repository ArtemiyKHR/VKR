import React, { useState } from 'react';
import LoginModal from './Login';
import RegisterModal from './Registration';

const AuthModal = ({ onClose, onLoginSuccess, onRegisterSuccess }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [isClosing, setIsClosing] = useState(false);

    const switchToRegister = () => {
        setIsClosing(true);
        setTimeout(() => {
            setIsLogin(false);
            setIsClosing(false);
        }, 400);
    };

    const switchToLogin = () => {
        setIsClosing(true);
        setTimeout(() => {
            setIsLogin(true);
            setIsClosing(false);
        }, 400);
    };

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => {
            onClose();
        }, 400);
    };

    return (
        <>
            {isLogin ? (
                <LoginModal
                    key="login-modal"
                    onClose={handleClose}
                    onLoginSuccess={onLoginSuccess}
                    onSwitchToRegister={switchToRegister}
                    isClosing={isClosing}
                />
            ) : (
                <RegisterModal
                    key="register-modal"
                    onClose={handleClose}
                    onRegisterSuccess={onRegisterSuccess}
                    onSwitchToLogin={switchToLogin}
                    isClosing={isClosing}
                />
            )}
        </>
    );
};

export default AuthModal;