(function () {
  var sections = document.querySelectorAll("main .hero, main .section");
  var navLinks = document.querySelectorAll(".site-nav__links a");

  if (!sections.length || !navLinks.length) return;

  var linksById = {};
  navLinks.forEach(function (link) {
    var id = link.getAttribute("href").split("#")[1];
    if (id) linksById[id] = link;
  });

  var observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        var link = linksById[entry.target.id];
        if (!link) return;
        if (entry.isIntersecting) {
          navLinks.forEach(function (l) { l.classList.remove("is-active"); });
          link.classList.add("is-active");
        }
      });
    },
    { rootMargin: "-45% 0px -50% 0px" }
  );

  sections.forEach(function (section) {
    if (section.id) observer.observe(section);
  });

  // 부드러운 커스텀 스크롤 (ease-in-out)
  var NAV_OFFSET = 72;

  function easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  function smoothScrollTo(targetY, duration) {
    var startY = window.scrollY;
    var distance = targetY - startY;
    var startTime = null;

    function step(timestamp) {
      if (startTime === null) startTime = timestamp;
      var elapsed = timestamp - startTime;
      var progress = Math.min(elapsed / duration, 1);
      window.scrollTo(0, startY + distance * easeInOutCubic(progress));
      if (progress < 1) requestAnimationFrame(step);
    }

    requestAnimationFrame(step);
  }

  document.querySelectorAll('a[href*="#"]').forEach(function (link) {
    var hash = link.getAttribute("href").split("#")[1];
    if (!hash) return;
    var target = document.getElementById(hash);
    if (!target) return;

    link.addEventListener("click", function (e) {
      e.preventDefault();
      var targetY = target.getBoundingClientRect().top + window.scrollY - NAV_OFFSET;
      var distance = Math.abs(targetY - window.scrollY);
      var duration = Math.min(1100, Math.max(500, distance * 0.6));
      smoothScrollTo(targetY, duration);
      history.pushState(null, "", "#" + hash);
    });
  });

  // 마우스 휠로 내려올 때도 섹션이 자연스럽게 떠오르는 리빌 애니메이션
  var revealEls = document.querySelectorAll(".reveal");
  if (revealEls.length) {
    var revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -80px 0px" }
    );

    revealEls.forEach(function (el) { revealObserver.observe(el); });
  }
})();
