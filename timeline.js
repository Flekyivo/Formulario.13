import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-database.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";

// Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBWcwqCTD6CeACJaJbIirMNvtel-xH1Ep4",
  authDomain: "controle-de-maquinistas.firebaseapp.com",
  databaseURL: "https://controle-de-maquinistas-default-rtdb.firebaseio.com",
  projectId: "controle-de-maquinistas",
  storageBucket: "controle-de-maquinistas.firebasestorage.app",
  messagingSenderId: "1095308158920",
  appId: "1:1095308158920:web:7432fc02d64eeb83b702fd"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const auth = getAuth(app);

// Verificar autenticação
onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = "login.html";
    return;
  }
  loadTimeline();
});

// Função para carregar e renderizar a timeline
function loadTimeline() {
  const dbRef = ref(database, 'rentals');
  onValue(dbRef, (snapshot) => {
    const rentals = [];
    snapshot.forEach((childSnapshot) => {
      const rental = { id: childSnapshot.key, ...childSnapshot.val() };
      rentals.push(rental);
    });

    renderTimeline(rentals);
  });
}

// Função para renderizar a timeline
function renderTimeline(rentals) {
  const timelineEl = document.getElementById('timeline');
  timelineEl.innerHTML = '';

  // Calcular período baseado nas datas dos aluguers
  let minDate = new Date();
  let maxDate = new Date();
  maxDate.setDate(minDate.getDate() + 30); // padrão 30 dias

  if (rentals.length > 0) {
    const dates = [];
    rentals.forEach(r => {
      dates.push(new Date(r.start_date));
      dates.push(new Date(r.end_date));
    });
    minDate = new Date(Math.min(...dates));
    maxDate = new Date(Math.max(...dates));
    // Adicionar margem de 7 dias antes e depois
    minDate.setDate(minDate.getDate() - 7);
    maxDate.setDate(maxDate.getDate() + 7);
  }

  const totalDays = (maxDate - minDate) / (1000 * 60 * 60 * 24);

  for (let vehicle = 1; vehicle <= 6; vehicle++) {
    const vehicleRentals = rentals.filter(r => r.vehicle == vehicle);

    const row = document.createElement('div');
    row.className = 'vehicle-row';

    const label = document.createElement('div');
    label.className = 'vehicle-label';
    label.textContent = `Viatura ${vehicle}`;
    row.appendChild(label);

    const bar = document.createElement('div');
    bar.className = 'timeline-bar';

    vehicleRentals.forEach(rental => {
      const start = new Date(rental.start_date);
      const end = new Date(rental.end_date);

      const startPos = (start - minDate) / (1000 * 60 * 60 * 24);
      const endPos = (end - minDate) / (1000 * 60 * 60 * 24);
      const width = (endPos - startPos) / totalDays * 100;

      if (width > 0) {
        const block = document.createElement('div');
        block.className = 'rental-block';
        block.style.left = `${startPos / totalDays * 100}%`;
        block.style.width = `${width}%`;
        block.textContent = rental.customer_name;
        block.title = `${rental.customer_name} (${rental.start_date} - ${rental.end_date})`;
        bar.appendChild(block);
      }
    });

    row.appendChild(bar);
    timelineEl.appendChild(row);
  }
}