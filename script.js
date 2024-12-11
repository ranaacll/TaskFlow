const btnAdicionarTarefa = document.querySelector('.btn-add-task');
const formAdicionarTarefa = document.querySelector('.form-add-task');
const textarea = document.querySelector('.app__form-textarea');
const ulTarefas = document.querySelector('.app__section-task-list');
const taskDescriptionDisplay = document.getElementById('taskDescriptionDisplay');
const botaoIniciarFoco = document.getElementById('startFocusButton');
const displayTimer = document.getElementById('focusTimer');


//variáveis globais
let activeTaskIndex = null; //No começo nenhuma tarefa será ativa
let tarefas = JSON.parse(localStorage.getItem('tarefas')) || []; //lista de tarefas armazenadas
let focusTimer;
let tempo = 0.1 * 60; //6 segundos 

//Função para formatar o tempo do cronômetro
function formatarTempo(tempo) {
    const minutos = Math.floor(tempo / 60);
    const segundos = tempo % 60;
    return `${String(minutos).padStart(2, '0')}:${String(segundos).padStart(2, '0')}`;
}

//Função para iniciar o cronômetro
function iniciarCronometro() {
    if (activeTaskIndex === null) {
        alert('Por favor, selecione uma tarefa para focar!');
        return;
    }
    botaoIniciarFoco.disabled = true; //desabilita o botão enquanto o cronômetro está em andamento
    focusTimer = setInterval(() => {
        tempo--;
        displayTimer.textContent = formatarTempo(tempo);

        if (tempo <= 0) {
            clearInterval(focusTimer); //Para o cronômetro
            const evento = new CustomEvent('FocoFinalizado'); // Dispara o evento customizado
            window.dispatchEvent(evento);
        }
    }, 1000);
}

// escutando e atualizando o evento 'FocoFinalizado' para salvar o estado completo
//fiz algumas pesquisas e coloquei 'window' para atualizar, pois document nao rodava corretamente
window.addEventListener('FocoFinalizado', () => {
    if (activeTaskIndex !== null) {
        const tarefa = tarefas[activeTaskIndex];
        tarefa.completa = true; 
        localStorage.setItem('tarefas', JSON.stringify(tarefas)); //atualiza o localStorage

        const tarefaItem = ulTarefas.children[activeTaskIndex];
        tarefaItem.classList.add('completed'); 

        const tarefaDescricao = tarefaItem.querySelector('.app__section-task-list-item-description');
        const botaoEditar = tarefaItem.querySelector('.app_button-edit');

        tarefaDescricao.contentEditable = 'false'; 
        botaoEditar.disabled = true; //deesabilita o botão "Editar"

        taskDescriptionDisplay.innerHTML = '<p><strong>Foco Finalizado!</strong></p>';
        displayTimer.textContent = '00:00'; //reseta o cronômetro
        botaoIniciarFoco.disabled = false; // habilita o botão para reiniciar
        tempo = 0.1 * 60; 

        activeTaskIndex = null;
    }
});


//Função para criar o elemento de uma tarefa
function criarElementoTarefa(tarefa, index) {
    const li = document.createElement('li');
    li.classList.add('app__section-task-list-item');

    if (tarefa.completa) {
        li.classList.add('completed');
    }

    li.addEventListener('click', () => {
        if (tarefa.completa) return; //ignora o clique nas tarefas completadas

        const itensAtivos = document.querySelectorAll('.active');
        itensAtivos.forEach(item => item.classList.remove('active'));

        if (!li.classList.contains('active')) {
            li.classList.add('active');
            taskDescriptionDisplay.textContent = tarefa.descricao;
            activeTaskIndex = index;
        } else {
            li.classList.remove('active');
            taskDescriptionDisplay.textContent = '';
            activeTaskIndex = null;
        }
    });

    const paragrafo = document.createElement('p');
    paragrafo.textContent = tarefa.descricao;
    paragrafo.classList.add('app__section-task-list-item-description');

    const botaoEditar = document.createElement('button');
    botaoEditar.classList.add('app_button-edit');
    botaoEditar.textContent = 'Editar';

    if (tarefa.completa) {
        botaoEditar.disabled = true; // desabilitar botão para tarefas completadas
        paragrafo.contentEditable = 'false'; //desabilitar a edição
    }

    botaoEditar.addEventListener('click', () => {
        if (tarefa.completa) return;

        const novaDescricao = prompt('Edite sua tarefa:', tarefa.descricao);
        if (novaDescricao && novaDescricao.trim()) {
            tarefa.descricao = novaDescricao;
            paragrafo.textContent = tarefa.descricao;
            localStorage.setItem('tarefas', JSON.stringify(tarefas));
        }
    });

    li.append(paragrafo, botaoEditar);
    return li;
}


//adicionar nova tarefa
btnAdicionarTarefa.addEventListener('click', () => {
    formAdicionarTarefa.classList.toggle('hidden');
});

formAdicionarTarefa.addEventListener('submit', (evento) => {
    evento.preventDefault();
    const descricao = textarea.value.trim();
    if (!descricao) return;

    const tarefa = { descricao };
    tarefas.push(tarefa);
    localStorage.setItem('tarefas', JSON.stringify(tarefas));

    const elementoTarefa = criarElementoTarefa(tarefa, tarefas.length - 1);
    ulTarefas.append(elementoTarefa);

    textarea.value = '';
    formAdicionarTarefa.classList.add('hidden');
});

// renderizar tarefas salvas
tarefas.forEach((tarefa, index) => {
    const elementoTarefa = criarElementoTarefa(tarefa, index);
    ulTarefas.append(elementoTarefa);
});

//  Evento para iniciar o foco
botaoIniciarFoco.addEventListener('click', iniciarCronometro);


//botão para limpar todas as tarefas
const btnLimparTarefas = document.getElementById('limpar-tarefas');
btnLimparTarefas.addEventListener('click', () => {
        localStorage.removeItem('tarefas'); //remoove do localStorage
        ulTarefas.innerHTML = ''; 
        taskDescriptionDisplay.textContent = ''; //limpa a tarefa ativa
        displayTimer.textContent = '00:00'; //cronômetro reseta
        activeTaskIndex = null; 
    
});


