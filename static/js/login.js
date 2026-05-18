document.getElementById('login-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    var form = this;
    var errorAlert = document.getElementById('login-error-alert');
    var successAlert = document.getElementById('login-success-alert');
    
    errorAlert.style.display = 'none';
    successAlert.style.display = 'none';
    
    fetch(window.location.href, {
        method: 'POST',
        body: new FormData(form),
        headers: {
            'X-Requested-With': 'XMLHttpRequest'
        }
    })
    .then(function(response) {
        if (response.redirected) {
            successAlert.style.display = 'block';
            
            setTimeout(function() {
                window.location.href = response.url;
            }, 2000);
        } else {
            errorAlert.style.display = 'block';
        }
    })
    .catch(function() {
        errorAlert.style.display = 'block';
    });
});