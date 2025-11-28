const linkMiddleware = require('../../utility/botUtil/linkMiddleware');

module.exports = async (context) => {
    await linkMiddleware(context, async () => {
        const { client, m } = context;

        try {
            const response = await client.groupInviteCode(m.chat);

            await client.sendText(
                m.chat,
`◈━━━━━━━━━━━━━━━━◈
│❒ *LINK DO GRUPO* ❒
◈━━━━━━━━━━━━━━━━◈

https://chat.whatsapp.com/${response}

│❒ 📌 Compartilhe este link para convidar novos membros.
│❒ 🔗 Link gerado com sucesso.
◈━━━━━━━━━━━━━━━━◈`,
                m,
                { detectLink: true }
            );

        } catch (error) {
            console.error('Erro ao gerar o link do grupo:', error);

            await client.sendText(
                m.chat,
`◈━━━━━━━━━━━━━━━━◈
│❒ *ERRO AO GERAR LINK* ❒
◈━━━━━━━━━━━━━━━━◈

│❒ ❌ Não foi possível gerar o link do grupo neste momento.
│❒ Tente novamente em alguns instantes.
◈━━━━━━━━━━━━━━━━◈`,
                m
            );
        }
    });
};
