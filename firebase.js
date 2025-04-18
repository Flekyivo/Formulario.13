var config = { 
    apiKey: "AIzaSyBWcwqCTD6CeACJaJbIirMNvtel-xH1Ep4",
    authDomain: "controle-de-maquinistas.firebaseapp.com",
    databaseURL: "https://controle-de-maquinistas-default-rtdb.firebaseio.com",
    projectId: "controle-de-maquinistas",
    storageBucket: "controle-de-maquinistas.firebasestorage.app",
    messagingSenderId: "1095308158920",
    appId: "1:1095308158920:web:7432fc02d64eeb83b702fd"
  };
firebase.initializeApp(config);

var var_lista = document.getElementById("div_lista");

var dados = ""

var db = firebaseRef = firebase.database().ref("clientes");


db.on('child_added', function(snapshot) {
  
    var adicicionado = snapshot.val();

    dados ="<table>" +"<tr></tr>"+adicicionado+"<tr></tr>" + dados;

    var_lista.innerHTML = dados;
    
})