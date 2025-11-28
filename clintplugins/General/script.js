const fetch = require('node-fetch');

module.exports = async (context) => {
  const { client, m, text, botname = 'Toxic-MD', prefix = '' } = context;

  const toFancyFont = (txt, isUpperCase = false) => {
    const fonts = {
      'A': '𝘼', 'B': '𝘽', 'C': '𝘾', 'D': '𝘿', 'E': '𝙀', 'F': '𝙁', 'G': '𝙂', 'H': '𝙃', 'I': '𝙄', 'J': '𝙅', 'K': '𝙆', 'L': '𝙇', 'M': '𝙈',
      'N': '𝙉', 'O': '𝙊', 'P': '𝙋', 'Q': '𝙌', 'R': '𝙍', 'S': '𝙎', 'T': '𝙏', 'U': '𝙐', 'V': '𝙑', 'W': '𝙒', 'X': '𝙓', 'Y': '𝙔', 'Z': '𝙕',
      'a': '𝙖', 'b': '𝙗', 'c': '𝙘', 'd': '𝙙', 'e': '𝙚', 'f': '𝙛', 'g': '𝙜', 'h': '𝙝', 'i': '𝙞', 'j': '𝙟', 'k': '𝙠', 'l': '𝙡', 'm': '𝙢',
      'n': '𝙣', 'o': '𝙤', 'p': '𝙥', 'q': '𝙦', 'r': '𝙧', 's': '𝙨', 't': '𝙩', 'u': '𝙪', 'v': '𝙫', 'w': '𝙬', 'x': '𝙭', 'y': '𝙮', 'z': '𝙯'
    };
    return (isUpperCase ? txt.toUpperCase() : txt.toLowerCase())
      .split('')
      .map(char => fonts[char] || char)
      .join('');
  };

  const safePrefix = prefix || '!';

  if (text) {
    return client.sendMessage(
      m.chat,
      {
        text: `◈━━━━━━━━━━━━━━━━◈
│❒ Yo, ${m.pushName}, pra que esse monte de coisa a mais?
│❒ Só digita *${safePrefix}site* e pronto. 😏
◈━━━━━━━━━━━━━━━━◈`
      },
      { quoted: m }
    );
  }

  try {
    const repoUrl = 'https://api.github.com/repos/xhclintohn/Toxic-MD';
    const response = await fetch(repoUrl);
    const repoData = await response.json();

    if (!response.ok) {
      throw new Error('Falha ao buscar os dados do repositório.');
    }

    const repoInfo = {
      stars: repoData.stargazers_count,
      forks: repoData.forks_count,
      lastUpdate: repoData.updated_at,
      owner: repoData.owner.login,
      createdAt: repoData.created_at,
      htmlUrl: repoData.html_url
    };

    const createdDate = new Date(repoInfo.createdAt).toLocaleDateString('pt-BR');
    const lastUpdateDate = new Date(repoInfo.lastUpdate).toLocaleDateString('pt-BR');

    const replyText =
      `◈━━━━━━━━━━━━━━━━◈
│❒ *Site do ${botname}*
│❒
│❒ 📅 *Criado em:* ${createdDate}
│❒ 🕒 *Última atualização:* ${lastUpdateDate}
│❒
│❒ Quer saber quem está por trás disso? Toca no botão abaixo. 😈
◈━━━━━━━━━━━━━━━━◈`;

    await client.sendMessage(
      m.chat,
      {
        text: replyText,
        footer: `Powered by ${botname}`,
        headerType: 1,
        viewOnce: true,
        contextInfo: {
          externalAdReply: {
            showAdAttribution: false,
            title: `${botname}`,
            body: `Confira o site aqui. 😉`,
            sourceUrl: 'https://9bot.com.br',
            mediaType: 1,
            renderLargerThumbnail: true
          }
        }
      },
      { quoted: m }
    );
  } catch (error) {
    console.error('Error in repo command:', error);
    await client.sendMessage(
      m.chat,
      {
        text: `◈━━━━━━━━━━━━━━━━◈
│❒ Não consegui obter as informações do site.
│❒ Confere direto aqui: https://9bot.com.br
◈━━━━━━━━━━━━━━━━◈`
      },
      { quoted: m }
    );
  }
};
