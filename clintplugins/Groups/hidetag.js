const middleware = require('../../utility/botUtil/middleware');

module.exports = async (context) => {
    await middleware(context, async () => {
        const { client, m, args, participants, text } = context;

        const formatStylishReply = (msg) => {
            return `◈━━━━━━━━━━━━━━━━◈\n│❒ ${msg}\n◈━━━━━━━━━━━━━━━━◈`;
        };

        // Caso não tenha texto, envia mensagem vazia estilizada
        const finalText = text && text.trim().length > 0
            ? text
            : 'ᅠᅠᅠᅠ';

        try {
            await client.sendMessage(
                m.chat,
                {
                    text: finalText,
                    mentions: participants.map(p => p.id)
                },
                { quoted: m }
            );
        } catch (error) {
            console.error(
                formatStylishReply(
                    `Erro ao enviar mensagem mencionando todos os membros.`
                ),
                error
            );

            await m.reply(
                formatStylishReply(
                    `Não consegui mencionar os membros agora.\n` +
                    `Tente novamente em alguns instantes.`
                )
            );
        }
    });
};
