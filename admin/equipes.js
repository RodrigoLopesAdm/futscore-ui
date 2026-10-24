
document.addEventListener("DOMContentLoaded", () => {

    // ID da equipe que está sendo editada
    let equipeEmEdicaoId = null;

async function carregarEquipes() {

        const lista = document.getElementById("lista-equipes-admin");

        if (!lista) return;

        try {
            const resposta = await fetch(
                "http://localhost:8080/api/equipes"
            );

            if (!resposta.ok) {
                throw new Error("Erro HTTP: " + resposta.status);
            }

            const equipes = await resposta.json();

            lista.innerHTML = "";

            if (equipes.length === 0) {
                lista.innerHTML = `
                    <tr>
                        <td colspan="6">
                            Nenhuma equipe cadastrada.
                        </td>
                    </tr>
                `;
                return;
            }

            equipes.forEach(equipe => {

                const linha = document.createElement("tr");

                const dados = [
                    equipe.id,
                    equipe.nome,
                    equipe.bairro,
                    equipe.tecnico,
                    equipe.contato
                ];

                dados.forEach(valor => {
                    const coluna = document.createElement("td");
                    coluna.textContent = valor ?? "";
                    linha.appendChild(coluna);
                });
      
                const colunaAcoes = document.createElement("td");

                // Botão Editar
                const botaoEditar = document.createElement("button");
                botaoEditar.type = "button";
                botaoEditar.textContent = "Editar";
                botaoEditar.classList.add("btn-editar");

                // Identifica a equipe selecionada para edição                                
                botaoEditar.addEventListener("click", () => {
                    // Ativa o modo de edição da equipe
                    equipeEmEdicaoId = equipe.id;
                    // Altera o texto do botão para o modo de edição
                    const botaoSalvarEquipe = document.querySelector(
                        '#form-equipe button[type="submit"]'
                    );

                    botaoSalvarEquipe.textContent = "Atualizar equipe";
                    // Exibe o botão Cancelar edição
                    document.getElementById("btn-cancelar-edicao-equipe")
                        .style.display = "inline-block";         

                    // Preenche o formulário com os dados da equipe
                    document.getElementById("nome-equipe").value =
                        equipe.nome ?? "";

                    document.getElementById("bairro-equipe").value =
                        equipe.bairro ?? "";

                    document.getElementById("tecnico-equipe").value =
                        equipe.tecnico ?? "";

                    document.getElementById("contato-equipe").value =
                        equipe.contato ?? "";

                    // Leva o usuário até o formulário
                    document.getElementById("form-equipe")
                        .scrollIntoView({
                            behavior: "smooth",
                            block: "start"
                        });

                });

                // Botão Excluir
                const botaoExcluir = document.createElement("button");
                botaoExcluir.type = "button";
                botaoExcluir.textContent = "Excluir";
                botaoExcluir.classList.add("btn-excluir");
                // Solicita confirmação antes de excluir a equipe
                
                botaoExcluir.addEventListener("click", async () => {

                    const confirmarExclusao = confirm(
                        `Tem certeza que deseja excluir a equipe "${equipe.nome}"?`
                    );

                    if (!confirmarExclusao) {
                        return;
                    }

                    botaoExcluir.disabled = true;

                    try {
                        const resposta = await fetch(
                            `http://localhost:8080/api/equipes/${equipe.id}`,
                            {
                                method: "DELETE"
                            }
                        );

                        if (resposta.status === 409) {
                            alert(
                                "Não é possível excluir esta equipe, pois ela possui registros vinculados."
                            );
                            return;
                        }

                        if (!resposta.ok) {
                            throw new Error("Erro HTTP: " + resposta.status);
                        }

                        alert("Equipe excluída com sucesso!");

                        await carregarEquipes();

                    } catch (erro) {
                        console.error("Erro ao excluir equipe:", erro);

                        alert(
                            "Não foi possível excluir a equipe. Verifique a conexão com a API."
                        );

                    } finally {
                        botaoExcluir.disabled = false;
                    }

                });

                // Adiciona os botões à coluna Ações
                colunaAcoes.appendChild(botaoEditar);
                colunaAcoes.appendChild(botaoExcluir);

                // Adiciona a coluna à linha
                linha.appendChild(colunaAcoes);

                // Adiciona a linha à tabela
                lista.appendChild(linha);


            });

        } catch (erro) {
            console.error("Erro ao carregar equipes:", erro);

            lista.innerHTML = `
                <tr>
                    <td colspan="6">
                        Não foi possível carregar as equipes.
                    </td>
                </tr>
            `;
        }
    }
    carregarEquipes();
    
/* =========================================
   CADASTRAR NOVA EQUIPE
========================================= */

const formularioEquipe = document.getElementById("form-equipe");
const mensagemEquipe = document.getElementById("mensagem-equipe");

const botaoCancelarEdicaoEquipe = document.getElementById(
    "btn-cancelar-edicao-equipe"
);

if (botaoCancelarEdicaoEquipe && formularioEquipe) {

    botaoCancelarEdicaoEquipe.addEventListener("click", () => {

        // Sai do modo de edição
        equipeEmEdicaoId = null;
    
        formularioEquipe.reset();

        // Restaura o botão de cadastro
        formularioEquipe.querySelector(
            'button[type="submit"]'
        ).textContent = "Salvar equipe";

        // Esconde o botão Cancelar edição
        botaoCancelarEdicaoEquipe.style.display = "none";

        // Limpa as mensagens anteriores
        if (mensagemEquipe) {
            mensagemEquipe.textContent = "";
        }

    });

}

if (formularioEquipe && mensagemEquipe) {

    formularioEquipe.addEventListener("submit", async (evento) => {

        evento.preventDefault();

        const nome = document.getElementById("nome-equipe").value.trim();
        const bairro = document.getElementById("bairro-equipe").value.trim();
        const tecnico = document.getElementById("tecnico-equipe").value.trim();
        const contato = document.getElementById("contato-equipe").value.trim();

        // Validação do nome
        if (nome.length < 2 || nome.length > 100) {
            mensagemEquipe.textContent =
                "O nome da equipe deve ter entre 2 e 100 caracteres.";
            mensagemEquipe.style.color = "#dc2626";
            return;
        }

        const novaEquipe = {
            nome: nome,
            bairro: bairro,
            tecnico: tecnico,
            contato: contato
        };

        const botaoSalvar = formularioEquipe.querySelector(
            'button[type="submit"]'
        );

        botaoSalvar.disabled = true;
        botaoSalvar.textContent = "Salvando...";

        mensagemEquipe.textContent = "Cadastrando equipe...";
        mensagemEquipe.style.color = "#64748b";
        // Verifica se estamos cadastrando ou editando
        const modoEdicaoEquipe = equipeEmEdicaoId !== null;

        const urlEquipe = modoEdicaoEquipe
            ? `http://localhost:8080/api/equipes/${equipeEmEdicaoId}`
            : "http://localhost:8080/api/equipes";

        const metodoHttpEquipe = modoEdicaoEquipe ? "PUT" : "POST";
        try {
            const resposta = await fetch(
                urlEquipe,
                {
                    method: metodoHttpEquipe,
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(novaEquipe)
                }
            );


            if (!resposta.ok) {
                throw new Error("Erro HTTP: " + resposta.status);
            }

            mensagemEquipe.textContent = modoEdicaoEquipe
                ? "Equipe atualizada com sucesso!"
                : "Equipe cadastrada com sucesso!";
            mensagemEquipe.style.color = "#16a34a";

            formularioEquipe.reset();

            // Retorna ao modo de cadastro após salvar ou atualizar
            equipeEmEdicaoId = null;

            // Esconde o botão Cancelar edição após salvar
            if (botaoCancelarEdicaoEquipe) {
                botaoCancelarEdicaoEquipe.style.display = "none";
            }

            // Atualiza a tabela de equipes
            await carregarEquipes();

        } catch (erro) {

            console.error("Erro ao cadastrar equipe:", erro);

            mensagemEquipe.textContent =
                "Não foi possível cadastrar a equipe. Verifique os dados e a conexão com a API.";

            mensagemEquipe.style.color = "#dc2626";

        } finally {
                botaoSalvar.disabled = false;

                botaoSalvar.textContent =
                    equipeEmEdicaoId !== null
                        ? "Atualizar equipe"
                        : "Salvar equipe";
            }

    });

}

});
