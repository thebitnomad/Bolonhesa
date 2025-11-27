const ownerMiddleware = require('../../utility/botUtil/Ownermiddleware'); 

module.exports = async (context) => {
    await ownerMiddleware(context, async () => {

        const { client, m, args, participants, text } = context;

        // Verificação de uso em grupo
        if (!m.isGroup) {
            return m.reply(
                "◈━━━━━━━━━━━━━━━━◈\n" +
                "│❒ Este comando só pode ser usado em grupos.\n" +
                "◈━━━━━━━━━━━━━━━━◈"
            );
        }

        // Mensagem padrão (se nenhuma for informada)
        const messageText = text?.trim() || "Atenção aqui!";

        // Enviar mensagem mencionando todos os membros
        await client.sendMessage(
            m.chat,
            { 
                text: messageText,
                mentions: participants.map((user) => user.id)
            },
            { quoted: m }
        );

    });
};
