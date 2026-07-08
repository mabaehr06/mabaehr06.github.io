const express   = require('express');
const path      = require('path');
const app       = express();

app.use(express.static(path.join(__dirname)));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/api/res', (req, res) => {
    res.json({ status: 'true' });
});

if (require.main === module) {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
}

module.exports = app;
