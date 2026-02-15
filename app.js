import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getDatabase, ref, push, set } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-database.js";
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

// Referência ao formulário
const form = document.getElementById('dataForm');

// Variável para armazenar a foto em base64
let fotoBase64 = '';
// Variável para armazenar a chave do registo em edição (se houver)
let editKey = null;

// Verificar autenticação antes de permitir uso do formulário
onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = "login.html";
    return;
  }
  
  console.log('Utilizador autenticado:', user.email);
});

// Event listener para converter a foto para base64
document.getElementById('foto').addEventListener('change', function(event) {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function(e) {
      fotoBase64 = e.target.result; // Guardar em base64
      const previewEl = document.getElementById('preview');
      if (previewEl) {
        previewEl.src = fotoBase64;
        previewEl.style.display = 'block';
      }
    };
    reader.readAsDataURL(file);
  }
});

// Event listener para calcular idade automaticamente
document.getElementById('data_nascimento').addEventListener('change', function(event) {
  const dataNascimento = new Date(event.target.value);
  
  if (!isNaN(dataNascimento.getTime())) {
    const hoje = new Date();
    let idade = hoje.getFullYear() - dataNascimento.getFullYear();
    const mesAtual = hoje.getMonth();
    const diaAtual = hoje.getDate();
    const mesMes = dataNascimento.getMonth();
    const diaNasc = dataNascimento.getDate();

    // Ajustar se ainda não fez aniversário este ano
    if (mesAtual < mesMes || (mesAtual === mesMes && diaAtual < diaNasc)) {
      idade--;
    }

    document.getElementById('age').value = idade;
  }
});

// Evento de envio do formulário
form.addEventListener('submit', (e) => {
  e.preventDefault(); // Evita o comportamento padrão de recarregar a página

  // Obter os valores do formulário
  const name = document.getElementById('name').value.trim();
  const matricula = document.getElementById('matricula').value.trim();
  const email = document.getElementById('email').value.trim();
  const age = document.getElementById('age').value.trim();
  const categoria = document.getElementById('categoria').value.trim();
  const escala = document.getElementById('escala').value.trim();
  const foto = fotoBase64;
  const telefone_particular = document.getElementById("telefone_particular").value.trim();
  const numero_tablet = document.getElementById("numero_tablet").value.trim();
  const data_nascimento = document.getElementById("data_nascimento").value.trim();
  const validade_carta = document.getElementById("validade_carta").value.trim();
  const numero_carta = document.getElementById("numero_carta").value.trim();
  const periodicos = document.getElementById("periodicos").value.trim();
  const psicologicos = document.getElementById("psicologicos").value.trim();

  // Validar campos obrigatórios
  if (!name || !matricula || !email) {
    alert('Por favor, preencha os campos obrigatórios (Nome, Matrícula, Email).');
    return;
  }

  // Salvar os dados no Firebase
  const dbRef = ref(database, 'users');
  const payload = {
    name: name,
    matricula: matricula,
    email: email,
    age: age,
    categoria: categoria,
    escala: escala,
    foto: foto,
    telefone_particular: telefone_particular,
    numero_tablet: numero_tablet,
    data_nascimento: data_nascimento,
    validade_carta: validade_carta,
    numero_carta: numero_carta,
    psicologicos: psicologicos,
    periodicos: periodicos
  };

  // Se houver uma edição em curso, atualizar o registo existente
  if (editKey) {
    const recordRef = ref(database, `users/${editKey}`);
    set(recordRef, payload)
      .then(() => {
        alert('Registro atualizado com sucesso!');
        form.reset();
        fotoBase64 = '';
        const previewEl = document.getElementById('preview');
        if (previewEl) previewEl.src = '';
        // limpar localStorage e estado de edição
        localStorage.removeItem('editRecordKey');
        localStorage.removeItem('editRecordData');
        editKey = null;
        console.log('Registro atualizado com sucesso no Firebase');
      })
      .catch((error) => {
        console.error('Erro ao atualizar os dados:', error);
        alert('Erro ao atualizar os dados: ' + error.message);
      });
    return;
  }

  // Caso contrário, criar um novo registo
  push(dbRef, payload)
    .then(() => {
      alert('Dados enviados com sucesso!');
      form.reset(); // Limpar o formulário após o envio
      fotoBase64 = ''; // Limpar a foto também
      const previewEl = document.getElementById('preview');
      if (previewEl) previewEl.src = '';
      console.log('Dados guardados com sucesso no Firebase');
    })
    .catch((error) => {
      console.error('Erro ao enviar os dados:', error);
      let errorMsg = 'Erro ao enviar os dados: ' + error.message;
      if (error.code === 'PERMISSION_DENIED') {
        errorMsg = 'Erro de permissão. Verifique as regras do Firebase.';
      }
      alert(errorMsg);
    });
});

// Ao carregar a página, verificar se existe um registo para edição
window.addEventListener('DOMContentLoaded', () => {
  const editDataJSON = localStorage.getItem('editRecordData');
  const editKeyStored = localStorage.getItem('editRecordKey');
  if (editDataJSON && editKeyStored) {
    try {
      const data = JSON.parse(editDataJSON);
      editKey = editKeyStored;
      // Preencher campos do formulário
      const setIf = (id, value) => {
        const el = document.getElementById(id);
        if (el && typeof value !== 'undefined') el.value = value;
      };
      setIf('name', data.name || '');
      setIf('matricula', data.matricula || '');
      setIf('email', data.email || '');
      setIf('age', data.age || '');
      setIf('categoria', data.categoria || '');
      setIf('escala', data.escala || '');
      setIf('telefone_particular', data.telefone_particular || '');
      setIf('numero_tablet', data.numero_tablet || '');
      setIf('data_nascimento', data.data_nascimento || '');
      setIf('validade_carta', data.validade_carta || '');
      setIf('numero_carta', data.numero_carta || '');
      setIf('periodicos', data.periodicos || '');
      setIf('psicologicos', data.psicologicos || '');
      // Foto
      if (data.foto) {
        fotoBase64 = data.foto;
        const previewEl = document.getElementById('preview');
        if (previewEl) {
          previewEl.src = fotoBase64;
          previewEl.style.display = 'block';
        }
      }
    } catch (err) {
      console.error('Erro ao parsear dados de edição:', err);
    }
  }
});