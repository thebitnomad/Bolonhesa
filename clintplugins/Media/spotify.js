module.exports = {
  name: "spotify",
  aliases: ["spotifydl", "spoti", "spt"],
  description: "Baixa músicas do Spotify",
  run: async (context) => {
    const { client, m, prefix, botname, fetchJson } = context;

    const formatStylishReply = (message) => {
      return `◈━━━━━━━━━━━━━━━━◈\n│❒ ${message}\n◈━━━━━━━━━━━━━━━━◈\n> Pσɯҽɾԃ Ⴆყ Tσxιƈ-ɱԃȥ`;
    };

    const query = m.body
      .replace(new RegExp(`^${prefix}(spotify|spotifydl|spoti|spt)\\s*`, "i"), "")
      .trim();

    if (!query) {
      return client.sendMessage(
        m.chat,
        {
          text: formatStylishReply(
            `Olá, @${m.sender.split("@")[0]}! 🎶\nMe diga qual música você quer baixar.\n\nExemplos:\n• ${prefix}spotify Alone Pt II\n• ${prefix}spoti Alan Walker Ava Max`
          ),
          mentions: [m.sender],
        },
        { quoted: m }
      );
    }

    if (query.length > 100) {
      return client.sendMessage(
        m.chat,
        {
          text: formatStylishReply(
            "O nome da música está muito longo. 😅\nTente usar até 100 caracteres."
          ),
        },
        { quoted: m }
      );
    }

    let loadingMsg;

    try {
      loadingMsg = await client.sendMessage(
        m.chat,
        {
          text: formatStylishReply(
            `Aguarde um instante... 🎧\nEstou procurando "${query}" no Spotify pra você.`
          ),
        },
        { quoted: m }
      );

      const apiUrl = `https://api.ootaizumi.web.id/downloader/spotifyplay?query=${encodeURIComponent(
        query
      )}`;
      const data = await fetchJson(apiUrl);

      if (data.status && data.result?.download) {
        const song = data.result;
        const audioUrl = song.download;
        const filename = song.title || "Música Desconhecida";
        const artist = song.artists || "Artista Desconhecido";
        const album = song.album || "Álbum Desconhecido";
        const duration = song.duration_ms
          ? `${Math.floor(song.duration_ms / 60000)}:${((song.duration_ms % 60000) / 1000)
              .toFixed(0)
              .padStart(2, "0")}`
          : "Desconhecida";

        if (loadingMsg?.key) {
          await client.sendMessage(m.chat, { delete: loadingMsg.key });
        }

        try {
          await client.sendMessage(
            m.chat,
            {
              audio: { url: audioUrl },
              mimetype: "audio/mpeg",
              fileName: `${filename}.mp3`,
              contextInfo: {
                externalAdReply: {
                  title: filename.substring(0, 30),
                  body: artist.substring(0, 30),
                  thumbnailUrl: song.image || "",
                  sourceUrl: song.external_url || "",
                  mediaType: 1,
                  renderLargerThumbnail: true,
                },
              },
            },
            { quoted: m }
          );
        } catch (audioError) {
          console.error("Erro ao enviar áudio Spotify:", audioError);
        }

        try {
          await client.sendMessage(
            m.chat,
            {
              document: { url: audioUrl },
              mimetype: "audio/mpeg",
              fileName: `${filename} - ${artist}.mp3`.replace(/[<>:"/\\|?*]/g, "_"),
              caption: formatStylishReply(
                `✅ Download do Spotify concluído!\n\n• Título: ${filename}\n• Artista: ${artist}\n• Álbum: ${album}\n• Duração: ${duration}\n\nAlimentado por ${botname}`
              ),
            },
            { quoted: m }
          );
        } catch (docError) {
          console.error("Erro ao enviar documento Spotify:", docError);
          throw new Error("Não consegui enviar o arquivo da música.");
        }
      } else {
        if (loadingMsg?.key) {
          await client.sendMessage(m.chat, { delete: loadingMsg.key });
        }

        await client.sendMessage(
          m.chat,
          {
            text: formatStylishReply(
              `Não encontrei nenhuma música para "${query}" 😢\nTente informar o nome completo ou incluir o artista.`
            ),
          },
          { quoted: m }
        );
      }
    } catch (error) {
      console.error("Spotify command error:", error);

      try {
        if (loadingMsg?.key) {
          await client.sendMessage(m.chat, { delete: loadingMsg.key });
        }
      } catch (_) {}

      let errorMessage = "Ocorreu um erro inesperado.";

      if (error.message.includes("Failed to download")) {
        errorMessage = "Falha no download da música. Ela pode estar indisponível.";
      } else if (error.message.includes("ENOTFOUND")) {
        errorMessage = "Não foi possível conectar ao serviço do Spotify.";
      } else if (error.message.includes("timeout")) {
        errorMessage = "A requisição demorou demais. Tente novamente em alguns instantes.";
      } else if (error.message) {
        errorMessage = error.message;
      }

      await client.sendMessage(
        m.chat,
        {
          text: formatStylishReply(
            `Não consegui finalizar o download. 😔\n\nMúsica: "${query}"\nErro: ${errorMessage}\n\nDicas:\n• Use o nome exato da música\n• Inclua o nome do artista\n• Verifique se não há erros de digitação`
          ),
        },
        { quoted: m }
      );
    }
  },
};
