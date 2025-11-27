const fetch = require('node-fetch');

module.exports = async (context) => {
  const { client, m, text, botname } = context;

  // Verifica botname
  if (!botname) {
    return m.reply(
`◈━━━━━━━━━━━━━━━━◈
│❒ Erro: o nome do bot não está definido.
│❒ Informe ao desenvolvedor para ajustar a configuração.
◈━━━━━━━━━━━━━━━━◈`
    );
  }

  // Verifica se o usuário enviou texto
  if (!text) {
    return m.reply(
`◈━━━━━━━━━━━━━━━━◈
│❒ Olá, ${m.pushName}.
│❒ Você esqueceu de enviar um prompt.
│❒ Exemplo: *.gpt Qual o sentido da vida?*
◈━━━━━━━━━━━━━━━━◈`
    );
  }

  try {
    const encodedText = encodeURIComponent(text);
    const apiUrl = `https://api.privatezia.biz.id/api/ai/GPT-4?query=${encodedText}`;
    
    const response = await fetch(apiUrl, { 
      timeout: 10000,
      headers: { 'Content-Type': 'application/json' }
    });

    if (!response.ok) {
      throw new Error(`API retornou status ${response.status}`);
    }

    const data = await response.json();

    if (!data.status || !data.response) {
      return m.reply(
`◈━━━━━━━━━━━━━━━━◈
│❒ A API não retornou uma resposta válida.
│❒ Por favor, tente novamente.
◈━━━━━━━━━━━━━━━━◈`
      );
    }

    await m.reply(
`◈━━━━━━━━━━━━━━━━◈
│❒ Resposta da IA:
◈━━━━━━━━━━━━━━━━◈

${data.response}

◈━━━━━━━━━━━━━━━━◈`
    );

  } catch (error) {
    await m.reply(
`◈━━━━━━━━━━━━━━━━◈
│❒ Ocorreu um erro ao processar sua solicitação.
│❒ Detalhes: ${error.message}
◈━━━━━━━━━━━━━━━━◈`
    );
  }
};
