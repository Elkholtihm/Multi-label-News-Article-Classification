let allArticles = [];
let selectedCategories = new Set();

document.addEventListener('DOMContentLoaded', function() {
    const fetchBtn = document.getElementById('fetchNewsBtn');
    const selectTrigger = document.getElementById('selectTrigger');
    const selectAllBtn = document.getElementById('selectAllBtn');
    const clearAllBtn = document.getElementById('clearAllBtn');
    
    fetchBtn.addEventListener('click', fetchNews);
    selectTrigger.addEventListener('click', toggleDropdown);
    selectAllBtn.addEventListener('click', selectAll);
    clearAllBtn.addEventListener('click', clearAll);
    
    // Close dropdown when clicking outside
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.custom-select-wrapper')) {
            closeDropdown();
        }
    });
    
    loadCategories();
});

async function loadCategories() {
    try {
        const response = await fetch('/api/categories');
        const data = await response.json();
        
        const optionsContainer = document.getElementById('dropdownOptions');
        data.categories.forEach(category => {
            const optionDiv = document.createElement('div');
            optionDiv.className = 'dropdown-option';
            optionDiv.dataset.value = category;
            
            optionDiv.innerHTML = `
                <input type="checkbox" id="cat-${category.replace(/\s+/g, '-')}" value="${category}">
                <label for="cat-${category.replace(/\s+/g, '-')}">${category}</label>
            `;
            
            optionDiv.addEventListener('click', function(e) {
                if (e.target.tagName !== 'INPUT') {
                    const checkbox = this.querySelector('input[type="checkbox"]');
                    checkbox.checked = !checkbox.checked;
                }
                toggleCategory(category, this.querySelector('input[type="checkbox"]').checked);
            });
            
            optionsContainer.appendChild(optionDiv);
        });
    } catch (error) {
        console.error('Error loading categories:', error);
    }
}

function toggleDropdown() {
    const trigger = document.getElementById('selectTrigger');
    const dropdown = document.getElementById('selectDropdown');
    
    trigger.classList.toggle('active');
    dropdown.classList.toggle('show');
}

function closeDropdown() {
    const trigger = document.getElementById('selectTrigger');
    const dropdown = document.getElementById('selectDropdown');
    
    trigger.classList.remove('active');
    dropdown.classList.remove('show');
}

function toggleCategory(category, isSelected) {
    if (isSelected) {
        selectedCategories.add(category);
    } else {
        selectedCategories.delete(category);
    }
    
    updateSelectedText();
    updateOptionStyles();
    filterArticles();
}

function updateSelectedText() {
    const selectedText = document.querySelector('.selected-text');
    
    if (selectedCategories.size === 0) {
        selectedText.textContent = 'Select categories...';
        selectedText.classList.remove('has-selections');
    } else if (selectedCategories.size === 1) {
        selectedText.textContent = Array.from(selectedCategories)[0];
        selectedText.classList.add('has-selections');
    } else {
        selectedText.textContent = `${selectedCategories.size} categories selected`;
        selectedText.classList.add('has-selections');
    }
}

function updateOptionStyles() {
    const options = document.querySelectorAll('.dropdown-option');
    options.forEach(option => {
        const checkbox = option.querySelector('input[type="checkbox"]');
        if (checkbox.checked) {
            option.classList.add('selected');
        } else {
            option.classList.remove('selected');
        }
    });
}

function selectAll() {
    const checkboxes = document.querySelectorAll('.dropdown-option input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        checkbox.checked = true;
        selectedCategories.add(checkbox.value);
    });
    updateSelectedText();
    updateOptionStyles();
    filterArticles();
}

function clearAll() {
    const checkboxes = document.querySelectorAll('.dropdown-option input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        checkbox.checked = false;
    });
    selectedCategories.clear();
    updateSelectedText();
    updateOptionStyles();
    filterArticles();
}

async function fetchNews() {
    const btn = document.getElementById('fetchNewsBtn');
    const btnText = btn.querySelector('.btn-text');
    const loader = btn.querySelector('.loader');
    const newsContainer = document.getElementById('newsContainer');
    const errorDiv = document.getElementById('error');
    
    btn.disabled = true;
    btnText.textContent = 'Loading...';
    loader.style.display = 'inline-block';
    errorDiv.style.display = 'none';
    newsContainer.innerHTML = '';
    
    try {
        const response = await fetch('/api/news');
        const data = await response.json();
        
        if (data.success) {
            allArticles = data.articles;
            displayArticles(allArticles);
            updateStats(data.articles);
            document.getElementById('stats').style.display = 'flex';
        } else {
            showError(data.error || 'Failed to fetch news');
        }
    } catch (error) {
        showError('Error fetching news: ' + error.message);
    } finally {
        btn.disabled = false;
        btnText.textContent = 'Fetch & Classify News';
        loader.style.display = 'none';
    }
}

function displayArticles(articles) {
    const container = document.getElementById('newsContainer');
    container.innerHTML = '';
    
    if (articles.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: white; font-size: 1.2em;">No articles found</p>';
        return;
    }
    
    articles.forEach(article => {
        const card = createArticleCard(article);
        container.appendChild(card);
    });
}

function createArticleCard(article) {
    const card = document.createElement('div');
    card.className = 'news-card';
    
    const labels = article.predicted_labels || [];
    const labelsHTML = labels.length > 0
        ? labels.map(label => `<span class="label">${label}</span>`).join('')
        : '<span class="label" style="background: #ccc;">Uncategorized</span>';
    
    card.innerHTML = `
        <div class="news-meta">
            <span class="news-source">${article.source}</span>
            <span class="news-date">${article.published}</span>
        </div>
        <h3>${article.title}</h3>
        <p>${article.description}</p>
        <div class="news-labels">${labelsHTML}</div>
        <a href="${article.link}" target="_blank" class="news-link">Read more →</a>
    `;
    
    return card;
}

function filterArticles() {
    // If no categories selected, show all articles
    if (selectedCategories.size === 0) {
        displayArticles(allArticles);
        updateStats(allArticles);
        return;
    }
    
    // Filter articles that have at least one of the selected categories
    const filtered = allArticles.filter(article => {
        if (!article.predicted_labels || article.predicted_labels.length === 0) {
            return false;
        }
        // Check if article has any of the selected categories
        return Array.from(selectedCategories).some(category => 
            article.predicted_labels.includes(category)
        );
    });
    
    displayArticles(filtered);
    updateStats(filtered);
}

function updateStats(articles) {
    document.getElementById('totalArticles').textContent = articles.length;
    
    const uniqueCategories = new Set();
    articles.forEach(article => {
        if (article.predicted_labels) {
            article.predicted_labels.forEach(label => uniqueCategories.add(label));
        }
    });
    
    document.getElementById('categoriesFound').textContent = uniqueCategories.size;
}

function showError(message) {
    const errorDiv = document.getElementById('error');
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
}