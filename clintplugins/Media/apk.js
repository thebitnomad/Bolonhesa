module.exports = async (context) => {
  const { client, m, text, fetchJson } = context;

  const formatStylishReply = (message) => {
    const lines = String(message || '')
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    const body = lines.map((l) => `│❒ ${l}`).join('\n');
    return `◈━━━━━━━━━━━━━━━━◈\n${body}\n◈━━━━━━━━━━━━━━━━◈`;
  };

  try {
    if (!text) {
      return m.reply(
        formatStylishReply(
          `Envie o nome de um aplicativo para buscar o APK.\n` +
          `Exemplo: *Spotify*, *Instagram Mod*, *WhatsApp*, etc.`
        )
      );
    }

    // Pesquisa o APK
    const data = await fetchJson(`https://bk9.fun/search/apk?q=${encodeURI(text)}`);

    if (!data || !data.BK9 || data.BK9.length === 0) {
      return m.reply(
        formatStylishReply(
          `Nenhum APK encontrado para: *${text}*\n` +
          `Tente outro nome ou verifique a ortografia.`
        )
      );
    }

    // Baixa o primeiro resultado encontrado
    const apkInfo = await fetchJson(`https://bk9.fun/download/apk?id=${data.BK9[0].id}`);

    if (!apkInfo || !apkInfo.BK9 || !apkInfo.BK9.dllink) {
      return m.reply(
        formatStylishReply(
          `Não consegui obter o link de download do APK.\n` +
          `Tente novamente mais tarde.`
        )
      );
    }

    await client.sendMessage(
      m.chat,
      {
        document: { url: apkInfo.BK9.dllink },
        fileName: apkInfo.BK9.name || "app.apk",
        mimetype: "application/vnd.android.package-archive"
      },
      { quoted: m }
    );

    await m.reply(
      formatStylishReply(
        `Seu APK está pronto para download. 📦\n` +
        `Caso não instale, tente renomear o arquivo ou baixar novamente.`
      )
    );

  } catch (error) {
    console.error("APK Download Error:", error);

    return m.reply(
      formatStylishReply(
        `Falha ao baixar o APK.\n` +
        `Erro técnico: ${error.message || error}`
      )
    );
  }
};
