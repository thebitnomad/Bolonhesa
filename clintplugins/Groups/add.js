const middleware = require('../../utility/botUtil/middleware');
const { getBinaryNodeChild, getBinaryNodeChildren } = require('baileys-elite');

module.exports = async (context) => {
    await middleware(context, async () => {
        const { client, m, participants, botname, groupMetadata, text, pushname } = context;

        const formatStylishReply = (message) => {
            return `◈━━━━━━━━━━━━━━━━◈\n│❒ ${message}\n◈━━━━━━━━━━━━━━━━◈`;
        };

        try {
            if (!text) {
                return m.reply(
                    formatStylishReply(
                        `Por favor, informe o número a ser adicionado neste formato:\n\n` +
                        `add 5511999999999`
                    )
                );
            }

            const currentParticipants = participants.map((user) => user.id);

            const users = (
                await Promise.all(
                    text
                        .split(',')
                        .map((v) => v.replace(/[^0-9]/g, ''))
                        .filter(
                            (v) =>
                                v.length > 4 &&
                                v.length < 20 &&
                                !currentParticipants.includes(v + '@s.whatsapp.net')
                        )
                        .map(async (v) => [
                            v,
                            await client.onWhatsApp(v + '@s.whatsapp.net'),
                        ])
                )
            )
                .filter((v) => v[1][0]?.exists)
                .map((v) => v[0] + '@c.us');

            if (!users.length) {
                return m.reply(
                    formatStylishReply(
                        `Nenhum número válido foi encontrado ou todos já estão neste grupo.\n` +
                        `Verifique os números informados e tente novamente.`
                    )
                );
            }

            const response = await client.query({
                tag: 'iq',
                attrs: {
                    type: 'set',
                    xmlns: 'w:g2',
                    to: m.chat,
                },
                content: users.map((jid) => ({
                    tag: 'add',
                    attrs: {},
                    content: [{ tag: 'participant', attrs: { jid } }],
                })),
            });

            const addNode = getBinaryNodeChild(response, 'add');
            const participantNodes = getBinaryNodeChildren(addNode, 'participant');

            const inviteCode = await client.groupInviteCode(m.chat);

            for (const user of participantNodes.filter(
                (item) =>
                    item.attrs.error === 401 ||
                    item.attrs.error === 403 ||
                    item.attrs.error === 408
            )) {
                const jid = user.attrs.jid;
                const content = getBinaryNodeChild(user, 'add_request');
                const invite_code = content?.attrs?.code || inviteCode;
                const invite_code_exp = content?.attrs?.expiration || '';

                let messageText;

                if (user.attrs.error === 401) {
                    messageText = formatStylishReply(
                        `@${jid.split('@')[0]} bloqueou o bot, por isso não pôde ser adicionado diretamente ao grupo.`
                    );
                } else if (user.attrs.error === 403) {
                    messageText = formatStylishReply(
                        `@${jid.split('@')[0]} configurou a privacidade para não ser adicionado diretamente em grupos.`
                    );
                } else if (user.attrs.error === 408) {
                    messageText = formatStylishReply(
                        `@${jid.split('@')[0]} saiu do grupo recentemente e não pôde ser adicionado automaticamente.`
                    );
                }

                if (messageText) {
                    await m.reply(messageText);
                }

                const inviteMessage = formatStylishReply(
                    `${pushname} está tentando adicionar ou convidar você para o grupo *${groupMetadata.subject}*.\n\n` +
                    `Link de entrada:\nhttps://chat.whatsapp.com/${invite_code}\n\n` +
                    `Powered by *${botname}* 🤖`
                );

                await client.sendMessage(
                    jid,
                    { text: inviteMessage },
                    { quoted: m }
                );
            }
        } catch (error) {
            console.error(
                formatStylishReply(
                    `Ocorreu um erro ao tentar adicionar participantes ao grupo.`
                ),
                error
            );

            await m.reply(
                formatStylishReply(
                    `Não foi possível concluir a adição dos números informados.\n` +
                    `Tente novamente em alguns instantes.`
                )
            );
        }
    });
};
