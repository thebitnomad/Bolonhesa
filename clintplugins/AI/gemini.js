module.exports = async (context) => {
  const { client, m, text } = context;
  const axios = require("axios");

  const formatStylishReply = (message) => {
    return `◈━━━━━━━━━━━━━━━━◈\n│❒ ${message}\n◈━━━━━━━━━━━━━━━━◈`;
  };

  // Verifica se o usuário enviou texto
  if (!text) {
    return client.sendMessage(
      m.chat,
      { 
        text: 
`◈━━━━━━━━━━━━━━━━◈
│❒ Envie uma mensagem para conversar com a IA.
│❒ Exemplo: *.gemini Olá, tudo bem?*
◈━━━━━━━━━━━━━━━━◈`
      },
      { quoted: m, ad: true }
    );
  }

  // Limita o tamanho do texto
  if (text.length > 500) {
    return client.sendMessage(
      m.chat,
      { 
        text: 
`◈━━━━━━━━━━━━━━━━◈
│❒ Sua mensagem está muito longa.
│❒ Por favor, mantenha abaixo de 500 caracteres.
◈━━━━━━━━━━━━━━━━◈`
      },
      { quoted: m, ad: true }
    );
  }

  try {
    // Chama a API
    const { data } = await axios.get("https://api.zenzxz.my.id/api/ai/gemini", {
      params: { text: text, id: "string" },
      headers: { Accept: "application/json" },
      timeout: 10000,
    });

    // Verifica se a resposta é válida
    if (!data.success || !data.data?.response) {
      return client.sendMessage(
        m.chat,
        { 
          text: 
`◈━━━━━━━━━━━━━━━━◈
│❒ Não recebi uma resposta válida da API.
│❒ Tente novamente em alguns instantes.
◈━━━━━━━━━━━━━━━━◈`
        },
        { quoted: m, ad: true }
      );
    }

    // Envia a resposta estilizada
    await client.sendMessage(
      m.chat,
      { 
        text: 
`◈━━━━━━━━━━━━━━━━◈
│❒ Resposta da IA:
◈━━━━━━━━━━━━━━━━◈

${data.data.response}

◈━━━━━━━━━━━━━━━━◈
> Powered by *Toxic-mdz*`
      },
      { quoted: m, ad: true }
    );

  } catch (error) {
    console.error("Erro no comando Gemini:", error);
    return client.sendMessage(
      m.chat,
      { 
        text: 
`◈━━━━━━━━━━━━━━━━◈
│❒ Ocorreu um erro ao processar sua solicitação.
│❒ Detalhes: ${error.message}
◈━━━━━━━━━━━━━━━━◈`
      },
      { quoted: m, ad: true }
    );
  }
};
