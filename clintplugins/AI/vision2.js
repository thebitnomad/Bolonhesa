const fetch = require('node-fetch');

module.exports = async (context) => {
  const { client, m, text, uploadtoimgur, msgDreaded } = context;

  const formatStylishReply = (message) => {
    return `◈━━━━━━━━━━━━━━━━◈\n│❒ ${message}\n◈━━━━━━━━━━━━━━━━◈`;
  };

  // Precisa ter imagem marcada e texto (prompt)
  if (!msgDreaded || !text) {
    return m.reply(
`◈━━━━━━━━━━━━━━━━◈
│❒ Você precisa marcar (responder) uma imagem e enviar um texto junto.
│❒ Essa IA analisa a imagem com base no seu prompt.
│❒ Exemplo:
│❒ Responda uma imagem com: *!vision Descreva essa cena em detalhes.*
◈━━━━━━━━━━━━━━━━◈`
    );
  }

  let imageMessage;

  if (msgDreaded.imageMessage) {
    imageMessage = msgDreaded.imageMessage;
  } else {
    return m.reply(
      formatStylishReply('Você não marcou nenhuma imagem para análise.')
    );
  }

  try {
    // Faz download e salva a mídia (caminho em disco)
    const filePath = await client.downloadAndSaveMediaMessage(imageMessage);

    // Faz upload (por exemplo, para o Imgur) usando o helper já existente
    const imageUrl = await uploadtoimgur(filePath);

    if (!imageUrl) {
      return m.reply(
        formatStylishReply('Não foi possível enviar a imagem para análise. Tente novamente em instantes.')
      );
    }

    await m.reply(
      formatStylishReply('Aguarde, estou analisando o conteúdo da imagem com IA...')
    );

    // Chama a API de visão (imagem + prompt)
    const apiUrl = `https://api.ootaizumi.web.id/ai/gptnano?imageUrl=${encodeURIComponent(
      imageUrl
    )}&prompt=${encodeURIComponent(text)}`;

    const res = await fetch(apiUrl);
    const json = await res.json();

    if (!json || !json.result) {
      return m.reply(
        formatStylishReply('A API não retornou uma resposta válida para a análise da imagem.')
      );
    }

    const replyText =
`◈━━━━━━━━━━━━━━━━◈
│❒ Resultado da análise de imagem:
◈━━━━━━━━━━━━━━━━◈

${json.result}

◈━━━━━━━━━━━━━━━━◈`;

    await client.sendMessage(
      m.chat,
      { text: replyText },
      { quoted: m }
    );

  } catch (err) {
    await m.reply(
      formatStylishReply(
        `Ocorreu um erro ao analisar a imagem.\nDetalhes: ${err.message || err}`
      )
    );
  }
};
