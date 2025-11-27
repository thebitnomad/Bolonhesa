module.exports = async (context) => {
    const { client, m, text } = context;

    const ai = require('unlimited-ai');

    const formatStylishReply = (msg) => {
        return `◈━━━━━━━━━━━━━━━━◈\n│❒ ${msg}\n◈━━━━━━━━━━━━━━━━◈`;
    };

    if (!text) {
        return m.reply(
            formatStylishReply("Por favor, envie um texto para a IA responder.")
        );
    }

    (async () => { 
        const model = 'gpt-4';

        const messages = [
            { role: 'user', content: text },
            { 
                role: 'system', 
                content: 'Você é um assistente no WhatsApp. Seu nome é Dreaded. Você responde aos comandos dos usuários.' 
            }
        ];

        try {
            const response = await ai.generate(model, messages);

            await m.reply(
`◈━━━━━━━━━━━━━━━━◈
│❒ Resposta da IA:
◈━━━━━━━━━━━━━━━━◈

${response}

◈━━━━━━━━━━━━━━━━◈`
            );

        } catch (error) {
            await m.reply(
                formatStylishReply(`Ocorreu um erro ao gerar a resposta.\nDetalhes: ${error.message || error}`)
            );
        }
    })();
};
