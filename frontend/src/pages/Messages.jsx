import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ProfileNavbar from "../components/ProfileNavbar";
import "../styles/Messages.css";

const Messages = () => {
    const [messages, setMessages] = useState([]);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchMessages = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) {
                    throw new Error("Токен не найден");
                }

                const response = await fetch("http://localhost:5000/api/messages", {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || "Ошибка загрузки запросов");
                }

                const data = await response.json();
                setMessages(data);
            } catch (err) {
                console.error("Ошибка загрузки сообщений:", err);
                setError(err.message);
                if (err.message.includes("Доступ запрещён") || err.message.includes("Токен")) {
                    localStorage.removeItem("token");
                    localStorage.removeItem("user");
                    navigate("/");
                }
            }
        };

        fetchMessages();
    }, [navigate]);

    const handleDelete = async (id) => {
        if (!window.confirm("Вы уверены, что хотите удалить данное сообщение?")) return;

        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`http://localhost:5000/api/messages/${id}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Ошибка удаления сообщения");
            }

            setMessages(messages.filter((msg) => msg.id !== id));
        } catch (err) {
            console.error("Ошибка удаления:", err);
            setError(err.message);
        }
    };

    if (error) {
        return (
            <>
                <ProfileNavbar />
                <div className="messages-page">
                    <p className="error-message">{error}</p>
                </div>
            </>
        );
    }

    return (
        <>
            <ProfileNavbar />
            <div className="messages-page">
                <h2>Сообщения</h2>
                {messages.length === 0 ? (
                    <p>Нет сообщений</p>
                ) : (
                    <table className="messages-table">
                        <thead>
                        <tr>
                            <th>ID</th>
                            <th>Имя</th>
                            <th>Email</th>
                            <th>Сообщение</th>
                            <th>Создано</th>
                            <th>Действия</th>
                        </tr>
                        </thead>
                        <tbody>
                        {messages.map((msg) => (
                            <tr key={msg.id}>
                                <td>{msg.id}</td>
                                <td>{msg.name}</td>
                                <td>{msg.email}</td>
                                <td>{msg.message}</td>
                                <td>{new Date(msg.created_at).toLocaleString('ru-RU')}</td>
                                <td>
                                    <button
                                        className="delete-button"
                                        onClick={() => handleDelete(msg.id)}
                                    >
                                        Удалить
                                    </button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                )}
            </div>
        </>
    );
};

export default Messages;