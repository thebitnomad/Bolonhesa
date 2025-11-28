module.exports = async (context) => {
    const { client, m, participants, text } = context;

    if (!m.isGroup) {
        return client.sendMessage(
            m.chat,
            {
                text:
                    `◈━━━━━━━━━━━━━━━━◈\n` +
                    `│❒ Este comando só pode ser usado em grupos.\n` +
                    `◈━━━━━━━━━━━━━━━━◈`
            },
            { quoted: m }
        );
    }

    try {
        const mentions = participants.map((a) => a.id);

        const header = [
            `◈━━━━━━━━━━━━━━━━◈`,
            `│❒ Todos os membros foram marcados neste grupo.`,
            `│❒ Mensagem: ${text && text.trim().length ? text : 'Nenhuma mensagem foi enviada.'}`,
            `│❒ Use com responsabilidade para não atrapalhar a galera. 😉`,
            `│❒ Membros mencionados:`,
        ];

        const body = mentions.map(
            (id) => `│❒ 📧 @${id.split('@')[0]}`
        );

        const footer = [`◈━━━━━━━━━━━━━━━━◈`];

        const txt = [...header, ...body, ...footer].join('\n');

        await client.sendMessage(
            m.chat,
            { text: txt, mentions },
            { quoted: m }
        );
    } catch (error) {
        console.error(`Tagall error: ${error.message}`);

        await client.sendMessage(
            m.chat,
            {
                text:
                    `◈━━━━━━━━━━━━━━━━◈\n` +
                    `│❒ Não foi possível mencionar todos os participantes agora.\n` +
                    `│❒ Tente novamente em alguns instantes.\n` +
                    `◈━━━━━━━━━━━━━━━━◈`
            },
            { quoted: m }
        );
    }
};
