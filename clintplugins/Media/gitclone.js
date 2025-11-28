const fetch = require('node-fetch');

module.exports = async (context) => {
  const { client, m, text } = context;

  const formatStylishReply = (message) => {
    const lines = String(message || '')
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    const body = lines.map((l) => `│❒ ${l}`).join('\n');
    return `◈━━━━━━━━━━━━━━━━◈\n${body}\n◈━━━━━━━━━━━━━━━━◈`;
  };

  if (!text) {
    return m.reply(
      formatStylishReply(
        `Cadê o link do repositório?\n` +
        `Envie um link válido de um repositório no GitHub.`
      )
    );
  }

  if (!text.includes('github.com')) {
    return m.reply(
      formatStylishReply(
        `Isso não parece ser um link de repositório do *GitHub*.\n` +
        `Verifique o link e tente novamente.`
      )
    );
  }

  try {
    const regex = /(?:https|git)(?::\/\/|@)github\.com[\/:]([^\/:]+)\/(.+)/i;
    let [, user3, repo] = text.match(regex) || [];

    if (!user3 || !repo) {
      return m.reply(
        formatStylishReply(
          `Não consegui identificar o usuário e o repositório a partir desse link.\n` +
          `Exemplo válido:\n` +
          `https://github.com/usuario/repo`
        )
      );
    }

    repo = repo.replace(/\.git$/, '').trim();
    const url = `https://api.github.com/repos/${user3}/${repo}/zipball`;

    const headResponse = await fetch(url, { method: 'HEAD' });

    if (!headResponse.ok) {
      return m.reply(
        formatStylishReply(
          `Não foi possível acessar o repositório:\n` +
          `Status: ${headResponse.status}\n` +
          `Verifique se o repositório é público e se o link está correto.`
        )
      );
    }

    const disposition = headResponse.headers.get('content-disposition');
    let filename = 'repository';

    if (disposition) {
      const match = disposition.match(/attachment;\s*filename="?([^"]+)"?/i);
      if (match && match[1]) {
        filename = match[1];
      }
    }

    await client.sendMessage(
      m.chat,
      {
        document: { url },
        fileName: `${filename}.zip`,
        mimetype: 'application/zip'
      },
      { quoted: m }
    );
  } catch (err) {
    console.error('GitHub repo download error:', err);
    await m.reply(
      formatStylishReply(
        `Não foi possível baixar o repositório no momento.\n` +
        `Motivo: ${err.message || err}\n` +
        `Tente novamente em alguns instantes.`
      )
    );
  }
};
