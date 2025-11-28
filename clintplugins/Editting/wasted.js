const { Sticker } = require('wa-sticker-formatter');
const canvacord = require('canvacord');

module.exports = async (context) => {
    const { client, m, Tag, botname } = context;

    const formatStylishReply = (message) => {
        return `◈━━━━━━━━━━━━━━━━◈
│❒ ${message}
◈━━━━━━━━━━━━━━━━◈`;
    };

    try {
        let img;
        let ppuser;
        let result;

        // Obter imagem do perfil via mensagem respondida
        if (m.quoted) {
            try {
                img = await client.profilePictureUrl(m.quoted.sender, 'image');
            } catch {
                img = 'https://telegra.ph/file/9521e9ee2fdbd0d6f4f1c.jpg';
            }
            result = await canvacord.Canvacord.wasted(img);

        // Obter imagem do perfil via @tag
        } else if (Tag && Tag.length > 0) {
            try {
                ppuser = await client.profilePictureUrl(Tag[0] || m.sender, 'image');
            } catch {
                ppuser = 'https://telegra.ph/file/9521e9ee2fdbd0d6f4f1c.jpg';
            }
            result = await canvacord.Canvacord.wasted(ppuser);

        } else {
            return m.reply(
                formatStylishReply(
                    'Responda a uma mensagem ou marque alguém para aplicar o efeito “wasted”.'
                )
            );
        }

        // Criar figurinha
        const sticker = new Sticker(result, {
            pack: 'Triggred',
            author: '',
            categories: ['🤩', '🎉'],
            id: '12345',
            quality: 75,
            background: 'transparent'
        });

        const stikk = await sticker.toBuffer();

        await client.sendMessage(
            m.chat,
            { sticker: stikk },
            { quoted: m }
        );

    } catch (e) {
        console.error(
            formatStylishReply(
                `Erro ao gerar figurinha com efeito “wasted”: ${e.message}`
            )
        );

        await m.reply(
            formatStylishReply(
                'Algo deu errado ao criar a figurinha. 😞\nTente novamente mais tarde.'
            )
        );
    }
};
