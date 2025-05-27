const elements = {
    formulario: document.getElementById("formulario"),
    descricao: document.getElementById("descricao"),
    valor: document.getElementById("valor"),
    tipo: document.getElementById("tipo"),
    msgForm: document.querySelector('.msg-form'),
    saldoPage: document.querySelector('.saldo-page'),
    listaTransacoes: document.querySelector('.lista-transacoes')
};

const storage = {
    getSaldo: () => parseFloat(localStorage.getItem("saldoAtual")) || 0,
    setSaldo: (valor) => localStorage.setItem("saldoAtual", valor.toFixed(2)),
    getTransacoes: () => JSON.parse(localStorage.getItem("transacoes")) || [],
    setTransacoes: (transacoes) => localStorage.setItem("transacoes", JSON.stringify(transacoes))
};


window.addEventListener('load', () => {
    atualizarSaldo();
    carregarTransacoes();
    verificarExibirLista();
});

function atualizarSaldo() {
    elements.saldoPage.textContent = `R$ ${storage.getSaldo().toFixed(2)}`;
}

function carregarTransacoes() {
    elements.listaTransacoes.innerHTML = '';
    storage.getTransacoes().forEach(transacao => {
        const li = document.createElement('li');
        li.className = `transacao ${transacao.tipo}`;
        li.innerHTML = `
            <div class="tipo">${transacao.tipo === 'entrada' ? 'Valor adicionado' : 'Valor retirado'}</div>
            <div class="detalhes">
                Descrição: ${transacao.descricao} 
                R$ ${transacao.valor.toFixed(2)} 
                Data: ${transacao.data}
            </div>
        `;
        elements.listaTransacoes.appendChild(li);
    });
}

elements.formulario.addEventListener('submit', (e) => {
    e.preventDefault();
    const descricaoValor = elements.descricao.value.trim();
    const valorTransacao = parseFloat(elements.valor.value);
    const tipoTransacao = elements.tipo.value;

    if (!validarCampos(descricaoValor, valorTransacao)) return;
    processarTransacao(tipoTransacao, valorTransacao, descricaoValor);
});

function validarCampos(descricao, valor) {
    if (!descricao || isNaN(valor)) {
        showMessage("Preencha todos os campos com valores válidos", "erro");
        return false;
    }
    return true;
}

function processarTransacao(tipo, valor, descricao) {
    let saldo = storage.getSaldo();

    if (tipo === "entrada") {
        saldo += valor;
        showMessage(`Saldo adicionado: R$ ${valor.toFixed(2)}`, "success");
    } else if (saldo >= valor) {
        saldo -= valor;
        showMessage(`Saldo retirado: R$ ${valor.toFixed(2)}`, "success");
    } else {
        showMessage("Saldo insuficiente", "erro");
        return;
    }

    storage.setSaldo(saldo);
    adicionarTransacao(tipo, valor, descricao);
    atualizarSaldo();
}

function adicionarTransacao(tipo, valor, descricao) {
    const transacoes = storage.getTransacoes();
    transacoes.push({
        tipo, valor, descricao,
        data: new Date().toLocaleString()
    });
    storage.setTransacoes(transacoes);
    carregarTransacoes();
    verificarExibirLista(); 
}

function showMessage(msg, tipo) {
    elements.msgForm.textContent = msg;
    elements.msgForm.className = `msg-form ${tipo}`;
    setTimeout(() => elements.msgForm.textContent = "", 4000);
}

function verificarExibirLista() {
    const transacoes = storage.getTransacoes();
    const temEntrada = transacoes.some(t => t.tipo === 'entrada');

    const profileTabLink = document.querySelector('.nav-link[href="#profile"]');
    const profileTabContent = document.getElementById('profile');

    if (temEntrada) {
        profileTabLink.style.display = 'block';
        profileTabContent.style.display = 'block';
    } else {
        profileTabLink.style.display = 'none';
        profileTabContent.style.display = 'none';
    }
}
