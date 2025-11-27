module.exports = async (context) => {

    const { client, m, text } = context;
    const wiki = require('wikipedia');

    const formatStylishReply = (message) => {
        return `◈━━━━━━━━━━━━━━━━◈\n│❒ ${message}\n┗━━━━━━━━━━━━━━━┛`;
    };

    try {
        if (!text) {
            return m.reply(
                formatStylishReply(
                    `Por favor, informe o termo que deseja pesquisar.\nExemplo: javascript`
                )
            );
        }

        const con = await wiki.summary(text);

        const texa = 
`◈━━━━━━━━━━━━━━━━◈
│❒ *${con.title}*
│
│📌 *Descrição:* ${con.description || 'Nenhuma descrição disponível.'}
│
│📄 *Resumo:* 
│ ${con.extract || 'Sem resumo encontrado.'}
│
│🔗 *Link:* ${con.content_urls?.mobile?.page || 'Não disponível.'}
┗━━━━━━━━━━━━━━━┛`;

        m.reply(texa);

    } catch (err) {
        console.log(err);
        return m.reply(
            formatStylishReply("Nada foi encontrado para esse termo. Tente outro! 🔎")
        );
    }
};
