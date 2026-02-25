console.log("hi");
// 1. Grab the elements
const btn = document.getElementById('menu-btn');
const menu = document.getElementById('nav-menu');


// 2. Add the click event
btn.onclick = function() {
    // Log to console so you can check F12 (Inspect Element)
    console.log("Button was clicked!");
            
    // Toggle the visibility of the menu
    menu.classList.toggle('active');
            
    // Toggle the 'X' animation on the button
    btn.classList.toggle('open');
};

// 3. Close the menu when a link is clicked
const links = document.querySelectorAll('.nav-links a');
links.forEach(link => {
    link.onclick = function() {
        menu.classList.remove('active');
        btn.classList.remove('open');
    };
});