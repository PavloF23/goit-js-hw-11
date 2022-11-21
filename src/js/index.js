// 1. Створи фронтенд частину застосунку пошуку і перегляду зображень за ключовим словом. Додай оформлення елементів інтерфейсу
// 2. Форма спочатку міститья в HTML документі. Користувач буде вводити рядок для пошуку у текстове поле, а по сабміту форми необхідно виконувати HTTP-запит.
//3. Для бекенду використовуй публічний API сервісу Pixabay. Зареєструйся, отримай свій унікальний ключ доступу і ознайомся з документацією.
// 4. Якщо бекенд повертає порожній масив, значить нічого підходящого не було знайдено. У такому разі показуй повідомлення з текстом "Sorry, there are no images matching your search query. Please try again.". Для повідомлень використовуй бібліотеку notiflix.
// 5. Елемент div.gallery спочатку міститься в HTML документі, і в нього необхідно рендерити розмітку карток зображень. Під час пошуку за новим ключовим словом необхідно повністю очищати вміст галереї, щоб не змішувати результати.
// 6. Pixabay API підтримує пагінацію і надає параметри page і per_page. Зроби так, щоб в кожній відповіді приходило 40 об'єктів (за замовчуванням 20).
// 7. HTML документ вже містить розмітку кнопки, по кліку на яку, необхідно виконувати запит за наступною групою зображень і додавати розмітку до вже існуючих елементів галереї. 
//В початковому стані кнопка повинна бути прихована.
// Після першого запиту кнопка з'являється в інтерфейсі під галереєю.
// При повторному сабміті форми кнопка спочатку ховається, а після запиту знову відображається.
// У відповіді бекенд повертає властивість totalHits - загальна кількість зображень, які відповідають критерію пошуку (для безкоштовного акаунту). Якщо користувач дійшов до кінця колекції, ховай кнопку і виводь повідомлення з текстом "We're sorry, but you've reached the end of search results.".



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
    <img class="img" src="${image.webformatURL}" alt="${image.tags}" loading="lazy" />
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