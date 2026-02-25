// load.js
document.addEventListener("DOMContentLoaded", function() {
    // --------- HEADER ---------
    const headerDiv = document.getElementById('header');
    headerDiv.innerHTML = `
        <style>
            /* 1. RESET & BASE */
            * { margin:0; padding:0; box-sizing:border-box; font-family:sans-serif; }

            /* 2. THE NAVBAR */
            .navbar {
                background: #2c3e50;
                color: white;
                height: 70px;
                display: flex;
                align-items: center;
                position: sticky;
                top: 0;
                width: 100%;
                z-index: 9999;
                box-shadow: 0 2px 5px rgba(0,0,0,0.2);
            }
            .nav-container {
                width: 90%;
                max-width: 1100px;
                margin: 0 auto;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            .logo { font-size:24px; font-weight:bold; color:#ecf0f1; text-decoration:none; }

            /* 3. NAV LINKS */
            .nav-links {
                display: flex;
                list-style: none;
                transition: 0.3s ease-in-out;
            }
            .nav-links li { margin-left: 25px; }
            .nav-links a { color: white; text-decoration:none; font-size:18px; }

            /* 4. HAMBURGER BUTTON */
            #menu-btn {
                display: none;
                flex-direction: column;
                justify-content: space-around;
                width: 30px;
                height: 25px;
                background: transparent;
                border: none;
                cursor: pointer;
                z-index: 10000;
                padding: 0;
            }
            #menu-btn span {
                width: 30px;
                height: 4px;
                background: white;
                border-radius: 10px;
                transition: 0.3s;
            }

            /* 5. MOBILE STYLES */
            @media screen and (max-width: 768px) {
                #menu-btn { display: flex; }
                .nav-links {
                    position: fixed;
                    top: 70px;
                    left: -100%;
                    flex-direction: column;
                    background: #34495e;
                    width: 100%;
                    height: 100vh;
                    text-align: center;
                    padding-top: 50px;
                }
                .nav-links.active { left: 0; }
                .nav-links li { margin: 20px 0; }
                .open span:nth-child(1) { transform: rotate(45deg) translate(6px,6px); }
                .open span:nth-child(2) { opacity: 0; }
                .open span:nth-child(3) { transform: rotate(-45deg) translate(6px,-6px); }
            }
        </style>

        <nav class="navbar">
            <div class="nav-container">
                <a href="/" class="logo">Verbum Bible</a>
                <button id="menu-btn">
                    <span></span>
                    <span></span>
                    <span></span>
                </button>
                <ul class="nav-links" id="nav-menu">
                    <li><a href="/readingplans/">Reading plans</a></li>
                    <li><a href="/biblestudies/">Bible studies</a></li>
                    <li><a href="/contactus">Contact & Support</a></li>
                </ul>
            </div>
        </nav>
    `;

    // Attach hamburger functionality AFTER header exists
    const btn = document.getElementById('menu-btn');
    const menu = document.getElementById('nav-menu');

    btn.addEventListener('click', () => {
        console.log("Button was clicked!");
        menu.classList.toggle('active');
        btn.classList.toggle('open');
    });

    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            menu.classList.remove('active');
            btn.classList.remove('open');
        });
    });

    // --------- FOOTER (optional) ---------
    const footerDiv = document.getElementById('footer');
    footerDiv.innerHTML = `
        <footer style="padding:20px; text-align:center; background:#2c3e50; color:white;">
        <a href="/" style="color:#ecf0f1; text-decoration:none; font-weight:bold;">Verbum Bible</a><br>
        <a href="/contactus" style="color:#ecf0f1; text-decoration:none; font-weight:bold;">Contact</a><br>
        <a href="/biblestudies" style="color:#ecf0f1; text-decoration:none; font-weight:bold;">Group bible studies</a><br>
        <a href="/readingplans" style="color:#ecf0f1; text-decoration:none; font-weight:bold;">Reading plans</a><br>
        &copy; ${new Date().getFullYear()} Noah McCracken & JJ Freeland. All rights reserved.
        </footer>
    `;
});