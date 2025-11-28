// random-anime.js

module.exports = async (context) => {
    const { client, m } = context;
    const axios = require("axios");

    const formatStylish = (msg) => `◈━━━━━━━━━━━━━━━━◈
│❒ ${msg}
◈━━━━━━━━━━━━━━━━◈`;

    const link = "https://api.jikan.moe/v4/random/anime";

    try {
        const response = await axios.get(link);
        const data = response?.data?.data;

        if (!data) {
            return m.reply(formatStylish("Não consegui obter o anime no momento. Tente novamente!"));
        }

        const title = data.title || "Título indisponível";
        const synopsis = data.synopsis || "Sem sinopse disponível.";
        const imageUrl = data.images?.jpg?.image_url || null;
        const episodes = data.episodes ?? "Desconhecido";
        const status = data.status || "Status indisponível";
        const url = data.url || "Sem URL disponível";

        const caption = `◈━━━━━━━━━━━━━━━━◈
│❒ 📺 *Título:* ${title}
│❒ 🎬 *Episódios:* ${episodes}
│❒ 📡 *Status:* ${status}
│❒ 📝 *Sinopse:* ${synopsis}
│❒ 🔗 *URL:* ${url}
◈━━━━━━━━━━━━━━━━◈`;

        await client.sendMessage(
            m.chat,
            { image: { url: imageUrl }, caption },
            { quoted: m }
        );

    } catch (error) {
        console.error("Random anime error:", error);
        m.reply(formatStylish("Ocorreu um erro ao buscar o anime. Tente novamente mais tarde."));
    }
};
