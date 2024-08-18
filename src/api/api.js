const express = require('express');
const path = require('path');
const fs = require('fs');
const { checkAuth, loginLimiter } = require('./auth');
const csrf = require('csurf');
const cookieParser = require('cookie-parser');
const config = require('../private/config.json');

const app = express();
const port = process.env.PORT || config.dashBoard.port;
const ip = process.env.IP || config.dashBoard.ip;
console.log(`[API]: Iniciando API na porta ${port} e IP ${ip}`);

// Configurar middleware CSRF
const csrfProtection = csrf({ cookie: true });

app.use(cookieParser());
app.use(express.static(path.join(__dirname, '../', 'web')));
app.use(express.json());

// Adicionar proteção CSRF às rotas que modificam dados
app.post('/configsUpdate', csrfProtection, checkAuth, (req, res) => {
    const newConfig = req.body;
    const configPath = path.join(__dirname, '../', 'private', 'config.json');

    // Validate newConfig structure
    if (!newConfig.bot || typeof newConfig.bot !== 'object') {
        return res.status(400).send('Invalid config structure.');
    }
    
    fs.readFile(configPath, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).send('Error reading config file.');
        }

        let currentConfig = JSON.parse(data);
        let updatedConfig = { ...currentConfig, ...newConfig };

        fs.writeFile(configPath, JSON.stringify(updatedConfig, null, 2), 'utf8', (err) => {
            if (err) {
                return res.status(500).send('Error writing config file.');
            }
            res.send('Config updated.');
        });
    });
});

app.get('/validateAuth', loginLimiter, checkAuth, csrfProtection, (req, res) => {
    res.send('Valid credentials.');
});

app.get('/getConfigs', checkAuth, csrfProtection, (req, res) => {
    fs.readFile(path.join(__dirname, '../', 'private', 'config.json'), 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading config file:', err);
            return res.status(500).send('Error reading config file.');
        }
        try {
            const jsonData = JSON.parse(data);
            res.json(jsonData);
        } catch (parseError) {
            console.error('Error parsing JSON:', parseError);
            res.status(500).send('Error parsing JSON.');
        }
    });
});

app.get('/csrf-token', csrfProtection, (req, res) => {
    res.json({ csrfToken: req.csrfToken() });
});

if(config.dashBoard.enabled) {
    app.listen(port, ip, () => { });
} else {
    console.log('Dashboard is disabled.');
}

module.exports = {
    app
};