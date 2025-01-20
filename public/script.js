document.getElementById('loginBtn').addEventListener('click', () => {
    window.location.href = '/auth/github';
});

document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');

    if (token) {
        // Store token in session storage for future use
        sessionStorage.setItem('githubToken', token);
        // Show the fetch repositories button
        document.getElementById('fetchReposBtn').style.display = 'block';
    }
});

document.getElementById('fetchReposBtn')?.addEventListener('click', () => {
    const token = sessionStorage.getItem('githubToken');
    
    if (token) {
        fetch(`/api/repos?token=${token}`)
            .then(response => response.json())
            .then(repos => {
                const repoList = document.getElementById('repoList');
                repoList.innerHTML = repos.map(repo => `<li>${repo.name}</li>`).join('');
            })
            .catch(error => console.error('Error fetching repositories:', error));
    } else {
        alert('You need to log in first!');
    }
});
