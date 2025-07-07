import React from 'react';
import "../styles/Footer.css";
import logo from "../assets/computer.png";
import { Link } from "react-scroll";

const Footer = () => {
    return (
        <footer className="footer">
            <div className="container">
                <div className="top-sections">
                    <div className="left-section">
                        <div className="logoFooter">
                            <img src={logo} alt="Логотип СервисТех" className="logo" />
                            <h2>СервисТех</h2>
                        </div>
                        <p>
                            Строим новый стандарт в ремонте техники — от традиционных процессов к умной,
                            быстрой и открытой системе обслуживания
                        </p>
                    </div>

                    <div className="middle-section">
                        <ul>
                            <li><Link to="main" smooth={true} duration={500} offset={-80}>Главная</Link></li>
                            <li><Link to="services" smooth={true} duration={500} offset={-80}>Услуги</Link></li>
                            <li><Link to="about" smooth={true} duration={500} offset={-80}>О нас</Link></li>
                            <li><Link to="contacts" smooth={true} duration={500} offset={-80}>Контакты</Link></li>
                        </ul>
                    </div>

                    <div className="right-section">
                        <ul>
                            <li><Link to="/login">Войти</Link></li>
                            <li><Link to="/register">Регистрация</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="bottom-section">
                    <hr />
                    <p>
                        © Copyright 2025 <a href="https://serviceteh.ru">serviceteh.ru</a>,  Все права защищены.
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;