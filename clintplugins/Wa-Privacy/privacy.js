module.exports = async (context) => {

    const ownerMiddleware = require('../../utility/botUtil/Ownermiddleware');
    await ownerMiddleware(context, async () => {

        const { client, m } = context;

        const Myself = await client.decodeJid(client.user.id);
        
        const {
            readreceipts,
            profile,
            status,
            online,
            last,
            groupadd,
            calladd
        } = await client.fetchPrivacySettings(true);
        
        const fnn = `*Configurações de Privacidade Atuais*

* Nome: ${client.user.name}
* Online: ${online}
* Foto de perfil: ${profile}
* Visto por último: ${last}
* Confirmação de leitura: ${readreceipts}
* Quem pode adicionar em grupos: ${groupadd}
* Status: ${status}
* Quem pode te ligar: ${calladd}`;

        const avatar = await client.profilePictureUrl(Myself, 'image').catch(_ => 'https://telegra.ph/file/b34645ca1e3a34f1b3978.jpg');

        await client.sendMessage(
            m.chat,
            { image: { url: avatar }, caption: fnn },
            { quoted: m }
        );

    });

};
