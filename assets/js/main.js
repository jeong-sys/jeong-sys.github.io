(function () {
  var sections = document.querySelectorAll("main .hero, main .section");
  var navLinks = document.querySelectorAll(".site-nav__links a");

  if (sections.length && navLinks.length) {
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
  }

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

  // h4로 나뉜 하위 내용을 카드 형태로 묶어, 긴 토글 내용도 훑어보기 쉽게 처리
  function wrapSubsections(container) {
    var children = Array.prototype.slice.call(container.children);
    var groups = [];
    var current = null;

    children.forEach(function (el) {
      if (el.tagName === "H4") {
        current = { heading: el, body: [] };
        groups.push(current);
      } else if (current) {
        current.body.push(el);
      }
    });

    groups.forEach(function (group) {
      var wrapper = document.createElement("div");
      wrapper.className = "sub-section";
      container.insertBefore(wrapper, group.heading);
      wrapper.appendChild(group.heading);
      group.body.forEach(function (n) { wrapper.appendChild(n); });
    });
  }

  // 프로젝트 상세 페이지 — "주요 기여" 섹션의 각 항목을 접어서 핵심(제목)만 먼저 보이게 처리
  var projectBody = document.getElementById("project-body");

  if (projectBody) {
    var topHeadings = Array.prototype.slice.call(projectBody.children).filter(function (el) {
      return el.tagName === "H2";
    });
    var contribHeading = topHeadings.filter(function (h) {
      return h.textContent.trim() === "주요 기여";
    })[0];

    if (contribHeading) {
      var boundary = topHeadings[topHeadings.indexOf(contribHeading) + 1] || null;

      var items = [];
      var node = contribHeading.nextElementSibling;
      var current = null;

      while (node && node !== boundary) {
        if (node.tagName === "H3") {
          current = { heading: node, body: [] };
          items.push(current);
        } else if (current) {
          current.body.push(node);
        }
        node = node.nextElementSibling;
      }

      items.forEach(function (item) {
        var heading = item.heading;
        var wrapper = document.createElement("div");
        wrapper.className = "contribution-item";

        var icon = document.createElement("span");
        icon.className = "toggle-icon";
        icon.innerHTML = "&darr;";

        heading.classList.add("contribution-item__heading");
        heading.setAttribute("role", "button");
        heading.setAttribute("tabindex", "0");
        heading.setAttribute("aria-expanded", "false");
        heading.appendChild(icon);

        var content = document.createElement("div");
        content.className = "contribution-item__content";
        content.hidden = true;
        item.body.forEach(function (n) { content.appendChild(n); });
        wrapSubsections(content);

        projectBody.insertBefore(wrapper, heading);
        wrapper.appendChild(heading);
        wrapper.appendChild(content);

        var toggle = function () {
          var willOpen = content.hidden;
          content.hidden = !willOpen;
          heading.setAttribute("aria-expanded", String(willOpen));
          heading.classList.toggle("is-open", willOpen);
        };

        heading.addEventListener("click", toggle);
        heading.addEventListener("keydown", function (e) {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            toggle();
          }
        });
      });
    }
  }

  // 맨 위로 버튼
  var backToTop = document.getElementById("back-to-top");
  if (backToTop) {
    window.addEventListener(
      "scroll",
      function () {
        backToTop.classList.toggle("is-visible", window.scrollY > 600);
      },
      { passive: true }
    );

    backToTop.addEventListener("click", function () {
      smoothScrollTo(0, 600);
    });
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
