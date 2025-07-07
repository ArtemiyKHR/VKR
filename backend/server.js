require('dotenv').config();
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const { pool } = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET;

const statusMapRuToEn = {
    'ожидание': 'pending',
    'принят в работу': 'accepted',
    'завершено': 'completed',
    'отклонено': 'rejected',
    'назначено': 'assigned',
    'выполнено': 'done'
};

app.use(cors({
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Доступ запрещён' });

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            console.error('Ошибка проверки токена!:', err);
            if (err.name === 'TokenExpiredError') {
                return res.status(401).json({ error: 'Токен просрочен, обновите профиль или перезайдите в аккаунт!' });
            }
            return res.status(403).json({ error: 'Неверный токен' });
        }
        req.user = user;
        next();
    });
};

app.post('/api/contact', async (req, res) => {
    const { name, email, message } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO Messages (name, email, message) VALUES ($1, $2, $3) RETURNING *',
            [name, email, message]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Contact error:', error);
        res.status(500).json({ error: 'Ошибка отправки сообщения' });
    }
});

app.get('/api/messages', authenticateToken, async (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Доступ запрещён' });
    }
    try {
        const result = await pool.query('SELECT * FROM Messages ORDER BY id DESC');
        res.json(result.rows);
    } catch (error) {
        console.error('Ошибка сообщения:', error);
        res.status(500).json({ error: 'Ошибка в получении сообщения' });
    }
});

app.delete('/api/messages/:id', authenticateToken, async (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Доступ запрещён' });
    }
    const { id } = req.params;
    try {
        const result = await pool.query('DELETE FROM Messages WHERE id = $1 RETURNING *', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Сообщение не найдено' });
        }
        res.json({ message: 'Сообщение успешно удалено!' });
    } catch (error) {
        console.error('Ошибка удаления сообщения:', error);
        res.status(500).json({ error: 'Ошибка в удалении сообщения' });
    }
});

app.post('/api/register', async (req, res) => {
    const { first_name, last_name, patronymic, phone, email, password } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const result = await pool.query(
            'INSERT INTO Users (first_name, last_name, patronymic, phone, email, password, role) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id, first_name, last_name, patronymic, email, phone, role',
            [first_name, last_name, patronymic, phone, email, hashedPassword, 'user']
        );
        const user = result.rows[0];
        const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '1h' });
        res.status(201).json({ ...user, token });
    } catch (error) {
        console.error('Ошибка регистрации:', error);
        if (error.code === '23505') {
            return res.status(409).json({ error: 'Данная почта уже существует!' });
        }
        res.status(500).json({ error: 'Ошибка в регистрации' });
    }
});

app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const result = await pool.query('SELECT * FROM Users WHERE email = $1', [email]);
        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Недействительные учётные данные' });
        }
        const user = result.rows[0];
        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
            return res.status(401).json({ error: 'Недействительные учётные данные' });
        }
        const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '1h' });
        res.json({ token, user: { id: user.id, first_name: user.first_name, last_name: user.last_name, patronymic: user.patronymic, email: user.email, role: user.role, phone: user.phone } });
    } catch (error) {
        console.error('Ошибка входа:', error);
        res.status(500).json({ error: 'Вход не выполнен' });
    }
});

app.post('/api/refresh', authenticateToken, async (req, res) => {
    try {
        const user = await pool.query('SELECT * FROM Users WHERE id = $1', [req.user.id]);
        if (user.rows.length === 0) {
            return res.status(404).json({ error: 'Пользователь не найден' });
        }
        const newToken = jwt.sign({ id: user.rows[0].id, role: user.rows[0].role }, JWT_SECRET, { expiresIn: '1h' });
        res.json({ token: newToken });
    } catch (error) {
        console.error('Ошибка в обновлении токена:', error);
        res.status(500).json({ error: 'Ошибка обновления токена!' });
    }
});

app.post('/api/requests', authenticateToken, async (req, res) => {
    const { title, description, equipment_type, contact_person, phone, repair_type } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO Requests (title, description, equipment_type, contact_person, phone, status, user_id, repair_type, executor_name, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, CURRENT_TIMESTAMP) RETURNING *',
            [title, description, equipment_type, contact_person, phone, 'pending', req.user.id, repair_type, null]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Ошибка создания заявки:', error);
        res.status(500).json({ error: 'Создание заявки прервано' });
    }
});

app.patch('/api/requests/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { status, executor_id } = req.body;
    console.log('Тело запроса:', { id, status, executor_id });
    try {
        const validStatus = typeof status === 'string' ? statusMapRuToEn[status.toLowerCase()] || status.toLowerCase() : null;
        const validStatuses = ['pending', 'accepted', 'completed', 'rejected', 'assigned', 'done'];
        if (validStatus && !validStatuses.includes(validStatus)) {
            return res.status(400).json({ error: 'Неверное значение статуса.' });
        }

        let executor_name = null;
        if (executor_id) {
            const executor = await pool.query('SELECT first_name, last_name, patronymic FROM Users WHERE id = $1 AND role = \'master\'', [executor_id]);
            if (executor.rows.length > 0) {
                executor_name = `${executor.rows[0].first_name} ${executor.rows[0].last_name} ${executor.rows[0].patronymic || ''}`.trim();
            } else {
                return res.status(400).json({ error: 'Пользователь не мастер или ошибочное ID' });
            }
        }

        const query = `
            UPDATE Requests
            SET
                status = $1::VARCHAR,
                executor_name = $2,
                executor_id = $3,
                closed_at = CASE
                                WHEN $1::VARCHAR = 'completed' THEN CURRENT_TIMESTAMP
                                ELSE NULL
                    END
            WHERE id = $4
              AND (SELECT role FROM Users WHERE id = $5) IN ('admin', 'master')
            RETURNING *
        `;
        const result = await pool.query(query, [validStatus || null, executor_name, executor_id || null, id, req.user.id]);
        console.log('Результат обновления запроса:', result.rows);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Запрос не найден' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Ошибка обновления запроса:', error);
        res.status(500).json({ error: 'Ошибка обновления запроса' });
    }
});

app.get('/api/users/masters', authenticateToken, async (req, res) => {
    if (!['admin', 'master'].includes(req.user.role)) {
        return res.status(403).json({ error: 'Доступ запрещён' });
    }
    try {
        const result = await pool.query(
            'SELECT id, first_name, last_name, patronymic FROM Users WHERE role = $1',
            ['master']
        );
        const masters = result.rows.map(user => ({
            id: user.id,
            name: `${user.first_name} ${user.last_name} ${user.patronymic || ''}`.trim()
        }));
        res.json(masters);
    } catch (error) {
        console.error('Ошибка получения мастеров:', error);
        res.status(500).json({ error: 'Ошибка получения мастеров' });
    }
});

app.patch('/api/user', authenticateToken, async (req, res) => {
    console.log('PATCH /api/user route hit');
    const { first_name, last_name, patronymic, email, phone } = req.body;
    try {
        const result = await pool.query(
            'UPDATE Users SET first_name = $1, last_name = $2, patronymic = $3, email = $4, phone = $5 WHERE id = $6 RETURNING id, first_name, last_name, patronymic, email, phone, role',
            [first_name, last_name, patronymic, email, phone, req.user.id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Пользователь не найден' });
        }
        const updatedUser = result.rows[0];
        res.json(updatedUser);
    } catch (error) {
        console.error('Ошибка обновления пользователя:', error);
        if (error.code === '23505') {
            return res.status(409).json({ error: 'Почта уже существует' });
        }
        res.status(500).json({ error: 'Ошибка обновления пользователя' });
    }
});

app.patch('/api/user/password', authenticateToken, async (req, res) => {

    const { currentPassword, newPassword } = req.body;
    try {
        const result = await pool.query('SELECT * FROM Users WHERE id = $1', [req.user.id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Пользователь не найден' });
        }
        const user = result.rows[0];
        const isValid = await bcrypt.compare(currentPassword, user.password);

        if (!isValid) {
            return res.status(401).json({ error: 'Неверный текущий пароль!' });
        }
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        const updateResult = await pool.query(
            'UPDATE Users SET password = $1 WHERE id = $2 RETURNING id',
            [hashedPassword, req.user.id]
        );
        if (updateResult.rows.length === 0) {
            return res.status(500).json({ error: 'Ошибка обновления пароля!' });
        }
        res.json({ message: 'Пароль успешно обновлён!' });
    } catch (error) {
        console.error('Ошибка обновления пароля:', error);
        res.status(500).json({ error: 'Ошибка в обновлении пароля!' });
    }
});


app.get('/api/requests', authenticateToken, async (req, res) => {
    if (!['admin', 'master'].includes(req.user.role)) {
        return res.status(403).json({ error: 'Доступ запрещён' });
    }
    try {
        const result = await pool.query('SELECT * FROM Requests');
        res.json(result.rows);
    } catch (error) {
        console.error('Ошибка доступа:', error);
        res.status(500).json({ error: 'Получение данных прервано' });
    }
});


app.get('/api/user/requests', authenticateToken, async (req, res) => {
    try {
        let query = 'SELECT * FROM Requests';
        const params = [];

        if (req.user.role !== 'admin') {
            query += ' WHERE user_id = $1';
            params.push(req.user.id);
        }

        const result = await pool.query(query, params);
        res.json(result.rows);
    } catch (error) {
        console.error('Ошибка получения пользователя:', error);
        res.status(500).json({ error: 'Ошибка получения пользователя!' });
    }
});

app.get('/api/user/requests/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    console.log(`Поиск по ID: ${id}, user_id: ${req.user.id}`);
    try {
        const result = await pool.query(
            'SELECT * FROM Requests WHERE id = $1 AND user_id = $2',
            [id, req.user.id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Запрос не найден или вход не выполнен' });
        }
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Ошибка получения запроса:', error);
        res.status(500).json({ error: 'Ошибка в получении запроса' });
    }
});


app.post('/api/user/requests/filter', authenticateToken, async (req, res) => {
    const { filterType, filterValue } = req.body;
    console.log(`Фильтр по ${filterType} со значением ${filterValue}, id: ${req.user.id}`);
    try {
        let query = 'SELECT * FROM Requests';
        let params = [];

        if (req.user.role !== 'admin') {
            query += ' WHERE user_id = $1';
            params.push(req.user.id);
        }

        if (filterValue) {
            const valueIndex = params.length + 1;
            let adjustedFilterValue = filterValue;
            if (filterType === 'status') {
                adjustedFilterValue = statusMapRuToEn[filterValue.toLowerCase()] || filterValue.toLowerCase();
            }
            switch (filterType) {
                case 'id':
                    query += (params.length > 0 ? ' AND' : ' WHERE') + ' id = $' + valueIndex;
                    params.push(adjustedFilterValue);
                    break;
                case 'name':
                    query += (params.length > 0 ? ' AND' : ' WHERE') + ' title ILIKE $' + valueIndex;
                    params.push(`%${adjustedFilterValue}%`);
                    break;
                case 'status':
                    query += (params.length > 0 ? ' AND' : ' WHERE') + ' status = $' + valueIndex;
                    params.push(adjustedFilterValue);
                    break;
                case 'executor_name':
                    query += (params.length > 0 ? ' AND' : ' WHERE') + ' executor_name ILIKE $' + valueIndex;
                    params.push(`%${adjustedFilterValue}%`);
                    break;
                case 'date_asc':
                case 'date_desc':
                    const [startDate, endDate] = adjustedFilterValue.split(' to ').map(date => date.trim());
                    if (startDate) {
                        query += (params.length > 0 ? ' AND' : ' WHERE') + ' created_at >= $' + valueIndex;
                        params.push(startDate);
                    }
                    if (endDate) {
                        query += ' AND created_at <= $' + (params.length + 1);
                        params.push(endDate);
                    }
                    break;
                default:
                    break;
            }
        }

        const result = await pool.query(query, params);
        let filteredRequests = result.rows;

        if (filterType === 'date_asc') {
            filteredRequests.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
        } else if (filterType === 'date_desc') {
            filteredRequests.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        } else if (filterType === 'name') {
            filteredRequests.sort((a, b) => a.title.localeCompare(b.title));
        } else if (filterType === 'id') {
            filteredRequests.sort((a, b) => a.id - b.id);
        } else if (filterType === 'status') {
            filteredRequests.sort((a, b) => a.status.localeCompare(b.status));
        } else if (filterType === 'executor_name') {
            filteredRequests.sort((a, b) => (a.executor_name || "").localeCompare(b.executor_name || ""));
        }

        res.json(filteredRequests);
    } catch (error) {
        console.error('Ошибка фильтрации:', error);
        res.status(500).json({ error: 'Ошибка в фильтрации!' });
    }
});


app.post('/api/comments', authenticateToken, async (req, res) => {
    const { request_id, message, full_name } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO Comments (request_id, user_id, full_name, message, created_at) VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP) RETURNING *',
            [request_id, req.user.id, full_name, message]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Ошибка создания комментария:', error);
        res.status(500).json({ error: 'Комментарий не был создан' });
    }
});


app.get('/api/comments', authenticateToken, async (req, res) => {
    const { request_id } = req.query;
    try {
        const result = await pool.query(
            'SELECT * FROM Comments WHERE request_id = $1 ORDER BY created_at DESC',
            [request_id]
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Ошибка получения комментариев:', error);
        res.status(500).json({ error: 'Ошибка в получении комментариев' });
    }
});

app.use((req, res) => {
    res.status(404).json({ error: 'Ошибка 404' });
});

app.listen(PORT, () => {
    console.log(`Сервер запущен на порте ${PORT}`);
});