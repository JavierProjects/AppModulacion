(function () {
  'use strict';

  const slides = Array.from(document.querySelectorAll('.slide'));
  const progressValue = document.getElementById('progressValue');
  const slideNumber = document.getElementById('slideNumber');
  const slideTotal = document.getElementById('slideTotal');
  const slideName = document.getElementById('slideName');
  const slideTime = document.getElementById('slideTime');
  const previousButton = document.getElementById('previousButton');
  const nextButton = document.getElementById('nextButton');
  const fullscreenButton = document.getElementById('fullscreenButton');
  const notesButton = document.getElementById('notesButton');
  const closeNotesButton = document.getElementById('closeNotesButton');
  const notesPanel = document.getElementById('notesPanel');
  const notesContent = document.getElementById('notesContent');
  const shortcutHint = document.getElementById('shortcutHint');
  const timerButton = document.getElementById('timer');
  const timerValue = document.getElementById('timerValue');

  let currentIndex = readInitialSlide();
  let touchStartX = null;
  let timerRunning = false;
  let elapsedBeforeStart = 0;
  let timerStartedAt = 0;
  let timerFrame = null;
  const presentationDuration = 12 * 60 * 1000;

  function readInitialSlide() {
    const match = window.location.hash.match(/diapositiva-(\d+)/);
    if (!match) return 0;
    return Math.min(Math.max(Number(match[1]) - 1, 0), slides.length - 1);
  }

  function twoDigits(value) {
    return String(value).padStart(2, '0');
  }

  function updateNotes() {
    const source = slides[currentIndex].querySelector('.speaker-notes');
    notesContent.innerHTML = source ? source.innerHTML : '<p>Sin notas para esta diapositiva.</p>';
  }

  function showSlide(nextIndex, updateHash = true) {
    currentIndex = Math.min(Math.max(nextIndex, 0), slides.length - 1);

    slides.forEach(function (slide, index) {
      const isActive = index === currentIndex;
      slide.classList.toggle('is-active', isActive);
      slide.classList.toggle('is-before', index < currentIndex);
      slide.setAttribute('aria-hidden', String(!isActive));
    });

    const current = slides[currentIndex];
    const title = current.dataset.title || 'Presentación';
    slideNumber.textContent = twoDigits(currentIndex + 1);
    slideTotal.textContent = twoDigits(slides.length);
    slideName.textContent = title;
    slideTime.textContent = current.dataset.time || '';
    progressValue.style.width = ((currentIndex + 1) / slides.length * 100) + '%';
    previousButton.disabled = currentIndex === 0;
    nextButton.disabled = currentIndex === slides.length - 1;
    document.title = title + ' · Simulador web didáctico';
    updateNotes();

    if (updateHash) {
      history.replaceState(null, '', '#diapositiva-' + (currentIndex + 1));
    }
  }

  function nextSlide() {
    if (currentIndex < slides.length - 1) showSlide(currentIndex + 1);
  }

  function previousSlide() {
    if (currentIndex > 0) showSlide(currentIndex - 1);
  }

  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(function () {});
    } else {
      document.exitFullscreen().catch(function () {});
    }
  }

  function setNotesOpen(open) {
    notesPanel.classList.toggle('is-open', open);
    notesPanel.setAttribute('aria-hidden', String(!open));
    notesButton.setAttribute('aria-pressed', String(open));
    if (open) updateNotes();
  }

  function currentElapsed() {
    if (!timerRunning) return elapsedBeforeStart;
    return elapsedBeforeStart + (Date.now() - timerStartedAt);
  }

  function renderTimer() {
    const remaining = presentationDuration - currentElapsed();
    const absolute = Math.abs(remaining);
    const minutes = Math.floor(absolute / 60000);
    const seconds = Math.floor((absolute % 60000) / 1000);

    timerValue.textContent = (remaining < 0 ? '+' : '') + twoDigits(minutes) + ':' + twoDigits(seconds);
    timerButton.classList.toggle('is-warning', remaining <= 120000 && remaining > 0);
    timerButton.classList.toggle('is-over', remaining <= 0);

    if (timerRunning) {
      timerFrame = window.requestAnimationFrame(renderTimer);
    }
  }

  function toggleTimer() {
    if (timerRunning) {
      elapsedBeforeStart = currentElapsed();
      timerRunning = false;
      timerButton.classList.remove('is-running');
      if (timerFrame) window.cancelAnimationFrame(timerFrame);
    } else {
      timerStartedAt = Date.now();
      timerRunning = true;
      timerButton.classList.add('is-running');
      renderTimer();
    }
  }

  function resetTimer() {
    timerRunning = false;
    elapsedBeforeStart = 0;
    timerStartedAt = 0;
    if (timerFrame) window.cancelAnimationFrame(timerFrame);
    timerButton.classList.remove('is-running', 'is-warning', 'is-over');
    timerValue.textContent = '12:00';
  }

  function isInteractiveTarget(target) {
    return Boolean(target.closest('a, button, input, select, textarea, iframe'));
  }

  document.addEventListener('keydown', function (event) {
    if (isInteractiveTarget(event.target) && !['Escape'].includes(event.key)) return;

    if (['ArrowRight', 'PageDown', ' '].includes(event.key)) {
      event.preventDefault();
      nextSlide();
    } else if (['ArrowLeft', 'PageUp'].includes(event.key)) {
      event.preventDefault();
      previousSlide();
    } else if (event.key === 'Home') {
      event.preventDefault();
      showSlide(0);
    } else if (event.key === 'End') {
      event.preventDefault();
      showSlide(slides.length - 1);
    } else if (event.key.toLowerCase() === 'f') {
      event.preventDefault();
      toggleFullscreen();
    } else if (event.key.toLowerCase() === 'n') {
      event.preventDefault();
      setNotesOpen(!notesPanel.classList.contains('is-open'));
    } else if (event.key.toLowerCase() === 't') {
      event.preventDefault();
      toggleTimer();
    } else if (event.key === 'Escape') {
      setNotesOpen(false);
    }
  });

  document.addEventListener('touchstart', function (event) {
    if (isInteractiveTarget(event.target)) return;
    touchStartX = event.changedTouches[0].clientX;
  }, { passive: true });

  document.addEventListener('touchend', function (event) {
    if (touchStartX === null) return;
    const difference = event.changedTouches[0].clientX - touchStartX;
    touchStartX = null;
    if (Math.abs(difference) < 60) return;
    if (difference < 0) nextSlide();
    else previousSlide();
  }, { passive: true });

  previousButton.addEventListener('click', previousSlide);
  nextButton.addEventListener('click', nextSlide);
  fullscreenButton.addEventListener('click', toggleFullscreen);
  notesButton.addEventListener('click', function () {
    setNotesOpen(!notesPanel.classList.contains('is-open'));
  });
  closeNotesButton.addEventListener('click', function () { setNotesOpen(false); });
  timerButton.addEventListener('click', toggleTimer);
  timerButton.addEventListener('dblclick', function (event) {
    event.preventDefault();
    resetTimer();
  });
  window.addEventListener('hashchange', function () { showSlide(readInitialSlide(), false); });

  window.setTimeout(function () { shortcutHint.classList.add('is-hidden'); }, 6500);
  showSlide(currentIndex, false);
})();
