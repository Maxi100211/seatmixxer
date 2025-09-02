// ------- GLOBAL STATE -------
let students = [];
let blacklist = [];
let layout = [];
let shuffleType = 'balanced';

// --------- STEP CONTROL ---------
const app = document.getElementById('app');

function showStep(step) {
    app.innerHTML = ""; // clear
    if (step === "upload") renderUpload();
    if (step === "gender") renderGender();
    if (step === "layout") renderLayout();
    if (step === "blacklist") renderBlacklist();
    if (step === "seating") renderSeating();
    window.scrollTo(0,0);
}

// ----------- STEP 1: UPLOAD -------------
function renderUpload() {
    app.innerHTML = `
    <div class="container">
        <h1 class="logo">🪑 SeatMixxer</h1>
        <h2>Upload elevliste</h2>
        <input type="file" id="file-input" accept=".csv,.txt">
        <button id="upload-btn">Upload</button>
        <div id="upload-error" class="error"></div>
        <div class="upload-instructions">
            <h3>Instruktioner:</h3>
            <ul>
                <li>CSV-fil: Første kolonne = navn, anden = køn (m/f/u)</li>
                <li>TXT-fil: Ét navn pr. linje</li>
            </ul>
        </div>
    </div>
    `;
    document.getElementById('upload-btn').onclick = handleFileUpload;
}

function handleFileUpload() {
    const input = document.getElementById('file-input');
    const file = input.files[0];
    const errorBox = document.getElementById('upload-error');
    errorBox.textContent = '';
    if (!file) { errorBox.textContent = "Ingen fil valgt"; return; }
    const reader = new FileReader();
    reader.onload = function(e) {
        const content = e.target.result;
        if (file.name.endsWith('.csv')) {
            students = parseCSV(content);
        } else {
            students = parseTXT(content);
        }
        if (students.length < 2) {
            errorBox.textContent = "Mindst 2 elever krævet";
            return;
        }
        showStep("gender");
    };
    reader.readAsText(file, 'utf-8');
}

function parseCSV(text) {
    return text
        .split('\n')
        .map(line => line.trim())
        .filter(Boolean)
        .map(line => {
            let [name, gender] = line.split(',');
            name = name?.trim() ?? "";
            gender = (gender || 'u').trim().toLowerCase().charAt(0);
            if (!['m', 'f'].includes(gender)) gender = 'u';
            return { name, gender };
        });
}
function parseTXT(text) {
    return text
        .split('\n')
        .map(line => line.trim())
        .filter(Boolean)
        .map(name => ({ name, gender: 'u' }));
}

// -------- STEP 2: KØNSVÆLG ---------
function renderGender() {
    app.innerHTML = `
    <div class="container">
        <h1 class="logo">🚻 Marker køn</h1>
        <form id="gender-form">
        <div class="gender-grid">
        ${students.map((student, i) => `
            <div class="student-card">
                <h3>${student.name}</h3>
                <input type="hidden" name="gender_${i}" value="${student.gender}" id="gender_${i}">
                <button type="button" class="gender-btn${student.gender === 'm' ? ' selected' : ''}" onclick="setGender(${i},'m')">👦 Dreng</button>
                <button type="button" class="gender-btn${student.gender === 'f' ? ' selected' : ''}" onclick="setGender(${i},'f')">👧 Pige</button>
                <button type="button" class="gender-btn${student.gender === 'u' ? ' selected' : ''}" onclick="setGender(${i},'u')">⚪ Ukendt</button>
            </div>
        `).join('')}
        </div>
        <div class="actions">
            <button type="submit" class="mix-btn">Gem og fortsæt</button>
            <button type="button" class="btn" onclick="showStep('upload')">← Tilbage</button>
        </div>
        </form>
    </div>
    `;
    window.setGender = function(idx, gender) {
        document.getElementById(`gender_${idx}`).value = gender;
        students[idx].gender = gender;
        renderGender(); // rerender for knap-stil
    }
    document.getElementById('gender-form').onsubmit = function(e) {
        e.preventDefault();
        showStep('layout');
    }
}

// -------- STEP 3: LAYOUT ---------
function renderLayout() {
    let gridRows = 10, gridCols = 10;
    app.innerHTML = `
    <div class="container">
        <h1 class="logo">🗺️ Layout Editor</h1>
        <div class="info-box">
            <p>Antal elever: ${students.length}</p>
            <p>Valgte pladser: <span id="selected-count">0</span></p>
        </div>
        <div class="grid-editor" style="overflow-x:auto">
            ${Array.from({length: gridRows}).map((_, row) => `
                <div class="grid-row">
                    ${Array.from({length: gridCols}).map((_, col) => {
                        const key = `${row},${col}`;
                        return `<div class="grid-cell${layout.some(p=>p[0]===row&&p[1]===col)?' active':''}" id="seat-${row}-${col}" onclick="toggleSeat(${row},${col})"></div>`;
                    }).join('')}
                </div>
            `).join('')}
        </div>
        <form id="layout-form">
            <input type="hidden" name="seats" id="seats-input">
            <div class="actions">
                <button type="submit" class="mix-btn">Gem layout</button>
                <button type="button" class="btn" onclick="showStep('gender')">← Tilbage</button>
            </div>
        </form>
    </div>
    `;
    window.toggleSeat = function(row, col) {
        const i = layout.findIndex(p => p[0]===row && p[1]===col);
        if (i >= 0) layout.splice(i, 1);
        else layout.push([row, col]);
        renderLayout();
        document.getElementById('selected-count').textContent = layout.length;
    }
    // init selected-count
    document.getElementById('selected-count').textContent = layout.length;

    document.getElementById('layout-form').onsubmit = function(e) {
        e.preventDefault();
        if (layout.length < students.length) {
            alert("For få pladser valgt");
            return;
        }
        showStep('blacklist');
    }
}

// -------- STEP 4: BLACKLIST ---------
function renderBlacklist() {
    app.innerHTML = `
    <div class="container">
        <h1 class="logo">🚫 Sortliste</h1>
        <form id="blacklist-form">
            <div class="shuffle-option">
                <label>Fordelingstype:</label>
                <select id="shuffle-type">
                    <option value="balanced"${shuffleType==='balanced'?' selected':''}>Kønsbalanceret</option>
                    <option value="random"${shuffleType==='random'?' selected':''}>Fuldt tilfældig</option>
                </select>
            </div>
            <div id="pairs-container">
                <h3>Forbudte naboskaber:</h3>
                ${blacklist.length ? blacklist.map((pair,i) =>
                    `<div class="pair-display">
                        <span>${pair[0]} og ${pair[1]}</span>
                        <button type="button" class="remove-pair" onclick="removePair(${i})">❌</button>
                    </div>`
                ).join('') : '<p>Ingen forbudte par</p>'}
            </div>
            <div class="new-pair">
                <h4>Tilføj nyt forbudt par:</h4>
                <div class="pair-entry">
                    <select id="select1">
                    ${students.map(s=>`<option>${s.name}</option>`).join('')}
                    </select>
                    <span>og</span>
                    <select id="select2">
                    ${students.map(s=>`<option>${s.name}</option>`).join('')}
                    </select>
                    <button type="button" id="add-pair-btn">➕ Tilføj</button>
                </div>
            </div>
            <div class="actions">
                <button type="submit" class="mix-btn">Generer pladser</button>
                <button type="button" class="btn" onclick="showStep('layout')">← Tilbage</button>
            </div>
        </form>
    </div>
    `;
    document.getElementById('shuffle-type').onchange = function(e) {
        shuffleType = e.target.value;
    }
    document.getElementById('add-pair-btn').onclick = function() {
        const name1 = document.getElementById('select1').value.trim().toLowerCase();
        const name2 = document.getElementById('select2').value.trim().toLowerCase();
        if (name1 && name2 && name1 !== name2) {
            const pair = [name1, name2].sort();
            if (!blacklist.some(p=>p[0]===pair[0] && p[1]===pair[1])) {
                blacklist.push(pair);
                renderBlacklist();
            }
        }
    }
    window.removePair = function(idx) {
        blacklist.splice(idx, 1);
        renderBlacklist();
    }
    document.getElementById('blacklist-form').onsubmit = function(e) {
        e.preventDefault();
        showStep('seating');
    }
}

// ---------- STEP 5: SEATING ------------
function renderSeating() {
    let result = generateSeating();
    if (!result) {
        app.innerHTML = `
        <div class="container">
            <h1 class="logo">⚠️ Fejl</h1>
            <div class="error-box">
                <p>Ingen gyldig ordning fundet efter 1000 forsøg</p>
                <div class="troubleshooting">
                    <h3>Løsningsforslag:</h3>
                    <ul>
                        <li>Reducer antallet af konflikter</li>
                        <li>Tjek for stavefejl i navne</li>
                        <li>Tilføj flere pladser</li>
                    </ul>
                </div>
                <button class="btn" onclick="showStep('upload')">← Prøv igen</button>
            </div>
        </div>
        `;
        return;
    }
    let {seating, gridRows, gridCols} = result;
    app.innerHTML = `
    <div class="container">
        <h1 class="logo">🎉 Pladsordning</h1>
        <div class="grid-header">
            <h2>Antal elever: ${seating.length}</h2>
            <button onclick="window.print()" class="print-btn">🖨️ Udskriv</button>
        </div>
        <div class="seat-grid" style="
            grid-template-rows: repeat(${gridRows}, auto);
            grid-template-columns: repeat(${gridCols}, 1fr);">
            ${seating.map(({student, pos}) =>
                `<div class="seat" style="grid-row:${pos[0]+1};grid-column:${pos[1]+1};">${student.name}</div>`
            ).join('')}
        </div>
        <div class="actions" style="margin-top:30px;">
            <button class="mix-btn" onclick="showStep('seating')">🔀 Mix igen</button>
            <button class="btn" onclick="showStep('upload')">🏠 Ny klasse</button>
        </div>
    </div>
    `;
}

// ----------- ALGO -----------
function generateSeating() {
    let attempts = 1000;
    let studentsCopy = students.slice();
    let currentShuffle = (shuffleType === 'balanced') ? genderBalancedShuffle : secureShuffle;
    let seating;
    for (let attempt=1; attempt<=attempts; attempt++) {
        studentsCopy = currentShuffle(studentsCopy);
        seating = studentsCopy.map((student,i) => ({student, pos: layout[i]}));
        if (validateArrangement(seating, blacklist)) {
            let gridRows = Math.max(...layout.map(p=>p[0]))+1;
            let gridCols = Math.max(...layout.map(p=>p[1]))+1;
            return {seating, gridRows, gridCols};
        }
    }
    return null;
}

function secureShuffle(arr) {
    let s = arr.slice();
    for (let i=s.length-1; i>0; i--) {
        let j = Math.floor(Math.random()*(i+1));
        [s[i], s[j]] = [s[j], s[i]];
    }
    return s;
}
function genderBalancedShuffle(students) {
    let males = secureShuffle(students.filter(s=>s.gender==='m'));
    let females = secureShuffle(students.filter(s=>s.gender==='f'));
    let others = secureShuffle(students.filter(s=>s.gender==='u'));
    let interleaved = [], m=0, f=0;
    while (m<males.length || f<females.length) {
        if ((m+f)%2===0 && m<males.length) interleaved.push(males[m++]);
        else if (f<females.length) interleaved.push(females[f++]);
        else if (m<males.length) interleaved.push(males[m++]);
    }
    for (let other of others) {
        let pos = Math.floor(Math.random()*(interleaved.length+1));
        interleaved.splice(pos, 0, other);
    }
    return interleaved;
}

function validateArrangement(seating, blacklist) {
    // seating = [{student, pos: [r,c]}]
    let posMap = {};
    for (let {student, pos} of seating) {
        posMap[`${pos[0]},${pos[1]}`] = student.name.toLowerCase();
    }
    let forbiddenPairs = new Set(blacklist.map(pair=>JSON.stringify([pair[0],pair[1]].sort())));
    for (let {student, pos} of seating) {
        let name = student.name.toLowerCase();
        let [x,y] = pos;
        for (let [dx,dy] of [[-1,0],[1,0],[0,-1],[0,1]]) {
            let npos = `${x+dx},${y+dy}`;
            let neighbor = posMap[npos];
            if (neighbor) {
                let p = [name, neighbor].sort();
                if (forbiddenPairs.has(JSON.stringify(p))) return false;
            }
        }
    }
    return true;
}

// -------- START --------
showStep('upload');