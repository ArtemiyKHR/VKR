import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/computer.png";
import "../styles/Navbar.css";

const ProfileNavbar = () => {
    const [showDropdown, setShowDropdown] = useState(false);
    const [isClosing, setIsClosing] = useState(false);
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem("user"));

    const handleToggleDropdown = () => {
        if (showDropdown) {
            setIsClosing(true);
            setTimeout(() => {
                setShowDropdown(false);
                setIsClosing(false);
            }, 300);
        } else {
            setShowDropdown(true);
        }
    };

    const handleLogout = () => {
        setIsClosing(true);
        setTimeout(() => {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            navigate("/");
            setShowDropdown(false);
            setIsClosing(false);
        }, 300);
    };

    const handleNavigation = (path) => {
        setIsClosing(true);
        setTimeout(() => {
            navigate(path);
            setShowDropdown(false);
            setIsClosing(false);
        }, 300);
    };

    return (
        <nav className="navbar profileNavbar">
            <div className="logo-container">
                <Link to="/" className="logo-link">
                    <img src={logo} alt="СервисТех" className="logo-img" />
                    <span className="logo-text">СервисТех</span>
                </Link>
            </div>

            <ul className="nav-btns">
                {user && (
                    <li className="nav-dropdown">
                        <button
                            onClick={handleToggleDropdown}
                            className="nav-btn user-name"
                        >
                            {user.first_name} {user.last_name}
                        </button>
                        {showDropdown && (
                            <ul className={`dropdown-menu ${isClosing ? "dropdown-closing" : "dropdown-opening"}`}>
                                <li>
                                    <button
                                        onClick={() => handleNavigation("/")}
                                        className="dropdown-item"
                                    >
                                        Главная
                                    </button>
                                </li>
                                <li>
                                    <button
                                        onClick={() => handleNavigation("/profile")}
                                        className="dropdown-item"
                                    >
                                        Профиль
                                    </button>
                                </li>
                                <li>
                                    <button
                                        onClick={() => handleNavigation("/applications")}
                                        className="dropdown-item"
                                    >
                                        Заявки
                                    </button>
                                </li>
                                {user.role === 'admin' && (
                                    <li>
                                        <button
                                            onClick={() => handleNavigation("/messages")}
                                            className="dropdown-item"
                                        >
                                            Сообщения
                                        </button>
                                    </li>
                                )}
                                <li>
                                    <button
                                        onClick={handleLogout}
                                        className="dropdown-item"
                                    >
                                        Выход
                                    </button>
                                </li>
                            </ul>
                        )}
                    </li>
                )}
            </ul>
        </nav>
    );
};

export default ProfileNavbar;