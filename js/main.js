// ==========================================
// SGLM-O ARCHITECTURE OVERDRIVE: DEFINITIVE EDITION (PHASE 1)
// ==========================================

// --- UTILITIES ---
function debounce(func, wait) {
    let timeout;
    return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

function showToast(message, type = 'success') {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.className = 'toast-container';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = 'toast-message';

    const icon = type === 'success' ? '<i class="fa-solid fa-check-circle" style="color:var(--color-primary)"></i>' : '<i class="fa-solid fa-info-circle"></i>';
    toast.innerHTML = `${icon} <span>${message}</span>`;

    container.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('hide');
        setTimeout(() => toast.remove(), 400);
    }, 3000);
}

// --- STATE MANAGER ---
class StateManager {
    constructor() {
        this.state = {
            theme: localStorage.getItem('sglmo-theme') || 'light',
            filters: {},
            db: window.UniverseDB || {}
        };

        if (window.GALLERY_DATA) {
            this.state.db.ALBUMS = window.GALLERY_DATA.ALBUMS;
            this.state.db.PHOTOS = window.GALLERY_DATA.PHOTOS;
        }

        this.listeners = [];
    }

    getState() { return this.state; }

    setState(newState) {
        this.state = { ...this.state, ...newState };
        this.notify();
    }

    subscribe(listener) {
        this.listeners.push(listener);
        return () => { this.listeners = this.listeners.filter(l => l !== listener); };
    }

    notify() {
        this.listeners.forEach(listener => listener(this.state));
    }
}

const appState = new StateManager();
if (appState.getState().theme === 'dark') {
    document.body.classList.add('dark-mode');
}

// --- SEARCH ENGINE ---
class SearchEngine {
    constructor() {
        this.index = [];
        this.isOpen = false;
        this.selectedIndex = -1;
        this.buildIndex();
        this.createOmnibar();
        this.attachEvents();
    }

    buildIndex() {
        const db = appState.getState().db;
        const chars = db.CHARACTERS || db.characters || [];
        const seasons = db.SEASONS || [];
        const albums = db.ALBUMS || [];

        chars.forEach(c => this.index.push({ title: c.nome || c.name, category: '👤 Personagens', url: `character.html?id=${c.id}`, keywords: `${c.nome || c.name} ${c.profissao || c.role || ''}`.toLowerCase() }));
        seasons.forEach(s => this.index.push({ title: s.titulo || s.title, category: '📖 Temporadas', url: `temporadas.html`, keywords: `${s.titulo || s.title}`.toLowerCase() }));
        albums.forEach(a => this.index.push({ title: a.title, category: '🖼️ Álbuns', url: `album.html?id=${a.id}`, keywords: `${a.title} ${a.description || ''}`.toLowerCase() }));
    }

    createOmnibar() {
        this.container = document.createElement('div');
        this.container.id = 'omnibar-overlay';
        this.container.innerHTML = `
            <div id="omnibar">
                <input type="text" id="omnibar-input" placeholder="Pesquisar Universo SGLM-O..." autocomplete="off">
                <div id="omnibar-results"></div>
            </div>
        `;
        document.body.appendChild(this.container);
        this.input = document.getElementById('omnibar-input');
        this.resultsContainer = document.getElementById('omnibar-results');
    }

    attachEvents() {
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
                e.preventDefault();
                this.toggle();
            }
            if (this.isOpen) {
                const results = this.resultsContainer.querySelectorAll('.omnibar-result');
                if (e.key === 'Escape') this.close();
                else if (e.key === 'ArrowDown') { e.preventDefault(); this.selectedIndex = (this.selectedIndex + 1) % results.length; this.updateSelection(results); }
                else if (e.key === 'ArrowUp') { e.preventDefault(); this.selectedIndex = (this.selectedIndex - 1 + results.length) % results.length; this.updateSelection(results); }
                else if (e.key === 'Enter' && this.selectedIndex >= 0) { e.preventDefault(); results[this.selectedIndex].click(); }
            }
        });
        this.container.addEventListener('click', (e) => { if (e.target === this.container) this.close(); });
        this.input.addEventListener('input', debounce((e) => this.performSearch(e.target.value), 300));
    }

    updateSelection(results) {
        results.forEach((el, index) => {
            if (index === this.selectedIndex) { el.classList.add('selected'); el.scrollIntoView({ block: 'nearest' }); }
            else el.classList.remove('selected');
        });
    }

    performSearch(query) {
        this.resultsContainer.innerHTML = '';
        this.selectedIndex = -1;
        query = query.toLowerCase().trim();
        if (!query) return;

        const results = this.index.filter(item => item.keywords.includes(query)).slice(0, 10);
        if (results.length === 0) {
            this.resultsContainer.innerHTML = '<div class="omnibar-empty">Nenhum resultado encontrado.</div>';
            return;
        }

        const grouped = results.reduce((acc, item) => {
            if (!acc[item.category]) acc[item.category] = [];
            acc[item.category].push(item);
            return acc;
        }, {});

        for (const [category, items] of Object.entries(grouped)) {
            const groupTitle = document.createElement('div');
            groupTitle.className = 'omnibar-group-title';
            groupTitle.textContent = category;
            this.resultsContainer.appendChild(groupTitle);

            items.forEach(item => {
                const a = document.createElement('a');
                a.className = 'omnibar-result';
                a.href = item.url;
                a.textContent = item.title;
                this.resultsContainer.appendChild(a);
            });
        }
    }

    toggle() { this.isOpen ? this.close() : this.open(); }
    open() { this.isOpen = true; this.container.classList.add('active'); this.input.value = ''; this.resultsContainer.innerHTML = ''; this.input.focus(); }
    close() { this.isOpen = false; this.container.classList.remove('active'); this.input.blur(); }
}

// --- VIEWS ---
function injectGlobalLayout(activePath) {
    const headerContainer = document.getElementById('app-header');
    if (headerContainer) {
        const isDark = localStorage.getItem('sglmo-theme') === 'dark';
        const iconClass = isDark ? 'fa-solid fa-sun' : 'fa-solid fa-moon';

        headerContainer.innerHTML = `
            <header class="global-header">
                <div class="logo">PROJETO<span>UNIVERSO</span></div>
                <nav class="nav-links" style="align-items: center;">
                    <a href="index.html" class="${activePath === 'index.html' ? 'active' : ''}">HOME</a>
                    <a href="personagens.html" class="${activePath === 'personagens.html' ? 'active' : ''}">PERSONAGENS</a>
                    <a href="galeria.html" class="${activePath === 'galeria.html' || activePath === 'album.html' ? 'active' : ''}">GALERIA</a>
                    <div class="dropdown">
                        <span>MFYIS ▾</span>
                        <div class="dropdown-content">
                            <a href="temporadas.html" class="${activePath === 'temporadas.html' ? 'active' : ''}">Temporadas</a>
                            <a href="mfyis.html" class="${activePath === 'mfyis.html' ? 'active' : ''}">Lore Completa</a>
                        </div>
                    </div>
                    <button id="btn-dark-mode" style="background: none; border: none; font-size: 1.4rem; cursor: pointer; color: var(--color-text-main); margin-left: 1.5rem; transition: var(--transition-smooth);" title="Alternar Tema (Shift+D)">
                        <i class="${iconClass}"></i>
                    </button>
                </nav>
            </header>
        `;
    }

    const footerContainer = document.getElementById('app-footer');
    if (footerContainer) {
        footerContainer.innerHTML = `
            <footer class="global-footer">
                <div class="container" style="text-align: center;">
                    <h2 style="margin-bottom: 1rem;" class="logo">PROJETO<span>UNIVERSO</span></h2>
                    <p id="footer-text"></p>
                    <p style="margin-top: 2rem; font-size: 0.8rem; color: #666;">© 2024 PROJETO UNIVERSO. TODOS OS DIREITOS RESERVADOS.</p>
                </div>
            </footer>
        `;
    }
}

function applyGlobalConfig(db) {
    if (window.GALLERY_DATA) {
        db.ALBUMS = window.GALLERY_DATA.ALBUMS;
        db.PHOTOS = window.GALLERY_DATA.PHOTOS;
    }

    if (db.GLOBAL_CONFIG) {
        if (db.GLOBAL_CONFIG.corPrimaria) {
            document.documentElement.style.setProperty('--color-primary', db.GLOBAL_CONFIG.corPrimaria);
        }

        const siteTitleElements = document.querySelectorAll('.logo');
        if (db.GLOBAL_CONFIG.nomeSite) {
            siteTitleElements.forEach(el => {
                const parts = db.GLOBAL_CONFIG.nomeSite.split(' ');
                if (parts.length > 1) {
                    el.innerHTML = `${parts[0]}<span>${parts.slice(1).join(' ')}</span>`;
                } else {
                    el.innerHTML = db.GLOBAL_CONFIG.nomeSite;
                }
            });
        }

        const creatorStatusEl = document.getElementById('home-status');
        if (creatorStatusEl && db.GLOBAL_CONFIG.statusCriador) {
            creatorStatusEl.innerHTML = `
                <h3>Status do Criador</h3>
                <p>"${db.GLOBAL_CONFIG.statusCriador}"</p>
                <span style="display: block; margin-top: 2rem; font-size: 0.9rem; opacity: 0.6;">SGLM-O Ativo</span>
            `;
        }

        const heroEl = document.querySelector('.full-width-hero img');
        if (heroEl && db.GLOBAL_CONFIG.bannerHome) {
            heroEl.src = db.GLOBAL_CONFIG.bannerHome;
        }
    }
}

function renderHomeView(db) {
    applyGlobalConfig(db);

    // Populate System Stats Dynamically
    const statsContainer = document.getElementById('home-stats');
    if (statsContainer) {
        const numEntities = db.CHARACTERS ? db.CHARACTERS.length : 0;
        const numSeasons = db.SEASONS ? db.SEASONS.length : 0;
        // Simple fallback since galleries might be spread or dynamically loaded later, let's use a flat hardcoded 12 for the demo if none.
        const numMídias = 12;

        statsContainer.innerHTML = `
            <div class="stat-item">
                <div class="stat-number">${numEntities}</div>
                <div class="stat-label">Entidades</div>
            </div>
            <div class="stat-item">
                <div class="stat-number">${numSeasons}</div>
                <div class="stat-label">Ciclos Registrados</div>
            </div>
            <div class="stat-item">
                <div class="stat-number">${numMídias}</div>
                <div class="stat-label">Mídias</div>
            </div>
        `;
    }

    // IntersectionObserver for Scroll Animations
    const revealElements = document.querySelectorAll('.reveal');
    if (revealElements.length > 0) {
        const observerOptions = {
            root: null,
            rootMargin: '0px',
            threshold: 0.15
        };

        const revealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        revealElements.forEach(el => revealObserver.observe(el));
    }
}

function renderCharacterView(db) {
    applyGlobalConfig(db);
    const urlParams = new URLSearchParams(window.location.search);
    const charId = urlParams.get('id') || 'aurora'; 

    const charactersList = db.CHARACTERS || db.characters;
    const char = charactersList.find(c => c.id === charId);

    if (!char) {
        document.body.innerHTML = '<h1>Personagem não encontrada.</h1>';
        return;
    }

    const header = document.getElementById('char-header');
    if (header) {
        header.style.backgroundImage = `url('assets/characters/${char.id}/banner.jpg')`;
        document.getElementById('char-name').textContent = char.name;
    }

    const content = document.getElementById('dossier-content');
    if (content) {
        content.innerHTML = `
            <section class="dossier-section">
                <h2>Ficha Técnica</h2>
                <div class="data-grid">
                    <div class="data-row"><strong>Idade</strong> <p>${char.age || 'N/A'}</p></div>
                    <div class="data-row"><strong>Altura</strong> <p>${char.height || 'N/A'}</p></div>
                    <div class="data-row"><strong>Peso</strong> <p>${char.weight || 'N/A'}</p></div>
                    <div class="data-row"><strong>Apelidos</strong> <p>${char.aliases ? char.aliases.join(', ') : 'N/A'}</p></div>
                </div>
                <div class="data-row" style="margin-top: 2rem;"><strong>Aparência</strong> <p>${char.appearance || 'N/A'}</p></div>
                <div class="data-row"><strong>Vestimenta</strong> <p>${char.clothing || 'N/A'}</p></div>
            </section>

            <hr class="dossier-separator">

            <section class="dossier-section">
                <h2>Psicologia & Medos</h2>
                <div class="data-row"><strong>Núcleo de Personalidade</strong> <p>${char.personalityCore || char.personality || 'N/A'}</p></div>
                <div class="data-grid" style="margin-top: 2rem;">
                    <div class="data-row"><strong>Traços Positivos</strong> <p>${char.positiveTraits ? char.positiveTraits.join(', ') : 'N/A'}</p></div>
                    <div class="data-row"><strong>Traços Negativos</strong> <p>${char.negativeTraits ? char.negativeTraits.join(', ') : 'N/A'}</p></div>
                    <div class="data-row"><strong>Medos</strong> <p>${char.fears ? char.fears.join(', ') : (char.medos ? char.medos.join(', ') : 'N/A')}</p></div>
                    <div class="data-row"><strong>Sonhos</strong> <p>${char.dreams ? char.dreams.join(', ') : 'N/A'}</p></div>
                </div>
            </section>

            <hr class="dossier-separator">

            <section class="dossier-section">
                <h2>Relações Chave</h2>
                <div style="max-width: 600px; margin: 0 auto;">
                    ${(char.relationships || char.relations || []).map(r => `
                        <div class="relation-card">
                            <h4>${r.name}</h4>
                            <p>${r.description}</p>
                        </div>
                    `).join('')}
                </div>
            </section>

            <hr class="dossier-separator">
        `;
    }

    const galleryContainer = document.getElementById('gallery-grid');
    if (galleryContainer) {
        galleryContainer.innerHTML = '';
        const totalImages = char.galleries ? char.galleries.totalImages : 0;

        if (totalImages > 0) {
            for (let i = 1; i <= totalImages; i++) {
                const imgNum = i.toString().padStart(2, '0');
                const imgPath = `assets/characters/${char.id}/gallery/${imgNum}.jpg`;
                const div = document.createElement('div');
                div.className = 'img-wrapper aspect-square';
                div.innerHTML = `<img src="${imgPath}" class="img-responsive" alt="Galeria" onerror="this.parentElement.style.display='none'">`;
                galleryContainer.appendChild(div);
            }
        } else {
            galleryContainer.innerHTML = `
                <div class="minimal-panel" style="grid-column: 1 / -1; padding: 4rem 2rem; text-align: center; background-color: #F9F9F9; border: 1px dashed var(--color-border);">
                    <h3 style="color: var(--color-text-muted); font-weight: 500; margin-bottom: 0.5rem; text-transform: uppercase; letter-spacing: 0.1em;">Arquivo Vazio</h3>
                    <p>Nenhuma imagem na galeria ainda.</p>
                </div>
            `;
        }
    }
}

function renderTemporadasView(db) {
    const seasonsGrid = document.getElementById('seasons-grid');
    if (!seasonsGrid || !db.SEASONS) return;

    seasonsGrid.innerHTML = '';

    db.SEASONS.forEach(season => {
        const card = document.createElement('div');
        card.className = 'minimal-panel';
        card.style.display = 'flex';
        card.style.flexDirection = 'column';
        card.style.overflow = 'hidden';

        const hasChapters = season.chapterPaths && season.chapterPaths.length > 0;
        const btnHtml = hasChapters
            ? `<a href="manga-reader.html?id=${season.id}" class="btn" style="width: 100%; text-align: center;">Acessar Capítulos</a>`
            : `<button class="btn btn-outline" style="width: 100%; cursor: not-allowed;" disabled>Em Breve</button>`;

        card.innerHTML = `
            <div class="img-wrapper aspect-portrait">
                <img src="${season.coverPath}" class="img-responsive" alt="${season.title}" onerror="this.style.display='none'">
            </div>
            <div style="padding: 2rem; display: flex; flex-direction: column; flex: 1;">
                <h3 style="font-size: 1.5rem; margin-bottom: 1rem; color: var(--color-text-main);">${season.title}</h3>
                <p style="margin-bottom: 2rem; flex: 1;">${season.synopsis}</p>
                ${btnHtml}
            </div>
        `;
        seasonsGrid.appendChild(card);
    });
}

function renderMangaView(db) {
    applyGlobalConfig(db);
    const urlParams = new URLSearchParams(window.location.search);
    const seasonId = urlParams.get('id') || '1';

    if (!db.SEASONS) return;

    const season = db.SEASONS.find(s => s.id === seasonId);

    if (!season || !season.chapterPaths || season.chapterPaths.length === 0) {
        document.body.innerHTML = `
            <h1 style="color:var(--color-text-main);text-align:center;margin-top:2rem;">Conteúdo não encontrado ou em breve.</h1>
            <div style="text-align: center; margin-top: 2rem;">
                <a href="temporadas.html" class="btn btn-outline">Voltar às Temporadas</a>
            </div>
        `;
        return;
    }

    const container = document.getElementById('manga-container');
    if (container) {
        container.innerHTML = '';
        season.chapterPaths.forEach((path, index) => {
            const img = document.createElement('img');
            img.src = path;
            img.className = 'manga-page';
            img.onerror = function() {
                this.onerror = null;
                this.src = ''; 
                this.alt = `Página não encontrada: ${path}`;
                this.style.minHeight = '200px';
                this.style.display = 'flex';
                this.style.alignItems = 'center';
                this.style.justifyContent = 'center';
                this.style.backgroundColor = 'var(--color-surface)';
                this.style.color = 'var(--color-text-main)';
                this.style.borderBottom = '1px solid var(--color-border)';
            };
            container.appendChild(img);
        });
    }
}

function renderPersonagensView(db) {
    applyGlobalConfig(db);
    const characters = db.CHARACTERS || [];
    if (characters.length === 0) return;

    const universes = {};
    characters.forEach(char => {
        const u = char.universe || 'Universo Principal';
        if (!universes[u]) universes[u] = [];
        universes[u].push(char);
    });

    const listagemEl = document.getElementById('col-listagem');
    if (listagemEl) {
        listagemEl.innerHTML = '';

        for (const [uniName, chars] of Object.entries(universes)) {
            const section = document.createElement('div');
            section.className = 'universe-section';

            const title = document.createElement('h3');
            title.textContent = uniName;
            section.appendChild(title);

            const hr = document.createElement('hr');
            section.appendChild(hr);

            const grid = document.createElement('div');
            grid.className = 'universe-grid';

            // Adiciona os personagens existentes
            chars.forEach((char) => {
                const thumb = document.createElement('div');
                thumb.className = 'char-thumb-wrapper';
                thumb.dataset.id = char.id;
                // INSTRUÇÃO PARA O USUÁRIO FINAL:
                // Para que a imagem apareça aqui na moldura, faça o upload de uma imagem 1:1
                // para o diretório: assets/characters/{id_do_personagem}/pfp.png
                // Exemplo: assets/characters/aurora/pfp.png

                // Fallback premium para imagens quebradas nas molduras (removendo a tag img)
                thumb.innerHTML = `<img src="${char.pfp || `assets/characters/${char.id}/pfp.png`}" alt="${char.name}" onerror="this.onerror=null; this.parentNode.innerHTML='<div style=\\'width:100%; height:100%; display:flex; align-items:center; justify-content:center; background-color:var(--color-bg-main); color:var(--color-text-muted); font-size:0.8rem; text-align:center; padding:10px; border:1px solid var(--color-border); box-sizing:border-box;\\'>Sem Imagem</div>';">`;

                thumb.addEventListener('click', () => selectCharacter(char, thumb));
                grid.appendChild(thumb);
            });

            // Preenche o resto do grid com "Slots Vazios" para manter um visual premium de landing page.
            // O grid exibirá um mínimo de 12 slots (ou múltiplo de 3 para manter alinhamento em 3 colunas).
            const MIN_SLOTS = 12;
            const currentCount = chars.length;
            const slotsToFill = currentCount < MIN_SLOTS ? MIN_SLOTS - currentCount : (3 - (currentCount % 3)) % 3;

            for (let i = 0; i < slotsToFill; i++) {
                const emptySlot = document.createElement('div');
                emptySlot.className = 'char-thumb-wrapper empty-slot';
                emptySlot.title = 'Slot Disponível - Adicione um novo personagem no database.js';
                emptySlot.innerHTML = `<i class="fa-solid fa-plus"></i>`;
                grid.appendChild(emptySlot);
            }

            section.appendChild(grid);
            listagemEl.appendChild(section);
        }

        // Removido o mockSection "Outros Mundos (Em Breve)" pois agora focamos no grid principal de 12 itens
    }

    function selectCharacter(char, thumbEl) {
        document.querySelectorAll('.char-thumb-wrapper').forEach(el => el.classList.remove('active'));
        if (thumbEl) thumbEl.classList.add('active');

        const previewImgContainer = document.getElementById('preview-img-container');
        if (previewImgContainer) {
            // Limpar o conteúdo atual da moldura central
            previewImgContainer.innerHTML = '';
            previewImgContainer.className = 'preview-img-container'; // Reseta as classes de fallback
            previewImgContainer.onclick = () => {
                window.location.href = `character.html?id=${char.id}`;
            };

            const img = document.createElement('img');
            // INSTRUÇÃO PARA O USUÁRIO FINAL:
            // A imagem central tem proporção 3:4. Faça o upload no diretório:
            // assets/characters/{id_do_personagem}/portrait.png
            img.src = char.portrait || char.pfp || `assets/characters/${char.id}/portrait.png`;
            img.alt = `Preview de ${char.name}`;

            // Fallback premium caso a imagem falhe ao carregar
            img.onerror = function() {
                previewImgContainer.classList.add('sem-imagem');
                previewImgContainer.innerHTML = `
                    <div class="missing-image-placeholder">
                        <i class="fa-solid fa-image"></i>
                        <span>Sem Imagem</span>
                    </div>
                `;
                // Remove o click se não há imagem para evitar link falso, mas aqui podemos manter o acesso ao perfil
            };

            previewImgContainer.appendChild(img);
        }

        const infoName = document.getElementById('info-name');
        const infoDesc = document.getElementById('info-desc');
        const infoExtra = document.getElementById('info-extra');
        const btnGaleria = document.getElementById('btn-ver-galeria');
        const btnFicha = document.getElementById('btn-ver-ficha');

        if (infoName) infoName.textContent = char.name;
        if (infoDesc) infoDesc.textContent = char.personality || char.appearance || 'Descrição não disponível.';

        if (infoExtra) {
            // Updated to support badges/pills via CSS styling
            infoExtra.innerHTML = `
                ${char.age ? `<div class="info-row"><strong>Idade</strong><span>${char.age}</span></div>` : ''}
                ${char.medos && char.medos.length > 0 ? `<div class="info-row"><strong>Medos</strong><span>${char.medos.join(', ')}</span></div>` : ''}
            `;
        }

        if (btnGaleria) {
            const albumId = (db.ALBUMS || []).find(a => a.characterId === char.id || a.title.toLowerCase().includes(char.name.toLowerCase()))?.id || char.id;
            btnGaleria.href = `album.html?id=${albumId}`;
        }

        if (btnFicha) {
            if (char.linkFicha) {
                btnFicha.href = char.linkFicha;
                btnFicha.classList.remove('disabled');
                btnFicha.removeAttribute('disabled');
                btnFicha.style.display = 'block'; // Ensure it's visible
            } else {
                btnFicha.removeAttribute('href');
                btnFicha.classList.add('disabled');
                btnFicha.setAttribute('disabled', 'true');
                // You can also change to display = 'none' if preferred, but disabled looks better
            }
        }
    }

    const firstCharThumb = listagemEl?.querySelector('.char-thumb-wrapper');
    if (firstCharThumb && characters.length > 0) {
        selectCharacter(characters[0], firstCharThumb);
    }
}

function renderGalleryView(db) {
    const galleryContainer = document.getElementById('albums-container') || document.getElementById('gallery-container');
    if (!galleryContainer || !db.ALBUMS) return;

    let currentAlbums = [...db.ALBUMS];

    const allTags = new Set();
    db.ALBUMS.forEach(a => { if (a.tags) a.tags.forEach(t => allTags.add(t.toLowerCase())); });

    const filterTag = document.getElementById('filter-tag');
    if (filterTag) {
        filterTag.innerHTML = '<option value="all">Todas as Tags</option>';
        Array.from(allTags).sort().forEach(tag => {
            const opt = document.createElement('option');
            opt.value = tag;
            opt.innerText = '#' + tag;
            filterTag.appendChild(opt);
        });
    }

    function updateAlbumsView() {
        let filtered = currentAlbums;

        const raritySelect = document.getElementById('filter-rarity');
        if (raritySelect && raritySelect.value !== 'all') {
            filtered = filtered.filter(a => a.rarity && a.rarity.toLowerCase() === raritySelect.value.toLowerCase());
        }

        const tagSelect = document.getElementById('filter-tag');
        if (tagSelect && tagSelect.value !== 'all') {
            filtered = filtered.filter(a => a.tags && a.tags.some(t => t.toLowerCase() === tagSelect.value.toLowerCase()));
        }

        const sortSelect = document.getElementById('sort-albums');
        if (sortSelect) {
            const sv = sortSelect.value;
            if (sv === 'name-asc') filtered.sort((a,b) => a.title.localeCompare(b.title));
            else if (sv === 'name-desc') filtered.sort((a,b) => b.title.localeCompare(a.title));
            else if (sv === 'date-asc') filtered.sort((a,b) => new Date(a.creationDate||0) - new Date(b.creationDate||0));
            else filtered.sort((a,b) => new Date(b.creationDate||0) - new Date(a.creationDate||0));
        }

        galleryContainer.style.opacity = '0';
        setTimeout(() => {
            renderFilteredAlbums(filtered);
            galleryContainer.style.transition = 'opacity 0.4s ease';
            galleryContainer.style.opacity = '1';
        }, 300);
    }

    document.getElementById('filter-rarity')?.addEventListener('change', updateAlbumsView);
    document.getElementById('filter-tag')?.addEventListener('change', updateAlbumsView);
    document.getElementById('sort-albums')?.addEventListener('change', updateAlbumsView);

    function renderFilteredAlbums(albums) {
        galleryContainer.innerHTML = '';
        if (albums.length === 0) {
            galleryContainer.innerHTML = '<div class="minimal-panel" style="grid-column: 1 / -1; padding: 4rem 2rem; text-align: center; border: 1px dashed var(--color-border);"><h3 style="color: var(--color-text-muted); font-weight: 500; text-transform: uppercase; letter-spacing: 0.1em;">Nenhum Álbum Encontrado</h3></div>';
            return;
        }

        albums.forEach(album => {
            const card = document.createElement('a');
            card.href = `album.html?id=${album.id}`;
            card.className = 'album-card minimal-panel';
            card.style.textDecoration = 'none';
            card.style.padding = '1rem';

            const albumPhotos = db.PHOTOS && db.PHOTOS[album.id] ? db.PHOTOS[album.id] : [];
            const coverPhoto = albumPhotos.find(p => p.id === album.coverPhotoId) || albumPhotos[0];
            const coverPath = coverPhoto ? (coverPhoto.filename.startsWith('assets/') ? coverPhoto.filename : `assets/gallery/${coverPhoto.filename}`) : 'assets/ui/placeholder.png';

            let rarityClass = 'badge-common';
            if(album.rarity === 'Rare' || album.rarity === 'rare') rarityClass = 'badge-rare';
            else if(album.rarity === 'Epic' || album.rarity === 'epic') rarityClass = 'badge-epic';
            else if(album.rarity === 'Legendary' || album.rarity === 'legendary') rarityClass = 'badge-legendary';
            else if(album.rarity === 'Aurora' || album.rarity === 'aurora') rarityClass = 'badge-aurora';

            card.innerHTML = `
                <div class="img-container">
                    <span class="badge ${rarityClass}" style="position: absolute; top: 10px; left: 10px; z-index: 10; background: var(--color-surface); padding: 4px 10px; border-radius: 4px; font-weight: 600; font-size: 0.75rem;">${album.rarity || 'Common'}</span>
                    <img src="${coverPath}" class="img-fit" alt="${album.title}" onerror="this.onerror=null; this.parentElement.style.display='none';">
                </div>
                <div class="album-labels" style="margin-top:1rem; flex-direction: column; gap: 0.5rem;">
                    <h3 class="album-title" style="font-size: 1.2rem;">${album.title}</h3>
                    <div style="display: flex; justify-content: space-between; width: 100%;">
                        <span style="font-weight: 600; color: var(--color-primary);"><i class="fa-solid fa-image"></i> ${albumPhotos.length} Fotos</span>
                        <span style="opacity: 0.6; font-size: 0.8rem;">${album.tags ? album.tags.map(t=>'#'+t).join(' ') : ''}</span>
                    </div>
                </div>
            `;
            galleryContainer.appendChild(card);
        });
    }

    updateAlbumsView();
}

function renderAlbumPage(db) {
    const params = new URLSearchParams(window.location.search);
    let albumId = params.get('id');
    if (!albumId && db.ALBUMS && db.ALBUMS.length > 0) albumId = db.ALBUMS[0].id;

    const album = (db.ALBUMS || []).find(a => a.id === albumId) || (db.ALBUMS || [])[0];
    if (!album) return;

    const albumTitleEl = document.getElementById('album-title');
    const albumDescEl = document.getElementById('album-desc');
    const photosContainer = document.getElementById('photos-container');

    if (albumTitleEl) albumTitleEl.innerText = album.title;
    if (albumDescEl) albumDescEl.innerHTML = album.description || '';

    function renderTags() {
        const tagsContainer = document.getElementById('album-tags-container');
        if (tagsContainer && album.tags) {
            tagsContainer.innerHTML = album.tags.map(tag => `<span style="background: var(--color-primary); color: #FFF; padding: 0.3rem 0.8rem; border-radius: 20px; font-size: 0.75rem; font-weight: 600; letter-spacing: 0.05em; text-transform: uppercase;">#${tag}</span>`).join('');
        }
        const tagsInput = document.getElementById('album-tags-input');
        if (tagsInput && album.tags) tagsInput.value = album.tags.join(', ');
    }
    renderTags();

    const btnSaveTags = document.getElementById('btn-save-tags');
    if (btnSaveTags) {
        btnSaveTags.addEventListener('click', () => {
            const tagsInput = document.getElementById('album-tags-input');
            if (tagsInput) {
                album.tags = tagsInput.value.split(',').map(t => t.trim().toLowerCase()).filter(t => t);
                renderTags();
                showToast('Tags salvas! Copie o JSON.');

                const jsonStr = JSON.stringify(db.ALBUMS, null, 4);
                let copyBtn = document.getElementById('btn-copy-albums-json');
                if (!copyBtn) {
                    copyBtn = document.createElement('button');
                    copyBtn.id = 'btn-copy-albums-json';
                    copyBtn.className = 'btn';
                    copyBtn.style.position = 'fixed';
                    copyBtn.style.bottom = '170px';
                    copyBtn.style.right = '40px';
                    copyBtn.style.zIndex = '9999';
                    copyBtn.innerHTML = '<i class="fa-solid fa-tags"></i> COPIAR JSON DOS ÁLBUNS';
                    document.body.appendChild(copyBtn);

                    copyBtn.addEventListener('click', () => {
                        navigator.clipboard.writeText(jsonStr).then(() => {
                            showToast('JSON copiado!');
                            copyBtn.remove();
                        });
                    });
                }
            }
        });
    }

    let currentPhotos = db.PHOTOS && db.PHOTOS[album.id] ? db.PHOTOS[album.id] : [];
    currentPhotos.sort((a, b) => a.orderIndex - b.orderIndex);

    let isEditMode = false;
    let sortableInstance = null;

    if (photosContainer) {
        photosContainer.classList.add('album-grid');

        function renderPhotos(photosToRender) {
            photosContainer.innerHTML = '';
            photosToRender.forEach((photo, index) => {
                const card = document.createElement('div');
                card.className = 'photo-card-premium';
                card.dataset.id = photo.id;

                const imgPath = photo.filename.startsWith("assets/") ? photo.filename : (photo.filename.startsWith("gallery/") ? `assets/${photo.filename}` : `assets/ui/${photo.filename}`);
                const isCover = album.coverPhotoId === photo.id;

                card.innerHTML = `
                    <div class="drag-handle" style="position: absolute; top: 10px; left: 10px; z-index: 10; color: #FFF; background: rgba(0,0,0,0.5); padding: 0.5rem; border-radius: 8px; backdrop-filter: blur(4px); display: none;"><i class="fa-solid fa-grip-vertical"></i></div>
                    <i class="cover-star ${isCover ? 'fa-solid fa-star is-cover' : 'fa-regular fa-star'}" title="Definir como Capa"></i>
                    <div class="img-container" style="cursor: pointer; padding: 0.5rem;" onclick="openModal(${index})">
                        <img src="${imgPath}" class="img-fit" alt="${photo.name}" onerror="this.onerror=null; this.parentElement.style.display='none';">
                    </div>
                    <div class="album-labels" style="margin-top:0.5rem; padding: 0 0.5rem 0.5rem 0.5rem;">
                        <span style="font-weight:600; color:var(--color-text-main);">${photo.name}</span>
                    </div>
                    <div class="album-labels" style="padding: 0 0.5rem 0.5rem 0.5rem;">
                        <span>${photo.fileSize || ''}</span>
                    </div>
                `;

                const btnCover = card.querySelector('.cover-star');
                btnCover.addEventListener('click', (e) => {
                    e.stopPropagation();
                    document.querySelectorAll('.cover-star').forEach(el => { el.className = 'cover-star fa-regular fa-star'; });
                    btnCover.className = 'cover-star fa-solid fa-star is-cover';
                    album.coverPhotoId = photo.id;
                    if (typeof window.showToast === 'function') window.showToast('Capa definida! (Salve o JSON dos álbuns)');
                });

                photosContainer.appendChild(card);
            });
        }

        renderPhotos(currentPhotos);

        const btnEdit = document.getElementById('btn-edit-mode');
        if (btnEdit) {
            btnEdit.addEventListener('click', () => {
                isEditMode = !isEditMode;
                const tagsEditor = document.getElementById('album-tags-editor');
                if (tagsEditor) tagsEditor.style.display = isEditMode ? 'flex' : 'none';
                document.body.classList.toggle('edit-mode', isEditMode);

                if (isEditMode) {
                    btnEdit.classList.add('active');
                    photosContainer.classList.add('edit-mode-active');
                    document.querySelectorAll('.drag-handle').forEach(el => el.style.display = 'block');
                    if (typeof window.showToast === 'function') window.showToast('Modo de Edição Ativo. Arraste para reordenar.', 'var(--color-primary)');
                    if (typeof Sortable !== 'undefined') {
                        sortableInstance = new Sortable(photosContainer, {
                            animation: 300,
                            easing: "cubic-bezier(0.16, 1, 0.3, 1)",
                            handle: '.drag-handle',
                            ghostClass: 'sortable-ghost',
                            onEnd: () => {
                                const newOrderIds = Array.from(photosContainer.children).map(c => c.dataset.id);
                                const updatedPhotos = [];
                                newOrderIds.forEach((id, index) => {
                                    const p = currentPhotos.find(photo => String(photo.id) === String(id));
                                    if (p) { p.orderIndex = index; updatedPhotos.push(p); }
                                });
                                currentPhotos = updatedPhotos;

                                const jsonStr = JSON.stringify(currentPhotos, null, 4);
                                let copyBtn = document.getElementById('btn-copy-json');
                                if (!copyBtn) {
                                    copyBtn = document.createElement('button');
                                    copyBtn.id = 'btn-copy-json';
                                    copyBtn.className = 'btn';
                                    copyBtn.style.position = 'fixed';
                                    copyBtn.style.bottom = '100px';
                                    copyBtn.style.right = '120px';
                                    copyBtn.style.zIndex = '9999';
                                    copyBtn.innerHTML = '<i class="fa-solid fa-copy"></i> COPIAR JSON DAS FOTOS';
                                    document.body.appendChild(copyBtn);

                                    copyBtn.addEventListener('click', () => {
                                        navigator.clipboard.writeText(jsonStr).then(() => {
                                            showToast('Copiado para o Clipboard!');
                                            copyBtn.remove();
                                        });
                                    });
                                }
                            }
                        });
                    }
                } else {
                    btnEdit.classList.remove('active');
                    photosContainer.classList.remove('edit-mode-active');
                    document.querySelectorAll('.drag-handle').forEach(el => el.style.display = 'none');
                    if (sortableInstance) sortableInstance.destroy();
                    const copyBtn = document.getElementById('btn-copy-json');
                    if (copyBtn) copyBtn.remove();
                }
            });
        }

        const modal = document.getElementById('photo-modal');
        if(modal) modal.classList.remove('photo-modal'); // remove old class if exist
        const modalImg = document.getElementById('modal-img');
        const modalTitle = document.getElementById('modal-title');
        let currentIndex = 0;
        let currentZoom = 1;

        window.openModal = function(index) {
            if (isEditMode) return;
            currentIndex = index;
            updateModalView();
            if(modal) modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        };

        window.closeModal = function() {
            if(modal) modal.classList.remove('active');
            document.body.style.overflow = '';
            currentZoom = 1;
            if(modalImg) modalImg.style.transform = `scale(${currentZoom})`;
        }

        function updateModalView() {
            const photo = currentPhotos[currentIndex];
            if(modalImg) modalImg.src = photo.filename.startsWith("assets/") ? photo.filename : (photo.filename.startsWith("gallery/") ? `assets/${photo.filename}` : `assets/ui/${photo.filename}`);
            if(modalTitle) modalTitle.innerText = photo.name;
            currentZoom = 1;
            if(modalImg) modalImg.style.transform = `scale(${currentZoom})`;
            
            const modalSize = document.getElementById('modal-filesize');
            const modalDate = document.getElementById('modal-date');
            if (modalSize) modalSize.innerText = photo.fileSize || '';
            if (modalDate && photo.uploadDate) modalDate.innerText = new Date(photo.uploadDate).toLocaleDateString();
        }

        document.getElementById('modal-close')?.addEventListener('click', closeModal);
        document.getElementById('modal-prev')?.addEventListener('click', () => { if(currentIndex > 0) { currentIndex--; updateModalView(); } });
        document.getElementById('modal-next')?.addEventListener('click', () => { if(currentIndex < currentPhotos.length - 1) { currentIndex++; updateModalView(); } });
        document.getElementById('modal-zoom-in')?.addEventListener('click', () => { currentZoom += 0.5; if(modalImg) modalImg.style.transform = `scale(${currentZoom})`; });
        document.getElementById('modal-zoom-out')?.addEventListener('click', () => { if(currentZoom > 0.5) { currentZoom -= 0.5; if(modalImg) modalImg.style.transform = `scale(${currentZoom})`; } });

        document.addEventListener('keydown', (e) => {
            if (modal && !modal.classList.contains('active')) return;
            if (e.key === 'Escape') closeModal();
            if (e.key === 'ArrowLeft' && currentIndex > 0) { currentIndex--; updateModalView(); }
            if (e.key === 'ArrowRight' && currentIndex < currentPhotos.length - 1) { currentIndex++; updateModalView(); }
        });
    }
}

// --- ROUTER ---
class Router {
    init() {
        const path = window.location.pathname;
        const page = path.split('/').pop() || 'index.html';
        const db = appState.getState().db;

        injectGlobalLayout(page);
        applyGlobalConfig(db);
        new SearchEngine();

        const headerContainer = document.getElementById('app-header');
        if (headerContainer) {
            const nav = headerContainer.querySelector('.nav-links');
            if (nav) {
                const searchBtnHTML = `
                    <button id="btn-search" style="background: none; border: none; font-size: 1.2rem; cursor: pointer; color: var(--color-text-main); margin-left: 1rem;" title="Pesquisar (Ctrl+K)">
                        <i class="fa-solid fa-magnifying-glass"></i>
                    </button>
                `;
                const darkModeBtn = document.getElementById('btn-dark-mode');
                if (darkModeBtn) darkModeBtn.insertAdjacentHTML('beforebegin', searchBtnHTML);
            }
        }

        if (page === 'character.html') renderCharacterView(db);
        else if (page === 'manga-reader.html') renderMangaView(db);
        else if (page === 'temporadas.html') renderTemporadasView(db);
        else if (page === 'galeria.html') renderGalleryView(db);
        else if (page === 'album.html') renderAlbumPage(db);
        else if (page === 'personagens.html') renderPersonagensView(db);
        else if (page === 'index.html' || page === '') renderHomeView(db);

        this.setupGlobalEvents();
    }

    setupGlobalEvents() {
        document.addEventListener('click', (e) => {
            const btnDark = e.target.closest('#btn-dark-mode');
            if (btnDark) {
                const currentTheme = appState.getState().theme;
                const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

                appState.setState({ theme: newTheme });
                localStorage.setItem('sglmo-theme', newTheme);

                if (newTheme === 'dark') document.body.classList.add('dark-mode');
                else document.body.classList.remove('dark-mode');

                const icon = btnDark.querySelector('i');
                if (icon) icon.className = newTheme === 'dark' ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
            }
            
            const btnSearch = e.target.closest('#btn-search');
            if (btnSearch) {
                document.dispatchEvent(new KeyboardEvent('keydown', {'key': 'k', 'ctrlKey': true}));
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
            if (e.shiftKey && e.key.toLowerCase() === 'd') { document.getElementById('btn-dark-mode')?.click(); showToast('Tema alternado!'); }
            if (e.shiftKey && e.key.toLowerCase() === 'h') window.location.href = 'index.html';
            if (e.shiftKey && e.key.toLowerCase() === 'g') window.location.href = 'galeria.html';
        });
    }
}

// Bootstrap
document.addEventListener('DOMContentLoaded', () => {
    const app = new Router();
    app.init();
});