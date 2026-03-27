import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getDatabase, ref, push, set, get, remove } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-database.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";

// Configuração do Firebase (mesma do app.js)
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

// Referência ao formulário
const form = document.getElementById('rentalForm');

// Verificar autenticação
onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = "login.html";
    return;
  }
  console.log('Utilizador autenticado:', user.email);

  // Verificar se é edição
  const urlParams = new URLSearchParams(window.location.search);
  const editId = urlParams.get('edit');
  if (editId) {
    loadRentalForEdit(editId);
  }
});

// Função para carregar reserva para edição
function loadRentalForEdit(id) {
  const rentalRef = ref(database, 'rentals/' + id);
  get(rentalRef).then((snapshot) => {
    if (snapshot.exists()) {
      const rental = snapshot.val();
      document.getElementById('vehicle').value = rental.vehicle;
      document.getElementById('customer_name').value = rental.customer_name;
      document.getElementById('start_date').value = rental.start_date;
      document.getElementById('end_date').value = rental.end_date;
      document.getElementById('email').value = rental.email || '';
      document.getElementById('phone').value = rental.phone || '';
      document.getElementById('notes').value = rental.notes || '';
      document.getElementById('color').value = rental.color || '#4CAF50';

      // Alterar título e botão
      document.querySelector('legend').textContent = 'Editar Reserva';
      document.querySelector('button[type="submit"]').textContent = 'Atualizar Reserva';
      document.getElementById('deleteBtn').style.display = 'inline-block';
    } else {
      alert('Reserva não encontrada');
      window.location.href = 'timeline.html';
    }
  }).catch((error) => {
    console.error('Erro ao carregar reserva:', error);
    alert('Erro ao carregar reserva');
  });
}

// Evento de envio do formulário
form.addEventListener('submit', (e) => {
  e.preventDefault();

  const vehicle = document.getElementById('vehicle').value;
  const customer_name = document.getElementById('customer_name').value.trim();
  const start_date = document.getElementById('start_date').value;
  const end_date = document.getElementById('end_date').value;
  const email = document.getElementById('email').value.trim();
  const phone = document.getElementById('phone').value.trim();
  const notes = document.getElementById('notes').value.trim();
  const color = document.getElementById('color').value;

  // Validar campos obrigatórios
  if (!vehicle || !customer_name || !start_date || !end_date) {
    alert('Por favor, preencha os campos obrigatórios.');
    return;
  }

  // Verificar se start_date <= end_date
  if (new Date(start_date) > new Date(end_date)) {
    alert('A data de fim deve ser igual ou posterior à data de início.');
    return;
  }

  const urlParams = new URLSearchParams(window.location.search);
  const editId = urlParams.get('edit');

  // Preparar payload
  const payload = {
    vehicle: vehicle,
    customer_name: customer_name,
    start_date: start_date,
    end_date: end_date,
    email: email,
    phone: phone,
    notes: notes,
    color: color,
    updated_at: new Date().toISOString()
  };

  if (editId) {
    // Atualizar reserva existente
    const rentalRef = ref(database, 'rentals/' + editId);
    set(rentalRef, payload)
      .then(() => {
        alert('Reserva atualizada com sucesso!');
        window.location.href = 'timeline.html';
      })
      .catch((error) => {
        console.error('Erro ao atualizar reserva:', error);
        alert('Erro ao atualizar reserva: ' + error.message);
      });
  } else {
    // Criar nova reserva
    payload.created_at = new Date().toISOString();
    payload.color = color; // Adicionar cor para novas reservas
    const dbRef = ref(database, 'rentals');
    push(dbRef, payload)
      .then(() => {
        alert('Reserva criada com sucesso!');
        form.reset();
        console.log('Reserva guardada no Firebase');
      })
      .catch((error) => {
        console.error('Erro ao salvar reserva:', error);
        alert('Erro ao salvar reserva: ' + error.message);
      });
  }
});

// Event listener para o botão de apagar
document.getElementById('deleteBtn').addEventListener('click', () => {
  const urlParams = new URLSearchParams(window.location.search);
  const editId = urlParams.get('edit');
  if (editId && confirm('Tem certeza que deseja apagar esta reserva?')) {
    const rentalRef = ref(database, 'rentals/' + editId);
    remove(rentalRef).then(() => {
      alert('Reserva apagada com sucesso!');
      window.location.href = 'timeline.html';
    }).catch((error) => {
      console.error('Erro ao apagar reserva:', error);
      alert('Erro ao apagar reserva: ' + error.message);
    });
  }
});