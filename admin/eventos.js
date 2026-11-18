
const API_EVENTOS = "http://localhost:8080/api";

// =========================================
// INICIALIZAÇÃO DA PÁGINA
// =========================================

document.addEventListener("DOMContentLoaded", () => {

    carregarPartidas();

    const selectPartida = document.getElementById("partida-evento");
    const formularioEvento = document.getElementById("form-evento");

    // Atualiza eventos e atletas ao selecionar uma partida
    selectPartida.addEventListener("change", function () {

        carregarEventos(this.value);
        carregarAtletasDaPartida(this.value);

    });

    // Registra um novo evento
    formularioEvento.addEventListener("submit", registrarEvento);

});

// =========================================
// CARREGAR PARTIDAS DA API
// =========================================

async function carregarPartidas() {

    const selectPartida = document.getElementById("partida-evento");

    selectPartida.innerHTML =
        '<option value="">Carregando partidas...</option>';

    try {

        const resposta = await fetch(
            `${API_EVENTOS}/partidas`
        );

        if (!resposta.ok) {
            throw new Error("Erro HTTP: " + resposta.status);
        }

        const partidas = await resposta.json();

        selectPartida.innerHTML =
            '<option value="">Selecione uma partida</option>';

        partidas.forEach(partida => {

            const option = document.createElement("option");

            option.value = partida.id;

            const mandante = partida.mandante?.nome ?? "Mandante";
            const visitante = partida.visitante?.nome ?? "Visitante";

            option.textContent =
                `${mandante} x ${visitante} - ` +
                `${partida.data ?? "Sem data"} ` +
                `(ID ${partida.id})`;

            selectPartida.appendChild(option);

        });

    } catch (erro) {

        console.error("Erro ao carregar partidas:", erro);

        selectPartida.innerHTML =
            '<option value="">Erro ao carregar partidas</option>';

    }
}

// =========================================
// CARREGAR EVENTOS DA PARTIDA
// =========================================

async function carregarEventos(partidaId) {

    const lista = document.getElementById("lista-eventos");

    lista.innerHTML = "";

    if (!partidaId) {

        lista.innerHTML = `
            <tr>
                <td colspan="6">
                    Selecione uma partida para visualizar os eventos.
                </td>
            </tr>
        `;

        return;
    }

    lista.innerHTML = `
        <tr>
            <td colspan="6">
                Carregando eventos...
            </td>
        </tr>
    `;

    try {

        const resposta = await fetch(
            `${API_EVENTOS}/eventos-partida/partida/${partidaId}`
        );

        if (!resposta.ok) {
            throw new Error("Erro HTTP: " + resposta.status);
        }

        const eventos = await resposta.json();

        // Evita mostrar dados de outra partida
        if (
            document.getElementById("partida-evento").value !==
            String(partidaId)
        ) {
            return;
        }

        lista.innerHTML = "";

        if (eventos.length === 0) {

            lista.innerHTML = `
                <tr>
                    <td colspan="6">
                        Nenhum evento registrado nesta partida.
                    </td>
                </tr>
            `;

            return;
        }

        eventos.forEach(evento => {

            const linha = document.createElement("tr");

            const dados = [
                evento.id,
                evento.tipo,
                evento.atleta?.nome ?? "-",
                evento.atleta?.equipe?.nome ?? "-",
                evento.minuto
            ];

            dados.forEach(dado => {

                const coluna = document.createElement("td");

                coluna.textContent = dado ?? "-";

                linha.appendChild(coluna);

            });

            // Coluna de ações
            const colunaAcoes = document.createElement("td");

            // Botão Editar
            const botaoEditar = document.createElement("button");

            botaoEditar.type = "button";
            botaoEditar.textContent = "Editar";
            botaoEditar.classList.add("btn-editar");
            botaoEditar.addEventListener("click", () => {

                document.getElementById("tipo-evento").value = evento.tipo;

                document.getElementById("atleta-evento").value =
                    evento.atleta?.id ?? "";

                document.getElementById("minuto-evento").value = evento.minuto;

                // Guarda o ID do evento que será editado
                document.getElementById("form-evento").dataset.edicaoId = evento.id;

                // Altera o texto do botão principal
                document.querySelector(
                    "#form-evento button[type='submit']"
                ).textContent = "Salvar alterações";

                // Leva o usuário até o formulário
                document.getElementById("form-evento").scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });

            });

            // Botão Excluir
            const botaoExcluir = document.createElement("button");

            botaoExcluir.type = "button";
            botaoExcluir.textContent = "Excluir";
            botaoExcluir.classList.add("btn-excluir");
            botaoExcluir.addEventListener("click", () => {
                excluirEvento(evento.id);
            });

            // Adiciona os botões à coluna
            colunaAcoes.appendChild(botaoEditar);
            colunaAcoes.appendChild(botaoExcluir);

            // Adiciona a coluna à linha
            linha.appendChild(colunaAcoes);
            lista.appendChild(linha);

        });

    } catch (erro) {

        console.error("Erro ao carregar eventos:", erro);

        if (
            document.getElementById("partida-evento").value !==
            String(partidaId)
        ) {
            return;
        }

        lista.innerHTML = `
            <tr>
                <td colspan="6">
                    Não foi possível carregar os eventos.
                </td>
            </tr>
        `;

    }
}

// =========================================
// CARREGAR ATLETAS DA PARTIDA
// =========================================

async function carregarAtletasDaPartida(partidaId) {

    const selectAtleta = document.getElementById("atleta-evento");

    selectAtleta.innerHTML =
        '<option value="">Selecione um atleta</option>';

    if (!partidaId) {
        return;
    }

    selectAtleta.innerHTML =
        '<option value="">Carregando atletas...</option>';

    try {

        const respostaPartida = await fetch(
            `${API_EVENTOS}/partidas/${partidaId}`
        );

        if (!respostaPartida.ok) {
            throw new Error("Erro ao consultar a partida");
        }

        const partida = await respostaPartida.json();

        const respostaAtletas = await fetch(
            `${API_EVENTOS}/atletas`
        );

        if (!respostaAtletas.ok) {
            throw new Error("Erro ao consultar os atletas");
        }

        const atletas = await respostaAtletas.json();

        if (
            document.getElementById("partida-evento").value !==
            String(partidaId)
        ) {
            return;
        }

        const mandanteId = partida.mandante?.id;
        const visitanteId = partida.visitante?.id;

        const atletasDaPartida = atletas.filter(atleta => {

            const equipeId = atleta.equipe?.id;

            return equipeId === mandanteId ||
                   equipeId === visitanteId;

        });

        atletasDaPartida.sort((a, b) => {

            const equipeA = a.equipe?.nome ?? "";
            const equipeB = b.equipe?.nome ?? "";

            return equipeA.localeCompare(equipeB) ||
                   a.nome.localeCompare(b.nome);

        });

        selectAtleta.innerHTML =
            '<option value="">Selecione um atleta</option>';

        atletasDaPartida.forEach(atleta => {

            const option = document.createElement("option");

            option.value = atleta.id;

            option.textContent =
                `${atleta.nome} - ${atleta.equipe.nome}`;

            selectAtleta.appendChild(option);

        });

        if (atletasDaPartida.length === 0) {

            selectAtleta.innerHTML =
                '<option value="">Nenhum atleta encontrado</option>';

        }

    } catch (erro) {

        console.error("Erro ao carregar atletas:", erro);

        if (
            document.getElementById("partida-evento").value !==
            String(partidaId)
        ) {
            return;
        }

        selectAtleta.innerHTML =
            '<option value="">Erro ao carregar atletas</option>';

    }
}

// =========================================
// REGISTRAR NOVO EVENTO
// =========================================

async function registrarEvento(evento) {

    // Impede o recarregamento da página
    evento.preventDefault();

    const partidaId = document.getElementById(
        "partida-evento"
    ).value;

    const tipo = document.getElementById(
        "tipo-evento"
    ).value;

    const atletaId = document.getElementById(
        "atleta-evento"
    ).value;

    const minuto = document.getElementById(
        "minuto-evento"
    ).value;

    // Validação dos campos
    if (!partidaId) {

        alert("Selecione uma partida antes de registrar o evento.");
        return;

    }

    if (!tipo || !atletaId || minuto === "") {

        alert("Preencha todos os campos do evento.");
        return;

    }

    if (!Number.isInteger(Number(minuto)) || Number(minuto) < 0) {

        alert("Informe um minuto válido, maior ou igual a zero.");
        return;

    }

    // Monta os dados exigidos pelo EventoPartidaDTO
    const dadosEvento = {

        tipo: tipo,
        minuto: Number(minuto),
        partidaId: Number(partidaId),
        atletaId: Number(atletaId)

    };

    // Verifica se estamos editando um evento existente
    const edicaoId = document.getElementById(
        "form-evento"
    ).dataset.edicaoId;

    const estaEditando = Boolean(edicaoId);

    // Define a URL e o método HTTP
    const url = estaEditando
        ? `${API_EVENTOS}/eventos-partida/${edicaoId}`
        : `${API_EVENTOS}/eventos-partida`;

    const metodo = estaEditando ? "PUT" : "POST";

    const botaoSalvar = document.querySelector(
        "#form-evento button[type='submit']"
    );

    botaoSalvar.disabled = true;
    botaoSalvar.textContent = "Registrando...";

    try {

        const resposta = await fetch(
            url,
            {
                method: metodo,

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify(dadosEvento)
            }
        );

        alert(
            estaEditando
                ? "Evento atualizado com sucesso!"
                : "Evento registrado com sucesso!"
        );

        // Limpa somente os campos do evento
        document.getElementById("form-evento").reset();

        // Encerra o modo de edição
        delete document.getElementById(
            "form-evento"
        ).dataset.edicaoId;

        // Atualiza os eventos da partida
        const partidaAtual = document.getElementById(
            "partida-evento"
        ).value;

        await carregarEventos(partidaAtual);

    } catch (erro) {

        console.error("Erro ao registrar evento:", erro);

        alert(
            "Não foi possível registrar o evento. " +
            "Verifique os dados e a conexão com a API."
        );

    } finally {

        botaoSalvar.disabled = false;
        botaoSalvar.textContent =
            document.getElementById("form-evento").dataset.edicaoId
                ? "Salvar alterações"
                : "Registrar evento";

    }
}

 // =========================================
 // EXCLUIR EVENTO
 // =========================================

async function excluirEvento(eventoId) {

    const confirmacao = confirm(
        "Tem certeza que deseja excluir este evento? " +
        "Esta ação não poderá ser desfeita."
    );

    if (!confirmacao) {
        return;
    }

    try {

        const resposta = await fetch(
            `${API_EVENTOS}/eventos-partida/${eventoId}`,
            {
                method: "DELETE"
            }
        );

        if (!resposta.ok) {
            throw new Error("Erro HTTP: " + resposta.status);
        }

        alert("Evento excluído com sucesso!");

        // Se o evento excluído estava em edição,
        // limpa o formulário
        const formulario = document.getElementById("form-evento");

        if (formulario.dataset.edicaoId === String(eventoId)) {

            formulario.reset();
            delete formulario.dataset.edicaoId;

            document.querySelector(
                "#form-evento button[type='submit']"
            ).textContent = "Registrar evento";
        }

        // Atualiza a tabela da partida selecionada
        const partidaId = document.getElementById(
            "partida-evento"
        ).value;

        await carregarEventos(partidaId);

    } catch (erro) {

        console.error("Erro ao excluir evento:", erro);

        alert(
            "Não foi possível excluir o evento. " +
            "Verifique a conexão com a API."
        );

    }
}

