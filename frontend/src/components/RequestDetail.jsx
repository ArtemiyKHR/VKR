import React, { useState, useEffect } from "react";
import "../styles/RequestDetail.css";

const statusMapEnToRu = {
    pending: 'Ожидание',
    accepted: 'Принят в работу',
    completed: 'Завершено',
    rejected: 'Отклонено',
    assigned: 'Назначено',
    done: 'Выполнено'
};

const RequestDetail = ({ request, onClose, onSubmitComment }) => {
    const [commentText, setCommentText] = useState("");
    const [comments, setComments] = useState([]);
    const [showCommentInput, setShowCommentInput] = useState(false);
    const token = localStorage.getItem("token");

    useEffect(() => {
        const fetchComments = async () => {
            try {
                const response = await fetch(`http://localhost:5000/api/comments?request_id=${request.id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (!response.ok) throw new Error("Ошибка загрузки комментариев");
                const data = await response.json();
                setComments(data);
            } catch (error) {
                console.error("Ошибка загрузки комментариев:", error.message);
            }
        };
        if (request) fetchComments();
    }, [request, token]);

    const handleCommentSubmit = (e) => {
        e.preventDefault();
        if (commentText.trim()) {
            onSubmitComment(commentText);
            setCommentText("");
            setShowCommentInput(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <h2>Обращение #{request.id}</h2>
                    <button className="close-btn" onClick={onClose}>
                        ×
                    </button>
                </div>
                <div className="request-detail">
                    <label>Имя</label>
                    <input value={request.title || ""} readOnly className="detail-input" />
                    <label>Описание</label>
                    <textarea value={request.description || ""} readOnly className="detail-input textarea" />
                    <label>Тип оборудования</label>
                    <input value={request.equipment_type || request.equipment_type || ""} readOnly className="detail-input" />
                    <label>Вид ремонта</label>
                    <input value={request.repair_type || ""} readOnly className="detail-input" />
                    <label>Контактное лицо</label>
                    <input value={request.contact_person || ""} readOnly className="detail-input" />
                    <label>Телефон</label>
                    <input value={request.phone || ""} readOnly className="detail-input" />
                    <label>Исполнитель</label>
                    <input value={request.executor_name || "Не назначен"} readOnly className="detail-input" />
                    <label>Статус</label>
                    <input value={statusMapEnToRu[request.status] || request.status || ""} readOnly className="detail-input" />

                    <div className="comments-section">
                        <h4>Комментарии</h4>
                        <ul className="comments-list">
                            {comments.length > 0 ? (
                                comments.map((comment) => (
                                    <li key={comment.id} className="comment-item">
                                        <strong>{comment.full_name}</strong>: {comment.message} ({new Date(comment.created_at).toLocaleString()})
                                    </li>
                                ))
                            ) : (
                                <li className="comment-item">Комментариев нет</li>
                            )}
                        </ul>
                        <div className="buttons-container">
                            {!showCommentInput && (
                                <button className="add-comment-btn" onClick={() => setShowCommentInput(true)}>
                                    + Добавить комментарий
                                </button>
                            )}
                            {showCommentInput && (
                                <form onSubmit={handleCommentSubmit} className="comment-form">
                                    <textarea
                                        value={commentText}
                                        onChange={(e) => setCommentText(e.target.value)}
                                        placeholder="Введите комментарий..."
                                        className="comment-input"
                                    />
                                    <button type="submit" className="comment-btn" style={{ marginBottom:"10px" }}>
                                        Отправить
                                    </button>
                                    <button className="save-btn reqst" onClick={onClose}>
                                        Закрыть
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RequestDetail;