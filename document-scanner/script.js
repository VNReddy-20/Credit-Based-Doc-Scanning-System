let token = null;

function showRegister() {
    const username = prompt('Enter username:');
    const password = prompt('Enter password:');
    fetch('/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
    }).then(res => res.json()).then(data => alert(data.message));
}

function showLogin() {
    const username = prompt('Enter username:');
    const password = prompt('Enter password:');
    fetch('/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
    }).then(res => res.json()).then(data => {
        token = data.token;
        document.getElementById('auth').style.display = 'none';
        document.getElementById('content').style.display = 'block';
        document.getElementById('username').innerText = username;
        fetchProfile();
    });
}

function fetchProfile() {
    fetch('/user/profile', {
        headers: { Authorization: `Bearer ${token}` },
    }).then(res => res.json()).then(data => {
        document.getElementById('credits').innerText = data.credits;
    });
}

function uploadFile() {
    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0];
    if (!file) return alert('Please select a file');
    const formData = new FormData();
    formData.append('file', file);
    fetch('/scan', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
    }).then(res => res.json()).then(data => {
        alert(`Scan complete. Matches: ${data.matches.length}`);
        fetchProfile();
    });
}

function requestCredits() {
    fetch('/credits/request', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
    }).then(res => res.json()).then(data => alert(data.message));
}