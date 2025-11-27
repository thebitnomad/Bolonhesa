module.exports = async (context) => {
  const { client, m, prefix, text } = context;

  const toFancyFont = (text, isUpperCase = false) => {
    const fonts = {
      'A': '𝘼', 'B': '𝘽', 'C': '𝘾', 'D': '𝘿', 'E': '𝙀', 'F': '𝙁', 'G': '𝙂', 'H': '𝙃', 'I': '𝙄', 'J': '𝙅', 'K': '𝙆', 'L': '𝙇', 'M': '𝙈',
      'N': '𝙉', 'O': '𝙊', 'P': '𝙋', 'Q': '𝙌', 'R': '𝙍', 'S': '𝙎', 'T': '𝙏', 'U': '𝙐', 'V': '𝙑', 'W': '𝙒', 'X': '𝙓', 'Y': '𝙔', 'Z': '𝙕',
      'a': '𝙖', 'b': '𝙗', 'c': '𝙘', 'd': '𝙙', 'e': '𝙚', 'f': '𝙛', 'g': '𝙜', 'h': '𝙝', 'i': '𝙞', 'j': '𝙟', 'k': '𝙠', 'l': '𝙡', 'm': '𝙢',
      'n': '𝙣', 'o': '𝙤', 'p': '𝙥', 'q': '𝙦', 'r': '𝙧', 's': '𝙨', 't': '𝙩', 'u': '𝙪', 'v': '𝙫', 'w': '𝙬', 'x': '𝙭', 'y': '𝙮', 'z': '𝙯'
    };
    return (isUpperCase ? text.toUpperCase() : text.toLowerCase())
      .split('')
      .map(char => fonts[char] || char)
      .join('');
  };

  if (text) {
    return client.sendMessage(m.chat, { text: `◈━━━━━━━━━━━━━━━━◈\n│❒ Opa, ${m.pushName}! Basta usar ${prefix}credits para ver os agradecimentos.\n◈━━━━━━━━━━━━━━━━◈` }, { quoted: m });
  }

  try {
    const replyText = `◈━━━━━━━━━━━━━━━━◈\n│❒ *Créditos Oficiais*\n\nAgradecimentos especiais a *𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧* pela construção deste bot do zero.\n│❒ Comunidade e colaboradores mantêm tudo ON!\n\nObrigado por fazer parte dessa jornada. 🫡`;

    await client.sendMessage(m.chat, {
      text: replyText,
      footer: `TPσɯҽɾҽԃ Ⴆყ Toxic-MD`,
      buttons: [
        { buttonId: `${prefix}dev`, buttonText: { displayText: `👤 ${toFancyFont('DEV')}` }, type: 1 }
      ],
      headerType: 1,
      viewOnce: true
    }, { quoted: m });
  } catch (error) {
    console.error('Error in credits command:', error);
    await client.sendMessage(m.chat, { text: `◈━━━━━━━━━━━━━━━━◈\n│❒ Algo deu errado ao mostrar os créditos.\n│❒ Tente novamente em instantes.\n◈━━━━━━━━━━━━━━━━◈` }, { quoted: m });
  }
};