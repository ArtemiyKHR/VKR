import React, { useState, useEffect } from 'react';
import '../styles/ProfileEditModal.css';

const ProfileEditModal = ({ handleSubmitProfile, onSubmitProfile, registerProfile, profileErrors, setIsEditing }) => {
    const [isExiting, setIsExiting] = useState(false);

    const handleClose = () => {
        setIsExiting(true);
    };

    useEffect(() => {
        if (isExiting) {
            const timer = setTimeout(() => {
                setIsEditing(false);
                setIsExiting(false);
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [isExiting, setIsEditing]);

    return (
        <div className={`modal-overlay profileEdit ${isExiting ? 'exiting' : ''}`}>
            <div className={`profile-info profileEdit ${isExiting ? 'exiting' : ''}`}>
                <form onSubmit={handleSubmitProfile(onSubmitProfile)} className="profile-form profileEdit">
                    <input
                        type="text"
                        placeholder="Имя"
                        {...registerProfile("first_name")}
                        className="form-input profileEdit"
                    />
                    {profileErrors.first_name && (
                        <p className="form-error profileEdit">
                            {profileErrors.first_name.message}
                        </p>
                    )}
                    <input
                        type="text"
                        placeholder="Фамилия"
                        {...registerProfile("last_name")}
                        className="form-input profileEdit"
                    />
                    {profileErrors.last_name && (
                        <p className="form-error profileEdit">
                            {profileErrors.last_name.message}
                        </p>
                    )}
                    <input
                        type="text"
                        placeholder="Отчество"
                        {...registerProfile("patronymic")}
                        className="form-input profileEdit"
                    />
                    {profileErrors.patronymic && (
                        <p className="form-error profileEdit">
                            {profileErrors.patronymic.message}
                        </p>
                    )}
                    <input
                        type="email"
                        placeholder="Почта"
                        {...registerProfile("email")}
                        className="form-input profileEdit"
                    />
                    {profileErrors.email && (
                        <p className="form-error profileEdit">
                            {profileErrors.email.message}
                        </p>
                    )}
                    <input
                        type="tel"
                        placeholder="Телефон"
                        {...registerProfile("phone")}
                        className="form-input profileEdit"
                    />
                    {profileErrors.phone && (
                        <p className="form-error profileEdit">
                            {profileErrors.phone.message}
                        </p>
                    )}
                    <div className="button-group profileEdit">
                        <button
                            type="button"
                            className="submit-btn profileEdit"
                            onClick={handleClose}
                        >
                            Отмена
                        </button>
                        <button type="submit" className="submit-btn save-btn profileEdit">
                            Сохранить
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProfileEditModal;