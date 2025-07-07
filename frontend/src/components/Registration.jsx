import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Login.css";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema } from "../shema";
import registerImage from "../assets/notebook.jpg";

const RegisterModal = ({ onClose, onSwitchToLogin, onRegisterSuccess, isClosing }) => {
    const navigate = useNavigate();
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(registerSchema),
    });

    const onSubmit = async (data) => {
        try {
            const payload = {
                first_name: data.firstName,
                last_name: data.lastName,
                patronymic: data.patronymic || null,
                phone: data.phone,
                email: data.email,
                password: data.password,
                role: 'user',
            };

            const response = await fetch('http://localhost:5000/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('Регистрация провалилась:', errorData);
                throw new Error(errorData.error || 'Ошибка регистрации');
            }

            const result = await response.json();
            console.log('Ответ регистрации:', result);

            localStorage.setItem('token', result.token);
            localStorage.setItem('user', JSON.stringify({
                id: result.id,
                first_name: result.first_name,
                last_name: result.last_name,
                patronymic: result.patronymic || "",
                email: result.email,
                phone: result.phone,
                role: result.role
            }));

            onRegisterSuccess();
            navigate('/profile');
        } catch (error) {
            console.error('Ошибка регистрации:', error);
            alert(error.message);
        }
    };

    useEffect(() => {
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = "auto";
        };
    }, []);

    return (
        <div className={`login-modal-overlay ${isClosing ? "fade-out" : "fade-in"}`} onClick={onClose}>
            <div className={`login-modal ${isClosing ? "popup-out" : "popup-in"}`} onClick={(e) => e.stopPropagation()}>
                <div className="login-left">
                    <img src={registerImage} alt="register visual" className="login-image" />
                    <button className="back-btn" onClick={onClose}>Вернуться назад →</button>
                </div>
                <div className="login-right">
                    <h2>Регистрация</h2>
                    <p>Есть аккаунт? <span className="link" onClick={onSwitchToLogin}>Вход</span></p>

                    <form onSubmit={handleSubmit(onSubmit)} className="login-form reg">
                        <div className="input-row">
                            <input
                                type="text"
                                placeholder="Имя"
                                {...register("firstName")}
                                className="form-input"
                            />
                            <input
                                type="text"
                                placeholder="Фамилия"
                                {...register("lastName")}
                                className="form-input"
                            />
                        </div>
                        {errors.firstName && <p className="form-error">{errors.firstName.message}</p>}
                        {errors.lastName && <p className="form-error">{errors.lastName.message}</p>}

                        <input
                            type="text"
                            placeholder="Отчество"
                            {...register("patronymic")}
                            className="form-input"
                        />
                        {errors.patronymic && <p className="form-error">{errors.patronymic.message}</p>}

                        <input
                            type="tel"
                            placeholder="Телефон"
                            {...register("phone")}
                            className="form-input"
                        />
                        {errors.phone && <p className="form-error">{errors.phone.message}</p>}

                        <input
                            type="email"
                            placeholder="Почта"
                            {...register("email")}
                            className="form-input"
                        />
                        {errors.email && <p className="form-error">{errors.email.message}</p>}

                        <input
                            type="password"
                            placeholder="Пароль"
                            {...register("password")}
                            className="form-input"
                        />
                        {errors.password && <p className="form-error">{errors.password.message}</p>}

                        <label className="agree-checkbox">
                            <input type="checkbox" defaultChecked {...register("agree")} />
                            <span className="custom-checkbox" />
                            Я соглашаюсь с политикой обработки персональных данных
                        </label>
                        {errors.agree && <p className="form-error">{errors.agree.message}</p>}

                        <button type="submit" className="submit-btn">Зарегистрироваться</button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default RegisterModal;