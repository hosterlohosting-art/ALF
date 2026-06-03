(function () {
  'use strict';

  var data = Array.isArray(window.AWAD_SEARCH_INDEX) ? window.AWAD_SEARCH_INDEX : [];
  var form = document.querySelector('[data-site-search-form]');
  var input = document.querySelector('[data-site-search-input]');
  var resultsNode = document.querySelector('[data-site-search-results]');
  var countNode = document.querySelector('[data-site-search-count]');
  var filtersNode = document.querySelector('[data-site-search-filters]');
  var currentCategory = 'All';

  if (!form || !input || !resultsNode || !countNode || !filtersNode) return;

  function normalize(value) {
    return String(value || '').toLowerCase().replace(/[^a-z0-9\s-]/g, ' ').replace(/\s+/g, ' ').trim();
  }

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"']/g, function (char) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char];
    });
  }

  function getQuery() {
    return new URLSearchParams(window.location.search).get('q') || '';
  }

  function setQuery(query) {
    var nextUrl = query ? '/search/?q=' + encodeURIComponent(query) : '/search/';
    window.history.replaceState({}, '', nextUrl);
  }

  function tokensFor(query) {
    return normalize(query).split(' ').filter(function (token) {
      return token.length > 1;
    });
  }

  function scoreItem(item, tokens, phrase) {
    var title = normalize(item.title);
    var category = normalize(item.category);
    var description = normalize(item.description);
    var keywords = normalize(item.keywords);
    var url = normalize(item.url);
    var score = 0;

    if (!tokens.length) return 0;
    if (title.indexOf(phrase) !== -1) score += 95;
    if (description.indexOf(phrase) !== -1) score += 42;
    if (keywords.indexOf(phrase) !== -1) score += 25;
    if (url.indexOf(phrase.replace(/\s+/g, '-')) !== -1) score += 20;

    tokens.forEach(function (token) {
      if (title.indexOf(token) !== -1) score += 28;
      if (category.indexOf(token) !== -1) score += 16;
      if (description.indexOf(token) !== -1) score += 9;
      if (keywords.indexOf(token) !== -1) score += 4;
      if (url.indexOf(token) !== -1) score += 6;
    });

    if (score > 0 && item.category === 'Team Member') score += 4;
    if (score > 0 && item.category === 'Practice Areas') score += 3;
    return score;
  }

  function buildSnippet(item, tokens) {
    var text = String(item.description || item.keywords || '').replace(/\s+/g, ' ').trim();
    var lower = text.toLowerCase();
    var hit = tokens.map(function (token) {
      return lower.indexOf(token.toLowerCase());
    }).filter(function (index) {
      return index >= 0;
    }).sort(function (a, b) {
      return a - b;
    })[0];

    if (hit > 95) {
      text = '...' + text.slice(Math.max(0, hit - 70));
    }

    if (text.length > 230) {
      text = text.slice(0, 230).replace(/\s+\S*$/, '') + '...';
    }

    return text;
  }

  function highlight(text, tokens) {
    var escaped = escapeHtml(text);
    tokens.slice(0, 6).forEach(function (token) {
      if (!token) return;
      var pattern = new RegExp('(' + token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'ig');
      escaped = escaped.replace(pattern, '<mark>$1</mark>');
    });
    return escaped;
  }

  function search(query) {
    var phrase = normalize(query);
    var tokens = tokensFor(query);

    if (!tokens.length) return [];

    return data.map(function (item) {
      return {
        item: item,
        score: scoreItem(item, tokens, phrase)
      };
    }).filter(function (result) {
      return result.score > 0;
    }).sort(function (a, b) {
      return b.score - a.score;
    });
  }

  function renderFilters(results) {
    var categories = ['All'].concat(Array.from(new Set(results.map(function (result) {
      return result.item.category;
    }))).slice(0, 8));

    if (categories.indexOf(currentCategory) === -1) currentCategory = 'All';

    filtersNode.innerHTML = categories.map(function (category) {
      var active = category === currentCategory ? ' is-active' : '';
      return '<button type="button" class="site-search-filter' + active + '" data-category="' + escapeHtml(category) + '">' + escapeHtml(category) + '</button>';
    }).join('');
  }

  function renderEmpty(query) {
    resultsNode.innerHTML = [
      '<div class="site-search-empty">',
      '<span>No exact match yet</span>',
      '<h2>Try a broader search for "' + escapeHtml(query) + '"</h2>',
      '<p>Good searches: car accident, settlement, Ibrahim Awad, Stephanie Rivera, reviews, TEDx, truck accident, insurance adjuster.</p>',
      '<a href="/contact/">Ask the team directly</a>',
      '</div>'
    ].join('');
  }

  function renderInitial() {
    countNode.textContent = 'Search the full site in one place.';
    filtersNode.innerHTML = '';
    resultsNode.innerHTML = [
      '<div class="site-search-empty site-search-empty-ready">',
      '<span>Start searching</span>',
      '<h2>Find people, pages, guides, videos, and case resources.</h2>',
      '<p>Type a name, practice area, legal topic, or video title. The strongest matches will rise to the top.</p>',
      '</div>'
    ].join('');
  }

  function render(query) {
    var tokens = tokensFor(query);
    var results = search(query);
    var visible = currentCategory === 'All' ? results : results.filter(function (result) {
      return result.item.category === currentCategory;
    });

    if (!query.trim()) {
      renderInitial();
      return;
    }

    renderFilters(results);
    countNode.textContent = visible.length + ' result' + (visible.length === 1 ? '' : 's') + ' for "' + query.trim() + '"';

    if (!visible.length) {
      renderEmpty(query);
      return;
    }

    resultsNode.innerHTML = visible.slice(0, 42).map(function (result) {
      var item = result.item;
      var snippet = buildSnippet(item, tokens);
      var displayUrl = 'theawadlawfirm.com' + item.url;
      return [
        '<a class="site-search-card" href="' + escapeHtml(item.url) + '">',
        '<span class="site-search-category">' + escapeHtml(item.category) + '</span>',
        '<h2>' + highlight(item.title, tokens) + '</h2>',
        '<p>' + highlight(snippet, tokens) + '</p>',
        '<strong>' + escapeHtml(displayUrl) + '</strong>',
        '</a>'
      ].join('');
    }).join('');
  }

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    currentCategory = 'All';
    setQuery(input.value.trim());
    render(input.value);
  });

  filtersNode.addEventListener('click', function (event) {
    var button = event.target.closest('[data-category]');
    if (!button) return;
    currentCategory = button.getAttribute('data-category') || 'All';
    render(input.value);
  });

  document.querySelectorAll('[data-search-suggestion]').forEach(function (button) {
    button.addEventListener('click', function () {
      input.value = button.getAttribute('data-search-suggestion') || '';
      currentCategory = 'All';
      setQuery(input.value.trim());
      render(input.value);
      input.focus();
    });
  });

  input.value = getQuery();
  render(input.value);
})();
