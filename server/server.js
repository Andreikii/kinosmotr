import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { MongoClient, ObjectId } from 'mongodb';

const app = express();
const PORT = Number(process.env.PORT || 10000);
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
const JWT_SECRET = process.env.JWT_SECRET || 'change-me-in-production';

app.use(cors({ origin: FRONTEND_URL }));
app.use(express.json({ limit: '5mb' }));

let db;
let users;
let reviews;

const sampleReviews = [
  {
    title: '«Тень» — хоррор, который больше волнует умом, чем криком',
    movie: 'Тень',
    text: 'Рецензия на психологический триллер, который строит напряжение медленно, но не отпускает до самого финала. Сценарий плотный, атмосфера густая, а главная роль сыграна тонко.',
    rating: 4.8,
    authorName: 'Анна Кузнецова',
    authorEmail: 'anna@example.com',
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
    tags: ['Хоррор', 'Психология', 'Рекомендуем'],
    demo: true
  },
  {
    title: '«Небо в огне» — сериал, который наконец-то сделал научную фантастику близкой',
    movie: 'Небо в огне',
    text: 'Второй сезон выглядит сильнее первого: диалоги стали естественнее, персонажи получили глубину, а визуальная часть выглядит как полноценный блокбастер. Рекомендуем всем, кто ждал взрослого научного сериала.',
    rating: 4.5,
    authorName: 'Максим Смирнов',
    authorEmail: 'maxim@example.com',
    createdAt: new Date(Date.now() - 60 * 60 * 1000),
    tags: ['Сериал', 'Научная фантастика', 'Сезон 2'],
    demo: true
  },
  {
    title: '«Лето в Париже» — драма, которая говорит о любви без слащавости',
    movie: 'Лето в Париже',
    text: 'Фильм смотрится как длинный разговор о том, что остается после расставания. Ритм спокойный, диалоги честные, а операторская работа делает каждую сцену похожей на кадр из любимого альбома.',
    rating: 4.9,
    authorName: 'Дарья Петрова',
    authorEmail: 'daria@example.com',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    tags: ['Драма', 'Любовная история', 'Фестивальная программа'],
    demo: true
  }
];

async function initDb() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI is not set. Create server/.env and add the Atlas connection string.');
  }

  const client = new MongoClient(uri);
  await client.connect();
  db = client.db('KinoSmotr');
  users = db.collection('users');
  reviews = db.collection('reviews');
  await users.createIndex({ email: 1 }, { unique: true });
  await reviews.createIndex({ createdAt: -1 });

  const hasDemo = await reviews.findOne({ demo: true });
  if (!hasDemo) {
    await reviews.insertMany(sampleReviews);
  }
  console.log('MongoDB connected');
}

function signUser(user) {
  return jwt.sign({ id: user._id.toString(), email: user.email }, JWT_SECRET, { expiresIn: '7d' });
}

function auth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ message: 'Требуется авторизация' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ message: 'Сессия истекла, войдите снова' });
  }
}

function serializeReview(review) {
  return {
    id: review._id.toString(),
    title: review.title,
    movie: review.movie,
    text: review.text,
    rating: review.rating,
    authorName: review.authorName,
    authorId: review.authorId ? review.authorId.toString() : null,
    createdAt: review.createdAt,
    tags: review.tags || [],
    poster: review.poster || null,
    demo: Boolean(review.demo)
  };
}

app.get('/', (req, res) => {
  res.json({ message: 'API Киносмотр работает!' });
});

app.get('/api/health', (req, res) => {
  res.json({ ok: true, service: 'kinosmotr-api' });
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: 'Заполните все поля' });
    if (password.length < 6) return res.status(400).json({ message: 'Пароль должен быть не короче 6 символов' });

    const normalizedEmail = String(email).trim().toLowerCase();
    const exists = await users.findOne({ email: normalizedEmail });
    if (exists) return res.status(409).json({ message: 'Пользователь уже существует' });

    const passwordHash = await bcrypt.hash(password, 10);
    const doc = { name: String(name).trim(), email: normalizedEmail, passwordHash, createdAt: new Date() };
    const result = await users.insertOne(doc);
    doc._id = result.insertedId;

    res.status(201).json({
      token: signUser(doc),
      user: { id: doc._id.toString(), name: doc.name, email: doc.email }
    });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка регистрации' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await users.findOne({ email: String(email || '').trim().toLowerCase() });
    if (!user || !(await bcrypt.compare(password || '', user.passwordHash))) {
      return res.status(401).json({ message: 'Неверная почта или пароль' });
    }
    res.json({
      token: signUser(user),
      user: { id: user._id.toString(), name: user.name, email: user.email }
    });
  } catch {
    res.status(500).json({ message: 'Ошибка входа' });
  }
});

app.get('/api/me', auth, async (req, res) => {
  const user = await users.findOne({ _id: new ObjectId(req.user.id) }, { projection: { passwordHash: 0 } });
  if (!user) return res.status(404).json({ message: 'Пользователь не найден' });
  res.json({ id: user._id.toString(), name: user.name, email: user.email });
});

app.patch('/api/me', auth, async (req, res) => {
  const name = String(req.body.name || '').trim();
  if (!name) return res.status(400).json({ message: 'Имя не может быть пустым' });
  await users.updateOne({ _id: new ObjectId(req.user.id) }, { $set: { name } });
  await reviews.updateMany({ authorId: new ObjectId(req.user.id) }, { $set: { authorName: name } });
  res.json({ message: 'Профиль обновлен', name });
});

app.get('/api/reviews', async (req, res) => {
  const list = await reviews.find({}).sort({ createdAt: -1 }).limit(100).toArray();
  res.json(list.map(serializeReview));
});

app.get('/api/reviews/user/me', auth, async (req, res) => {
  const list = await reviews.find({ authorId: new ObjectId(req.user.id) }).sort({ createdAt: -1 }).toArray();
  res.json(list.map(serializeReview));
});

app.post('/api/reviews', auth, async (req, res) => {
  const { movie, title, text, rating, tags, poster } = req.body;
  if (!movie || !text || !rating) return res.status(400).json({ message: 'Заполните название, оценку и текст рецензии' });
  const user = await users.findOne({ _id: new ObjectId(req.user.id) });
  if (!user) return res.status(404).json({ message: 'Пользователь не найден' });

  const doc = {
    movie: String(movie).trim(),
    title: String(title || `«${movie}» — моя рецензия`).trim(),
    text: String(text).trim(),
    rating: Math.max(1, Math.min(5, Number(rating))),
    tags: Array.isArray(tags) ? tags.slice(0, 5) : [],
    poster: poster || null,
    authorId: user._id,
    authorName: user.name,
    authorEmail: user.email,
    createdAt: new Date()
  };

  const result = await reviews.insertOne(doc);
  doc._id = result.insertedId;
  res.status(201).json(serializeReview(doc));
});

app.patch('/api/reviews/:id', auth, async (req, res) => {
  if (!ObjectId.isValid(req.params.id)) return res.status(400).json({ message: 'Некорректный id' });
  const id = new ObjectId(req.params.id);
  const review = await reviews.findOne({ _id: id, authorId: new ObjectId(req.user.id) });
  if (!review) return res.status(404).json({ message: 'Рецензия не найдена' });

  const patch = {};
  if (req.body.movie) patch.movie = String(req.body.movie).trim();
  if (req.body.title) patch.title = String(req.body.title).trim();
  if (req.body.text) patch.text = String(req.body.text).trim();
  if (req.body.rating) patch.rating = Math.max(1, Math.min(5, Number(req.body.rating)));
  if (Array.isArray(req.body.tags)) patch.tags = req.body.tags.slice(0, 5);
  if (req.body.poster !== undefined) patch.poster = req.body.poster;

  await reviews.updateOne({ _id: id }, { $set: patch });
  const updated = await reviews.findOne({ _id: id });
  res.json(serializeReview(updated));
});

app.delete('/api/reviews/:id', auth, async (req, res) => {
  if (!ObjectId.isValid(req.params.id)) return res.status(400).json({ message: 'Некорректный id' });
  const result = await reviews.deleteOne({ _id: new ObjectId(req.params.id), authorId: new ObjectId(req.user.id) });
  if (!result.deletedCount) return res.status(404).json({ message: 'Рецензия не найдена' });
  res.json({ message: 'Рецензия удалена' });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: 'Внутренняя ошибка сервера' });
});

initDb()
  .then(() => {
    app.listen(PORT, '0.0.0.0', () => console.log(`KinoSmotr API listening on ${PORT}`));
  })
  .catch((error) => {
    console.error(error.message);
    process.exit(1);
  });
