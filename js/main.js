let spelerNaam = '';
let score = 0;
let maxScore = 10; // Maximaal aantal vragen
let vragenData = {};
let huidigeVraagIndex = 0;
let scoreboard = [];

// Laad JSON bij het starten van de applicatie
document.addEventListener('DOMContentLoaded', function () {
    fetch('/js/vragen.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Kan vragenbestand niet laden');
            }
            return response.json();
        })
        .then(data => {
            vragenData = data;
            console.log('Vragen geladen:', vragenData);
        })
        .catch(error => console.error('Fout bij laden van vragen:', error));
});

// Start de quiz
document.getElementById('startQuizButton').addEventListener('click', function () {
    spelerNaam = document.getElementById('name').value;
    if (spelerNaam.trim() === '') {
        alert('Vul je naam in.');
        return;
    }
    document.getElementById('startscherm').style.display = 'none';
    document.getElementById('themascherm').style.display = 'block';
    document.getElementById('spelerNaam').textContent = spelerNaam;

    // dit is voor teamnaam latenzien.
    document.getElementById('spelerTeam1').textContent = spelerNaam;
    document.getElementById('spelerTeam2').textContent = spelerNaam;
});

// Selecteer thema
document.getElementById('thema1').addEventListener('click', function () { startThema('Aardrijkskunde'); });
document.getElementById('thema2').addEventListener('click', function () { startThema('Geschiedenis'); });
document.getElementById('thema3').addEventListener('click', function () { startThema('Random'); });

// Laad vragen
function startThema(thema) {
    huidigeVraagIndex = 0;
    score = 0;
    document.getElementById('themascherm').style.display = 'none';
    document.getElementById('quizVraag').style.display = 'block';



    // Kopieer en schud de vragenlijst
    let shuffledVragen = [...vragenData[thema]].sort(() => Math.random() - 0.5);

    // Beperk de vragenlijst tot maximaal 10 vragen
    vragenData[thema] = shuffledVragen.slice(0, maxScore);



    startTimer(); // voor timer te starten
    loadVraag(thema);
}

// Laad een vraag
function loadVraag(thema) {

    stopTimer();
    startTimer(thema);


    let vragenLijst = vragenData[thema];

    if (huidigeVraagIndex >= maxScore || huidigeVraagIndex >= vragenLijst.length) {
        endQuiz();
        return;
    }


    let huidigeVraag = vragenLijst[huidigeVraagIndex];
    document.getElementById('vraag').textContent = huidigeVraag.vraag;



    let vraagFoto = document.getElementById('vraagFoto');
    if (huidigeVraag.foto) {
        vraagFoto.src = huidigeVraag.foto;
        vraagFoto.style.display = 'block';
    } else {
        vraagFoto.style.display = 'none';
    }

    let antwoordOpties = document.getElementById('antwoordOpties');
    antwoordOpties.innerHTML = '';
    huidigeVraag.antwoorden.forEach((antwoord, index) => {
        let li = document.createElement('li');
        li.textContent = antwoord;

        // Voeg de juiste CSS-class toe op basis van de index
        if (index < 2) {
            li.classList.add('page-3-2-1-li'); // Eerste twee antwoorden
        } else {
            li.classList.add('page-3-2-2-li'); // Laatste twee antwoorden
        }

        // Voeg eventlistener toe
        li.addEventListener('click', function () {
            checkAntwoord(antwoord, huidigeVraag.juisteAntwoord, thema);
        });

        antwoordOpties.appendChild(li);
    });
}




// stopwatch is copy van andere opdracht
// Timer setup
var seconds = 15;
var everysecond;
function startTimer(thema) {
    clearInterval(everysecond);
    seconds = 15;
    everysecond = setInterval(function () {
        if (seconds > 0) {
            seconds -= 1;
        } else {
            clearInterval(everysecond);

            huidigeVraagIndex++;
            if (huidigeVraagIndex < vragenData[thema].length) {
                loadVraag(thema);
            } else {
                endQuiz();
            }
        }
        document.getElementById("stopwatch").innerText = `00:${seconds < 10 ? '0' : ''}${seconds}`;
    }, 1000);
}


// Stop timer
function stopTimer() {
    clearInterval(everysecond);
}

// Controleer antwoord
function checkAntwoord(antwoord, juisteAntwoord, thema) {
    stopTimer();
    if (antwoord === juisteAntwoord) {
        score++;
    }
    huidigeVraagIndex++;
    if (huidigeVraagIndex < vragenData[thema].length) {
        loadVraag(thema);
    } else {
        endQuiz();
    }
}

// Eindig quiz
function endQuiz() {
    document.getElementById('quizVraag').style.display = 'none';
    document.getElementById('score').style.display = 'block';
    document.getElementById('resultSpelerNaam').textContent = spelerNaam;
    document.getElementById('scoreDisplay').textContent = score;
    document.getElementById('maxScoreDisplay').textContent = vragenData['Aardrijkskunde'].length; // Aantal vragen



    // Add player score to the scoreboard
    updateScoreboard(spelerNaam, score);
}

// Update the scoreboard array and display it
function updateScoreboard(name, score) {
    // Add player to scoreboard
    scoreboard.push({ name, score });

    // Sort scoreboard (highest scores first)
    scoreboard.sort((a, b) => b.score - a.score);

    // Display scoreboard
    const scorebord = document.getElementById('scorebord');
    scorebord.innerHTML = ''; // Clear previous content
    scoreboard.forEach((player, index) => {
        let li = document.createElement('li');
        li.classList.add('pagina-4-div-ul-1-li');
        li.textContent = `${index + 1}. ${player.name}: ${player.score} punten`;
        scorebord.appendChild(li);
    });
}


function updateResultatenLijst() {
    const resultatenLijst = document.querySelector('.pagina-4-ul');
    resultatenLijst.innerHTML = '';

    Object.keys(vragenData).forEach(thema => {
        vragenData[thema].forEach((vraag, index) => {
            let li = document.createElement('li');
            li.textContent = `Vraag ${index + 1}: ${vraag.vraag} - Juiste antwoord: ${vraag.juisteAntwoord}`;
            resultatenLijst.appendChild(li);
        });
    });
}


// Herstart quiz
document.getElementById('restartButton').addEventListener('click', function () {
    stopTimer();
    document.getElementById('score').style.display = 'none';
    document.getElementById('startscherm').style.display = 'block';
    document.getElementById('name').value = '';
});
