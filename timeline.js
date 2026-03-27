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

// Variáveis globais
let currentMonth = new Date();
currentMonth.setDate(1); // Primeiro dia do mês atual
let vehicles = [];
let rentals = [];

// Verificar autenticação
onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = "login.html";
    return;
  }
  loadVehicles();
});

// Função para carregar viaturas
function loadVehicles() {
  const dbRef = ref(database, 'vehicles');
  onValue(dbRef, (snapshot) => {
    vehicles = [];
    snapshot.forEach((childSnapshot) => {
      const vehicle = { id: childSnapshot.key, ...childSnapshot.val() };
      vehicles.push(vehicle);
    });
    // Fallback se não houver viaturas no Firebase
    if (vehicles.length === 0) {
      vehicles = [
        { id: '1', license_plate: '89-77-XA' },
        { id: '2', license_plate: '08-AS-84' },
        { id: '3', license_plate: '56-GH-18' },
        { id: '4', license_plate: '35-HU-20' },
        { id: '5', license_plate: 'RESERVA' },
        { id: '6', license_plate: 'VIATURA' },
      ];
    }
    loadRentals();
  });
}

// Função para carregar aluguers
function loadRentals() {
  const dbRef = ref(database, 'rentals');
  onValue(dbRef, (snapshot) => {
    rentals = [];
    snapshot.forEach((childSnapshot) => {
      const rental = { id: childSnapshot.key, ...childSnapshot.val() };
      rentals.push(rental);
    });
    renderTimeline();
  });
}

// Função auxiliar para normalizar datas para meia-noite
function normalizeToMidnight(date) {
  const normalized = new Date(date);
  normalized.setHours(0, 0, 0, 0);
  return normalized;
}

// Função para renderizar a timeline
function renderTimeline() {
  const timelineEl = document.getElementById('timeline');
  timelineEl.innerHTML = '';

  // Atualizar display do mês
  document.getElementById('current-month-display').textContent = currentMonth.toLocaleDateString('pt-PT', { year: 'numeric', month: 'long' });

  // Definir período para o mês atual
  let minDate = normalizeToMidnight(currentMonth);
  let maxDate = new Date(currentMonth);
  maxDate.setMonth(maxDate.getMonth() + 1);
  maxDate.setDate(0); // Último dia do mês
  maxDate = normalizeToMidnight(maxDate);

  const totalDays = maxDate.getDate();

  // Criar cabeçalho com datas
  const headerRow = document.createElement('div');
  headerRow.className = 'timeline-header';

  const labelSpace = document.createElement('div');
  labelSpace.style.width = '150px';
  headerRow.appendChild(labelSpace);

  const headerBar = document.createElement('div');
  headerBar.style.display = 'flex';
  headerBar.style.flex = '1';
  headerBar.style.position = 'relative';

  for (let i = 0; i < totalDays; i++) {
    const currentDate = new Date(minDate);
    currentDate.setDate(minDate.getDate() + i);

    const dayCell = document.createElement('div');
    dayCell.className = 'day-cell';
    if (currentDate.getDay() === 0 || currentDate.getDay() === 6) {
      dayCell.style.color = '#bd1717';
    }
    if (currentDate.toDateString() === new Date().toDateString()) {
      dayCell.style.fontWeight = 'bold';
      dayCell.style.color = 'green';
    }
    dayCell.textContent = currentDate.toLocaleDateString('pt-PT', { day: 'numeric', month: 'short' });
    headerBar.appendChild(dayCell);
  }

  // Adicionar linhas verticais de separação no cabeçalho
  for (let i = 1; i < totalDays; i++) {
    const separator = document.createElement('div');
    separator.style.position = 'absolute';
    separator.style.left = `${(i / totalDays) * 100}%`;
    separator.style.top = '0';
    separator.style.width = '2px';
    separator.style.height = '100%';
    separator.style.backgroundColor = '#9b9a9a';
    separator.style.pointerEvents = 'none';
    headerBar.appendChild(separator);
  }

  // Adicionar linha para o dia atual no cabeçalho
  const today = normalizeToMidnight(new Date());
  if (minDate <= today && today <= maxDate) {
    const todayPos = ((today - minDate) / (1000 * 60 * 60 * 24)) / totalDays * 100;
    const todayLine = document.createElement('div');
    todayLine.style.position = 'absolute';
    todayLine.style.left = `${todayPos}%`;
    todayLine.style.top = '0';
    todayLine.style.width = '2px';
    todayLine.style.height = '100%';
    todayLine.style.backgroundColor = 'red';
    todayLine.style.pointerEvents = 'none';
    todayLine.title = 'Dia Atual';
    headerBar.appendChild(todayLine);
  }

  headerRow.appendChild(headerBar);

  const totalHeader = document.createElement('div');
  totalHeader.className = 'total-days';
  totalHeader.textContent = 'Total';
  headerRow.appendChild(totalHeader);

  timelineEl.appendChild(headerRow);

  // Renderizar viaturas
  for (let vehicle of vehicles) {
    const vehicleRentals = rentals.filter(r => r.vehicle == vehicle.id);

    const row = document.createElement('div');
    row.className = 'vehicle-row';

    const label = document.createElement('div');
    label.className = 'vehicle-label';
    label.textContent = vehicle.license_plate || `Viatura ${vehicle.id}`;
    row.appendChild(label);

    const bar = document.createElement('div');
    bar.className = 'timeline-bar';

    // Adicionar linhas verticais de separação dos dias na barra
    for (let i = 1; i < totalDays; i++) {
      const separator = document.createElement('div');
      separator.style.position = 'absolute';
      separator.style.left = `${(i / totalDays) * 100}%`;
      separator.style.top = '0';
      separator.style.width = '2px';
      separator.style.height = '100%';
      separator.style.backgroundColor = '#c4c2c2';
      separator.style.pointerEvents = 'none';
      bar.appendChild(separator);
    }

    // Adicionar linha para o dia atual se estiver no mês
    const today = normalizeToMidnight(new Date());
    if (minDate <= today && today <= maxDate) {
      const todayPos = ((today - minDate) / (1000 * 60 * 60 * 24)) / totalDays * 100;
      const todayLine = document.createElement('div');
      todayLine.style.position = 'absolute';
      todayLine.style.left = `${todayPos}%`;
      todayLine.style.top = '0';
      todayLine.style.width = '2px';
      todayLine.style.height = '100%';
      todayLine.style.backgroundColor = 'red';
      todayLine.style.pointerEvents = 'none';
      todayLine.title = 'Dia Atual';
      bar.appendChild(todayLine);
    }

    let totalDaysRented = 0;

    vehicleRentals.forEach(rental => {
      const start = normalizeToMidnight(new Date(rental.start_date));
      const end = normalizeToMidnight(new Date(rental.end_date));

      // Verificar se o aluguer se sobrepõe ao mês atual
      if (end >= minDate && start <= maxDate) {
        const startPos = Math.max(0, (start - minDate) / (1000 * 60 * 60 * 24));
        const endPos = Math.min(totalDays - 1, (end - minDate) / (1000 * 60 * 60 * 24));
        const width = ((endPos - startPos) + 1) / totalDays * 100;

        if (width > 0) {
          const block = document.createElement('div');
          block.className = 'rental-block';
          block.style.left = `${startPos / totalDays * 100}%`;
          block.style.width = `${width}%`;
          block.style.backgroundColor = rental.color || '#4CAF50';
          block.textContent = rental.customer_name;
          const rentalDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
          const info = `${rental.customer_name} (${rental.start_date} - ${rental.end_date})` + (rental.notes ? ' - ' + rental.notes : '') + ` - ${rentalDays} dias`;
          block.title = info; // Para hover

          let clickCount = 0;
          block.addEventListener('click', () => {
            clickCount++;
            setTimeout(() => {
              if (clickCount === 1) {
                // Single click: mostrar info
                alert(info);
              }
              clickCount = 0;
            }, 300); // Delay para detectar double click
          });

          block.addEventListener('dblclick', () => {
            clickCount = 0; // Cancel single click
            window.location.href = `rental.html?edit=${rental.id}`;
          });

          bar.appendChild(block);
        }

        // Calcular dias alugados no mês
        const rentalStart = start < minDate ? minDate : start;
        const rentalEnd = end > maxDate ? maxDate : end;
        const daysInMonth = Math.ceil((rentalEnd - rentalStart) / (1000 * 60 * 60 * 24)) + 1;
        totalDaysRented += daysInMonth;
      }
    });

    row.appendChild(bar);

    const totalDiv = document.createElement('div');
    totalDiv.className = 'total-days';
    totalDiv.textContent = totalDaysRented;
    row.appendChild(totalDiv);

    timelineEl.appendChild(row);
  }
}

// Event listeners para navegação de meses
document.getElementById('prev-month').addEventListener('click', () => {
  currentMonth.setMonth(currentMonth.getMonth() - 1);
  renderTimeline();
});

document.getElementById('next-month').addEventListener('click', () => {
  currentMonth.setMonth(currentMonth.getMonth() + 1);
  renderTimeline();
});