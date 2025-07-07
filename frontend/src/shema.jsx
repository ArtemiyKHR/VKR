import { z } from 'zod';

export const contactFormSchema = z.object({
    name: z.string().min(2, 'Имя должно содержать минимум 2 символа'),
    email: z.string().email('Введите корректный email адрес'),
    message: z.string().min(10, 'Сообщение должно содержать минимум 10 символов'),
});

export const loginSchema = z.object({
    email: z.string().email('Введите корректный email'),
    password: z.string().min(6, 'Пароль должен быть не менее 6 символов'),
});

export const registerSchema = z.object({
    firstName: z.string().min(2, 'Имя должно содержать минимум 2 символа'),
    lastName: z.string().min(2, 'Фамилия должна содержать минимум 2 символа'),
    patronymic: z.string().min(2, 'Отчество должно содержать минимум 2 символа'),
    phone: z.string().regex(/^\+?\d{10,15}$/, 'Введите корректный номер телефона'),
    email: z.string().email('Введите корректный email'),
    password: z.string().min(6, 'Пароль должен быть не менее 6 символов'),
});

export const profileSchema = z.object({
    first_name: z.string().min(1, "Введите имя"),
    last_name: z.string().min(1, "Введите фамилию"),
    patronymic: z.string().optional(),
    email: z.string().email("Введите корректный email"),
    phone: z.string().min(10, "Введите корректный телефон"),
});

export const passwordSchema = z
    .object({
        currentPassword: z.string().min(1, "Введите текущий пароль"),
        newPassword: z.string().min(6, "Новый пароль должен содержать минимум 6 символов"),
        confirmPassword: z.string().min(6, "Подтвердите новый пароль"),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
        message: "Пароли не совпадают",
        path: ["confirmPassword"],
    });