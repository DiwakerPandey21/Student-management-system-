const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

dotenv.config();

connectDB();

const app = express();

app.use(express.json());
app.use(cors());

app.get('/', (req, res) => {
    res.send('API is running...');
});

const userRoutes = require('./routes/userRoutes');
const studentRoutes = require('./routes/studentRoutes');
const courseRoutes = require('./routes/courseRoutes');
const batchRoutes = require('./routes/batchRoutes');
const enrollmentRoutes = require('./routes/enrollmentRoutes');
const statsRoutes = require('./routes/statsRoutes');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

app.use('/api/users', userRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/batches', batchRoutes);
app.use('/api/enroll', enrollmentRoutes);
app.use('/api/stats', statsRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
