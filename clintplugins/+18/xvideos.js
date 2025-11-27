module.exports = async (context) => {
  const { client, m, text, botname, fetchJson } = context;

  const formatStylishReply = (message) => {
    return `◈━━━━━━━━━━━━━━━━◈\n│❒ ${message}\n◈━━━━━━━━━━━━━━━━◈`;
  };

  try {
    // Sem termo de busca
    if (!text || text.trim() === '') {
      return m.reply(
        formatStylishReply(
          'Informe um termo para pesquisar no Xvideos.\n\nExemplo:\n*!xvideos hot milf*'
        )
      );
    }

    // Sanitize básico, igual ao original (limita tamanho e remove caracteres estranhos)
    const queryRaw = text.trim().slice(0, 50).replace(/[^a-zA-Z0-9\s]/g, '');
    if (queryRaw.length < 3) {
      return m.reply(
        formatStylishReply(
          `Esse termo está muito curto, ${m.pushName}.\nUse pelo menos *3 caracteres* para eu conseguir pesquisar.`
        )
      );
    }

    const encodedQuery = encodeURIComponent(queryRaw);

    // Busca na API de pesquisa
    const searchUrl =
      `https://api.giftedtech.web.id/api/search/xvideossearch?apikey=gifted&query=` +
      encodedQuery;

    const searchRes = await fetchJson(searchUrl);

    if (
      !searchRes ||
      !searchRes.success ||
      !searchRes.results ||
      searchRes.results.length === 0
    ) {
      return m.reply(
        formatStylishReply(
          `Não encontrei resultados para *"${queryRaw}"*.\nTente outro termo de pesquisa.`
        )
      );
    }

    // Pega até 5 resultados, escolhe 1 aleatório para download
    const topResults = searchRes.results.slice(0, 5);
    const picked =
      topResults[Math.floor(Math.random() * topResults.length)];

    // Chama API de download para o vídeo escolhido
    const downloadUrl =
      `https://api.giftedtech.web.id/api/download/xvideosdl?apikey=gifted&url=` +
      encodeURIComponent(picked.url);

    const dlRes = await fetchJson(downloadUrl);

    if (!dlRes || !dlRes.success || !dlRes.result || !dlRes.result.download_url) {
      return m.reply(
        formatStylishReply(
          `Não consegui obter o vídeo para você no momento.\nTente novamente em alguns minutos.`
        )
      );
    }

    // Monta o texto de lista dos resultados
    let listMsg =
      `◈━━━━━━━━━━━━━━━━◈\n` +
      `│❒ Encontrei *${topResults.length}* vídeos para *"${queryRaw}"*.\n` +
      `│❒ Um deles foi selecionado para download.\n` +
      `◈━━━━━━━━━━━━━━━━◈\n`;

    topResults.forEach((item, idx) => {
      listMsg += `${idx + 1}. *${item.title}* (${item.duration})${
        item.url === picked.url ? '  [escolhido]' : ''
      }\n`;
    });

    listMsg += `\n◈━━━━━━━━━━━━━━━━◈\nPowered by *${botname}*`;

    await m.reply(listMsg);

    // Monta a legenda do vídeo
    const info = dlRes.result;
    const caption =
      `◈━━━━━━━━━━━━━━━━◈\n` +
      `│❒ *Título*: ${info.title}\n` +
      `│❒ *Pedido por*: ${m.pushName}\n` +
      `│🎬 *Duração*: ${picked.duration}\n` +
      `│👀 *Views*: ${info.views}\n` +
      `│👍 *Likes*: ${info.likes}\n` +
      `│💾 *Tamanho*: ${info.size}\n` +
      `◈━━━━━━━━━━━━━━━━◈\n` +
      `Assista com responsabilidade.\nPowered by *${botname}*`;

    await client.sendMessage(
      m.chat,
      {
        video: { url: info.download_url },
        caption,
      },
      { quoted: m }
    );
  } catch (err) {
    console.error('Xvideo command error:', err);
    await m.reply(
      formatStylishReply(
        `Ocorreu um erro ao processar sua pesquisa.\n\nDetalhes: ${err.message}`
      )
    );
  }
};
