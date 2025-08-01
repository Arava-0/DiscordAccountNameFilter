const { Client, Events, Message, EmbedBuilder } = require('discord.js');
const Core = require('../../Core');

module.exports = {
    name: Events.MessageCreate,
    type: "event",
    once: false,

    /**
     * @param {Client} client
     * @param {Message} message
     */
    async execute(client, message) {
        if (message.author.bot) return;

        const guild = message.guild;
        if (!guild) return;

        const database = await Core.getConfigFile("nameFilterConfig");

        if (Core.isNullOrUndefined(database) || Core.isNullOrUndefined(database.invalidPseudos) || !Array.isArray(database.invalidPseudos)) {
            return;
        }

        const invalidPseudos = database.invalidPseudos.map(pseudo => pseudo.toLowerCase());
        const member = message.member;
        const memberName = message.author.username.toLowerCase().replace(/\s+/g, '');
        const memberDisplayName = member?.displayName?.toLowerCase().replace(/\s+/g, '') || "";

        const matchedInvalid = invalidPseudos.find(invalid =>
            memberName.includes(invalid) || memberDisplayName.includes(invalid)
        );

        if (matchedInvalid) {
            const staffChannel = guild.safetyAlertsChannel || guild.systemChannel;

            const alertEmbed = new EmbedBuilder()
                .setTitle(`${client.config.emote.error} **ALERTE PSEUDO INVALID**`)
                .setColor("#920E15")
                .setDescription(`Le membre \`${message.author.tag}\` a envoyé un message avec un pseudo invalide.\n🔎 Mot détecté : \`${matchedInvalid}\``)
                .addFields(
                    { name: "__Nom d'utilisateur__", value: `\`\`\`${message.author.username}\`\`\``, inline: true },
                    { name: "__Nom d'affichage__", value: `\`\`\`${member?.displayName || "Inconnu"}\`\`\``, inline: true },
                    { name: "__ID du membre__", value: `\`\`\`${message.author.id}\`\`\``, inline: true }
                );

            if (staffChannel)
                await staffChannel.send({ embeds: [alertEmbed] }).catch(() => {});

            await message.member.kick(`Pseudo invalide: ${message.author.username} (${message.author.id}) - Mot détecté : ${matchedInvalid}`)
                .catch(() => {});
        }
    }
};
