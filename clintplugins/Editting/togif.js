const axios = require("axios");

module.exports = async (context) => {
    const { client, m, text } = context;

    try {
        const emojiText = (text || '').trim();

        // Verificar se o usuário enviou um emoji
        if (!emojiText) {
            return m.reply(
                `◈━━━━━━━━━━━━━━━━◈
│❒ Por favor, envie um emoji para eu animar.
│❒ Exemplo: \`.togif 😂\`
◈━━━━━━━━━━━━━━━━◈`
            );
        }

        // Validar se é um emoji
        if (!/\p{Emoji}/u.test(emojiText)) {
            return m.reply(
                `◈━━━━━━━━━━━━━━━━◈
│❒ Isso não parece ser um emoji válido.
│❒ Tente novamente usando um emoji real.
◈━━━━━━━━━━━━━━━━◈`
            );
        }

        await m.reply(
            `◈━━━━━━━━━━━━━━━━◈
│❒ Gerando seu emoji animado...
│❒ Aguarde só um instante. 🎬
◈━━━━━━━━━━━━━━━━◈`
        );

        // Buscar o GIF na API
        const apiUrl = `https://api-faa.my.id/faa/emojigerak?emoji=${encodeURIComponent(emojiText)}`;
        const response = await axios.get(apiUrl, { responseType: "arraybuffer", timeout: 60000 });

        // Enviar o GIF para o chat
        await client.sendMessage(
            m.chat,
            {
                video: Buffer.from(response.data),
                gifPlayback: true,
                caption: `◈━━━━━━━━━━━━━━━━◈
│❒ Emoji animado: ${emojiText}
│❒ Poderizado por Toxic-MDȥ.
◈━━━━━━━━━━━━━━━━◈`
            },
            { quoted: m }
        );
    } catch (error) {
        console.error(
            `◈━━━━━━━━━━━━━━━━◈
│❒ Erro no comando togif: ${error.message}
◈━━━━━━━━━━━━━━━━◈`
        );

        await m.reply(
            `◈━━━━━━━━━━━━━━━━◈
│❒ Não foi possível criar o GIF do emoji.
│❒ Detalhes: ${error.message}
◈━━━━━━━━━━━━━━━━◈`
        );
    }
};
