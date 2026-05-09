(function () {
  const clockContainer = document.getElementById('clock-container');
  let isLocked = localStorage.getItem('tickclock_locked') === 'true';

  function setLocked(locked) {
    isLocked = locked;
    clockContainer.classList.toggle('locked', locked);
    localStorage.setItem('tickclock_locked', locked);
  }
  setLocked(isLocked);

  window.tickDrag = { setLocked, isLocked: () => isLocked };
})();
