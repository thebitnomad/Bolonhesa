const middleware = require('../../utility/botUtil/middleware');

module.exports = async (context) => {
    await middleware(context, async () => {
        const { client, m } = context;

        // Verificação básica
        if (!m.quoted && (!m.mentionedJid || m.mentionedJid.length === 0)) {
            return m.reply(
                `◈━━━━━━━━━━━━━━━━◈
│❒ Você não marcou ninguém!
│❒ Marque ou responda alguém para promover.
◈━━━━━━━━━━━━━━━━◈`
            );
        }

        // Determina o alvo (marcado ou citado)
        const user = m.mentionedJid[0]
            ? m.mentionedJid[0]
            : m.quoted
            ? m.quoted.sender
            : null;

        if (!user) {
            return m.reply(
                `◈━━━━━━━━━━━━━━━━◈
│❒ Não consegui identificar o usuário.
│❒ Tente novamente marcando alguém corretamente.
◈━━━━━━━━━━━━━━━━◈`
            );
        }

        const number = user.split('@')[0];

        try {
            await client.groupParticipantsUpdate(m.chat, [user], 'promote');

            m.reply(
                `◈━━━━━━━━━━━━━━━━◈
│❒ @${number} agora é administrador(a)! 🥇
│❒ Use esse poder com sabedoria. 😄
◈━━━━━━━━━━━━━━━━◈`,
                { mentions: [user] }
            );
        } catch (error) {
            console.error('Erro ao promover usuário:', error);

            m.reply(
                `◈━━━━━━━━━━━━━━━━◈
│❒ Não consegui promover @${number}.
│❒ O WhatsApp pode estar instável. Tente mais tarde.
◈━━━━━━━━━━━━━━━━◈`,
                { mentions: [user] }
            );
        }
    });
};
