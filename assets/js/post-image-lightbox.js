/*! Minimal post-image lightbox — click to enlarge, Esc / backdrop / close to dismiss. */
(function () {
  'use strict';
  var triggers = document.querySelectorAll('a[data-lightbox="post"]');
  if (!triggers.length) return;

  var dialog = document.createElement('dialog');
  dialog.className = 'post-lightbox';
  dialog.setAttribute('aria-label', 'Enlarged image');
  dialog.innerHTML =
    '<button type="button" class="post-lightbox-close" aria-label="Close">&times;</button>' +
    '<img class="post-lightbox-img" alt="" />' +
    '<p class="post-lightbox-cap" hidden></p>';
  document.body.appendChild(dialog);

  var img = dialog.querySelector('.post-lightbox-img');
  var cap = dialog.querySelector('.post-lightbox-cap');
  var closeBtn = dialog.querySelector('.post-lightbox-close');

  function openFrom(a) {
    var href = a.getAttribute('href');
    if (!href) return;
    img.src = href;
    img.alt = a.getAttribute('data-alt') || '';
    var caption = a.getAttribute('data-caption') || '';
    if (caption) {
      cap.textContent = caption;
      cap.hidden = false;
    } else {
      cap.textContent = '';
      cap.hidden = true;
    }
    if (typeof dialog.showModal === 'function') dialog.showModal();
    else dialog.setAttribute('open', '');
  }

  function close() {
    if (typeof dialog.close === 'function') dialog.close();
    else dialog.removeAttribute('open');
    img.removeAttribute('src');
  }

  triggers.forEach(function (a) {
    a.addEventListener('click', function (e) {
      e.preventDefault();
      openFrom(a);
    });
  });
  closeBtn.addEventListener('click', close);
  dialog.addEventListener('click', function (e) {
    if (e.target === dialog) close();
  });
})();
