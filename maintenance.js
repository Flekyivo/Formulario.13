import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getDatabase, ref, push, set } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-database.js";
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
const form = document.getElementById('maintenanceForm');
let editMaintenanceId = null;

onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = 'login.html';
    return;
  }
  loadEditData();
});

form.addEventListener('submit', (e) => {
  e.preventDefault();

  const vehicle = document.getElementById('vehicle').value;
  const maintenance_date = document.getElementById('maintenance_date').value;
  const km = document.getElementById('km').value.trim();
  const observations = document.getElementById('observations').value.trim();

  if (!vehicle || !maintenance_date || !km || !observations) {
    alert('Por favor, preencha todos os campos.');
    return;
  }

  const payload = {
    vehicle,
    maintenance_date,
    km,
    observations,
  };

  if (editMaintenanceId) {
    const recordRef = ref(database, `maintenanceRecords/${editMaintenanceId}`);
    set(recordRef, payload)
      .then(() => {
        alert('Manutenção atualizada com sucesso!');
        form.reset();
        localStorage.removeItem('editMaintenanceId');
        localStorage.removeItem('editMaintenanceData');
        editMaintenanceId = null;
      })
      .catch((error) => {
        console.error('Erro ao atualizar manutenção:', error);
        alert('Erro ao atualizar manutenção: ' + error.message);
      });
    return;
  }

  const dbRef = ref(database, 'maintenanceRecords');
  push(dbRef, payload)
    .then(() => {
      alert('Manutenção registrada com sucesso!');
      form.reset();
    })
    .catch((error) => {
      console.error('Erro ao salvar manutenção:', error);
      alert('Erro ao salvar manutenção: ' + error.message);
    });
});

function loadEditData() {
  const editDataJSON = localStorage.getItem('editMaintenanceData');
  const editId = localStorage.getItem('editMaintenanceId');
  if (!editDataJSON || !editId) return;

  try {
    const data = JSON.parse(editDataJSON);
    editMaintenanceId = editId;
    document.getElementById('vehicle').value = data.vehicle || '';
    document.getElementById('maintenance_date').value = data.maintenance_date || '';
    document.getElementById('km').value = data.km || '';
    document.getElementById('observations').value = data.observations || '';
    document.querySelector('button[type="submit"]').textContent = 'Atualizar Manutenção';
  } catch (error) {
    console.error('Erro ao carregar dados de edição:', error);
  }
}
