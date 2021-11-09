const BASE_URL = 'https://movie-list.alphacamp.io'
const INDEX_URL = BASE_URL + '/api/v1/movies/'
const POSTER_URL = BASE_URL + '/posters/'


const movies = JSON.parse(localStorage.getItem('favoriteMovies')) || [] //收藏清單

const dataPanel = document.querySelector('#data-panel')

function renderMovieList(data) {
  let rawHTML = ''

  data.forEach((item) => {
    // title, image, id
    rawHTML += `<div class="col-sm-3">
    <div class="mb-2">
      <div class="card">
        <img src="${
          POSTER_URL + item.image
        }" class="card-img-top" alt="Movie Poster">
        <div class="card-body">
          <h5 class="card-title">${item.title}</h5>
        </div>
        <div class="card-footer">
          <button class="btn btn-primary btn-show-movie" data-toggle="modal" data-target="#movie-modal" data-id="${
            item.id
          }">More</button>
          <button class="btn btn-danger btn-remove-favorite" data-id="${
            item.id
          }">x</button>
        </div>
      </div>
    </div>
  </div>`
  })

  dataPanel.innerHTML = rawHTML
}

function showMovieModal(id) {
  const modalTitle = document.querySelector('#movie-modal-title')
  const modalImage = document.querySelector('#movie-modal-image')
  const modalDate = document.querySelector('#movie-modal-date')
  const modalDescription = document.querySelector('#movie-modal-description')

  axios.get(INDEX_URL + id).then((response) => {
    const data = response.data.results
    modalTitle.innerText = data.title
    modalDate.innerText = 'Release date: ' + data.release_date
    modalDescription.innerText = data.description
    modalImage.innerHTML = `<img src="${
      POSTER_URL + data.image
    }" alt="movie-poster" class="img-fluid">`
  })
}


function removeFromFavorite(id) {
  if (!movies || !movies.length) return // 防止 movie 是空陣列的狀況 (收藏清單是空的)
  // 透過 id 找到要刪除電影的 index
  // findIndex 會回傳找到元素的位置
  const movieIndex = movies.findIndex(movie => movie.id === id)

  // 若 findIndex 沒有比對到符合的 id 會回傳 -1 ，此情況下會結束函式執行
  if(movieIndex === -1) return 
  movies.splice(movieIndex, 1)

  // 將新陣列用 JSON.stringify() 轉換為JSON格式的字串，重新放回 localStage
  localStorage.setItem('favoriteMovies', JSON.stringify(movies))
  renderMovieList(movies)
}


//listen to data panel
dataPanel.addEventListener('click', function onPanelClicked(event) {
  if (event.target.matches('.btn-show-movie')) {
    showMovieModal(Number(event.target.dataset.id))
  } else if (event.target.matches('.btn-remove-favorite')) {
    removeFromFavorite(Number(event.target.dataset.id))
  }
})

renderMovieList(movies)
