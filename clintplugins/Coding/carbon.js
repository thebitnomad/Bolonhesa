module.exports = async (context) => {
  const { client, m, text, botname } = context;

  const fetch = require('node-fetch');

  const formatStylishReply = (message) => {
    return `◈━━━━━━━━━━━━━━━━◈\n│❒ ${message}\n◈━━━━━━━━━━━━━━━━◈`;
  };

  let cap = `◈━━━━━━━━━━━━━━━━◈\n│❒ Convertido por *${botname}*\n◈━━━━━━━━━━━━━━━━◈`;

  // Verifica se o usuário respondeu uma mensagem de texto
  if (m.quoted && m.quoted.text) {
    const forq = m.quoted.text;

    try {
      let response = await fetch('https://carbonara.solopov.dev/api/cook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: forq,
          backgroundColor: '#1F816D',
        }),
      });

      if (!response.ok) {
        return m.reply(
          formatStylishReply('A API não retornou uma resposta válida.')
        );
      }

      let per = await response.buffer();

      await client.sendMessage(
        m.chat,
        { image: per, caption: cap },
        { quoted: m }
      );

    } catch (error) {
      m.reply(
        formatStylishReply(
          `Ocorreu um erro ao converter o código.\nDetalhes: ${error}`
        )
      );
    }

  } else {
    m.reply(
      formatStylishReply('Responda uma mensagem que contenha código para converter.')
    );
  }
};
