function formatTechnologies(technos) {
    const isMobile = window.innerWidth <= 768;

    if (!isMobile)
        return technos.join(', ');
    if (technos.length <= 2)
        return technos.join(', ');

    const visibles = technos.slice(0, 2).join(', ');
    const rest = technos.length - 2;
    return `${visibles}, +${rest}`;
}

const no_images_message = "Aucune image n'a été fournie pour ce projet.";

document.addEventListener('DOMContentLoaded', () => {
    fetch('/projects/projets.json')
        .then(response => response.json())
        .then(data => {
            const sidebar = document.getElementById('sidebar');


            ///
            //  Usage de la barre de recherche
            ///

            const searchInput = document.getElementById("search-input");
            const searchCount = document.getElementById("search-count");
            const allItems = []

            data.projets.forEach((projet) => {
                const item = document.createElement('div');
                item.setAttribute("data-id", projet.id);
                item.classList.add('project-item');

                // render de chaque projet visilbe
                item.innerHTML = `
                    <div class="project-header">
                        <strong>${projet.nom}</strong>
                        <span class="project-date">${projet.date}</span>
                    </div>
                    <span class="project-technos">${formatTechnologies(projet.technologies)}</span>
                `;
                item.addEventListener('click', () => {
                    afficherDetails(projet, item);
                });

                sidebar.appendChild(item);
                allItems.push(item);
            });

            // funk (tu ta ta) pour récup le nombre de projets
            function updateCount() {
                const visible = allItems.filter(item => item.style.display !== "none").length;
                searchCount.textContent = `${visible}/${allItems.length} résultat${visible > 1 ? "s" : ""} (${(visible * 100 / allItems.length).toFixed(2)} %)`;
            }

            searchInput.addEventListener("input", () => {

                // text récupéré de l'input
                const query = searchInput.value.toLowerCase();

                allItems.forEach(item => {
                    const name = item.querySelector("strong").textContent.toLowerCase();
                    const techs = item.querySelector(".project-technos").textContent.toLowerCase();
                    if (name.includes(query) || techs.includes(query)) {
                        item.style.display = "";
                    } else {
                        item.style.display = "none";
                    }
                });

                updateCount();
            });

            // au lancement pour afficher le nombre total
            updateCount();





            /// 
            //  Affiche de chaque titre (nom, date, technos) pour chaque projet dans la sidebar
            //
            //      /!\ Appliqué au système de recherche, ce code est donc commenté /!\
            /// 

            // data.projets.forEach((projet, index) => {
            //     const item = document.createElement('div');
            //     item.setAttribute("data-id", projet.id);
            //     item.classList.add('project-item');
            //     item.innerHTML = `
            //     <div class="project-header">
            //         <strong>${projet.nom}</strong>
            //         <span class="project-date">${projet.date}</span>
            //     </div>
            //     <span class="project-technos">${formatTechnologies(projet.technologies)}</span>
            //     `;
            //     item.addEventListener('click', () => {
            //         afficherDetails(projet, item);
            //     });

            //     sidebar.appendChild(item);
            // });


            ///
            //  Afficher les détails du projet sélectionné (partie visible à droite)
            ///

            function afficherDetails(projet, elementClique) {
                const details = document.getElementById('project-details');
                const allItems = document.querySelectorAll('.project-item');

                allItems.forEach(item => item.classList.remove('active-project'));
                elementClique.classList.add('active-project');

                details.innerHTML = `
                <div class="details-grid">
                    <!-- Colonne gauche (3 blocs) -->
                    <div class="card info-card name-card">
                    <span class="section-title">Nom</span>
                    <div class="info-value">${projet.nom}</div>
                    </div>

                    <div class="card info-card date-card">
                    <span class="section-title">Date du projet</span>
                    <div class="info-value">${projet.date}</div>
                    </div>

                    <div class="card info-card team-card">
                    <span class="section-title">Taille du groupe</span>
                    <div class="info-value">
                        ${projet.equipe > 1 ? `${projet.equipe} personnes` : `Solo`}
                    </div>
                    </div>

                    <!-- Description (prend la hauteur des 3 blocs de gauche) -->
                    <div class="card desc-card">
                    <span class="section-title">Description du projet</span>
                    <div class="desc-text" id="desc-text">Chargement...</div>
                    </div>

                    <!-- Galerie -->
                    <div class="card gallery-card">
                    <span class="section-title">Galerie d’images</span>
                    ${projet.images.length > 0 ? `
                        <div class="gallery-container" id="gallery-container">
                        <img class="gallery-image" id="gallery-image"
                            src="${projet.images[0]}" alt="Image du projet">
                        </div>
                        <div class="gallery-controls gallery-controls--bar">
                        <button class="gallery-btn" id="prev-btn">PRÉCÉDENT</button>
                        <span class="gallery-counter" id="gallery-counter">1 / ${projet.images.length}</span>
                        <button class="gallery-btn" id="next-btn">SUIVANT</button>
                        </div>
                    ` : `<p class="no-images-message">${no_images_message}</p>`}
                    </div>

                    <!--  Technologies  -->
                    <div class="card tech-card">
                    <span class="section-title">Technologie(s) utilisé(s)</span>
                    <div class="tech-grid">
                        ${projet.technologies.map(t => `
                            <div class="tech-item">
                            <div class="tech-thumb">
                                <img src="/projects/technologies/${t}.png" alt="${t}" title="${t}">
                            </div>
                            <!-- <span class="tech-name">${t}</span> -->
                            </div>
                        `).join("")
                    }
                    </div>
                    </div>
                </div>
                `;

                // Charger la description depuis un fichier externe
                const descEl = document.getElementById("desc-text");
                fetch(`/projects/all/${projet.id}/description.txt`)
                    .then(res => {
                        if (!res.ok) throw new Error("Fichier introuvable");
                        return res.text();
                    })
                    .then(txt => {
                        // Respecter les sauts de lignes
                        descEl.innerHTML = txt.replace(/\n/g, "<br>");
                    })
                    .catch(err => {
                        descEl.textContent = "Pas de description disponible.";
                    });

                history.replaceState(null, null, `#${projet.id}`);

                if (projet.images.length > 0) {
                    let currentIndex = 0;
                    const imageEl = document.getElementById('gallery-image');
                    const counterEl = document.getElementById('gallery-counter');
                    const prevBtn = document.getElementById('prev-btn');
                    const nextBtn = document.getElementById('next-btn');

                    function updateGallery() {
                        imageEl.src = projet.images[currentIndex];
                        counterEl.textContent = `${currentIndex + 1} / ${projet.images.length}`;
                    }

                    // Boutons pour switch d'images
                    prevBtn.addEventListener('click', () => {
                        currentIndex = (currentIndex - 1 + projet.images.length) % projet.images.length;
                        updateGallery();
                    });

                    nextBtn.addEventListener('click', () => {
                        currentIndex = (currentIndex + 1) % projet.images.length;
                        updateGallery();
                    });

                    // Si clic alors ouvre image
                    imageEl.addEventListener("click", () => {
                        window.open(projet.images[currentIndex], "_blank");
                    });
                }
            }

            // Si hash dans l'url
            function handleHash() {
                const hash = location.hash.replace('#', '');
                if (!hash)
                    return;
                const projet = data.projets.find(p => p.id === hash);
                if (projet) {
                    const item = document.querySelector(`.project-item[data-id="${projet.id}"]`);
                    if (item)
                        afficherDetails(projet, item);
                } else
                    history.replaceState(null, null, window.location.pathname);
            }

            // 1ère fois
            handleHash();

            // Le reste du temps
            window.addEventListener('hashchange', handleHash);


            // Clic en dehors d'un projet de la liste gauche / sidebar
            const sidebarEl = document.getElementById("sidebar");
            const detailsEl = document.getElementById("project-details");

            sidebarEl.addEventListener("click", (e) => {
                const clickedProject = e.target.closest(".project-item");

                if (!clickedProject) {
                    detailsEl.innerHTML = `
                        <div class="no-selection">
                            Sélectionnez un projet pour voir les détails.
                        </div>
                    `;

                    document.querySelectorAll(".project-item.active-project")
                        .forEach(el => el.classList.remove("active-project"));

                    // enleve le hash de l'rul
                    history.replaceState(null, null, window.location.pathname);
                }
            });
        });
});
