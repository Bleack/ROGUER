        document.addEventListener('DOMContentLoaded', function() {

            document.querySelectorAll('a[href^="#"]').forEach(anchor => {
                anchor.addEventListener('click', function(e) {
                    e.preventDefault();
                    const target = document.querySelector(this.getAttribute('href'));
                    if (target) {
                        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                    const navbarCollapse = document.getElementById('navbarLanding');
                    if (navbarCollapse.classList.contains('show')) {
                        const bsCollapse = bootstrap.Collapse.getInstance(navbarCollapse);
                        if (bsCollapse) bsCollapse.hide();
                    }
                });
            });

            window.addEventListener('scroll', function() {
                const navbar = document.querySelector('.landing-navbar');
                if (window.scrollY > 50) {
                    navbar.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.4)';
                } else {
                    navbar.style.boxShadow = '0 2px 15px rgba(0, 0, 0, 0.3)';
                }
            });
        });