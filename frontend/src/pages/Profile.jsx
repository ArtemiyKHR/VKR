import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import {profileSchema} from "../shema";
import {passwordSchema} from "../shema";
import defaultImage from "../assets/defaultImage.png";
import "../styles/Profile.css";
import Navbar from "../components/ProfileNavbar";
import PasswordModal from "../components/PasswordModal";
import ProfileEditModal from "../components/ProfileEditModal";

const Profile = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const {
        register: registerProfile,
        handleSubmit: handleSubmitProfile,
        formState: { errors: profileErrors },
        reset: resetProfile,
        setValue: setValueProfile,
    } = useForm({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            first_name: "",
            last_name: "",
            patronymic: "",
            email: "",
            phone: "",
        },
    });
    const {
        register: registerPassword,
        handleSubmit: handleSubmitPassword,
        formState: { errors: passwordErrors },
        reset: resetPassword,
    } = useForm({
        resolver: zodResolver(passwordSchema),
    });

    useEffect(() => {
        const userData = JSON.parse(localStorage.getItem("user"));
        const token = localStorage.getItem("token");
        if (!userData || !token) {
            navigate("/");
            return;
        }
        setUser(userData);
        setValueProfile("first_name", userData.first_name || "");
        setValueProfile("last_name", userData.last_name || "");
        setValueProfile("patronymic", userData.patronymic || "");
        setValueProfile("email", userData.email || "");
        setValueProfile("phone", userData.phone || "");
    }, [navigate, setValueProfile]);

    const onSubmitProfile = async (data) => {

        try {
            const token = localStorage.getItem("token");
            const response = await fetch("http://localhost:5000/api/user", {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error("Ответ сервера:", errorText);
                const errorData = await response.json().catch(() => ({}));
                throw new Error(
                    errorData.error || "Ошибка обновления профиля" || errorText
                );
            }

            const updatedUser = await response.json();
            localStorage.setItem("user", JSON.stringify(updatedUser));
            setUser(updatedUser);
            setIsEditing(false);
            alert("Профиль успешно обновлён!");
            resetProfile(updatedUser);
        } catch (error) {
            console.error("Ошибка обновления профиля:", error.message);
            alert(error.message);
        }
    };

    const onSubmitPassword = async (data) => {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch("http://localhost:5000/api/user/password", {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    currentPassword: data.currentPassword,
                    newPassword: data.newPassword,
                }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error("Ответ сервера:", errorText);
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || "Ошибка обновления пароля!" || errorText);
            }

            alert("Пароль успешно обновлён!");
            setIsChangingPassword(false);
            resetPassword();
        } catch (error) {
            console.error("Ошибка обновления пароля:", error.message);
            alert(error.message);
        }
    };

    if (!user) return null;

    return (
        <>
            <Navbar />
            <div className="profile-page">
                <div className="profile-card">
                    <div className="profile-image-container">
                        <div className="profile-image">
                            <img
                                src={defaultImage}
                                alt="Фото по умолчанию"
                                className="profile-image-img"
                            />
                        </div>
                        {!isEditing && (
                            <div className="profile-name">
                                <p>{`${user.first_name} ${user.last_name} ${
                                    user.patronymic || ""
                                }`.trim()}</p>
                            </div>
                        )}
                    </div>
                    {!isEditing && (
                        <div className="profile-info">
                            <h2>Профиль</h2>
                            <div className="info-columns">
                                <div className="info-labels">
                                    <p>Почта</p>
                                    <p>Телефон</p>
                                    <p>Пароль</p>
                                </div>
                                <div className="info-values">
                                    <p>{user.email}</p>
                                    <p>{user.phone || "Not provided"}</p>
                                    <p>
                                        <span
                                            className="change-link"
                                            onClick={() => setIsChangingPassword(true)}
                                        >
                                            Изменить
                                        </span>
                                    </p>
                                </div>
                            </div>
                            <button
                                className="edit-btn"
                                onClick={() => setIsEditing(true)}
                            >
                                Редактировать
                            </button>
                        </div>
                    )}
                    {isEditing && (
                        <ProfileEditModal
                            handleSubmitProfile={handleSubmitProfile}
                            onSubmitProfile={onSubmitProfile}
                            registerProfile={registerProfile}
                            profileErrors={profileErrors}
                            setIsEditing={setIsEditing}
                        />
                    )}
                    {isChangingPassword && (
                        <PasswordModal
                            handleSubmitPassword={handleSubmitPassword}
                            onSubmitPassword={onSubmitPassword}
                            registerPassword={registerPassword}
                            passwordErrors={passwordErrors}
                            setIsChangingPassword={setIsChangingPassword}
                            resetPassword={resetPassword}
                        />
                    )}
                </div>
            </div>
        </>
    );
};

export default Profile;