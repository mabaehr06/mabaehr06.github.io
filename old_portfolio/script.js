document.addEventListener("DOMContentLoaded", () => {
    const links = document.querySelectorAll(".nav_pages");
    const currentPage = window.location.pathname.split("/").pop() || "index.html";

    links.forEach(link => {
        const linkPage = link.getAttribute("href").split("/").pop();

        if (linkPage === currentPage) {
            link.classList.add("active");
        }
    });
});
