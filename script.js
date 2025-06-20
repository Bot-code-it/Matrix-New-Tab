// Matrix Rain Effect
const canvas = document.getElementById('matrix-canvas');
const ctx = canvas.getContext('2d');
const chars = 'あいうえおかきくけこさしすせそたちつてとはひふへほまみむめもやゆよらりるれろわをんゃゅょっハヒフヘホマミムメモヤユヨラリルレロワヲンアイウエオカキクケコサシスセソタチツテトナニヌネノ';
const charArray = chars.split('');
const fontSize = 16;
let drops = [], columns = 0;

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    columns = Math.floor(canvas.width / fontSize);
    drops = new Array(columns).fill(1);
}

function draw() {
	ctx.fillStyle = 'rgba(0,0,0,0.04)';
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	ctx.font = fontSize + 'px "Noto Sans JP", "Yu Gothic", "Meiryo", "MS Gothic", sans-serif';
	ctx.shadowColor = '#ff0000';
	ctx.shadowBlur = 2;
	ctx.fillStyle = 'rgba(255,50,120,0.8)';
    for (let i = 0; i < columns; i++) {
        const text = charArray[Math.floor(Math.random() * charArray.length)];
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);
        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) drops[i] = 0;
        drops[i]++;
    }
    ctx.shadowBlur = 0;
}

function animate() {
    draw();
    requestAnimationFrame(animate);
}

let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(resizeCanvas, 200);
});

function isValidLink(input) {
    try {
        // Add protocol if missing
        const withProtocol = input.startsWith('http://') || input.startsWith('https://')
            ? input
            : `https://${input}`;
        const url = new URL(withProtocol);
        return /^[a-z0-9.-]+\.[a-z]{2,}$/i.test(url.hostname);
    } catch (_) {
        return false;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const greetingText = document.getElementById('greetingText');
    const searchBox = document.getElementById('searchBox');
    const engineToggle = document.getElementById('engineToggle');
    const engineIcon = document.getElementById('engineIcon');
    let currentEngine = 'google';
	
	searchBox.focus();

    chrome.storage.sync.get(['customName'], (result) => {
        const name = result.customName || 'Guest';
        greetingText.textContent = `Hello, ${name}`;
    });

    // Toggle search engine
    engineToggle.addEventListener('click', () => {
        currentEngine = currentEngine === 'google' ? 'youtube' : 'google';
        engineIcon.src = `icons/${currentEngine}.png`;
    });

    // Perform search
    searchBox.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            const query = this.value.trim();
			if (isValidLink(query)) {
				const url = query.startsWith('http://') || query.startsWith('https://')
					? query
					: `http://${query}`;
				window.location.href = url;				
				} else if (query) {
                const baseUrl = currentEngine === 'google'
                    ? 'https://www.google.com/search?q='
                    : 'https://www.youtube.com/results?search_query=';
                window.location.href = baseUrl + encodeURIComponent(query);
                this.value = '';
            }
        }
    });

    // Settings modal
	const settingsBtn = document.getElementById('settingsBtn');
	const settingsModal = document.getElementById('settingsModal');
	const nameInput = document.getElementById('nameInput');
	const titleInput = document.getElementById('titleInput');
	const saveSettingsBtn = document.getElementById('saveSettingsBtn');

	// Load saved values
	chrome.storage.sync.get(['customName', 'customTitle'], (result) => {
		const name = result.customName || 'Guest';
		const title = result.customTitle || 'New Tab';
		greetingText.textContent = `Hello, ${name}`;
		document.title = title;
	});

	// Open modal and populate values
	settingsBtn.addEventListener('click', () => {
		settingsModal.style.display = 'flex';
		chrome.storage.sync.get(['customName', 'customTitle'], (result) => {
			nameInput.value = result.customName || '';
			titleInput.value = result.customTitle || '';
		});
	});

	// Save settings
	saveSettingsBtn.addEventListener('click', () => {
		const name = nameInput.value.trim();
		const title = titleInput.value.trim();

		chrome.storage.sync.set({
			customName: name,
			customTitle: title
		}, () => {
			greetingText.textContent = `Hello, ${name || 'Guest'}`;
			document.title = title || 'New Tab';
			settingsModal.style.display = 'none';
		});
	});

	// Close modal when clicking outside
	window.addEventListener('click', (e) => {
		if (e.target === settingsModal) {
			settingsModal.style.display = 'none';
		}
	});


    // Init
    resizeCanvas();
    requestAnimationFrame(animate);
});