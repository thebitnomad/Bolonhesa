module.exports = async (context) => {
  const { client, m, text } = context;

  try {
    if (!text) {
      return m.reply(
        "◈━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━◈\n" +
        "│ ❒ ERRO\n" +
        "◈━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━◈\n" +
        "│ 🚫 Informe um nome de usuário do GitHub!\n" +
        "│ ❒ Exemplo: .github octocat\n" +
        "◈━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━◈"
      );
    }

    const response = await fetch(`https://api.github.com/users/${text}`);
    const data = await response.json();

    if (!data.login) {
      return m.reply(
        "◈━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━◈\n" +
        "│ ❒ ERRO\n" +
        "◈━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━◈\n" +
        "│ ❌ Usuário não encontrado. Verifique o nome e tente novamente.\n" +
        "◈━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━◈"
      );
    }

    const pic = `https://github.com/${data.login}.png`;

    const userInfo =
      "◈━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━◈\n" +
      "│ ❒ PERFIL DO GITHUB\n" +
      "◈━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━◈\n" +
      "│ 🔖 Usuário      : " + (data.login || "N/A") + "\n" +
      "│ ♦️ Nome         : " + (data.name || "N/A") + "\n" +
      "│ ✨ Bio          : " + (data.bio || "N/A") + "\n" +
      "│ 🏢 Empresa      : " + (data.company || "N/A") + "\n" +
      "│ 📍 Localização  : " + (data.location || "N/A") + "\n" +
      "│ 📧 Email        : " + (data.email || "N/A") + "\n" +
      "│ 📰 Site/Blog    : " + (data.blog || "N/A") + "\n" +
      "│ 🔓 Repos Públic.: " + (data.public_repos || 0) + "\n" +
      "│ 👪 Seguidores   : " + (data.followers || 0) + "\n" +
      "│ 👪 Seguindo     : " + (data.following || 0) + "\n" +
      "◈━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━◈";

    await client.sendMessage(
      m.chat,
      { image: { url: pic }, caption: userInfo },
      { quoted: m }
    );

  } catch (e) {
    return m.reply(
      "◈━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━◈\n" +
      "│ ❒ ERRO\n" +
      "◈━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━◈\n" +
      "│ ❌ Ocorreu um erro inesperado.\n" +
      `│ ❒ Detalhes: ${e.message}\n` +
      "◈━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━◈"
    );
  }
};
