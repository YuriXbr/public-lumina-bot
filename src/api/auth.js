const { logApiCall } = require('../utils/logger/logger.js');
const fs = require('node:fs');
const rateLimit = require('express-rate-limit');
const config = require('../private/config.json');
const cache = require('../private/cache.json');

const passLen = config.dashBoard.auth.randPasswordLength
const passSlice = config.dashBoard.auth.randPasswordSlice
let generatedPassword = null;

async function setPassword() {
    if(config.dashBoard.auth.randomPassword) {
        dashBoardPassword = Math.random().toString(passLen).slice(passSlice);
        
    } else {
        dashBoardPassword = config.dashBoard.auth.password;
    }

    cache.cache.data.generatedPassword = dashBoardPassword;
    cache.cache.data.username = config.dashBoard.auth.username;
    generatedPassword = dashBoardPassword;
    // using fs to save the password to the cache.json file
    fs.writeFileSync(__dirname + '/../private/cache.json', JSON.stringify(cache, null, 2), (err) => {
        if (err) {
            console.log(err);
        }
    });


    logApiCall('AUTH', 'setPassword', null, "DashBoard Password "+dashBoardPassword, dashBoardPassword, false, `Senha do dashboard configurada: ${dashBoardPassword}`);
    return dashBoardPassword;
}

// Check if the user is authorized to access the dashboard
async function checkAuth(req, res, next) {
    const { username, password } = req.headers;
    const connectionDate = new Date().toLocaleString();

    if (!username || !password) {
        return res.status(400).send('Username and password are required.');
    }

    if  (!config.dashBoard.enabled) {   
        return res.status(403).send('Dashboard is disabled.');
    }
    
    if (username !== config.dashBoard.auth.username || password !== generatedPassword) {
        const userIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress || undefined;
        console.log(`[CheckAuth]: Tentativa de acesso com usuário ou senha inválidos através do IP: ${userIp} com o usuário: ${username} horário: ${connectionDate}`);
        return res.status(401).send('Invalid username or password.');
    }

    // Log the IP address of the authenticated user
    const userIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress || undefined;
    console.log(`[CheckAuth]: Usuário conectado pelo IP: ${userIp} user: ${username} horário: ${connectionDate}`);
    next();
}

// Rate limiter to prevent brute force attacks
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 15, // Limit each IP to 5 login requests per windowMs
    message: 'Too many login attempts from this IP, please try again after 15 minutes',
});


module.exports = {
    checkAuth,
    setPassword,
    generatedPassword,
    loginLimiter
};