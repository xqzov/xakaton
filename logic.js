// === ПЕРЕМЕННЫЕ СОСТОЯНИЯ ===
let currentUser = null;
let userPoints = 0;

// Переменные для хранения данных текущей покупки (за рубли)
let currentPrice = 0;
let currentReward = 0;

// Переменная для хранения стоимости текущей покупки (за баллы)
let pointsCost = 0;

// === ЭЛЕМЕНТЫ DOM ===

// 1. Авторизация
const authModal = document.getElementById("auth-modal");
const loginBtn = document.getElementById("login-btn");
const logoutBtn = document.getElementById("logout-btn");
const closeAuthBtn = document.querySelector("#auth-modal .close-modal");

// 2. Отображение пользователя
const pointsContainer = document.getElementById("points-container");
const pointsValue = document.getElementById("user-points");
const usernameDisplay = document.getElementById("username-display");

// 3. Формы
const loginForm = document.getElementById("login-form");
const registerForm = document.getElementById("register-form");
const loginBlock = document.getElementById("login-form-block");
const registerBlock = document.getElementById("register-form-block");

// 4. Уведомления (новое окно)
const notifyModal = document.getElementById("notification-modal");
const closeNotifyBtn = document.querySelector(".close-notification");
const notifyTitle = document.getElementById("notify-title");
const notifyMessage = document.getElementById("notify-message");
const notifyActions = document.getElementById("notify-actions"); // Блок кнопок Да/Нет
const notifyOkContainer = document.getElementById("notify-ok-container"); // Блок кнопки ОК
const btnConfirm = document.getElementById("btn-confirm");
const btnCancel = document.getElementById("btn-cancel");
const btnOk = document.getElementById("btn-ok");


// === ФУНКЦИИ УПРАВЛЕНИЯ МОДАЛКАМИ ===

// Открытие окна авторизации
if (loginBtn) {
    loginBtn.onclick = (e) => {
        e.preventDefault();
        authModal.style.display = "block";
    };
}

// Закрытие окон по крестику
if (closeAuthBtn) closeAuthBtn.onclick = () => authModal.style.display = "none";
if (closeNotifyBtn) closeNotifyBtn.onclick = () => notifyModal.style.display = "none";

// Закрытие при клике на фон
window.onclick = (event) => {
    if (event.target == authModal) authModal.style.display = "none";
    if (event.target == notifyModal) notifyModal.style.display = "none";
};

// Переключение Вход / Регистрация
const toRegBtn = document.getElementById("switch-to-register");
const toLogBtn = document.getElementById("switch-to-login");

if (toRegBtn) {
    toRegBtn.onclick = (e) => {
        e.preventDefault();
        loginBlock.style.display = "none";
        registerBlock.style.display = "block";
    };
}
if (toLogBtn) {
    toLogBtn.onclick = (e) => {
        e.preventDefault();
        registerBlock.style.display = "none";
        loginBlock.style.display = "block";
    };
}


// === ЛОГИКА АВТОРИЗАЦИИ ===

if (loginForm) {
    loginForm.onsubmit = (e) => {
        e.preventDefault();
        const u = document.getElementById("username").value;
        const p = document.getElementById("password").value;

        if (u === "user" && p === "password") {
            // !!! ДАЕМ 100 000 БАЛЛОВ ДЛЯ ТЕСТА ПОКУПКИ !!!
            loginUser("User", 100000);
            authModal.style.display = "none";
            document.getElementById("username").value = "";
            document.getElementById("password").value = "";
        } else {
            showNotification("Ошибка", "Неверный логин или пароль! <br> (Попробуйте: user / password)", false);
        }
    };
}

if (registerForm) {
    registerForm.onsubmit = (e) => {
        e.preventDefault();
        authModal.style.display = "none";
        showNotification("Успешно!", "Регистрация прошла успешно! <br> Вы получили 50 баллов.", false);
        loginUser("Новый Турист", 50);
    };
}

function loginUser(name, points) {
    currentUser = name;
    userPoints = points;
    updateUI();
}

if (logoutBtn) {
    logoutBtn.onclick = (e) => {
        e.preventDefault();
        showNotification("Выход", "Вы точно хотите выйти из аккаунта?", true, () => {
            currentUser = null;
            userPoints = 0;
            updateUI();
            notifyModal.style.display = "none";
        });
    };
}

function updateUI() {
    if (currentUser) {
        pointsContainer.classList.remove("hidden");
        usernameDisplay.classList.remove("hidden");
        logoutBtn.classList.remove("hidden");
        loginBtn.classList.add("hidden");
        usernameDisplay.textContent = currentUser;
        pointsValue.textContent = userPoints;
    } else {
        pointsContainer.classList.add("hidden");
        usernameDisplay.classList.add("hidden");
        logoutBtn.classList.add("hidden");
        loginBtn.classList.remove("hidden");
    }
}


// === ЛОГИКА ПОКУПКИ ЗА РУБЛИ (ПОЛУЧЕНИЕ БАЛЛОВ) ===

window.buyTour = function(price, pointsReward) {
    if (!currentUser) {
        authModal.style.display = "block";
        return;
    }

    currentPrice = price;
    currentReward = pointsReward;

    showNotification(
        "Покупка тура",
        `Стоимость: <b>${price} ₽</b><br>Вы получите: <b>+${pointsReward} баллов</b>`,
        true,
        processPurchase // Вызов функции начисления
    );
};

function processPurchase() {
    userPoints += currentReward;
    updateUI();
    showNotification(
        "Поздравляем!",
        `Тур успешно оплачен.<br>Ваш новый баланс: <b>${userPoints} баллов</b>.`,
        false
    );
}


// === ЛОГИКА ПОКУПКИ ЗА БАЛЛЫ (НОВАЯ ФУНКЦИЯ) ===

window.buyTourPoints = function(cost) {
    if (!currentUser) {
        authModal.style.display = "block";
        return;
    }

    // Проверка: хватает ли баллов?
    if (userPoints < cost) {
        showNotification(
            "Недостаточно баллов",
            `Стоимость тура: <b>${cost}</b>.<br>Ваш баланс: <b>${userPoints}</b>.<br>Копите баллы, покупая другие туры!`,
            false
        );
        return;
    }

    pointsCost = cost;

    // Спрашиваем подтверждение
    showNotification(
        "Оплата баллами",
        `Вы уверены, что хотите потратить <b>${cost} баллов</b> на этот тур?`,
        true,
        processPointsPurchase // Вызов функции списания
    );
};

function processPointsPurchase() {
    // Списываем баллы
    userPoints -= pointsCost;
    updateUI();

    showNotification(
        "Успешно!",
        `Тур оплачен баллами.<br>Остаток на счете: <b>${userPoints} б.</b>`,
        false
    );
}


// === УНИВЕРСАЛЬНАЯ ФУНКЦИЯ ПОКАЗА УВЕДОМЛЕНИЯ ===

function showNotification(title, message, isConfirmation, onConfirm = null) {
    notifyTitle.textContent = title;
    notifyMessage.innerHTML = message;

    notifyModal.style.display = "block";

    if (isConfirmation) {
        // Режим вопроса (Да/Нет)
        notifyActions.style.display = "flex";
        notifyOkContainer.style.display = "none";

        // Удаляем старые обработчики, чтобы не накапливались
        btnConfirm.onclick = null;

        // Назначаем новый
        btnConfirm.onclick = () => {
            if (onConfirm) onConfirm();
        };

        btnCancel.onclick = () => {
            notifyModal.style.display = "none";
        };

    } else {
        // Режим информации (Просто ОК)
        notifyActions.style.display = "none";
        notifyOkContainer.style.display = "block";

        btnOk.onclick = () => {
            notifyModal.style.display = "none";
        };
    }
}