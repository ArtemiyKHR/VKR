import React, { useState } from "react";
import logo from "../assets/computer.png";
import "../styles/Navbar.css";
import { Link as ScrollLink } from "react-scroll";
import { useNavigate, Link } from "react-router-dom";
import AuthModal from "./AuthModal";

const Navbar = () => {
    const [showModal, setShowModal] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem("user"));

    const handleLoginSuccess = () => {
        setShowModal(false);
        navigate("/profile");
    };

    const handleRegisterSuccess = () => {
        setShowModal(false);
        navigate("/profile");
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/");
        setIsMenuOpen(false);
    };

    const openAuthModal = () => {
        setShowModal(true);
        setIsMenuOpen(false);
    };

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    return (
        <nav className="navbar">
            <div className="logo-container">
                <ScrollLink
                    smooth
                    duration={500}
                    offset={-80}
                    to="main"
                    className="logo-link"
                    onClick={() => setIsMenuOpen(false)}
                >
                    <img src={logo} alt="СервисТех" className="logo-img" />
                    <span className="logo-text">СервисТех</span>
                </ScrollLink>
            </div>

            <ul className={`nav-links ${isMenuOpen ? "active" : ""}`}>
                <li>
                    <ScrollLink
                        to="main"
                        smooth
                        duration={500}
                        offset={-80}
                        className="nav-btn"
                        onClick={toggleMenu}
                    >
                        Главная
                    </ScrollLink>
                </li>
                <li>
                    <ScrollLink
                        to="services"
                        smooth
                        duration={500}
                        offset={-80}
                        className="nav-btn"
                        onClick={toggleMenu}
                    >
                        Услуги
                    </ScrollLink>
                </li>
                <li>
                    <ScrollLink
                        to="about"
                        smooth
                        duration={500}
                        offset={-80}
                        className="nav-btn"
                        onClick={toggleMenu}
                    >
                        О нас
                    </ScrollLink>
                </li>
                <li>
                    <ScrollLink
                        to="contacts"
                        smooth
                        duration={500}
                        offset={-80}
                        className="nav-btn"
                        onClick={toggleMenu}
                    >
                        Контакты
                    </ScrollLink>
                </li>
            </ul>

            <ul className={`nav-btns ${isMenuOpen ? "active" : ""}`}>
                {user ? (
                    <>
                        <li>
                            <Link
                                to="/profile"
                                className="nav-btn user-name"
                                onClick={toggleMenu}
                            >
                                {user.first_name} {user.last_name}
                            </Link>
                        </li>
                        <li>
                            <button onClick={handleLogout} className="nav-btn">
                                Выход
                            </button>
                        </li>
                    </>
                ) : (
                    <li>
                        <button onClick={openAuthModal} className="nav-btn">
                            Вход
                        </button>
                    </li>
                )}
            </ul>

            <div
                className={`burger-menu ${isMenuOpen ? "active" : ""}`}
                onClick={toggleMenu}
            >
                <span></span>
                <span></span>
                <span></span>
            </div>

            {showModal && (
                <AuthModal
                    onClose={() => setShowModal(false)}
                    onLoginSuccess={handleLoginSuccess}
                    onRegisterSuccess={handleRegisterSuccess}
                />
            )}
        </nav>
    );
};

export default Navbar;