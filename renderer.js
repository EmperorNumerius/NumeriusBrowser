const { ipcRenderer } = require('electron');

let tabs = [];
let currentTab = null;

document.getElementById('newTabButton').addEventListener('click', createNewTab);
document.getElementById('searchButton').addEventListener('click', navigateCurrentTab);
document.getElementById('searchBar').addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        navigateCurrentTab();
    }
});

document.getElementById('backButton').addEventListener('click', () => {
    if (currentTab) {
        ipcRenderer.send('navigate-back', currentTab.id);
    }
});

document.getElementById('forwardButton').addEventListener('click', () => {
    if (currentTab) {
        ipcRenderer.send('navigate-forward', currentTab.id);
    }
});

document.getElementById('bookmarkButton').addEventListener('click', () => {
    if (currentTab) {
        addBookmark(currentTab.url);
    }
});

function createNewTab() {
    const tabId = tabs.length;
    const tabButton = document.createElement('button');
    tabButton.textContent = `Tab ${tabId + 1}`;
    tabButton.addEventListener('click', () => switchTab(tabId));
    document.getElementById('newTabButton').before(tabButton);

    const tab = {
        id: tabId,
        button: tabButton,
        history: [],
        historyIndex: -1,
        url: ''
    };
    tabs.push(tab);
    switchTab(tabId);
}

function switchTab(tabId) {
    if (currentTab) {
        currentTab.button.classList.remove('active');
    }

    currentTab = tabs[tabId];
    currentTab.button.classList.add('active');
    updateSearchBar();
}

function navigateCurrentTab() {
    const query = document.getElementById('searchBar').value.trim();
    if (currentTab) {
        let url;
        if (query.startsWith('http://') || query.startsWith('https://')) {
            url = query;
        } else if (query.startsWith('www.')) {
            url = `https://${query}`;
        } else {
            url = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
        }

        currentTab.url = url;
        currentTab.history = currentTab.history.slice(0, currentTab.historyIndex + 1);
        currentTab.history.push(url);
        currentTab.historyIndex++;

        ipcRenderer.send('navigate-to-url', { tabId: currentTab.id, url });
        updateSearchBar();
    }
}

function updateSearchBar() {
    if (currentTab) {
        document.getElementById('searchBar').value = currentTab.url || '';
    }
}

function addBookmark(url) {
    const bookmarks = JSON.parse(localStorage.getItem('bookmarks') || '[]');
    bookmarks.push(url);
    localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
    updateBookmarkList();
}

function updateBookmarkList() {
    const bookmarkList = document.getElementById('bookmarkList');
    bookmarkList.innerHTML = '';
    const bookmarks = JSON.parse(localStorage.getItem('bookmarks') || '[]');
    bookmarks.forEach((url) => {
        const li = document.createElement('li');
        li.textContent = url;
        li.addEventListener('click', () => {
            if (currentTab) {
                currentTab.url = url;
                currentTab.history.push(url);
                currentTab.historyIndex = currentTab.history.length - 1;
                ipcRenderer.send('navigate-to-url', { tabId: currentTab.id, url });
                updateSearchBar();
            }
        });
        bookmarkList.appendChild(li);
    });
}

updateBookmarkList();
createNewTab(); // Start with one tab open
