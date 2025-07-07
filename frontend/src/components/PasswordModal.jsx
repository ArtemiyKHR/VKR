import React, { useState, useEffect } from 'react';
import '../styles/PasswordModal.css';

const PasswordModal = ({ handleSubmitPassword, onSubmitPassword, registerPassword, passwordErrors, setIsChangingPassword, resetPassword }) => {
    const [isExiting, setIsExiting] = useState(false);

    const handleClose = () => {
        setIsExiting(true);
    };

    useEffect(() => {
        if (isExiting) {
            const timer = setTimeout(() => {
                setIsChangingPassword(false);
                resetPassword();
                setIsExiting(false);
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [isExiting, setIsChangingPassword, resetPassword]);

    return (
        <div className={`modal-overlay updatePaswrd ${isExiting ? 'exiting' : ''}`}>
            <div className={`profile-info updatePaswrd ${isExiting ? 'exiting' : ''}`}>
                <form onSubmit={handleSubmitPassword(onSubmitPassword)} className="profile-form updatePaswrd">
                    <h2 className="updatePaswrd">Смена пароля</h2>
                    <label className="updatePaswrd">Старый пароль</label>
                    <input
                        type="password"
                        placeholder="Старый пароль"
                        {...registerPassword("currentPassword")}
                        className="form-input updatePaswrd"
                    />
                    {passwordErrors.currentPassword && (
                        <p className="form-error updatePaswrd">
                            {passwordErrors.currentPassword.message}
                        </p>
                    )}
                    <label className="updatePaswrd">Новый пароль</label>
                    <input
                        type="password"
                        placeholder="Новый пароль"
                        {...registerPassword("newPassword")}
                        className="form-input updatePaswrd"
                    />
                    {passwordErrors.newPassword && (
                        <p className="form-error updatePaswrd">
                            {passwordErrors.newPassword.message}
                        </p>
                    )}
                    <label className="updatePaswrd">Подтверждение</label>
                    <input
                        type="password"
                        placeholder="Подтверждение"
                        {...registerPassword("confirmPassword")}
                        className="form-input updatePaswrd"
                    />
                    {passwordErrors.confirmPassword && (
                        <p className="form-error updatePaswrd">
                            {passwordErrors.confirmPassword.message}
                        </p>
                    )}
                    <div className="button-group updatePaswrd">
                        <button
                            type="button"
                            className="submit-btn updatePaswrd"
                            onClick={handleClose}
                        >
                            Отмена
                        </button>
                        <button type="submit" className="submit-btn save-btn updatePaswrd">
                            Сохранить
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PasswordModal;