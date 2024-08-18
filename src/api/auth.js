const config = require('../private/config.json');
const rateLimit = require('express-rate-limit');

const passLen = config.dashBoard.auth.randPasswordLength
const passSlice = config.dashBoard.auth.randPasswordSlice
const generatedPassword = setPassword();

function setPassword() {

    let pass;
    if(config.dashBoard.auth.randomPassword) {
        pass = Math.random().toString(passLen).slice(passSlice);

    } else {
        pass = config.dashBoard.auth.password;
    }
        console.log(`[AUTH] SENHA DO DASHBOARD CONFIGURADA.`);
    return pass;
}

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
    generatedPassword,
    loginLimiter
};