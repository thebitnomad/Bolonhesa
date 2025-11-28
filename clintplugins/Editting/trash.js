const canvacord = require("canvacord");

module.exports = async (context) => {
    const { client, m, Tag, botname } = context;

    const formatStylishReply = (message) => {
        return `◈━━━━━━━━━━━━━━━━◈
│❒ ${message}
◈━━━━━━━━━━━━━━━━◈`;
    };

    const caption = formatStylishReply(`Imagem convertida com ${botname}.`);

    try {
        let result;
        let img;
        let ppuser;

        if (m.quoted) {
            try {
                img = await client.profilePictureUrl(m.quoted.sender, "image");
            } catch {
                img = "https://telegra.ph/file/9521e9ee2fdbd0d6f4f1c.jpg";
            }
            result = await canvacord.Canvacord.trash(img);
        } else if (Tag && Tag.length > 0) {
            try {
                ppuser = await client.profilePictureUrl(Tag[0] || m.sender, "image");
            } catch {
                ppuser = "https://telegra.ph/file/9521e9ee2fdbd0d6f4f1c.jpg";
            }
            result = await canvacord.Canvacord.trash(ppuser);
        } else {
            return m.reply(
                formatStylishReply(
                    `Responda a uma mensagem ou marque alguém para aplicar o efeito “trash”.`
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
            formatStylishReply(`Erro no comando de efeito “trash”: ${e.message}`)
        );

        await m.reply(
            formatStylishReply(
                `Algo deu errado ao gerar a imagem. 😞
│❒ Tente novamente em instantes.`
            )
        );
    }
};
