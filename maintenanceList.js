import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getDatabase, ref, onValue, remove } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-database.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyBWcwqCTD6CeACJaJbIirMNvtel-xH1Ep4",
  authDomain: "controle-de-maquinistas.firebaseapp.com",
  databaseURL: "https://controle-de-maquinistas-default-rtdb.firebaseio.com",
  projectId: "controle-de-maquinistas",
  storageBucket: "controle-de-maquinistas.firebasestorage.app",
  messagingSenderId: "1095308158920",
  appId: "1:1095308158920:web:7432fc02d64eeb83b702fd"
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const auth = getAuth(app);
const tableBody = document.getElementById('maintenanceTable').getElementsByTagName('tbody')[0];
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const resetBtn = document.getElementById('resetBtn');
let maintenanceRecords = [];

function formatDate(value) {
  if (!value) return '';
  try {
    const date = new Date(value);
    return isNaN(date.getTime()) ? value : date.toLocaleString('pt-PT');
  } catch {
    return value;
  }
}

function renderTable(records) {
  tableBody.innerHTML = '';
  if (!records.length) {
    const row = tableBody.insertRow();
    const cell = row.insertCell(0);
    cell.colSpan = 5;
    cell.textContent = 'Nenhum registo encontrado.';
    cell.style.textAlign = 'center';
    return;
  }

  records.forEach((record) => {
    const row = tableBody.insertRow();
    row.insertCell(0).textContent = record.vehicle || '';
    row.insertCell(1).textContent = record.maintenance_date || '';
    row.insertCell(2).textContent = record.km || '';
    row.insertCell(3).textContent = record.observations || '';
    const actionsCell = row.insertCell(4);
    const editBtn = document.createElement('button');
    editBtn.type = 'button';
    editBtn.textContent = 'Editar';
    editBtn.style.marginRight = '8px';
    editBtn.addEventListener('click', () => editMaintenance(record));

    const deleteBtn = document.createElement('button');
    deleteBtn.type = 'button';
    deleteBtn.textContent = 'Apagar';
    deleteBtn.addEventListener('click', () => deleteMaintenance(record.id));

    actionsCell.appendChild(editBtn);
    actionsCell.appendChild(deleteBtn);
  });
}

function filterRecords() {
  const query = searchInput.value.trim().toLowerCase();
  if (!query) {
    renderTable(maintenanceRecords);
    return;
  }
  const filtered = maintenanceRecords.filter((record) => {
    return (record.vehicle || '').toLowerCase().includes(query) || (record.observations || '').toLowerCase().includes(query);
  });
  renderTable(filtered);
}

function carregarManutencoes() {
  const dbRef = ref(database, 'maintenanceRecords');
  onValue(dbRef, (snapshot) => {
    maintenanceRecords = [];
    if (!snapshot.exists()) {
      renderTable([]);
      return;
    }

    snapshot.forEach((childSnapshot) => {
      maintenanceRecords.push({ id: childSnapshot.key, ...childSnapshot.val() });
    });

    renderTable(maintenanceRecords);
  }, (error) => {
    console.error('Erro ao carregar manutenções:', error);
    alert('Erro ao carregar manutenções do Firebase.');
  });
}

onAuthStateChanged(auth, (user) => {
  if (user) {
    carregarManutencoes();
  } else {
    window.location.href = 'login.html';
  }
});

searchBtn.addEventListener('click', filterRecords);
resetBtn.addEventListener('click', () => {
  searchInput.value = '';
  renderTable(maintenanceRecords);
});
function editMaintenance(record) {
  localStorage.setItem('editMaintenanceId', record.id);
  localStorage.setItem('editMaintenanceData', JSON.stringify(record));
  window.location.href = 'maintenance.html';
}

function deleteMaintenance(recordId) {
  if (!recordId) return;
  if (!confirm('Deseja apagar esta manutenção?')) return;

  const recordRef = ref(database, `maintenanceRecords/${recordId}`);
  remove(recordRef)
    .then(() => {
      alert('Manutenção apagada com sucesso.');
    })
    .catch((error) => {
      console.error('Erro ao apagar manutenção:', error);
      alert('Erro ao apagar manutenção: ' + error.message);
    });
}