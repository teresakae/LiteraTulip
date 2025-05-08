const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const sessionMiddleware = require('./middlewares/session'); // Import your session middleware (renamed to 'session')
const bodyParser = require('body-parser');
const productRoutes = require('./routes/product');
const transaksiRoutes = require('./routes/transaksi');
const userRoutes = require('./routes/user');
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const webRoutes = require('./routes/web'); // Import the web routes

const app = express();
const PORT = process.env.PORT || 3000;
const path = require('path');

app.use(express.static(path.join(__dirname, 'public')));

app.get('/paymentcomplete', (req, res) => {
    const transactionId = req.query.transactionId;
    const orderStatus = req.query.status;
    res.sendFile(path.join(__dirname, 'public', 'paymentcomplete.html'), {
        root: __dirname,
        locals: { transactionId: transactionId, orderStatus: orderStatus }
    });
});

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// Session Middleware
app.use(sessionMiddleware);

const attachUser = async (req, res, next) => {
    console.log('attachUser middleware running for:', req.url); // Log the URL
    console.log('req.headers.cookie:', req.headers.cookie); // Log the cookies sent by the browser
    console.log('req.session:', req.session); // Log the entire session object
    console.log('req.session.userId:', req.session.userId);
    if (req.session.userId) {
        try {
            const User = require('./models/user');
            req.user = await User.findById(req.session.userId).select('-password');
            console.log('req.user after fetch:', req.user);
        } catch (error) {
            console.error('Error fetching user from session:', error);
        }
    } else {
        console.log('No userId found in session.');
    }
    next();
};

app.use(attachUser);

// Database connection
mongoose.connect('mongodb://localhost:27017/uts_pbw', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Failed to connect to MongoDB:', err));

// Routes
app.use('/api', adminRoutes);
app.use('/api', userRoutes);
app.use('/api', authRoutes);
app.use('/api', productRoutes);
app.use('/api', transaksiRoutes);
app.use('/', webRoutes); // Mount the web routes at the root path

// Default route
app.get('/', (req, res) => {
    res.send('API is running');
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});