// profilegc.js

module.exports = async (context) => {
    const { client, m } = context;

    const formatStylishReply = (msg) => (
        `◈━━━━━━━━━━━━━━━━◈
│❒ ${msg}
◈━━━━━━━━━━━━━━━━◈`
    );

    // Função para converter timestamp de criação do grupo
    function convertTimestamp(timestamp) {
        const d = new Date(timestamp * 1000);
        const daysOfWeek = [
            'Domingo',
            'Segunda-feira',
            'Terça-feira',
            'Quarta-feira',
            'Quinta-feira',
            'Sexta-feira',
            'Sábado'
        ];

        return {
            date: d.getDate(),
            month: new Intl.DateTimeFormat('pt-BR', { month: 'long' }).format(d),
            year: d.getFullYear(),
            day: daysOfWeek[d.getUTCDay()],
            time: `${d.getUTCHours().toString().padStart(2, '0')}:${d
                .getUTCMinutes()
                .toString()
                .padStart(2, '0')}:${d.getUTCSeconds().toString().padStart(2, '0')}`
        };
    }

    try {
        if (!m.isGroup) {
            return m.reply(
                formatStylishReply('Este comando só pode ser usado em grupos. 😊')
            );
        }

        const info = await client.groupMetadata(m.chat);
        const ts = convertTimestamp(info.creation);

        let pp;
        try {
            pp = await client.profilePictureUrl(m.chat, 'image');
        } catch {
            pp = 'https://telegra.ph/file/9521e9ee2fdbd0d6f4f1c.jpg';
        }

        const totalParticipants = info.participants?.length || 0;
        const membersCount = info.participants.filter((p) => p.admin == null).length;
        const adminsCount = totalParticipants - membersCount;

        const ownerJid = info.owner || '';
        const ownerTag = ownerJid
            ? `@${ownerJid.split('@')[0]}`
            : 'Sem criador definido';

        const caption = `◈━━━━━━━━━━━━━━━━◈
│❒ *INFORMAÇÕES DO GRUPO*
│❒
│❒ *Nome:* ${info.subject}
│❒ *ID:* ${info.id}
│❒ *Dono do grupo:* ${ownerTag}
│❒ *Criado em:* ${ts.day}, ${ts.date} de ${ts.month} de ${ts.year}, ${ts.time} (UTC)
│❒
│❒ *Participantes:* ${totalParticipants}
│❒ • Membros: ${membersCount}
│❒ • Administradores: ${adminsCount}
│❒
│❒ *Quem pode enviar mensagens:* ${info.announce ? 'Apenas administradores' : 'Todos os participantes'}
│❒ *Quem pode editar as informações:* ${info.restrict ? 'Apenas administradores' : 'Todos os participantes'}
│❒ *Quem pode adicionar participantes:* ${info.memberAddMode ? 'Todos os participantes' : 'Apenas administradores'}
│❒
│❒ Powered by 9bot.com.br
◈━━━━━━━━━━━━━━━━◈`;

        await client.sendMessage(
            m.chat,
            {
                image: { url: pp },
                caption,
                mentions: ownerJid ? [ownerJid] : []
            },
            { quoted: m }
        );
    } catch (error) {
        console.error('Error in profilegc command:', error);
        await client.sendMessage(
            m.chat,
            {
                text: formatStylishReply(
                    `Não foi possível obter as informações do grupo.\nDetalhes: ${error.message}`
                )
            },
            { quoted: m }
        );
    }
};
