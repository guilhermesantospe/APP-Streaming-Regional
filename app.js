const API_URL = "https://streaming-regional-api.free.beeceptor.com/filmes"; 

let movies = [];

const movieList = document.getElementById("movie-list");
const search = document.getElementById("search");
const regionFilter = document.getElementById("region-filter");
const detailsSection = document.getElementById("details");
const moviesSection = document.getElementById("movies");
const playerSection = document.getElementById("player");

let currentUser = JSON.parse(localStorage.getItem("user")) || null;
let favorites = JSON.parse(localStorage.getItem("favorites")) || [];
let comments = JSON.parse(localStorage.getItem("comments")) || {};

async function fetchMovies() {
    try {
        const response = await fetch(API_URL);
        
        if (!response.ok) throw new Error("Erro ao conectar na API");
        
        movies = await response.json();
        
        renderMovies();
    } catch (error) {
        console.error(error);
        movieList.innerHTML = `<p class="text-danger text-center">Erro ao carregar filmes.<br>Erro: ${error.message}</p>`;
    }
}

function renderMovies() {
  movieList.innerHTML = "";
  const query = search.value.toLowerCase();
  const region = regionFilter.value;

  const filtered = movies.filter(m => 
    (m.title.toLowerCase().includes(query) || m.genre.toLowerCase().includes(query) || m.region.toLowerCase().includes(query)) &&
    (region === "Todas" || m.region === region)
  );

  if(filtered.length === 0) {
      movieList.innerHTML = "<p class='text-center text-muted'>Nenhum filme encontrado.</p>";
      return;
  }

  filtered.forEach(m => {
    const div = document.createElement("div");
    div.className = "col-md-3 col-sm-6"; 
    div.innerHTML = `
      <div class="card h-100 movie-card">
        <img src="${m.image}" class="card-img-top" alt="${m.title}">
        <div class="card-body d-flex flex-column">
          <h5 class="card-title">${m.title}</h5>
          <p class="card-text text-muted small">${m.genre} • ${m.region}</p>
          <button class="btn btn-outline-warning mt-auto w-100" onclick="showDetails(${m.id})">Detalhes</button>
        </div>
      </div>
    `;
    movieList.appendChild(div);
  });
}

function showDetails(id) {
  const movie = movies.find(m => m.id === id);
  
  document.getElementById("movie-title").textContent = movie.title;
  document.getElementById("movie-synopsis").textContent = movie.synopsis;
  document.getElementById("movie-cast").textContent = "Elenco: " + movie.cast;
  
  moviesSection.classList.add("hidden");
  detailsSection.classList.remove("hidden");
  playerSection.classList.add("hidden");

  document.getElementById("watch-btn").onclick = () => openPlayer(movie);
  document.getElementById("fav-btn").onclick = () => toggleFavorite(movie.id);
  
  renderComments(movie.id);
}

function goBack() {
    detailsSection.classList.add("hidden");
    playerSection.classList.add("hidden");
    moviesSection.classList.remove("hidden");
}

function openPlayer(movie) {
  if (!currentUser) return alert("Faça login para assistir!");
  
  detailsSection.classList.add("hidden");
  playerSection.classList.remove("hidden");
  document.getElementById("player-title").textContent = movie.title;
}

document.getElementById("close-player").onclick = () => {
    playerSection.classList.add("hidden");
    detailsSection.classList.remove("hidden");
};

const bootstrapModal = new bootstrap.Modal(document.getElementById('loginModal'));

document.getElementById("save-login").onclick = () => {
  const name = document.getElementById("login-name").value;
  const email = document.getElementById("login-email").value;
  
  if(!name || !email) return alert("Preencha os campos!");

  currentUser = { name, email };
  localStorage.setItem("user", JSON.stringify(currentUser));
  
  const modalElem = document.querySelector('#loginModal');
  const modalInstance = bootstrap.Modal.getInstance(modalElem);
  modalInstance.hide();

  updateUserInfo();
};

document.getElementById("logout-btn").onclick = () => {
  currentUser = null;
  localStorage.removeItem("user");
  updateUserInfo();
};

function updateUserInfo() {
  const userInfo = document.getElementById("user-info");
  const loginBtn = document.getElementById("login-btn");
  const userArea = document.getElementById("user-area");

  if (currentUser) {
    userInfo.textContent = "Olá, " + currentUser.name;
    loginBtn.classList.add("d-none"); 
    userArea.classList.remove("d-none");
    userArea.classList.add("d-flex");
  } else {
    userInfo.textContent = "";
    loginBtn.classList.remove("d-none");
    userArea.classList.add("d-none");
    userArea.classList.remove("d-flex");
  }
}

function toggleFavorite(id) {
  if (!currentUser) return alert("Faça login para favoritar!");
  
  if (favorites.includes(id)) {
      favorites = favorites.filter(f => f !== id);
      alert("Removido dos favoritos.");
  } else {
      favorites.push(id);
      alert("Adicionado aos favoritos!");
  }
  localStorage.setItem("favorites", JSON.stringify(favorites));
}

function renderComments(id) {
  const cBox = document.getElementById("comments");
  cBox.innerHTML = "";
  (comments[id] || []).forEach(c => {
    const p = document.createElement("div");
    p.className = "border-bottom border-secondary py-1";
    p.innerHTML = `<strong class="text-warning">${c.user}:</strong> <span>${c.text}</span>`;
    cBox.appendChild(p);
  });

  document.getElementById("send-comment").onclick = () => {
    if (!currentUser) return alert("Faça login para comentar!");
    const text = document.getElementById("comment-input").value.trim();
    if (!text) return;
    
    comments[id] = comments[id] || [];
    comments[id].push({ user: currentUser.name, text });
    localStorage.setItem("comments", JSON.stringify(comments));
    
    document.getElementById("comment-input").value = ""; 
    renderComments(id);
  };
}

search.oninput = renderMovies;
regionFilter.onchange = renderMovies;

updateUserInfo();
fetchMovies();