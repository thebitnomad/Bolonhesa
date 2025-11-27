const { saveConversation, getRecentMessages } = require('../../Database/config');
const { deleteUserHistory } = require('../../Database/config');

module.exports = async (context) => {
    const { client, m, text, botname, fetchJson, prefix } = context;
    const num = m.sender;

    if (!text) {
        return m.reply(
`◈━━━━━━━━━━━━━━━━◈
│❒ Envie um texto ou pergunta para conversar com a IA.
│❒ Suas conversas são salvas para manter o contexto.
│❒ Para apagar seu histórico envie: *${prefix}chat --reset*
◈━━━━━━━━━━━━━━━━◈`
        );
    }

    // Resetar histórico
    if (text.toLowerCase().includes('--reset')) {
        await deleteUserHistory(num);
        return m.reply(
`◈━━━━━━━━━━━━━━━━◈
│❒ Seu histórico de conversa foi apagado com sucesso.
◈━━━━━━━━━━━━━━━━◈`
        );
    }

    try {
        // Salva mensagem do usuário
        await saveConversation(num, 'user', text);

        const recentHistory = await getRecentMessages(num);
        const contextString = recentHistory
            .map(entry => `${entry.role}: ${entry.message}`)
            .join('\n');

        const queryWithContext = encodeURIComponent(
            `${contextString}\nuser: ${text.replace('--reset', '').trim()}`
        );

        const data = await fetchJson(
            `https://api.dreaded.site/api/aichat?query=${queryWithContext}`
        );

        const response = data?.result || 
`◈━━━━━━━━━━━━━━━━◈
│❒ Não tenho certeza de como responder isso.
◈━━━━━━━━━━━━━━━━◈`;

        // Salva resposta da IA
        await saveConversation(num, 'bot', response);

        // Resposta estilizada
        await m.reply(
`◈━━━━━━━━━━━━━━━━◈
│❒ Resposta da IA:
◈━━━━━━━━━━━━━━━━◈

${response}

◈━━━━━━━━━━━━━━━━◈
Powered by *${botname}*`
        );

    } catch (error) {
        console.error(error);
        m.reply(
`◈━━━━━━━━━━━━━━━━◈
│❒ Algo deu errado ao processar sua solicitação.
│❒ Detalhes: ${error.message}
◈━━━━━━━━━━━━━━━━◈`
        );
    }
};
