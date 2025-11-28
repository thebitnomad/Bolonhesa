const canvacord = require('canvacord');

module.exports = async (context) => {
    const { client, m, Tag, botname } = context;

    const formatStylishReply = (message) => {
        return `◈━━━━━━━━━━━━━━━━◈
│❒ ${message}
◈━━━━━━━━━━━━━━━━◈`;
    };

    const caption = formatStylishReply(`Procurado gerado por ${botname}.`);

    try {
        let img;
        let ppuser;
        let result;

        if (m.quoted) {
            try {
                img = await client.profilePictureUrl(m.quoted.sender, 'image');
            } catch {
                img = 'https://telegra.ph/file/9521e9ee2fdbd0d6f4f1c.jpg';
            }
            result = await canvacord.Canvacord.wanted(img);
        } else if (Tag && Tag.length > 0) {
            try {
                ppuser = await client.profilePictureUrl(Tag[0] || m.sender, 'image');
            } catch {
                ppuser = 'https://telegra.ph/file/9521e9ee2fdbd0d6f4f1c.jpg';
            }
            result = await canvacord.Canvacord.wanted(ppuser);
        } else {
            return m.reply(
                formatStylishReply(
                    'Responda a uma mensagem ou marque alguém para gerar o cartaz de “procurado(a)”.'
                )
            );
        }

        await client.sendMessage(
            m.chat,
            { image: result, caption },
            { quoted: m }
        );
    } catch (e) {
        console.error(
            formatStylishReply(
                `Erro ao gerar a imagem de “procurado(a)”: ${e.message}`
            )
        );

        await m.reply(
            formatStylishReply(
                'Algo deu errado ao gerar o cartaz de “procurado(a)”. 😞\nTente novamente em instantes.'
            )
        );
    }
};
