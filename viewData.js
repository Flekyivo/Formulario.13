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

// Referência para a tabela HTML
const dataTable = document.getElementById('dataTable').getElementsByTagName('tbody')[0];

// Função para carregar dados do Firebase
function carregarDados() {
  const dbRef = ref(database, 'users');
  onValue(dbRef, (snapshot) => {
    dataTable.innerHTML = '';
    snapshot.forEach((childSnapshot) => {
      const data = childSnapshot.val();
      const row = dataTable.insertRow();
      row.insertCell(0).textContent = data.name || '';
      row.insertCell(1).textContent = data.matricula || '';
      row.insertCell(2).textContent = data.email || '';
      row.insertCell(3).textContent = data.age || '';
      row.insertCell(4).textContent = data.categoria || '';
      row.insertCell(5).textContent = data.escala || '';
      row.insertCell(6).textContent = data.telefone_particular || '';
      row.insertCell(7).textContent = data.numero_tablet || '';
      row.insertCell(8).textContent = data.periodicos || '';
      row.insertCell(9).textContent = data.psicologicos || '';
      row.insertCell(10).textContent = data.data_nascimento || '';
      row.insertCell().textContent = data.center|| '';
      row.insertCell().textContent = data.numero_carta || '';
      row.insertCell(11).innerHTML = data.foto ? `<img src="${data.foto}" alt="Foto" style="max-width: 100px;">` : 'Sem Foto';
    });
  });
}

// Verifica se o usuário está autenticado antes de mostrar os dados
onAuthStateChanged(auth, (user) => {
  if (user) {
    carregarDados();
  } else {
    window.location.href = "index.html"; // Redireciona para login se não autenticado
  }
});
