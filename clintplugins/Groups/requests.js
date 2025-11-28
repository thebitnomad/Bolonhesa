const middleware = require('../../utility/botUtil/middleware');

module.exports = async (context) => {
    await middleware(context, async () => {
        const { client, m } = context;

        const formatStylishReply = (message) => {
            const lines = String(message || '')
                .split('\n')
                .map((l) => l.trim())
                .filter((l) => l.length > 0);
            const body = lines.map((l) => `│❒ ${l}`).join('\n');
            return `◈━━━━━━━━━━━━━━━━◈\n${body}\n◈━━━━━━━━━━━━━━━━◈`;
        };

        try {
            const response = await client.groupRequestParticipantsList(m.chat);

            if (!response || response.length === 0) {
                return m.reply(
                    formatStylishReply(
                        `Não há nenhuma solicitação de entrada pendente neste grupo no momento.`
                    )
                );
            }

            let jids = '';

            response.forEach((participant, index) => {
                jids += '+' + participant.jid.split('@')[0];
                if (index < response.length - 1) {
                    jids += '\n';
                }
            });

            const msg =
                `Participantes com solicitação pendente 🕓\n` +
                `${jids}\n\n` +
                `Use os comandos *.approve-all* ou *.reject-all* para aprovar ou rejeitar essas solicitações de entrada.`;

            await client.sendMessage(
                m.chat,
                { text: formatStylishReply(msg) },
                { quoted: m }
            );
        } catch (error) {
            console.error(
                formatStylishReply(
                    `Erro ao listar as solicitações pendentes de entrada: ${error.message}`
                ),
                error
            );

            await m.reply(
                formatStylishReply(
                    `Não foi possível listar as solicitações de entrada agora.\n` +
                    `Tente novamente em alguns instantes.`
                )
            );
        }
    });
};
