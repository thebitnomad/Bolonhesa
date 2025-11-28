module.exports = async (context) => {
    const { client, m, pict } = context;

    try {
        const isQuoted = !!m.quoted;
        const sender = isQuoted ? m.quoted.sender : m.sender;
        const name = isQuoted ? `@${sender.split('@')[0]}` : (m.pushName || 'Usuário');

        let ppUrl = pict; // Imagem padrão vinda do contexto
        try {
            ppUrl = await client.profilePictureUrl(sender, 'image');
        } catch {
            ppUrl = pict; // Fallback para pict se não tiver foto de perfil
        }

        let statusText = 'Não definido';
        try {
            const status = await client.fetchStatus(sender);
            statusText = status?.status || 'Não definido';
        } catch {
            statusText = 'Sobre não acessível por causa das configurações de privacidade.';
        }

        const caption = `◈━━━━━━━━━━━━━━━━◈
│❒ 👤 *Perfil de:* ${name}
│❒
│❒ 🖼️ *Foto de perfil:* ${ppUrl ? 'Exibida abaixo.' : 'Não disponível.'}
│❒ 📝 *Sobre (status):* ${statusText}
│❒
│❒ Powered by 9bot.com.br
◈━━━━━━━━━━━━━━━━◈`;

        const message = {
            image: { url: ppUrl },
            caption,
            mentions: isQuoted ? [sender] : []
        };

        await client.sendMessage(m.chat, message, { quoted: m });
    } catch (error) {
        console.error('Error in profile command:', error);
        await client.sendMessage(
            m.chat,
            {
                text: `◈━━━━━━━━━━━━━━━━◈
│❒ Não foi possível buscar o perfil.
│❒ Detalhes: ${error.message}
│❒ Tente novamente mais tarde.
◈━━━━━━━━━━━━━━━━◈`
            },
            { quoted: m }
        );
    }
};
