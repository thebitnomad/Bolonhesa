const axios = require("axios");

module.exports = {
    name: "bonk",
    aliases: ["bonkmeme"],
    description: "Aplica um efeito de BONK na foto de perfil de alguém",
    run: async (context) => {
        const { client, m, Tag, botname } = context;

        const formatStylishReply = (message) => {
            return `◈━━━━━━━━━━━━━━━━◈\n│❒ ${message}\n◈━━━━━━━━━━━━━━━━◈`;
        };

        try {
            let avatarUrl;

            // Se respondeu alguém, usa a foto de quem foi citado
            if (m.quoted) {
                try {
                    avatarUrl = await client.profilePictureUrl(m.quoted.sender, "image");
                } catch {
                    avatarUrl = "https://telegra.ph/file/9521e9ee2fdbd0d6f4f1c.jpg";
                }
            }
            // Se marcou alguém com @, usa a foto da pessoa marcada ou do autor
            else if (Tag && Tag[0]) {
                try {
                    avatarUrl = await client.profilePictureUrl(Tag[0], "image");
                } catch {
                    avatarUrl = "https://telegra.ph/file/9521e9ee2fdbd0d6f4f1c.jpg";
                }
            }
            // Senão, usa a própria foto de perfil de quem enviou o comando
            else {
                try {
                    avatarUrl = await client.profilePictureUrl(m.sender, "image");
                } catch {
                    avatarUrl = "https://telegra.ph/file/9521e9ee2fdbd0d6f4f1c.jpg";
                }
            }

            if (!avatarUrl) {
                return m.reply(
                    formatStylishReply(
                        "Não consegui pegar a foto de perfil. Tente marcar alguém ou responder a uma mensagem."
                    )
                );
            }

            // ⬇️ Substitua esta URL pela sua API de BONK
            // A ideia é: a API recebe ?avatar=<url> e devolve a imagem já pronta (buffer/png/jpg)
            const BONK_API_URL = process.env.BONK_API_URL || "https://sua-api-bonk-aqui.com/generate";

            const apiUrl = `${BONK_API_URL}?avatar=${encodeURIComponent(avatarUrl)}`;

            // Envia mensagem de processamento
            const loadingMsg = await client.sendMessage(
                m.chat,
                {
                    text: formatStylishReply(
                        "Aplicando o BONK na foto… 🪓\nSegure firme, isso leva só alguns instantes."
                    ),
                },
                { quoted: m }
            );

            // Chama a API que gera o BONK
            const response = await axios.get(apiUrl, {
                responseType: "arraybuffer",
                timeout: 30000,
            });

            const bonkBuffer = Buffer.from(response.data);

            // Apaga mensagem de carregamento
            try {
                await client.sendMessage(m.chat, { delete: loadingMsg.key });
            } catch (_) {
                // ignora erro ao deletar
            }

            // Envia a imagem bonkada
            const caption =
`◈━━━━━━━━━━━━━━━━◈
│❒ BONK aplicado com sucesso. 🪓
│❒ Convertido por *${botname || "9bot"}*
◈━━━━━━━━━━━━━━━━◈`;

            await client.sendMessage(
                m.chat,
                {
                    image: bonkBuffer,
                    caption,
                },
                { quoted: m }
            );
        } catch (error) {
            console.error("Erro no comando BONK:", error);

            await m.reply(
                formatStylishReply(
                    "Não consegui gerar o BONK agora.\nTente novamente em alguns instantes."
                )
            );
        }
    },
};
