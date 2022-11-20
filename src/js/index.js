import ImagesApiService from './images-service';
import LoadMoreBtn from './load-more-btn';
import '../sass/index.scss';
import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const refs = {
  form: document.querySelector('.search-form'),
  galleryContainer: document.querySelector('.gallery'),
};

let hitsLength = 40;

const loadMoreBtn = new LoadMoreBtn({
  selector: '.load-more',
  hidden: true,
});

const imagesApiService = new ImagesApiService();

refs.form.addEventListener('submit', onSearch);
loadMoreBtn.refs.button.addEventListener('click', fetchImages);

function onSearch(e) {
  e.preventDefault();

  imagesApiService.query = e.currentTarget.elements.searchQuery.value;

  if (!imagesApiService.query) {
    Notiflix.Notify.failure(
      'Search box cannot be empty. Please enter the word.'
    );
    return;
  }

  loadMoreBtn.show();
  imagesApiService.resetPage();
  clearGalleryContainer();

  fetchImages();

  refs.form.reset();
}

function fetchImages() {
  loadMoreBtn.disable();
  imagesApiService.fetchImages().then(({ totalHits, hits }) => {
    if (hitsLength > totalHits) {
      loadMoreBtn.hide();
      Notiflix.Notify.failure(
        "We're sorry, but you've reached the end of search results."
      );
      return;
    } else if (hits.length === 0) {
      Notiflix.Notify.failure(
        'Sorry, there are no images matching your search query. Please try again.'
      );
      return;
    } else {
      Notiflix.Notify.success(`Hooray! We found ${hitsLength} images.`);

      renderImagesCards(hits);
      scrollImagesCards();

      const lightbox = new SimpleLightbox('.gallery a', {
        captionsData: 'alt',
        captionDelay: 250,
      });

      lightbox.refresh();

      loadMoreBtn.enable();
      hitsLength += hits.length;
    }
  });
}

function renderImagesCards(images) {
  const markup = images
    .map(
      image =>
        `<div class="photo-card">
  <a href="${image.largeImageURL}" class="gallery__item">
    <img src="${image.webformatURL}" alt="${image.tags}" loading="lazy" />
  </a>
  <div class="info">
    <p class="info-item"><b>Likes</b>${image.likes}</p>
    <p class="info-item"><b>Views</b>${image.views}</p>
    <p class="info-item"><b>Comments</b>${image.comments}</p>
    <p class="info-item"><b>Downloads</b>${image.comments}</p>
  </div>
</div>`
    )
    .join('');

  refs.galleryContainer.insertAdjacentHTML('beforeend', markup);
}

function clearGalleryContainer() {
  refs.galleryContainer.innerHTML = '';
}

function scrollImagesCards() {
  const { height: cardHeight } =
    refs.galleryContainer.firstElementChild.getBoundingClientRect();

  window.scrollBy({
    top: cardHeight * 2,
    behavior: 'smooth',
  });
}