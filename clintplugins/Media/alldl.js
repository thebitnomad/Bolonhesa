module.exports = async (context) => {
  const { client, m, text, botname, fetchJson } = context;

  const formatStylishReply = (message) => {
    const lines = String(message || '')
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    const body = lines.map((l) => `│❒ ${l}`).join('\n');
    return `◈━━━━━━━━━━━━━━━━◈\n${body}\n◈━━━━━━━━━━━━━━━━◈`;
  };

  if (!text) {
    return m.reply(
      formatStylishReply(
        `Envie um link para fazer o download.\n` +
        `Exemplos: link do *Facebook*, *X (Twitter)*, *TikTok*, *CapCut*, entre outros.`
      )
    );
  }

  try {
    const url = encodeURI(text.trim());
    const data = await fetchJson(`https://api.dreaded.site/api/alldl?url=${url}`);

    if (!data || data.status !== 200 || !data.data || !data.data.videoUrl) {
      return m.reply(
        formatStylishReply(
          `Não consegui processar o link informado.\n` +
          `O serviço de download pode estar indisponível no momento.\n` +
          `Tente novamente mais tarde.`
        )
      );
    }

    const allvid = data.data.videoUrl;

    await client.sendMessage(
      m.chat,
      {
        video: { url: allvid },
        caption: `◈━━━━━━━━━━━━━━━━◈
│❒ Download realizado por *${botname}*.
│❒ Se o vídeo não carregar, tente reenviar o link.
◈━━━━━━━━━━━━━━━━◈`,
        gifPlayback: false
      },
      { quoted: m }
    );
  } catch (e) {
    console.error('Erro no comando de download:', e);

    await m.reply(
      formatStylishReply(
        `Ocorreu um erro ao tentar baixar o vídeo.\n` +
        `O serviço pode estar instável ou fora do ar.\n` +
        `Detalhes técnicos: ${e.message || e}`
      )
    );
  }
};
