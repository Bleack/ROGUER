document.addEventListener('DOMContentLoaded', function() {
    const navbarMenuBtn = document.getElementById('navbarMenuBtn');
    const sidebar = document.getElementById('sidebar');
    
    navbarMenuBtn.addEventListener('click', function() {
        sidebar.classList.toggle('show');
    });
    
    document.addEventListener('click', function(event) {
        const isClickInsideSidebar = sidebar.contains(event.target);
        const isClickOnButton = navbarMenuBtn.contains(event.target);
        
        if (!isClickInsideSidebar && !isClickOnButton && window.innerWidth <= 875) {
            sidebar.classList.remove('show');
        }
    });
    
    window.addEventListener('resize', function() {
        if (window.innerWidth > 875) {
            sidebar.classList.remove('show');
        }
    });
});