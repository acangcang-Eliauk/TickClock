const clock = new FlipClock();

function updateClock() {
  const now = new Date();
  let hours = now.getHours();
  const minutes = now.getMinutes();
  const seconds = now.getSeconds();
  const is24h = localStorage.getItem('tickclock_24h') !== 'false';

  if (!is24h) {
    hours = hours % 12 || 12;
  }

  clock.setTime(hours, minutes, seconds);

  const dateStr = now.toLocaleDateString('zh-CN', {
    year: 'numeric', month: '2-digit', day: '2-digit', weekday: 'short',
  });
  document.getElementById('date-display').textContent = dateStr;
}

document.addEventListener('DOMContentLoaded', () => {
  clock.init({
    hoursTens: 'group-hours-tens',
    hoursOnes: 'group-hours-ones',
    minutesTens: 'group-minutes-tens',
    minutesOnes: 'group-minutes-ones',
    secondsTens: 'group-seconds-tens',
    secondsOnes: 'group-seconds-ones',
  });

  updateClock();
  setInterval(updateClock, 1000);

  const showSeconds = localStorage.getItem('tickclock_seconds') !== 'false';
  if (!showSeconds) {
    document.querySelectorAll('.separator.dot, #group-seconds-tens, #group-seconds-ones').forEach(
      el => el.style.display = 'none'
    );
  }
});
