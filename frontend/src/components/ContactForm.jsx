import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { contactFormSchema } from '../shema';

const ContactForm = () => {
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        reset,
    } = useForm({
        resolver: zodResolver(contactFormSchema),
    });

    const onSubmit = async (data) => {
        try {

            await fetch('http://localhost:5000/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });


            alert('Сообщение успешно отправлено!');
            reset();
        } catch (error) {
            alert('Ошибка при отправке сообщения.');
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="contact-Form">
            <div className="form-group">
                <label htmlFor="name">Ваше имя:</label>
                <input id="name" {...register('name')} placeholder="Введите ваше имя" />
                {errors.name && <span className="error">{errors.name.message}</span>}
            </div>

            <div className="form-group">
                <label htmlFor="email">Почта:</label>
                <input
                    id="email"
                    {...register('email')}
                    placeholder="Введите вашу электронную почту"
                />
                {errors.email && <span className="error">{errors.email.message}</span>}
            </div>

            <div className="form-group">
                <label htmlFor="message">Сообщение:</label>
                <textarea
                    id="message"
                    {...register('message')}
                    placeholder="Напишите ваше сообщение"
                ></textarea>
                {errors.message && <span className="error">{errors.message.message}</span>}
            </div>

            <button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Отправка...' : 'Отправить'}
            </button>
        </form>
    );
};

export default ContactForm;