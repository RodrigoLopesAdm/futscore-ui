
const API_URL = "http://localhost:8080/api";

document.addEventListener("DOMContentLoaded", () => {

    carregarCampeonatos();
    carregarEquipes();
    carregarInscricoes();

    const selectCampeonato = document.getElementById(
        "campeonato-inscricao"
    );
    
    selectCampeonato.addEventListener("change", () => {
        carregarGrupos();
        carregarEquipes();
        carregarInscricoes();
        carregarDistribuicaoGrupos();
    });

});

// CARREGAR CAMPEONATOS
async function carregarCampeonatos() {

    const selectCampeonato = document.getElementById(
        "campeonato-inscricao"
    );

    try {

        const resposta = await fetch(
            `${API_URL}/campeonatos`
        );

        if (!resposta.ok) {
            throw new Error("Erro ao carregar campeonatos.");
        }

        const campeonatos = await resposta.json();

        selectCampeonato.innerHTML = `
            <option value="">
                Selecione um campeonato
            </option>
        `;

        campeonatos.forEach(campeonato => {

            const opcao = document.createElement("option");

            opcao.value = campeonato.id;

            opcao.textContent =
                `${campeonato.nome} (${campeonato.ano})`;

            selectCampeonato.appendChild(opcao);

        });

    } catch (erro) {

        console.error("Erro ao carregar campeonatos:", erro);

        document.getElementById(
            "mensagem-inscricao"
        ).textContent = "Não foi possível carregar os campeonatos.";

    }

}


// CARREGAR EQUIPES
async function carregarEquipes() {

    const selectEquipe = document.getElementById(
        "equipe-inscricao"
    );

    try {

        const resposta = await fetch(
            `${API_URL}/equipes`
        );

        if (!resposta.ok) {
            throw new Error("Erro ao carregar equipes.");
        }

        const equipes = await resposta.json();
        const campeonatoId = document.getElementById(
            "campeonato-inscricao"
        ).value;

        let equipesDisponiveis = equipes;

        if (campeonatoId) {

            const respostaInscricoes = await fetch(
                `${API_URL}/campeonato-equipes`
            );

            if (!respostaInscricoes.ok) {
                throw new Error("Erro ao verificar equipes inscritas.");
            }

            const inscricoes = await respostaInscricoes.json();

            const equipesJaInscritas = inscricoes
                .filter(inscricao =>
                    String(inscricao.campeonato?.id) === campeonatoId
                )
                .map(inscricao => String(inscricao.equipe?.id));

            equipesDisponiveis = equipes.filter(equipe =>
                !equipesJaInscritas.includes(String(equipe.id))
            );
        }


        selectEquipe.innerHTML = `
            <option value="">
                Selecione uma equipe
            </option>
        `;

        equipesDisponiveis.forEach(equipe => {

            const opcao = document.createElement("option");

            opcao.value = equipe.id;
            opcao.textContent = equipe.nome;

            selectEquipe.appendChild(opcao);

        });

    } catch (erro) {

        console.error("Erro ao carregar equipes:", erro);

        document.getElementById(
            "mensagem-inscricao"
        ).textContent = "Não foi possível carregar as equipes.";

    }

}


// CARREGAR GRUPOS DO CAMPEONATO SELECIONADO
async function carregarGrupos() {

    const campeonatoId = document.getElementById(
        "campeonato-inscricao"
    ).value;

    const selectGrupo = document.getElementById(
        "grupo-inscricao"
    );

    // Limpa os grupos da seleção anterior
    selectGrupo.innerHTML = `
        <option value="">Sem grupo definido</option>
    `;

    // Se nenhum campeonato foi selecionado, não busca grupos
    if (!campeonatoId) {
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

        // Evita mostrar grupos de outro campeonato
        // caso o usuário mude a seleção rapidamente
        if (document.getElementById(
            "campeonato-inscricao"
        ).value !== campeonatoId) {
            return;
        }

        grupos.forEach(grupo => {

            const opcao = document.createElement("option");

            opcao.value = grupo.id;
            opcao.textContent = grupo.nome;

            selectGrupo.appendChild(opcao);

        });

    } catch (erro) {

        console.error("Erro ao carregar grupos:", erro);

        document.getElementById(
            "mensagem-inscricao"
        ).textContent = "Não foi possível carregar os grupos.";

    }

}


// INSCREVER EQUIPE NO CAMPEONATO
document.getElementById("form-inscricao")
    .addEventListener("submit", async (evento) => {

        evento.preventDefault();

        const campeonatoId = document.getElementById(
            "campeonato-inscricao"
        ).value;

        const equipeId = document.getElementById(
            "equipe-inscricao"
        ).value;

        const grupoId = document.getElementById(
            "grupo-inscricao"
        ).value;

        const mensagem = document.getElementById(
            "mensagem-inscricao"
        );

        const botaoSalvar = evento.currentTarget.querySelector(
            'button[type="submit"]'
        );

        if (!campeonatoId || !equipeId) {
            mensagem.textContent =
                "Selecione um campeonato e uma equipe.";
            mensagem.style.color = "#dc2626";
            return;
        }

        const parametros = new URLSearchParams({
            campeonatoId: campeonatoId,
            equipeId: equipeId
        });

        if (grupoId) {
            parametros.append("grupoId", grupoId);
        }

        botaoSalvar.disabled = true;
        mensagem.textContent = "Realizando inscrição...";
        mensagem.style.color = "#64748b";

        try {

            const resposta = await fetch(
                `${API_URL}/campeonato-equipes?${parametros}`,
                {
                    method: "POST"
                }
            );

            if (resposta.status === 409) {
                throw new Error(
                    "Esta equipe já está inscrita neste campeonato."
                );
            }

            if (!resposta.ok) {
                throw new Error(
                    "Não foi possível realizar a inscrição."
                );
            }
            
            mensagem.textContent =
                "Equipe inscrita com sucesso!";
            mensagem.style.color = "#16a34a";
            
            await carregarInscricoes();
            await carregarDistribuicaoGrupos();
            await carregarEquipes();

            document.getElementById(
                "equipe-inscricao"
            ).value = "";

            document.getElementById(
                "grupo-inscricao"
            ).value = "";

        } catch (erro) {

            console.error("Erro ao inscrever equipe:", erro);

            mensagem.textContent = erro.message;
            mensagem.style.color = "#dc2626";

        } finally {

            botaoSalvar.disabled = false;

        }

    });


async function carregarInscricoes() {

    const lista = document.getElementById(
        "lista-inscricoes-admin"
    );
    const campeonatoSelecionado = document.getElementById(
        "campeonato-inscricao"
    ).value;

    try {

        const resposta = await fetch(
            `${API_URL}/campeonato-equipes`
        );

        if (!resposta.ok) {
            throw new Error("Erro ao carregar inscrições.");
        }

        const todasInscricoes = await resposta.json();

        const inscricoes = campeonatoSelecionado
            ? todasInscricoes.filter(inscricao =>
                String(inscricao.campeonato?.id) === campeonatoSelecionado
            )
            : todasInscricoes;

        lista.innerHTML = "";

        if (inscricoes.length === 0) {

            const mensagemVazia = campeonatoSelecionado
                ? "Nenhuma equipe inscrita neste campeonato."
                : "Nenhuma inscrição cadastrada.";

            lista.innerHTML = `
                <tr>
                    <td colspan="5">
                        ${mensagemVazia}
                    </td>
                </tr>
            `;

            return;
        }

        inscricoes.forEach(inscricao => {

            const linha = document.createElement("tr");

            const dados = [
                inscricao.id,
                inscricao.campeonato?.nome ?? "",
                inscricao.equipe?.nome ?? "",
                inscricao.grupo?.nome ?? "Sem grupo"
            ];

            dados.forEach(valor => {

                const coluna = document.createElement("td");
                coluna.textContent = valor;
                linha.appendChild(coluna);

            });

            const colunaAcoes = document.createElement("td");

            // Botão para alterar o grupo da equipe
            const botaoAlterarGrupo = document.createElement("button");

            botaoAlterarGrupo.type = "button";
            botaoAlterarGrupo.textContent = "Alterar grupo";
            botaoAlterarGrupo.className = "btn-editar";

            // A funcionalidade será implementada no próximo passo
            botaoAlterarGrupo.addEventListener("click", async () => {

                try {

                    // Busca os grupos do campeonato da equipe
                    const respostaGrupos = await fetch(
                        `${API_URL}/grupos/campeonato/${inscricao.campeonato.id}`
                    );

                    if (!respostaGrupos.ok) {
                        throw new Error("Não foi possível carregar os grupos.");
                    }

                    const grupos = await respostaGrupos.json();

                    const opcoes = [
                        { id: "", nome: "Sem grupo" },
                        ...grupos
                    ];

                    // Apresenta os grupos numerados
                    const listaOpcoes = opcoes.map((grupo, indice) =>
                        `${indice + 1} - ${grupo.nome}`
                    ).join("\n");

                    const grupoAtual = inscricao.grupo?.nome ?? "Sem grupo";

                    const escolha = prompt(
                        `Equipe: ${inscricao.equipe.nome}\n` +
                        `Grupo atual: ${grupoAtual}\n\n` +
                        `Escolha o novo grupo:\n${listaOpcoes}\n\n` +
                        `Digite o número da opção desejada:`
                    );

                    // Cancelou a operação
                    if (escolha === null) {
                        return;
                    }

                    const numeroEscolhido = Number(escolha.trim());

                    if (
                        !Number.isInteger(numeroEscolhido) ||
                        numeroEscolhido < 1 ||
                        numeroEscolhido > opcoes.length
                    ) {
                        alert("Opção inválida.");
                        return;
                    }

                    const grupoId = opcoes[numeroEscolhido - 1].id;


                    const parametros = new URLSearchParams();

                    if (grupoId) {
                        parametros.append("grupoId", grupoId);
                    }

                    botaoAlterarGrupo.disabled = true;

                    const resposta = await fetch(
                        `${API_URL}/campeonato-equipes/${inscricao.id}/grupo?${parametros}`,
                        {
                            method: "PUT"
                        }
                    );

                    if (!resposta.ok) {
                        throw new Error("Não foi possível alterar o grupo.");
                    }
                    
                    alert("Grupo atualizado com sucesso!");

                    await carregarInscricoes();
                    await carregarDistribuicaoGrupos();

                } catch (erro) {

                    console.error("Erro ao alterar grupo:", erro);
                    alert(erro.message);

                } finally {

                    botaoAlterarGrupo.disabled = false;

                }

            });

            colunaAcoes.appendChild(botaoAlterarGrupo);

            // Botão para excluir a inscrição
            const botaoExcluirInscricao = document.createElement("button");

            botaoExcluirInscricao.type = "button";
            botaoExcluirInscricao.textContent = "Excluir inscrição";
            botaoExcluirInscricao.className = "btn-excluir";
   
        botaoExcluirInscricao.addEventListener("click", async () => {

            const confirmar = confirm(
                `Deseja realmente excluir a inscrição da equipe "${inscricao.equipe.nome}" ` +
                `no campeonato "${inscricao.campeonato.nome}"?`
            );

            if (!confirmar) {
                return;
            }

            botaoExcluirInscricao.disabled = true;

            try {

                const resposta = await fetch(
                    `${API_URL}/campeonato-equipes/${inscricao.id}`,
                    {
                        method: "DELETE"
                    }
                );

                if (resposta.status === 409) {
                    alert(
                        "Não é possível excluir esta inscrição, pois a equipe possui partidas cadastradas neste campeonato."
                    );
                    return;
                }

                if (!resposta.ok) {
                    throw new Error(
                        `Erro ao excluir inscrição: ${resposta.status}`
                    );
                }
                                
                alert("Inscrição excluída com sucesso!");

                await carregarInscricoes();
                await carregarDistribuicaoGrupos();
                await carregarEquipes();

            } catch (erro) {

                console.error("Erro ao excluir inscrição:", erro);

                alert(
                    "Não foi possível excluir a inscrição. Verifique a conexão com a API."
                );

            } finally {

                botaoExcluirInscricao.disabled = false;

            }

        });


            colunaAcoes.appendChild(botaoExcluirInscricao);

            linha.appendChild(colunaAcoes);



            lista.appendChild(linha);

        });

    } catch (erro) {

        console.error("Erro ao carregar inscrições:", erro);

        lista.innerHTML = `
            <tr>
                <td colspan="5">
                    Não foi possível carregar as inscrições.
                </td>
            </tr>
        `;

    }

}

// EXIBIR DISTRIBUIÇÃO DAS EQUIPES POR GRUPOS
async function carregarDistribuicaoGrupos() {

    const campeonatoId = document.getElementById(
        "campeonato-inscricao"
    ).value;

    const area = document.getElementById(
        "distribuicao-grupos"
    );

    area.innerHTML = "";

    if (!campeonatoId) {
        area.textContent =
            "Selecione um campeonato para visualizar a distribuição das equipes.";
        return;
    }

    try {

        const [respostaGrupos, respostaInscricoes] = await Promise.all([
            fetch(`${API_URL}/grupos/campeonato/${campeonatoId}`),
            fetch(`${API_URL}/campeonato-equipes`)
        ]);

        if (!respostaGrupos.ok || !respostaInscricoes.ok) {
            throw new Error("Erro ao carregar distribuição.");
        }

        const grupos = await respostaGrupos.json();
        const todasInscricoes = await respostaInscricoes.json();

        // Inscrições somente do campeonato selecionado
        const inscricoes = todasInscricoes.filter(inscricao =>
            String(inscricao.campeonato?.id) === campeonatoId
        );

        // Evita exibir dados de outro campeonato
        if (document.getElementById(
            "campeonato-inscricao"
        ).value !== campeonatoId) {
            return;
        }

        if (grupos.length === 0) {
            area.textContent =
                "Este campeonato ainda não possui grupos cadastrados.";
            return;
        }

        grupos.forEach(grupo => {

            const bloco = document.createElement("div");
            bloco.className = "grupo-distribuicao";

            const equipesDoGrupo = inscricoes.filter(inscricao =>
                String(inscricao.grupo?.id) === String(grupo.id)
            );

            const titulo = document.createElement("h4");

            const quantidade = equipesDoGrupo.length;

            titulo.textContent =
                `${grupo.nome} — ${quantidade} ${quantidade === 1 ? "equipe" : "equipes"}`;

            bloco.appendChild(titulo);

            if (equipesDoGrupo.length === 0) {

                const mensagem = document.createElement("p");
                mensagem.textContent = "Nenhuma equipe neste grupo.";
                bloco.appendChild(mensagem);

            } else {

                const lista = document.createElement("ul");

                equipesDoGrupo.forEach(inscricao => {

                    const item = document.createElement("li");
                    item.textContent = inscricao.equipe?.nome ?? "Equipe sem nome";
                    lista.appendChild(item);

                });

                bloco.appendChild(lista);
            }

            area.appendChild(bloco);

        });

    } catch (erro) {

        console.error("Erro ao carregar distribuição:", erro);

        area.textContent =
            "Não foi possível carregar a distribuição das equipes.";
    }
}



