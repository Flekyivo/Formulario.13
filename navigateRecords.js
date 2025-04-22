import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getDatabase, ref, onValue, remove, child } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-database.js";

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

// Referência ao nó "users" no Firebase
const dbRef = ref(database, 'users');

// Variáveis para armazenar os registros e o índice atual
let records = [];
let recordKeys = [];
let currentIndex = 0;

// Obter os dados do Firebase
onValue(dbRef, (snapshot) => {
  records = [];
  recordKeys = [];
  snapshot.forEach((childSnapshot) => {
    records.push(childSnapshot.val());
    recordKeys.push(childSnapshot.key); // Armazena as chaves dos registros
  });
  if (records.length > 0) {
    currentIndex = 0;
    displayRecord(currentIndex);
  }
});

// Função para exibir um registro com base no índice
function displayRecord(index) {
  const record = records[index];
  document.getElementById('name').textContent = record.name || '';
  document.getElementById('matricula').textContent= record.matricula || '';
  document.getElementById('email').textContent = record.email || '';
  document.getElementById('age').textContent = record.age || '';
  document.getElementById('categoria').textContent = record.categoria || '';
  document.getElementById('escala').textContent= record.escala || '';
  document.getElementById('telefone_particular').textContent= record.telefone_particular || '';
  document.getElementById('preview').src = record.foto || '';
  document.getElementById('preview').style.display = record.foto ? 'block' : 'none';
}

// Navegar para o registro anterior
document.getElementById('prevButton').addEventListener('click', () => {
  if (currentIndex > 0) {
    currentIndex--;
    displayRecord(currentIndex);
  } else {
    alert('Este é o primeiro registro.');
  }
});

// Navegar para o próximo registro
document.getElementById('nextButton').addEventListener('click', () => {
  if (currentIndex < records.length - 1) {
    currentIndex++;
    displayRecord(currentIndex);
  } else {
    alert('Este é o último registro.');
  }
});

// Apagar o registro atual
document.getElementById('deleteButton').addEventListener('click', () => {
  if (records.length === 0) {
    alert('Nenhum registro para apagar.');
    return;
  }

  const recordKey = recordKeys[currentIndex];
  const recordRef = child(dbRef, recordKey);

  remove(recordRef)
    .then(() => {
      alert('Registro apagado com sucesso.');
      records.splice(currentIndex, 1);
      recordKeys.splice(currentIndex, 1);

      // Atualizar a exibição
      if (records.length > 0) {
        if (currentIndex >= records.length) {
          currentIndex = records.length - 1;
        }
        displayRecord(currentIndex);
      } else {
        // Limpar a exibição se não houver mais registros
        document.getElementById('name').textContent = '';
        document.getElementById('matricula').textContent = '';
        document.getElementById('email').textContent = '';
        document.getElementById('age').textContent = '';
        document.getElementById('categoria').textContent = '';
        document.getElementById('escala').textContent = '';
        document.getElementById('telefone_particular').textContent = '';
        document.getElementById('preview').src = record.foto || '';
        document.getElementById('preview').style.display = record.foto ? 'block' : 'none';
      }
    })
    .catch((error) => {
      console.error('Erro ao apagar o registro:', error);
      alert('Erro ao apagar o registro.');
    });
});