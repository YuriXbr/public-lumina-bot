const express = require('express');
const path = require('path');
const fs = require('fs');
const { checkAuth, loginLimiter, setPassword } = require('./auth');
const csrf = require('csurf');
const cookieParser = require('cookie-parser');
const config = require('../private/config.json');
const { logApiCall, logApiCallError } = require('../utils/logger/logger.js');
const { log } = require('console');

const app = express();
const port = process.env.PORT || config.dashBoard.port;
const ip = process.env.IP || config.dashBoard.ip;
logApiCall('API', 'start', null, `API iniciada na porta ${port} e IP ${ip}`, null, false, `API iniciada em: IP ${ip}:${port}`);

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
        logApiCall('API', 'configsUpdate', newConfig, 'Invalid config structure.', null, false, 'Invalid config structure.');
        return res.status(400).send('Invalid config structure.');
    }
    
    fs.readFile(configPath, 'utf8', (err, data) => {
        if (err) {
            logApiCall('API', 'configsUpdate', newConfig, 'Error reading config file.', null, false, 'Error reading config file.');
            return res.status(500).send('Error reading config file.');
        }

        let currentConfig = JSON.parse(data);
        let updatedConfig = { ...currentConfig, ...newConfig };

        fs.writeFile(configPath, JSON.stringify(updatedConfig, null, 2), 'utf8', (err) => {
            if (err) {
                logApiCall('API', 'configsUpdate', newConfig, 'Error writing config file.', null, false, 'Error writing config file.');
                return res.status(500).send('Error writing config file.');
            }
            logApiCall('API', 'configsUpdate', newConfig, 'Config updated.', null, false, 'Config updated.');
            res.send('Config updated.');
        });
    });
});

app.get('/validateAuth', loginLimiter, checkAuth, csrfProtection, (req, res) => {
    logApiCall('API', 'validateAuth', null, `Valid credentials from IP: ${req.headers['x-forwarded-for'] || req.connection.remoteAddress || undefined}`, null, false, 'Valid credentials.');
    res.send('Valid credentials.');
});

app.get('/getConfigs', checkAuth, csrfProtection, (req, res) => {
    fs.readFile(path.join(__dirname, '../', 'private', 'config.json'), 'utf8', (err, data) => {
        if (err) {
            logApiCallError('API', 'getConfigs', null, 'Error reading config file.');
            return res.status(500).send('Error reading config file.');
        }
        try {
            const jsonData = JSON.parse(data);
            res.json(jsonData);
        } catch (parseError) {
            logApiCallError('API', 'getConfigs', null, 'Error parsing JSON.');
            res.status(500).send('Error parsing JSON.');
        }
        logApiCall('API', 'getConfigs', null, `Config sent to IP: ${req.headers['x-forwarded-for'] || req.connection.remoteAddress || undefined}`, null, false, 'Config sent.');
    });
});

app.get('/csrf-token', csrfProtection, (req, res) => {
    logApiCall('API', 'csrf-token', null, `CSRF token sent to IP: ${req.headers['x-forwarded-for'] || req.connection.remoteAddress || undefined}`, null, false, 'CSRF token sent.');
    res.json({ csrfToken: req.csrfToken() });
});

if(config.dashBoard.enabled) {
    app.listen(port, ip, () => { });
} else {
    logApiCall('API', 'start', null, 'Dashboard is disabled.', null, false, 'Dashboard is disabled.');
}

module.exports = {
    app
};