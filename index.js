const BASE_URL = "https://movie-list.alphacamp.io";
const INDEX_URL = BASE_URL + "/api/v1/movies/";
const POSTER_URL = BASE_URL + "/posters/";
const MOVIES_PER_PAGE = 12;

const dataPanel = document.querySelector("#data-panel");
const searchForm = document.querySelector("#search-form");
const searchInput = document.querySelector("#search-input");
const paginator = document.querySelector("#paginator");
const switchIcon = document.querySelector(".switch-icon");

const movies = [];
let filteredMovies = [];
let page = 1;


axios.get(INDEX_URL).then((response) => {
  movies.push(...response.data.results);
  renderPaginator(movies.length);
  renderMovieList(getMoviesByPage(1));
});

// dataPanel 點擊事件 (modal / favorite)
dataPanel.addEventListener('click', onPanelClicked)

// 分頁器點擊事件 (paginator)
paginator.addEventListener("click", onPaginatorClicked)

// 表單提交事件 (search form)
searchForm.addEventListener("submit", onSearchFormSubmitted)

// 模式轉換點擊事件 (card / list)
switchIcon.addEventListener("click", changeMode)



// 渲染電影清單（ card mode ）

function renderMovieList(data) {
  let rawHTML = "";

  data.forEach((item) => {
    rawHTML += `
      <div class="col-sm-3">
        <div class="mb-2">
          <div class="card">
            <img 
              src="${POSTER_URL + item.image}" 
              class="card-img-top" 
              alt="Movie Poster">
            <div class="card-body">
              <h5 class="card-title">${item.title}</h5>
            </div>
            <div class="card-footer">
              <button class="btn btn-primary btn-show-movie" data-toggle="modal" data-target="#movie-modal" data-id="${
                item.id
              }">More</button>
              <button class="btn btn-info btn-add-favorite" data-id="${
                item.id
              }">+</button>
            </div>
          </div>
        </div>
      </div>
    `;
  });
  dataPanel.innerHTML = rawHTML;
}

// 渲染電影清單 （ list mode )
function renderListMode(data) {
  let rawHTML = `<ul class="list-group list-group-flush col-sm-12 ">`;

  data.forEach((item) => {
    rawHTML += `
      <li class="list-group-item">
        <div class="row align-items-center">
          <div class="col">
            <h5>${item.title}</h5>
          </div>
          <div class="col-md-auto">
            <button class="btn btn-primary btn-show-movie" id="list-modal" data-toggle="modal" data-target="#movie-modal" data-id="${item.id}">More</button>
          </div>
          <div class="col col-lg-2">
            <button class="btn btn-info btn-add-favorite" id="list-favorite" data-id="${item.id}">+</button>
          </div>
        </div>
      </li>
    `;
  });
  rawHTML += `</ul>`;
  dataPanel.innerHTML = rawHTML;
}

// card / list mode 轉換
function changeMode(event) {
  if (event.target.matches("#card-mode")) {
    renderMovieList(getMoviesByPage(filteredMovies.length ? 1 : page));
    renderPaginator(filteredMovies.length ? filteredMovies.length : movies.length);
  } else if (event.target.matches("#list-mode")) {
    renderListMode(getMoviesByPage(filteredMovies.length ? 1 : page));
    renderListModePaginator(filteredMovies.length ? filteredMovies.length : movies.length);
  }
}

// 取得分頁中的資料，並判斷是否正在搜尋頁面
function getMoviesByPage(page) {
  const data = filteredMovies.length ? filteredMovies : movies;
  const startIndex = (page - 1) * MOVIES_PER_PAGE;
  return data.slice(startIndex, startIndex + MOVIES_PER_PAGE);
}

// 視窗中的點擊事件
function onPanelClicked(event) {
  if (event.target.matches(".btn-show-movie")) {
    showMovieModal(Number(event.target.dataset.id));
  } else if (event.target.matches(".btn-add-favorite")) {
    addToFavorite(Number(event.target.dataset.id));
  }
}

// modal 視窗
function showMovieModal(id) {
  const modalTitle = document.querySelector("#movie-modal-title");
  const modalImage = document.querySelector("#movie-modal-image");
  const modalDate = document.querySelector("#movie-modal-date");
  const modalDescription = document.querySelector("#movie-modal-description ");

  axios.get(INDEX_URL + id).then((response) => {
    const data = response.data.results;
    modalTitle.innerText = data.title;
    modalDate.innerText = "Release date: " + data.release_date;
    modalDescription.innerText = data.description;
    modalImage.innerHTML = `<img src="${
      POSTER_URL + data.image
    }" alt="movie-poster" class="fluid">`;
  });
}

// add favorite
function addToFavorite(id) {
  const list = JSON.parse(localStorage.getItem("favoriteMovies")) || [];
  const movie = movies.find((movie) => movie.id === id);

  if (list.some((movie) => movie.id === id)) {
    return alert("此電影已經在收藏清單中！");
  }

  list.push(movie);
  console.log(list);

  localStorage.setItem("favoriteMovies", JSON.stringify(list));
}

// 渲染 card mode 分頁器，根據項目數量 amount 來決定頁數
function renderPaginator(amount) {
  const numberOfPages = Math.ceil(amount / MOVIES_PER_PAGE);
  let rawHTML = "";

  for (let page = 1; page <= numberOfPages; page++) {
    rawHTML += `<li class="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li>`;
  }

  paginator.innerHTML = rawHTML;
}

// 渲染 list mode分頁器
function renderListModePaginator(amount) {
  const numberOfPages = Math.ceil(amount / MOVIES_PER_PAGE);
  let rawHTML = "";
  for (let page = 1; page <= numberOfPages; page++) {
    rawHTML += `<li class="page-item"><a class="page-link" id="list-paginator" href="#" data-page="${page}">${page}</a></li>`;
  }

  paginator.innerHTML = rawHTML;
}

// 根據點擊頁數重新渲染電影清單畫面
function onPaginatorClicked(event) {
  if (event.target.tagName !== "A") return;
  page = Number(event.target.dataset.page);
  if (event.target.matches("#list-paginator")) {
    renderListMode(getMoviesByPage(page));
  } else {
    renderMovieList(getMoviesByPage(page));
  }
};

// 搜尋功能
function onSearchFormSubmitted(event) {
  event.preventDefault(); 
  const searchInputValue = searchInput.value;
  const keyword = searchInputValue.trim().toLowerCase();

  if (searchInputValue.trim() === "") {
    return searchInput.classList.add("is-invalid");
  } else {
    searchInput.classList.remove("is-invalid");
    filteredMovies = movies.filter((movie) =>
      movie.title.toLowerCase().includes(keyword)
    );
  }

  if (filteredMovies.length === 0) {
    searchInput.value = "";
    renderMovieList(getMoviesByPage(1));
    return alert(`Cannot find movie with keyword: ${searchInputValue}`);
  }

  renderPaginator(filteredMovies.length);
  renderMovieList(getMoviesByPage(page));
  searchInput.value = "";
};

