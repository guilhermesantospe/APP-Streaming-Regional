const movies = [
  { id: 1, 
    title: "Gonzaga: De Pai pra Filho ", 
    genre: "Drama,Musica",
    region: "Nordeste", 
    synopsis: "Decidido a mudar seu destino, Gonzaga sai de casa jovem e segue para cidade grande em busca de novos horizontes e para apagar uma tristeza amorosa.", 
    cast: " Júlio Andrade, Nanda Costa, Nivaldo Expedito De Carvalho" 
  },

  { id: 2,
    title: "Nevoeiro na Serra", 
    genre: "Mistério", 
    region: "Sul", 
    synopsis: "Segredos antigos vêm à tona.", 
    cast: "Ricardo Maia, Beatriz Faria" 
    },

  { id: 3, 
    title: "Cidade de Deus", 
    genre: "crime,drama,suspense", 
    region: "Sudeste", 
    synopsis: "Dadinho (Douglas Silva) e Buscapé são grandes amigos, que cresceram juntos imersos em um universo de muita violência. ", 
    cast: " Alexandre Rodrigues, Leandro Firmino da Hora, Seu Jorge" 
  },

  { id: 4, title: "Terra de Cima",
    genre: "Aventura", 
    region: "Centro-Oeste", 
    synopsis: "Jovens exploradores no cerrado brasileiro.",
    cast: "Lucas Costa, Marina Lopes" 
  },
];

const movieList = document.getElementById("movie-list");
const search = document.getElementById("search");
const regionFilter = document.getElementById("region-filter");
const details = document.getElementById("details");
const player = document.getElementById("player");
const loginModal = document.getElementById("login-modal");

let currentUser = JSON.parse(localStorage.getItem("user")) || null;
let favorites = JSON.parse(localStorage.getItem("favorites")) || [];
let comments = JSON.parse(localStorage.getItem("comments")) || {};

function renderMovies() {
  movieList.innerHTML = "";
  const query = search.value.toLowerCase();
  const region = regionFilter.value;
  movies.filter(m => 
    (m.title.toLowerCase().includes(query) || m.genre.toLowerCase().includes(query) || m.region.toLowerCase().includes(query)) &&
    (region === "Todas" || m.region === region)
  ).forEach(m => {
    const div = document.createElement("div");
    div.className = "movie-card";
    div.innerHTML = `
      <h3>${m.title}</h3>
      <p>${m.genre} • ${m.region}</p>
      <button onclick="showDetails(${m.id})">Detalhes</button>
    `;
    movieList.appendChild(div);
  });
}

function showDetails(id) {
  const movie = movies.find(m => m.id === id);
  document.getElementById("movie-title").textContent = movie.title;
  document.getElementById("movie-synopsis").textContent = movie.synopsis;
  document.getElementById("movie-cast").textContent = "Elenco: " + movie.cast;
  details.classList.remove("hidden");

  document.getElementById("watch-btn").onclick = () => openPlayer(movie);
  document.getElementById("fav-btn").onclick = () => toggleFavorite(movie.id);
  renderComments(movie.id);
}

function openPlayer(movie) {
  if (!currentUser) return openLogin();
  player.classList.remove("hidden");
  document.getElementById("player-title").textContent = movie.title;
}

document.getElementById("close-player").onclick = () => player.classList.add("hidden");

function openLogin() {
     loginModal.style.display = "flex";
}
document.getElementById("close-login").onclick = () =>{
    console.log("Fechando modal de login");
    loginModal.style.displlay = 'none';
}
document.getElementById("exit-login").onclick = () =>{
  currentUser = null;
  localStorage.removeItem("user");
  loginModal.style.display = 'none';
  updateUserInfo();
  alert("Você saiu da sua conta!");
}

document.getElementById("save-login").onclick = () => {
  const name = document.getElementById("login-name").value;
  const email = document.getElementById("login-email").value;
  currentUser = { name, email };
  localStorage.setItem("user", JSON.stringify(currentUser));
  loginModal.style.display ="none";
  updateUserInfo();
};

function updateUserInfo() {
  const userInfo = document.getElementById("user-info");
  const loginBtn = document.getElementById("login-btn");
  const logoutBtn = document.getElementById("logout-btn");

  if (currentUser) {
    userInfo.textContent = "Olá, " + currentUser.name;
    loginBtn.style.display = "none";
    logoutBtn.style.display = "inline";
  } else {
    userInfo.textContent = "";
    loginBtn.style.display = "inline";
    logoutBtn.style.display = "none";
  }
}
document.getElementById("logout-btn").onclick = () => {
  currentUser = null;
  localStorage.removeItem("user");
  updateUserInfo();
};

function toggleFavorite(id) {
  if (!currentUser) return openLogin();
  if (favorites.includes(id)) favorites = favorites.filter(f => f !== id);
  else favorites.push(id);
  localStorage.setItem("favorites", JSON.stringify(favorites));
  alert("Favoritos atualizados!");
}

function renderComments(id) {
  const cBox = document.getElementById("comments");
  cBox.innerHTML = "";
  (comments[id] || []).forEach(c => {
    const p = document.createElement("p");
    p.textContent = `${c.user}: ${c.text}`;
    cBox.appendChild(p);
  });

  document.getElementById("send-comment").onclick = () => {
    if (!currentUser) return openLogin();
    const text = document.getElementById("comment-input").value.trim();
    if (!text) return;
    comments[id] = comments[id] || [];
    comments[id].push({ user: currentUser.name, text });
    localStorage.setItem("comments", JSON.stringify(comments));
    renderComments(id);
  };
}

search.oninput = renderMovies;
regionFilter.onchange = renderMovies;
document.getElementById("login-btn").onclick = openLogin;
renderMovies();
updateUserInfo();