import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getDatabase, ref, push } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-database.js";

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

// Referência ao formulário
const form = document.getElementById('dataForm');


// Evento de envio do formulário
form.addEventListener('submit', (e) => {
  e.preventDefault(); // Evita o comportamento padrão de recarregar a página

  // Obter os valores do formulário
  const name = document.getElementById('name').value;
  const matricula = document.getElementById('matricula').value;
  const email = document.getElementById('email').value;
  const age = document.getElementById('age').value;
  const categoria = document.getElementById('categoria').value;
  const escala = document.getElementById('escala').value;
  const foto = document.getElementById("foto").value;
  const telefone_particular = document.getElementById("telefone_particular").value;
  const numero_tablet = document.getElementById("numero_tablet").value;
  const data_nascimento = document.getElementById("data_nascimento").value;
  const validade_carta = document.getElementById("validade_carta").value;
  const numero_carta = document.getElementById("numero_carta").value;
  const periodicos = document.getElementById("periodicos").value;
  const psicologicos = document.getElementById("psicologicos").value;


  

  // Salvar os dados no Firebase
  const dbRef = ref(database, 'users');
  push(dbRef, {
    name: name,
    matricula: matricula,
    email: email,
    age: age,
    categoria: categoria,
    escala: escala,
    Foto: foto,  
    telefone_particular: telefone_particular,
    numero_tablet: numero_tablet,
    data_nascimento: data_nascimento,
    validade_carta: validade_carta,
    numero_carta: numero_carta,
    psicologicos: psicologicos,
    periodicos: periodicos

  })
    .then(() => {
      alert('Dados enviados com sucesso!');
      form.reset(); // Limpar o formulário após o envio
    })
    .catch((error) => {
      console.error('Erro ao enviar os dados:', error);
      alert('Erro ao enviar os dados.');
    });

    document.getElementById('foto').addEventListener('change', function(event) {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
          document.getElementById('fotoPreview').src = e.target.result;
        };
        reader.readAsDataURL(file);
      }
    });   
});