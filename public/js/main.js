document.addEventListener('DOMContentLoaded', function() {
    // Mostrar/ocultar alertas después de un tiempo
    const alerts = document.querySelectorAll('.alert');
    
    if (alerts.length > 0) {
      setTimeout(() => {
        alerts.forEach(alert => {
          alert.style.opacity = '0';
          setTimeout(() => {
            alert.style.display = 'none';
          }, 300);
        });
      }, 5000);
    }
  
    // Validación de contraseñas en el formulario de registro
    const registerForm = document.querySelector('form[action="/register"]');
    
    if (registerForm) {
      registerForm.addEventListener('submit', function(e) {
        const password = document.getElementById('password');
        const confirmPassword = document.getElementById('confirmPassword');
        
        if (password.value !== confirmPassword.value) {
          e.preventDefault();
          alert('Las contraseñas no coinciden');
        }
      });
    }
  });