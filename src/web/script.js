document.addEventListener('DOMContentLoaded', function() {
    let authCredentials = null; // Armazena as credenciais
    let csrfToken = null; // Armazena o token CSRF

    const modal = document.getElementById('sessionModal');
    const span = document.getElementsByClassName('close')[0];
    const submitSessionIdButton = document.getElementById('submitSessionId');
    const usernameInput = document.getElementById('usernameInput');
    const passwordInput = document.getElementById('passwordInput');
    const openModalButton = document.getElementById('openModal');
    const revealTokenButton = document.getElementById('revealToken');
    const errorMessage = document.getElementById('errorMessage');
    const tokenInput = document.getElementById('token');
    const errorDisplay = document.getElementById('error-message'); // Elemento para exibir a mensagem de erro
    const saveButton = document.getElementById('saveButton'); // Botão de salvar

    // Formulário e botão de salvar
    const form = document.querySelector('form');

    // Busca o token CSRF do servidor
    fetch('/csrf-token')
        .then(response => response.json())
        .then(data => {
            csrfToken = data.csrfToken;
        })
        .catch(error => {
            console.error('Erro ao buscar o token CSRF:', error);
        });

    if (!authCredentials) {
        modal.style.display = 'block';
    }

    openModalButton.onclick = function() {
        modal.style.display = 'block';
    }

    span.onclick = function() {
        modal.style.display = 'none';
    }

    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = 'none';
        }
    }

    submitSessionIdButton.onclick = function() {
        const username = DOMPurify.sanitize(usernameInput.value);
        const password = DOMPurify.sanitize(passwordInput.value);

        if (username && password) {
            validateAuth(username, password);
        } else {
            alert('Nome de usuário e senha são obrigatórios.');
        }
    }

    revealTokenButton.onclick = function() {
        if (tokenInput.type === 'password') {
            tokenInput.type = 'text';
            revealTokenButton.textContent = 'visibility';
        } else {
            tokenInput.type = 'password';
            revealTokenButton.textContent = 'visibility_off';
        }
    };

    form.addEventListener('submit', function(event) {
        event.preventDefault(); // Previne o envio normal do formulário

        // Desabilita o botão de salvar enquanto a requisição está sendo processada
        if (saveButton) {
            saveButton.disabled = true;
        }

        // Coleta os dados do formulário
        const formData = {
            bot: {
                token: DOMPurify.sanitize(document.getElementById('token').value),
                clientId: DOMPurify.sanitize(document.getElementById('clientId').value),
                prefix: DOMPurify.sanitize(document.getElementById('prefix').value),
                status: DOMPurify.sanitize(document.getElementById('status').value),
                activity: {
                    type: DOMPurify.sanitize(document.getElementById('activityType').value),
                    name: DOMPurify.sanitize(document.getElementById('activityName').value)
                },
                devmode: document.getElementById('devmode').checked
            }
        };

        // Envia os dados do formulário para o servidor via uma requisição POST
        fetch('/configsUpdate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'username': authCredentials.username,
                'password': authCredentials.password,
                'CSRF-Token': csrfToken // Inclui o token CSRF nos cabeçalhos
            },
            body: JSON.stringify(formData)
        })
        .then(response => {
            if (response.ok) {
                return response.text(); // Espera uma resposta de texto
            } else {
                throw new Error(`${response.status} : Falha ao salvar as configurações.`);
            }
        })
        .then(data => {
            try {
                const jsonData = JSON.parse(data);
                errorDisplay.style.display = 'none'; // Esconde a mensagem de erro
                errorDisplay.classList.remove('error-message'); // Remove a classe de erro
                errorDisplay.classList.add('success-message'); // Adiciona a classe de sucesso
                errorDisplay.textContent = 'Configurações salvas com sucesso.';
                errorDisplay.style.display = 'block'; // Exibe a mensagem de sucesso
            } catch (e) {
                errorDisplay.classList.remove('success-message'); // Remove a classe de sucesso
                errorDisplay.classList.add('error-message'); // Adiciona a classe de erro
                errorDisplay.textContent = data; // Mostra a resposta de texto
                errorDisplay.style.display = 'block'; // Exibe a mensagem de erro
            }
        })
        .catch(error => {
            console.error('Erro:', error);
            errorDisplay.classList.remove('success-message'); // Remove a classe de sucesso
            errorDisplay.classList.add('error-message'); // Adiciona a classe de erro
            errorDisplay.textContent = error.message; // Mostra a mensagem de erro com o código de erro
            errorDisplay.style.display = 'block'; // Exibe a mensagem de erro
        })
        .finally(() => {
            if (saveButton) {
                saveButton.disabled = false; // Habilita o botão de salvar novamente
            }
        });
    });

    // Valida as credenciais de autenticação
    function validateAuth(username, password) {
        fetch('/validateAuth', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'username': username,
                'password': password
            }
        })
        .then(response => {
            if (response.ok) {
                authCredentials = { username, password };
                modal.style.display = 'none';
                fetchConfigs();
            } else {
                throw new Error('Credenciais inválidas.');
            }
        })
        .catch(error => {
            console.error('Erro:', error);
            alert('Credenciais inválidas.');
        });
    }

    // Busca as configurações do servidor
    function fetchConfigs() {
        fetch('/getConfigs', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'username': authCredentials.username,
                'password': authCredentials.password
            }
        })
        .then(response => response.json())
        .then(data => {
            populateForm(data);
        })
        .catch(error => {
            console.error('Erro:', error);
        });
    }

    // Popula o formulário com as configurações recebidas
    function populateForm(config) {
        try {
            document.getElementById('token').value = DOMPurify.sanitize(config.bot.token);
            document.getElementById('clientId').value = DOMPurify.sanitize(config.bot.clientId);
            document.getElementById('prefix').value = DOMPurify.sanitize(config.bot.prefix);
            document.getElementById('status').value = DOMPurify.sanitize(config.bot.status);
            document.getElementById('activityType').value = DOMPurify.sanitize(config.bot.activity.type);
            document.getElementById('activityName').value = DOMPurify.sanitize(config.bot.activity.name);
            document.getElementById('devmode').checked = config.bot.devmode;
        } catch (error) {
            console.error('Erro ao popular o formulário:', error);
            errorDisplay.classList.remove('success-message'); // Remove a classe de sucesso
            errorDisplay.classList.add('error-message'); // Adiciona a classe de erro
            errorDisplay.textContent = 'Erro ao popular o formulário com as configurações recebidas.';
            errorDisplay.style.display = 'block'; // Exibe a mensagem de erro
        }
    }

    // Obtém um cookie pelo nome
    function getCookie(name) {
        try {
            const value = `; ${document.cookie}`;
            const parts = value.split(`; ${name}=`);
            if (parts.length === 2) return parts.pop().split(';').shift();
        } catch (error) {
            console.error('Erro ao obter o cookie:', error);
            alert('Erro ao obter o cookie.');
        }
    }
});