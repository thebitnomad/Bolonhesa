module.exports = async (context) => {
    const { client, m, botname, text } = context;

    const { Sticker, createSticker, StickerTypes } = require('wa-sticker-formatter');
    const axios = require("axios");

    const formatStylishReply = (message) => {
        return `◈━━━━━━━━━━━━━━━━◈\n│❒ ${message}\n◈━━━━━━━━━━━━━━━━◈`;
    };

    // Verifica se o usuário enviou os emojis
    if (!text) {
        return m.reply(
            formatStylishReply(
                "Você precisa informar dois emojis para misturar.\nExemplo: 🙂+😎"
            )
        );
    }

    const emojis = text.split('+');

    if (emojis.length !== 2) {
        return m.reply(
            formatStylishReply(
                "Informe exatamente *2 emojis* separados por '+'.\nExemplo: 🙂+😎"
            )
        );
    }

    const emoji1 = emojis[0].trim();
    const emoji2 = emojis[1].trim();

    try {
        const response = await axios.get(
            `https://levanter.onrender.com/emix?q=${emoji1}${emoji2}`
        );

        if (response.data.status === true) {

            let stickerMess = new Sticker(response.data.result, {
                pack: botname,
                type: StickerTypes.CROPPED,
                categories: ["🤩", "🎉"],
                id: "12345",
                quality: 70,
                background: "transparent",
            });

            const stickerBuffer2 = await stickerMess.toBuffer();

            await client.sendMessage(
                m.chat,
                { sticker: stickerBuffer2 },
                { quoted: m }
            );

        } else {
            m.reply(
                formatStylishReply(
                    "Não foi possível criar o mix de emojis. Tente novamente em instantes."
                )
            );
        }
    } catch (error) {
        m.reply(
            formatStylishReply(
                `Ocorreu um erro ao criar o mix de emojis.\nDetalhes: ${error}`
            )
        );
    }
};
