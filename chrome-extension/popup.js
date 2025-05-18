document.addEventListener('DOMContentLoaded', () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.scripting.executeScript(
      {
        target: { tabId: tabs[0].id },
        func: () => localStorage.getItem('mini-x-errors')
      },
      (results) => {
        const errors = JSON.parse(results[0].result || '[]');
        const container = document.getElementById('errors');
        if (errors.length === 0) {
          container.innerHTML = '<p>No errors found.</p>';
        } else {
          container.innerHTML = errors.map(e =>
            `<div class="error">
               <strong>${e.date}</strong><br/>
               <pre>${e.message}</pre>
               <small>${e.stack}</small>
             </div>`
          ).join('');
        }
      }
    );
  });

  document.getElementById('clear').onclick = () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        func: () => localStorage.setItem('mini-x-errors', '[]')
      }, () => window.location.reload());
    });
  };
});