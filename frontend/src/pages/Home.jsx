import React from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

import "../styles/imports";

import { Element } from "react-scroll";
import { ReactComponent as WindowsIcon } from '../assets/Icons/windows8.svg';
import { ReactComponent as CleaningIcon } from '../assets/Icons/cleaning_services.svg';
import { ReactComponent as RepairIcon } from '../assets/Icons/tools.svg';

import { images } from '../imports';
import ContactForm from "../components/ContactForm";
import AboutImage from "../components/AboutImage";
import StatsGrid from "../components/StatsGrid";


const Home = () => {
    return (
        <div className="container">
            <main>
                <Navbar />
                <Element name="main" className="homepage">
                    <div className="header">
                        <h1>СервисТех — умные решения для ремонта техники</h1>
                        <p>Онлайн-запись, подбор мастера и отслеживание статуса заявки — всё в одном сервисе</p>
                    </div>
                </Element>

                <Element name="services" className="section services">
                    <h2>Предоставляемые услуги</h2>
                    <p>
                        Ниже приведен список популярных услуг, которые мы предоставляем. Если не нашли нужное — напишите нам, поможем разобраться.
                    </p>
                    <div className="service-cards">

                        <div className="service-card">
                            <WindowsIcon className="service-icon" />
                            <h3>Обслуживание и настройка техники</h3>
                            <p>
                                Установка Windows, драйверов, настройка программ, интернета и принтеров. Удаление вирусов, оптимизация работы системы.
                            </p>
                        </div>

                        <div className="service-card">
                            <RepairIcon className="service-icon" />
                            <h3>Ремонт и замена комплектующих</h3>
                            <p>
                                Ремонт принтеров, ноутбуков и ПК, замена комплектующих — экранов, клавиатур, жёстких дисков, видеокарт и др. Работаем с техникой всех брендов.
                            </p>
                        </div>

                        <div className="service-card">
                            <CleaningIcon className="service-icon" />
                            <h3>Чистка и диагностика</h3>
                            <p>
                                Диагностика неисправностей, профессиональная чистка системы охлаждения, замена термопасты.
                            </p>
                        </div>
                    </div>
                </Element>

                <Element name="about" className="section about-us">
                    <div className="about-content">
                        <div className="about-text">
                            <h2>Мы — СервисТех</h2>
                            <p>
                                СервисТех — молодая команда специалистов по ремонту компьютерной техники.
                            </p>
                            <p>
                                Мы начали свою работу в 2024 году, объединив опыт и стремление сделать сервис проще и понятнее для людей.
                            </p>
                            <p>
                                Наша цель — не просто ремонтировать устройства, а выстроить удобную, честную и цифровую систему взаимодействия с клиентами.
                            </p>
                        </div>
                            <AboutImage src={images.aboutus} alt="Техник работает над ноутбуком" />
                    </div>

                <div className="statistics">
                    <StatsGrid />
                    </div>

                <div className="masters">
                    <h2>Наши мастера</h2>
                    <div className="master-cards">

                        <div className="master-card">
                            <img src={images.master1} alt="Андрей" />
                            <div className="master-card-textblock">
                                <h3>Алексей</h3>
                                <p className="specialization">
                                    Специальность: системные блоки, апгрейд, сложный ремонт
                                </p>
                                <p className="experience">
                                    Опыт: более 6 лет
                                </p>
                                <p className="quote">
                                    Кредо: "Люблю находить решения даже в самых сложных ситуациях."
                                </p>
                            </div>
                        </div>

                        <div className="master-card">
                            <img src={images.master2} alt="Андрей" />
                            <div className="master-card-textblock">
                                <h3>Андрей</h3>
                                <p className="specialization">
                                    Специальность: апгрейд техники, восстановление после повреждений, обслуживание сложного оборудования
                                </p>
                                <p className="experience">
                                    Опыт: 7 лет
                                </p>
                                <p className="quote">
                                    Кредо: "В работе я руководствуюсь профессионализмом и честностью."
                                </p>
                            </div>
                        </div>

                        <div className="master-card">
                            <img src={images.master3} alt="Андрей" />
                            <div className="master-card-textblock">
                                <h3>Дмитрий</h3>
                                <p className="specialization">
                                    Специальность: сборка системных блоков, диагностика неисправностей, устранение аппаратных проблем
                                </p>
                                <p className="experience">
                                    Опыт: 3 года
                                </p>
                                <p className="quote">
                                    Кредо: "Главное — внимание к деталям и доверие клиента."
                                </p>
                            </div>

                        </div>
                    </div>
                </div>
                </Element>

                <Element name="contacts" className="section">
                    <div className="contact-section">
                        <div className="contact-info">
                            <h2>Свяжитесь с нами</h2>
                            <p>Мы всегда готовы помочь — по телефону, в мессенджерах или лично.</p>
                            <div className="contact-details">
                                <div className="contact-item phone">
                                    <a href="tel:+79937799265">
                                        +7 993 779 92 65
                                    </a>
                                </div>

                                <div className="contact-item email">
                                    <a href="mailto:example@yandex.ru">
                                        example@yandex.ru
                                    </a>
                                </div>

                                <div className="contact-item location">
                                    <a
                                        rel="noopener noreferrer"
                                        href="https://yandex.ru/maps/193/voronezh/?ll=39.183199%2C51.672060&z=14.8"
                                        target="_blank"
                                    >
                                        г. Воронеж, ул. Центральная, д.199
                                    </a>
                                </div>
                            </div>
                        </div>
                        <div className="contact-form">
                            <ContactForm />
                        </div>
                    </div>
                </Element>
            <Footer />
            </main>
        </div>
    );
};

export default Home;
