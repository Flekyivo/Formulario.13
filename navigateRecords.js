import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getDatabase, ref, onValue, remove, child } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-database.js";
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

// Variáveis para armazenar os registros e o índice atual
let records = [];
let recordKeys = [];
let currentIndex = 0;
let unsubscribeOnValue = null;
let eventListenersAdded = false;

// Função auxiliar para obter elemento DOM com validação
function getElementById(id) {
  const element = document.getElementById(id);
  if (!element) console.warn(`Elemento com ID "${id}" não encontrado.`);
  return element;
}

// Função para exibir um registro com base no índice
function displayRecord(index) {
  if (!records[index]) {
    console.warn(`Registro no índice ${index} não existe.`);
    return;
  }

  const record = records[index];
  const elements = {
    name: getElementById('name'),
    matricula: getElementById('matricula'),
    email: getElementById('email'),
    age: getElementById('age'),
    categoria: getElementById('categoria'),
    escala: getElementById('escala'),
    telefone_particular: getElementById('telefone_particular'),
    numero_tablet: getElementById('numero_tablet'),
    numero_carta: getElementById('numero_carta'),
    preview: getElementById('preview')
  };

  if (elements.name) elements.name.textContent = record.name || '';
  if (elements.matricula) elements.matricula.textContent = record.matricula || '';
  if (elements.email) elements.email.textContent = record.email || '';
  if (elements.age) elements.age.textContent = record.age || '';
  if (elements.categoria) elements.categoria.textContent = record.categoria || '';
  if (elements.escala) elements.escala.textContent = record.escala || '';
  if (elements.telefone_particular) elements.telefone_particular.textContent = record.telefone_particular || '';
  if (elements.numero_tablet) elements.numero_tablet.textContent = record.numero_tablet || '';
  if (elements.numero_carta) elements.numero_carta.textContent = record.numero_carta || '';

  if (elements.preview) {
    elements.preview.src = record.foto || '';
    elements.preview.style.display = record.foto ? 'block' : 'none';
  }
}

// Função para carregar os dados do Firebase
function carregarDados() {
  const dbRef = ref(database, 'users');
  
  // Desinscrever listener anterior se existir
  if (unsubscribeOnValue) {
    unsubscribeOnValue();
  }

  // Criar novo listener com capacidade de desinscrever
  unsubscribeOnValue = onValue(dbRef, (snapshot) => {
    records = [];
    recordKeys = [];
    snapshot.forEach((childSnapshot) => {
      records.push(childSnapshot.val());
      recordKeys.push(childSnapshot.key);
    });
    if (records.length > 0) {
      // Se veio de uma seleção (duplo clique), abrir o registo específico
      const selectedKey = localStorage.getItem('selectedRecordKey');
      if (selectedKey) {
        const idx = recordKeys.indexOf(selectedKey);
        if (idx !== -1) {
          currentIndex = idx;
        } else {
          currentIndex = 0;
        }
        localStorage.removeItem('selectedRecordKey');
      } else {
        currentIndex = 0;
      }
      displayRecord(currentIndex);
    }
  });
}

// Função para adicionar event listeners uma única vez
function addEventListeners() {
  if (eventListenersAdded) return; // Evitar duplicação

  const prevButton = getElementById('prevButton');
  const nextButton = getElementById('nextButton');
  const deleteButton = getElementById('deleteButton');
  const editButton = getElementById('editButton');

  if (prevButton) {
    prevButton.addEventListener('click', () => {
      if (records.length === 0) {
        alert('Nenhum registro para navegar.');
        return;
      }
      if (currentIndex > 0) {
        currentIndex--;
        displayRecord(currentIndex);
      } else {
        alert('Este é o primeiro registro.');
      }
    });
  }

  if (nextButton) {
    nextButton.addEventListener('click', () => {
      if (records.length === 0) {
        alert('Nenhum registro para navegar.');
        return;
      }
      if (currentIndex < records.length - 1) {
        currentIndex++;
        displayRecord(currentIndex);
      } else {
        alert('Este é o último registro.');
      }
    });
  }

  if (deleteButton) {
    deleteButton.addEventListener('click', () => {
      if (records.length === 0) {
        alert('Nenhum registro para apagar.');
        return;
      }

      if (!confirm('Tem a certeza que deseja apagar este registro?')) {
        return;
      }

      const recordKey = recordKeys[currentIndex];
      const dbRef = ref(database, 'users');
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
              const idsToClear = ['name','matricula','email','age','categoria','escala','telefone_particular','numero_tablet','numero_carta'];
              idsToClear.forEach(id => {
                const el = getElementById(id);
                if (el) el.textContent = '';
              });
              const previewEl = getElementById('preview');
              if (previewEl) {
                previewEl.src = '';
                previewEl.style.display = 'none';
              }
          }
        })
        .catch((error) => {
          console.error('Erro ao apagar o registro:', error);
          alert('Erro ao apagar o registro.');
        });
    });
  }

  if (editButton) {
    editButton.addEventListener('click', () => {
      if (records.length === 0) {
        alert('Nenhum registro para editar.');
        return;
      }
      const record = records[currentIndex];
      const recordKey = recordKeys[currentIndex];
      // Guardar no localStorage e abrir o formulário para edição
      try {
        localStorage.setItem('editRecordKey', recordKey);
        localStorage.setItem('editRecordData', JSON.stringify(record));
        window.location.href = 'indexs.html';
      } catch (err) {
        console.error('Erro ao preparar edição:', err);
        alert('Erro ao preparar edição do registo.');
      }
    });
  }

  eventListenersAdded = true;
}

// Verifica autenticação antes de carregar dados e adicionar eventos
onAuthStateChanged(auth, (user) => {
  if (user) {
    carregarDados();
    addEventListeners();
  } else {
    // Desinscrever do listener de dados
    if (unsubscribeOnValue) {
      unsubscribeOnValue();
      unsubscribeOnValue = null;
    }
    // Redirecionar para página de login (ajuste o URL conforme necessário)
    window.location.href = "login.html";
  }
});