import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/ProfileNavbar";
import RequestDetail from "../components/RequestDetail";
import "../styles/Applications.css";

const statusMapEnToRu = {
    pending: 'Ожидание',
    accepted: 'Принят в работу',
    completed: 'Завершено',
    rejected: 'Отклонено',
    assigned: 'Назначено',
    done: 'Выполнено'
};

const Applications = () => {
    const navigate = useNavigate();
    const [requests, setRequests] = useState([]);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [selectedRequestForDetail, setSelectedRequestForDetail] = useState(null);
    const [selectedRequestForUpdate, setSelectedRequestForUpdate] = useState(null);
    const [searchError, setSearchError] = useState(null);
    const [filterType, setFilterType] = useState("id"); // Default filter
    const [filterValue, setFilterValue] = useState("");
    const [showFilterDropdown, setShowFilterDropdown] = useState(false);
    const [masters, setMasters] = useState([]); // State for masters
    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
        setValue,
    } = useForm();

    useEffect(() => {
        const fetchRequests = async () => {
            const token = localStorage.getItem("token");
            if (!token) {
                navigate("/");
                return;
            }
            try {
                const response = await fetch("http://localhost:5000/api/user/requests", {
                    headers: { Authorization: `Bearer ${token}` },
                });
                console.log("Статус ответа:", response.status);
                if (response.status === 401) {
                    const refreshResponse = await fetch("http://localhost:5000/api/refresh", {
                        method: "POST",
                        headers: { Authorization: `Bearer ${token}` },
                    });
                    if (refreshResponse.ok) {
                        const { token: newToken } = await refreshResponse.json();
                        localStorage.setItem("token", newToken);
                        const userResponse = await fetch("http://localhost:5000/api/user", {
                            headers: { Authorization: `Bearer ${newToken}` },
                        });
                        if (userResponse.ok) {
                            const userData = await userResponse.json();
                            localStorage.setItem("user", JSON.stringify(userData));
                        }
                    } else {
                        navigate("/");
                        return;
                    }
                }
                if (!response.ok) throw new Error("Ошибка загрузки запросов");
                const data = await response.json();
                const user = JSON.parse(localStorage.getItem("user"));
                if (user?.role === "admin" && data.length === 0) {
                    const allResponse = await fetch("http://localhost:5000/api/requests", {
                        headers: { Authorization: `Bearer ${token}` },
                    });
                    if (allResponse.ok) {
                        const allData = await allResponse.json();
                        setRequests(allData);
                    }
                } else {
                    setRequests(data);
                }
            } catch (error) {
                console.error("Ошибка загрузки запросов:", error.message);
                if (error.message.includes("401")) navigate("/");
            }
        };

        const fetchMasters = async () => {
            const token = localStorage.getItem("token");
            if (!token) return;
            try {
                const response = await fetch("http://localhost:5000/api/users/masters", {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (!response.ok) throw new Error("Ошибка получения мастеров");
                const data = await response.json();
                setMasters(data);
            } catch (error) {
                console.error("Ошибка получения мастеров:", error.message);
            }
        };

        fetchRequests();
        fetchMasters();
    }, [navigate]);

    const onSubmitCreate = async (data) => {
        const token = localStorage.getItem("token");
        const user = JSON.parse(localStorage.getItem("user"));
        const contactPerson = `${user.first_name} ${user.last_name} ${user.patronymic || ""}`.trim();
        try {
            const response = await fetch("http://localhost:5000/api/requests", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    title: data.name,
                    description: data.description,
                    equipment_type: data.equipmentType,
                    contact_person: contactPerson,
                    phone: user.phone || "",
                    repair_type: data.repairType,
                }),
            });

            if (response.status === 401) {
                const refreshResponse = await fetch("http://localhost:5000/api/refresh", {
                    method: "POST",
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (refreshResponse.ok) {
                    const { token: newToken } = await refreshResponse.json();
                    localStorage.setItem("token", newToken);
                    const retryResponse = await fetch("http://localhost:5000/api/requests", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${newToken}`,
                        },
                        body: JSON.stringify({
                            title: data.name,
                            description: data.description,
                            equipment_type: data.equipmentType,
                            contact_person: contactPerson,
                            phone: user.phone || "",
                            repair_type: data.repairType,
                        }),
                    });
                    if (!retryResponse.ok) throw new Error("Ошибка создания запроса");
                } else {
                    throw new Error("Обновление токена прервано");
                }
            }

            if (!response.ok) {
                throw new Error("Ошибка загрузки запроса");
            }

            alert("Заявка успешно создана!");
            setIsCreateModalOpen(false);
            reset();
            const updatedResponse = await fetch("http://localhost:5000/api/user/requests", {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            });
            if (updatedResponse.ok) {
                const updatedData = await updatedResponse.json();
                setRequests(updatedData);
            }
        } catch (error) {
            console.error("Ошибка создания запроса:", error.message);
            if (error.message.includes("401")) navigate("/");
            else alert(error.message);
        }
    };

    const onSubmitUpdate = async (data) => {
        const token = localStorage.getItem("token");
        try {
            const response = await fetch(`http://localhost:5000/api/requests/${selectedRequestForUpdate.id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    status: data.status,
                    executor_id: data.executor_id ? parseInt(data.executor_id) : null,
                }),
            });

            if (response.status === 401) {
                const refreshResponse = await fetch("http://localhost:5000/api/refresh", {
                    method: "POST",
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (refreshResponse.ok) {
                    const { token: newToken } = await refreshResponse.json();
                    localStorage.setItem("token", newToken);
                    const retryResponse = await fetch(`http://localhost:5000/api/requests/${selectedRequestForUpdate.id}`, {
                        method: "PATCH",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${newToken}`,
                        },
                        body: JSON.stringify({
                            status: data.status,
                            executor_id: data.executor_id ? parseInt(data.executor_id) : null,
                        }),
                    });
                    if (!retryResponse.ok) {
                        const errorData = await retryResponse.json();
                        throw new Error(errorData.error || "Ошибка обновления запроса");
                    }
                } else {
                    throw new Error("Ошибка обновления токена");
                }
            }

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Ошибка обновления запроса");
            }

            alert("Заявка успешно обновлена!");
            setSelectedRequestForUpdate(null);
            const updatedResponse = await fetch("http://localhost:5000/api/user/requests", {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            });
            if (updatedResponse.ok) {
                const updatedData = await updatedResponse.json();
                setRequests(updatedData);
            }
        } catch (error) {
            console.error("Ошибка обновления запроса:", error.message);
            if (error.message.includes("401")) navigate("/");
            else alert(error.message);
        }
    };

    const onSubmitComment = async (message) => {
        const token = localStorage.getItem("token");
        const user = JSON.parse(localStorage.getItem("user"));
        const fullName = `${user.first_name} ${user.last_name} ${user.patronymic || ""}`.trim();
        try {
            const response = await fetch("http://localhost:5000/api/comments", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    request_id: selectedRequestForDetail.id,
                    message,
                    full_name: fullName,
                }),
            });

            if (response.status === 401) {
                const refreshResponse = await fetch("http://localhost:5000/api/refresh", {
                    method: "POST",
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (refreshResponse.ok) {
                    const { token: newToken } = await refreshResponse.json();
                    localStorage.setItem("token", newToken);
                    const retryResponse = await fetch("http://localhost:5000/api/comments", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${newToken}`,
                        },
                        body: JSON.stringify({
                            request_id: selectedRequestForDetail.id,
                            message,
                            full_name: fullName,
                        }),
                    });
                    if (!retryResponse.ok) throw new Error("Ошибка добавления комментария");
                } else {
                    throw new Error("Ошибка обновления токена");
                }
            }

            if (!response.ok) throw new Error("Ошибка добавления комментария");

            alert("Добавление комментария успешно!");
            setSelectedRequestForDetail({ ...selectedRequestForDetail });
        } catch (error) {
            console.error("Ошибка добавления комментария:", error.message);
            if (error.message.includes("401")) navigate("/");
            else alert(error.message);
        }
    };

    const user = JSON.parse(localStorage.getItem("user"));
    console.log("Роль пользователя:", user?.role);
    const isAdminOrMaster = user && ["admin", "master"].includes(user.role);

    const openRequestDetail = (request) => {
        setSelectedRequestForDetail(request);
    };

    const closeRequestDetail = () => {
        setSelectedRequestForDetail(null);
    };

    const handleSearch = async () => {
        if (!filterValue && filterType !== "date_asc" && filterType !== "date_desc") {
            setSearchError("Пожалуйста, введите фильтр");
            return;
        }
        const token = localStorage.getItem("token");
        try {
            const response = await fetch("http://localhost:5000/api/user/requests/filter", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ filterType, filterValue }),
            });
            console.log("Ответ фильтрации:", response.status);
            if (response.status === 401) {
                const refreshResponse = await fetch("http://localhost:5000/api/refresh", {
                    method: "POST",
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (refreshResponse.ok) {
                    const { token: newToken } = await refreshResponse.json();
                    localStorage.setItem("token", newToken);
                    const retryResponse = await fetch("http://localhost:5000/api/user/requests/filter", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${newToken}`,
                        },
                        body: JSON.stringify({ filterType, filterValue }),
                    });
                    if (!retryResponse.ok) throw new Error("Ошибка фильтрации");
                    const data = await retryResponse.json();
                    setRequests(data);
                } else {
                    throw new Error("Ошибка обновления токена");
                }
            }
            if (!response.ok) throw new Error("Фильтрация прервана");
            const data = await response.json();
            console.log("Отфильтрованные запросы:", data);
            setRequests(data);
            setSearchError(null);
        } catch (error) {
            console.error("Ошибка поиска:", error.message);
            setRequests([]);
            setSearchError(error.message);
        }
    };

    const handleResetSearch = async () => {
        setFilterValue("");
        setSearchError(null);
        const token = localStorage.getItem("token");
        try {
            const response = await fetch("http://localhost:5000/api/user/requests", {
                headers: { Authorization: `Bearer ${token}` },
            });
            console.log("Сброс запроса:", response.status);
            if (response.status === 401) {
                const refreshResponse = await fetch("http://localhost:5000/api/refresh", {
                    method: "POST",
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (refreshResponse.ok) {
                    const { token: newToken } = await refreshResponse.json();
                    localStorage.setItem("token", newToken);
                    const retryResponse = await fetch("http://localhost:5000/api/user/requests", {
                        headers: { Authorization: `Bearer ${newToken}` },
                    });
                    if (!retryResponse.ok) throw new Error("Ошибка загрузки запросов");
                    const data = await retryResponse.json();
                    setRequests(data);
                } else {
                    throw new Error("Ошибка обновления токена");
                }
            }
            if (!response.ok) throw new Error("Ошибка загрузки запросов");
            const data = await response.json();
            setRequests(data);
        } catch (error) {
            console.error("Ошибка обновления поиска:", error.message);
            if (error.message.includes("401")) navigate("/");
            else setSearchError(error.message);
        }
    };

    const applyFilter = () => {
        handleSearch();
    };

    useEffect(() => {
        if (selectedRequestForUpdate && masters.length > 0) {
            const currentExecutorId = selectedRequestForUpdate.executor_id;
            if (currentExecutorId) {
                setValue("executor_id", currentExecutorId.toString());
            } else {
                setValue("executor_id", "");
            }

            const currentStatus = statusMapEnToRu[selectedRequestForUpdate.status] || selectedRequestForUpdate.status || "";
            setValue("Статус", currentStatus);
        }
    }, [selectedRequestForUpdate, masters, setValue]);

    return (
        <>
            <Navbar />
            <div className="applications-page">
                <div className="applications-header">
                    <h1>Обращения</h1>
                    <div className="header-buttons">
                        <div className="filter-container">
                            <button className="filter-btn" onClick={() => setShowFilterDropdown(!showFilterDropdown)}>
                                Фильтровать
                            </button>
                            {showFilterDropdown && (
                                <div className="filter-dropdown">
                                    <button onClick={() => { setFilterType("date_asc"); setShowFilterDropdown(false); applyFilter(); }}>Дата (↑)</button>
                                    <button onClick={() => { setFilterType("date_desc"); setShowFilterDropdown(false); applyFilter(); }}>Дата (↓)</button>
                                    <button onClick={() => { setFilterType("name"); setShowFilterDropdown(false); applyFilter(); }}>Имя</button>
                                    <button onClick={() => { setFilterType("id"); setShowFilterDropdown(false); applyFilter(); }}>ID</button>
                                    <button onClick={() => { setFilterType("status"); setShowFilterDropdown(false); applyFilter(); }}>Статус</button>
                                    <button onClick={() => { setFilterType("executor_name"); setShowFilterDropdown(false); applyFilter(); }}>Исполнитель</button>
                                </div>
                            )}
                        </div>
                        <input
                            type="text"
                            value={filterValue}
                            onChange={(e) => setFilterValue(e.target.value)}
                            className="search-input"
                            placeholder={
                                filterType === "date_asc" || filterType === "date_desc"
                                    ? "По дате"
                                    : filterType === "name"
                                        ? "По названию"
                                        : filterType === "id"
                                            ? "По ID"
                                            : filterType === "status"
                                                ? "Введите статус: Ожидание, Принят в работу, Завершено и т.д."
                                                : filterType === "executor_name"
                                                    ? "По исполнителю"
                                                    : "Введите фильтр"
                            }
                            onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                        />
                        <button className="search-btn" onClick={handleSearch}>
                            Поиск
                        </button>
                        <button className="reset-btn" onClick={handleResetSearch}>
                            Сбросить поиск
                        </button>
                        <button className="create-btn" onClick={() => setIsCreateModalOpen(true)}>
                            Создать
                        </button>
                    </div>
                    {searchError && <p className="error">{searchError}</p>}
                </div>
                <div className="applications-table">
                    <table>
                        <thead>
                        <tr>
                            <th>ID</th>
                            <th>Название</th>
                            <th>Статус</th>
                            <th>Контактное лицо</th>
                            <th>Исполнитель</th>
                            <th>Создано</th>
                            {isAdminOrMaster && <th>Действия</th>}
                        </tr>
                        </thead>
                        <tbody>
                        {requests.length > 0 ? (
                            requests.map((request) => (
                                <tr
                                    key={request.id}
                                    onClick={() => openRequestDetail(request)}
                                    className="clickable-row"
                                >
                                    <td>{request.id}</td>
                                    <td>{request.title}</td>
                                    <td>{statusMapEnToRu[request.status] || request.status}</td>
                                    <td>{request.contact_person}</td>
                                    <td>{request.executor_name || "Не назначен"}</td>
                                    <td>{new Date(request.created_at).toLocaleString()}</td>
                                    {isAdminOrMaster && (
                                        <td>
                                            <button
                                                className="update-btn"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSelectedRequestForUpdate(request);
                                                }}
                                            >
                                                Обновить
                                            </button>
                                        </td>
                                    )}
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={isAdminOrMaster ? 7 : 6} className="empty-state">
                                    {searchError ? searchError : "Нету активных обращений"}
                                </td>
                            </tr>
                        )}
                        </tbody>
                    </table>
                </div>
                {isCreateModalOpen && (
                    <div className="modal-overlay">
                        <div className="modal-content create-update-modal">
                            <div className="modal-header">
                                <h2>Создать обращение</h2>
                                <button className="close-btn" onClick={() => setIsCreateModalOpen(false)}>
                                    ×
                                </button>
                            </div>
                            <form onSubmit={handleSubmit(onSubmitCreate)}>
                                <label>Заголовок</label>
                                <input
                                    {...register("name", { required: "Имя обязательно" })}
                                    className="modal-input"
                                />
                                {errors.name && <p className="error">{errors.name.message}</p>}

                                <label>Описание</label>
                                <textarea
                                    {...register("description", { required: "Описание обязательно" })}
                                    className="modal-input"
                                />
                                {errors.description && <p className="error">{errors.description.message}</p>}

                                <label>Тип оборудования</label>
                                <select
                                    {...register("equipmentType", { required: "Тип оборудования обязателен" })}
                                    className="modal-input"
                                >
                                    <option value="">Выберите тип оборудования</option>
                                    <option value="ПК">ПК</option>
                                    <option value="Ноутбук">Ноутбук</option>
                                    <option value="Принтер">Принтер</option>
                                    <option value="Телефон">Телефон</option>
                                    <option value="Планшет">Планшет</option>
                                </select>
                                {errors.equipmentType && <p className="error">{errors.equipmentType.message}</p>}

                                <label>Вид ремонта</label>
                                <select
                                    {...register("repairType", { required: "Вид ремонта обязателен" })}
                                    className="modal-input"
                                >
                                    <option value="">Выберите вид ремонта</option>
                                    <option value="Удалённо">Удалённо</option>
                                    <option value="Сервисный центр">Сервисный центр</option>
                                </select>
                                {errors.repairType && <p className="error">{errors.repairType.message}</p>}

                                <button type="submit" className="create-modal-btn">
                                    Создать
                                </button>
                            </form>
                        </div>
                    </div>
                )}
                {selectedRequestForUpdate && isAdminOrMaster && (
                    <div className="modal-overlay">
                        <div className="modal-content create-update-modal">
                            <div className="modal-header">
                                <h2>Обновление обращения #{selectedRequestForUpdate.id}</h2>
                                <button className="close-btn" onClick={() => setSelectedRequestForUpdate(null)}>
                                    ×
                                </button>
                            </div>
                            <form onSubmit={handleSubmit(onSubmitUpdate)}>
                                <label>Статус</label>
                                <select
                                    {...register("status", { required: "Статус обязателен" })}
                                    className="modal-input"
                                >
                                    <option value="">Выберите статус</option>
                                    <option value="Ожидание">Ожидание</option>
                                    <option value="Принят в работу">Принят в работу</option>
                                    <option value="Завершено">Завершено</option>
                                    <option value="Отклонено">Отклонено</option>
                                    <option value="Назначено">Назначено</option>
                                    <option value="Выполнено">Выполнено</option>
                                </select>
                                {errors.status && <p className="error">{errors.status.message}</p>}

                                <label>Исполнитель</label>
                                <select
                                    {...register("executor_id")}
                                    className="modal-input"
                                    defaultValue=""
                                >
                                    <option value="">Не назначен</option>
                                    {masters.map((master) => (
                                        <option key={master.id} value={master.id}>
                                            {master.name}
                                        </option>
                                    ))}
                                </select>

                                <button type="submit" className="create-modal-btn">
                                    Обновить
                                </button>
                            </form>
                        </div>
                    </div>
                )}
                {selectedRequestForDetail && <RequestDetail request={selectedRequestForDetail} onClose={closeRequestDetail} onSubmitComment={onSubmitComment} />}
            </div>
        </>
    );
};

export default Applications;