module.exports = async (context) => {
    const { client, m, text, fetchJson } = context;

    const formatStylishReply = (msg) => {
        return `◈━━━━━━━━━━━━━━━━◈\n│❒ ${msg}\n◈━━━━━━━━━━━━━━━━◈`;
    };

    if (!text) {
        return m.reply(
            formatStylishReply("Qual é a sua pergunta?")
        );
    }

    try {
        const data = await fetchJson(
            `https://apis.davidcyriltech.my.id/ai/gpt3?text=${encodeURIComponent(text)}`
        );

        if (data.success) {
            const res = data.result;

            await m.reply(
`◈━━━━━━━━━━━━━━━━◈
│❒ Resposta da IA:
◈━━━━━━━━━━━━━━━━◈

${res}

◈━━━━━━━━━━━━━━━━◈`
            );

        } else {
            await m.reply(
                formatStylishReply("Não foi possível obter uma resposta da API.")
            );
        }

    } catch (e) {
        console.log(e);
        m.reply(
            formatStylishReply("Ocorreu um erro ao processar sua solicitação.")
        );
    }
};
