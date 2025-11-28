const canvacord = require("canvacord");

module.exports = async (context) => {
    const { client, m, Tag, botname } = context;

    const formatStylishReply = (msg) => {
        return `◈━━━━━━━━━━━━━━━━◈\n│❒ ${msg}\n◈━━━━━━━━━━━━━━━━◈`;
    };

    let cap =
`◈━━━━━━━━━━━━━━━━◈
│❒ Efeito aplicado por *${botname || '9bot'}*
◈━━━━━━━━━━━━━━━━◈`;

    try {
        let img;
        let result;

        if (m.quoted) {
            // Foto de quem foi respondido
            try {
                img = await client.profilePictureUrl(m.quoted.sender, 'image');
            } catch {
                img = 'https://telegra.ph/file/9521e9ee2fdbd0d6f4f1c.jpg';
            }
            result = await canvacord.Canvacord.rip(img);

        } else if (Tag) {
            // Foto de quem foi marcado ou, se não, de quem enviou
            let ppuser;
            try {
                ppuser = await client.profilePictureUrl(Tag[0] || m.sender, 'image');
            } catch {
                ppuser = 'https://telegra.ph/file/9521e9ee2fdbd0d6f4f1c.jpg';
            }
            result = await canvacord.Canvacord.rip(ppuser);

        } else {
            // Nenhum reply ou tag
            return m.reply(
                formatStylishReply(
                    'Marque alguém ou responda a uma mensagem para aplicar o efeito RIP na foto de perfil.'
                )
            );
        }

        await client.sendMessage(
            m.chat,
            { image: result, caption: cap },
            { quoted: m }
        );

    } catch (e) {
        console.error('RIP effect error:', e);
        m.reply(
            formatStylishReply(
                'Algo deu errado ao aplicar o efeito. 😞\nTente novamente em alguns instantes.'
            )
        );
    }
};
