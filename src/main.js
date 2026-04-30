import './style.css';

// Mock data to start with if localStorage is empty
const initialGames = [
  {
    id: '1',
    title: 'Elden Ring',
    image: 'https://image.api.playstation.com/vulcan/ap/rnd/202110/2000/aGhopp3MHppi7kooGE2Dtt8C.png',
    status: 'platinum'
  },
  {
    id: '2',
    title: 'Hollow Knight',
    image: 'https://assets.nintendo.com/image/upload/c_fill,w_1200/q_auto:best/f_auto/dpr_2.0/ncom/software/switch/70010000003208/21262d59048a609dce8c005ba332b7bc5a4f3ec18a7a58a74e1d1f7743d8c582',
    status: 'playing'
  },
  {
    id: '3',
    title: 'The Witcher 3: Wild Hunt',
    image: 'https://image.api.playstation.com/vulcan/ap/rnd/202211/0711/kh4MUIuMmHlktOHar3lVl6rY.png',
    status: 'completed'
  },
  {
    id: '4',
    title: 'Cyberpunk 2077',
    image: 'https://image.api.playstation.com/vulcan/ap/rnd/202311/2812/28e5354ff03d92036c8ef8cd1711c7af01389de7d8d21b0e.png',
    status: 'plan'
  },
  {
    id: '5',
    title: 'Starfield',
    image: 'https://store-images.s-microsoft.com/image/apps.43793.13689404283833324.93510522-83de-4340-bbfe-51147da5fb16.89d53c7c-486d-495d-b2ba-7e23af0a4f50',
    status: 'dropped'
  }
];

const statusMap = {
  playing: { label: 'Jogando', class: 'badge-playing' },
  plan: { label: 'Jogarei a seguir', class: 'badge-plan' },
  future: { label: 'Futuramente', class: 'badge-future' },
  'plan-platinum': { label: 'Irei platinar / Fazer 100%', class: 'badge-plan-platinum' },
  dropped: { label: 'Dropados', class: 'badge-dropped' },
  completed: { label: 'Finalizados', class: 'badge-completed' },
  platinum: { label: '100% / Platinados', class: 'badge-platinum' }
};

const categoryTitles = {
  all: 'Todos os Jogos',
  playing: 'Jogando Atualmente',
  plan: 'Jogarei a Seguir',
  future: 'Jogarei Futuramente',
  'plan-platinum': 'Irei Platinar / Fazer 100%',
  dropped: 'Jogos Dropados',
  completed: 'Jogos Finalizados',
  platinum: 'Jogos Platinados / 100%'
};

// State
let games = JSON.parse(localStorage.getItem('mygamelist_games')) || initialGames;
let currentCategory = 'all';
let searchQuery = '';

// DOM Elements
const gameGrid = document.getElementById('game-grid');
const categoryNav = document.getElementById('category-nav');
const currentCategoryTitle = document.getElementById('current-category-title');
const searchInput = document.getElementById('searchInput');

const modal = document.getElementById('game-modal');
const addGameBtn = document.getElementById('add-game-btn');
const closeModalBtn = document.getElementById('close-modal');
const gameForm = document.getElementById('game-form');
const modalTitle = document.getElementById('modal-title');

// Initialize
function init() {
  saveData();
  renderGames();
  setupEventListeners();
}

// Save data to localStorage
function saveData() {
  localStorage.setItem('mygamelist_games', JSON.stringify(games));
}

// Render Games
function renderGames() {
  gameGrid.innerHTML = '';
  
  let filteredGames = games;
  
  // Filter by category
  if (currentCategory !== 'all') {
    filteredGames = filteredGames.filter(g => g.status === currentCategory);
  }
  
  // Filter by search
  if (searchQuery) {
    filteredGames = filteredGames.filter(g => g.title.toLowerCase().includes(searchQuery.toLowerCase()));
  }
  
  if (filteredGames.length === 0) {
    gameGrid.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">🎮</div>
        <h3>Nenhum jogo encontrado</h3>
        <p>Adicione alguns jogos ou mude o filtro para ver seus títulos.</p>
      </div>
    `;
    return;
  }
  
  filteredGames.forEach(game => {
    const card = document.createElement('div');
    card.className = 'game-card';
    
    const statusInfo = statusMap[game.status];
    
    card.innerHTML = `
      <img src="${game.image}" alt="${game.title}" class="game-card-img" onerror="this.src='https://placehold.co/400x600/1a1d24/f0f0f0?text=Sem+Capa'">
      <div class="game-card-content">
        <span class="game-status-badge ${statusInfo.class}">${statusInfo.label}</span>
        <h3 class="game-title" title="${game.title}">${game.title}</h3>
        
        <div class="game-actions">
          <button class="btn-edit" data-id="${game.id}">Editar</button>
          <button class="btn-delete" data-id="${game.id}">Excluir</button>
        </div>
      </div>
    `;
    
    gameGrid.appendChild(card);
  });
  
  // Attach event listeners to new buttons
  document.querySelectorAll('.btn-edit').forEach(btn => {
    btn.addEventListener('click', (e) => openModal(e.target.dataset.id));
  });
  
  document.querySelectorAll('.btn-delete').forEach(btn => {
    btn.addEventListener('click', (e) => deleteGame(e.target.dataset.id));
  });
}

// Set Category
function setCategory(category) {
  currentCategory = category;
  
  // Update UI
  document.querySelectorAll('#category-nav li').forEach(li => {
    li.classList.remove('active');
    if (li.dataset.category === category) {
      li.classList.add('active');
    }
  });
  
  currentCategoryTitle.textContent = categoryTitles[category];
  renderGames();
}

// Event Listeners setup
function setupEventListeners() {
  // Category Navigation
  categoryNav.addEventListener('click', (e) => {
    const li = e.target.closest('li');
    if (li) {
      setCategory(li.dataset.category);
    }
  });
  
  // Search
  searchInput.addEventListener('input', (e) => {
    searchQuery = e.target.value;
    renderGames();
  });
  
  // Modal Actions
  addGameBtn.addEventListener('click', () => openModal());
  closeModalBtn.addEventListener('click', closeModal);
  
  // Close modal when clicking outside
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });
  
  // Form Submit
  gameForm.addEventListener('submit', handleFormSubmit);
}

// Modal Functions
function openModal(id = null) {
  const gameIdInput = document.getElementById('game-id');
  const titleInput = document.getElementById('game-title');
  const imageInput = document.getElementById('game-image');
  const statusSelect = document.getElementById('game-status');
  
  if (id) {
    // Edit Mode
    const game = games.find(g => g.id === id);
    modalTitle.textContent = 'Editar Jogo';
    gameIdInput.value = game.id;
    titleInput.value = game.title;
    imageInput.value = game.image;
    statusSelect.value = game.status;
  } else {
    // Add Mode
    modalTitle.textContent = 'Adicionar Jogo';
    gameForm.reset();
    gameIdInput.value = '';
    
    // Auto-select status based on current category if not "all"
    if (currentCategory !== 'all') {
      statusSelect.value = currentCategory;
    }
  }
  
  modal.classList.remove('hidden');
}

function closeModal() {
  modal.classList.add('hidden');
}

function handleFormSubmit(e) {
  e.preventDefault();
  
  const id = document.getElementById('game-id').value;
  const title = document.getElementById('game-title').value;
  const image = document.getElementById('game-image').value;
  const status = document.getElementById('game-status').value;
  
  if (id) {
    // Update existing game
    const index = games.findIndex(g => g.id === id);
    if (index !== -1) {
      games[index] = { id, title, image, status };
    }
  } else {
    // Add new game
    const newGame = {
      id: Date.now().toString(),
      title,
      image,
      status
    };
    games.push(newGame);
  }
  
  saveData();
  renderGames();
  closeModal();
}

function deleteGame(id) {
  if (confirm('Tem certeza que deseja excluir este jogo da sua lista?')) {
    games = games.filter(g => g.id !== id);
    saveData();
    renderGames();
  }
}

// Run app
init();
