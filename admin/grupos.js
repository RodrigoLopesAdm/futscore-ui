
const API_URL = "http://localhost:8080/api";
// Armazena o ID do grupo que está sendo editado
let grupoEmEdicaoId = null;

// Carrega os campeonatos cadastrados
async function carregarCampeonatos() {

    const select = document.getElementById("campeonato-grupo");

    try {

        const resposta = await fetch(`${API_URL}/campeonatos`);

        if (!resposta.ok) {
            throw new Error("Erro ao buscar campeonatos.");
        }

        const campeonatos = await resposta.json();

        select.innerHTML =
            '<option value="">Selecione um campeonato</option>';

        campeonatos.forEach(campeonato => {

            const option = document.createElement("option");

            option.value = campeonato.id;
            option.textContent =
                `${campeonato.nome} (${campeonato.ano})`;

            select.appendChild(option);

        });

    } catch (erro) {

        console.error("Erro ao carregar campeonatos:", erro);

        document.getElementById("mensagem-grupo").textContent =
            "Não foi possível carregar os campeonatos.";
    }
}

// Executa quando a página terminar de carregar
document.addEventListener("DOMContentLoaded", () => {
    carregarCampeonatos();
});


// Cadastrar um novo grupo
document.getElementById("form-grupo").addEventListener("submit", async (event) => {

    event.preventDefault();

    const campeonatoId = document.getElementById("campeonato-grupo").value;
    const nome = document.getElementById("nome-grupo").value.trim();
    const mensagem = document.getElementById("mensagem-grupo");

    if (!campeonatoId || !nome) {
        mensagem.textContent = "Selecione um campeonato e informe o nome do grupo.";
        return;
    }

    try {
        const editando = grupoEmEdicaoId !== null;

        // Define a URL e o método conforme a operação
        const url = editando
            ? `${API_URL}/grupos/${grupoEmEdicaoId}`
            : `${API_URL}/grupos/campeonato/${campeonatoId}`;

        const metodo = editando ? "PUT" : "POST";

        const resposta = await fetch(url, {
            method: metodo,
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ nome })
        });

        if (!resposta.ok) {

            if (resposta.status === 409) {
                throw new Error(
                    "Não foi possível realizar a operação. " +
                    "O campeonato pode ter atingido o limite de grupos " +
                    "ou já possuir um grupo com esse nome."
                );
            }

            if (resposta.status === 400) {
                throw new Error(
                    "Não foi possível realizar a operação. " +
                    "Verifique o nome do grupo e as configurações do campeonato."
                );
            }

            throw new Error(
                editando
                    ? "Não foi possível atualizar o grupo."
                    : "Não foi possível cadastrar o grupo."
            );
        }

        mensagem.textContent = editando
            ? "Grupo atualizado com sucesso!"
            : "Grupo cadastrado com sucesso!";

        // Limpa o formulário e encerra a edição
        grupoEmEdicaoId = null;

        document.getElementById("nome-grupo").value = "";

        document.getElementById("btn-salvar-grupo").textContent =
            "Salvar grupo";

        document.getElementById("btn-cancelar-edicao-grupo").style.display =
            "none";

        // Atualiza a tabela
        await carregarGrupos();

    } catch (erro) {

        console.error("Erro ao cadastrar grupo:", erro);
        mensagem.textContent = erro.message;
    }

});

 // Listar os grupos do campeonato selecionado
async function carregarGrupos() {

    const campeonatoId =
        document.getElementById("campeonato-grupo").value;

    const tabela =
        document.getElementById("lista-grupos-admin");

    tabela.innerHTML = "";

    if (!campeonatoId) {
        tabela.innerHTML =
            '<tr><td colspan="4">Selecione um campeonato.</td></tr>';
        return;
    }

    try {

        const resposta = await fetch(
            `${API_URL}/grupos/campeonato/${campeonatoId}`
        );

        if (!resposta.ok) {
            throw new Error("Erro ao carregar grupos.");
        }

        const grupos = await resposta.json();

        if (grupos.length === 0) {
            tabela.innerHTML =
                '<tr><td colspan="4">Nenhum grupo cadastrado.</td></tr>';
            return;
        }

        grupos.forEach(grupo => {

            const linha = document.createElement("tr");

            const celulaId = document.createElement("td");
            celulaId.textContent = grupo.id;

            const celulaNome = document.createElement("td");
            celulaNome.textContent = grupo.nome;

            const celulaCampeonato = document.createElement("td");
            celulaCampeonato.textContent = grupo.campeonato.nome;

            const celulaAcoes = document.createElement("td");
            const botaoEditar = document.createElement("button");
            botaoEditar.textContent = "Editar";
            botaoEditar.className = "btn-editar";

            // Carrega os dados do grupo no formulário
            botaoEditar.addEventListener("click", () => {

            // Identifica o grupo que será atualizado
            grupoEmEdicaoId = grupo.id;

            document.getElementById("nome-grupo").value = grupo.nome;

            document.getElementById("nome-grupo").focus();

            document.getElementById("btn-salvar-grupo").textContent =
                "Atualizar grupo";

            document.getElementById("btn-cancelar-edicao-grupo").style.display =
                "inline-block";

            document.getElementById("mensagem-grupo").textContent =
                `Editando o grupo: ${grupo.nome}`;

        });

            const botaoExcluir = document.createElement("button");
            botaoExcluir.textContent = "Excluir";
            botaoExcluir.className = "btn-excluir";

            botaoExcluir.addEventListener("click", async () => {

                const confirmar = confirm(
                    `Deseja realmente excluir o grupo "${grupo.nome}"?`
                );

                if (!confirmar) {
                    return;
                }

                try {

                    const resposta = await fetch(
                        `${API_URL}/grupos/${grupo.id}`,
                        {
                            method: "DELETE"
                        }
                    );

                    if (!resposta.ok) {

                        const erro = await resposta.json();

                        throw new Error(
                            erro.message || "Não foi possível excluir o grupo."
                        );
                    }

                    document.getElementById("mensagem-grupo").textContent =
                        "Grupo excluído com sucesso!";

                    // Atualiza a tabela após a exclusão
                    await carregarGrupos();

                } catch (erro) {

                    console.error("Erro ao excluir grupo:", erro);

                    document.getElementById("mensagem-grupo").textContent =
                        erro.message;
                }

            });


            celulaAcoes.appendChild(botaoEditar);
            celulaAcoes.appendChild(botaoExcluir);

            linha.appendChild(celulaId);
            linha.appendChild(celulaNome);
            linha.appendChild(celulaCampeonato);
            linha.appendChild(celulaAcoes);

            tabela.appendChild(linha);

        });

    } catch (erro) {

        console.error("Erro ao carregar grupos:", erro);

        tabela.innerHTML =
            '<tr><td colspan="4">Erro ao carregar grupos.</td></tr>';
    }
}

// Atualiza a tabela ao selecionar outro campeonato
document.getElementById("campeonato-grupo")
    .addEventListener("change", carregarGrupos);

// Cancelar a edição de um grupo
document.getElementById("btn-cancelar-edicao-grupo")
    .addEventListener("click", () => {

        // Encerra o modo de edição
        grupoEmEdicaoId = null;

        // Limpa o campo do nome
        document.getElementById("nome-grupo").value = "";

        // Restaura o botão de cadastro
        document.getElementById("btn-salvar-grupo").textContent =
            "Salvar grupo";

        // Oculta o botão Cancelar edição
        document.getElementById("btn-cancelar-edicao-grupo").style.display =
            "none";

        // Exibe a mensagem
        document.getElementById("mensagem-grupo").textContent =
            "Edição cancelada.";

    });


