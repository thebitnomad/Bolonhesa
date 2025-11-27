module.exports = async (context) => {
  const { client, m, text } = context;

  const formatStylishReply = (message) => {
    return `◈━━━━━━━━━━━━━━━━◈\n│❒ ${message}\n◈━━━━━━━━━━━━━━━━◈`;
  };

  if (!text) {
    return m.reply(
      formatStylishReply("Qual é o seu texto? Envie uma pergunta ou mensagem para a IA.")
    );
  }

  try {
    const username = (m.sender || "").split("@")[0] || "usuario";

    const apiUrl = `https://gpt4.guruapi.tech/chat-gpt?username=${encodeURIComponent(
      username
    )}&query=${encodeURIComponent(text)}`;

    const response = await fetch(apiUrl);

    const data = await response.json();
    const result = data?.result;

    if (!result) {
      return m.reply(
        formatStylishReply("Não foi possível obter uma resposta da API. Tente novamente em instantes.")
      );
    }

    await m.reply(
`◈━━━━━━━━━━━━━━━━◈
│❒ Resposta da IA:
◈━━━━━━━━━━━━━━━━◈

${result}

◈━━━━━━━━━━━━━━━━◈
Powered by *9bot*`
    );
  } catch (error) {
    await m.reply(
      formatStylishReply(
        `Ocorreu um erro ao processar sua solicitação.\nDetalhes: ${error.message || error}`
      )
    );
  }
};
