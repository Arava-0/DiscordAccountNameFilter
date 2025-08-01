const { Client, Events, GuildMember, EmbedBuilder } = require('discord.js');
const Core = require('../../Core');

module.exports = {
    name: Events.GuildMemberUpdate,
    type: "event",
    once: false,

    /**
     * @param {Client} client
     * @param {GuildMember} oldMember
     * @param {GuildMember} newMember
     */
    async execute(client, oldMember, newMember) {
        const guild = newMember.guild;

        const database = await Core.getConfigFile("nameFilterConfig");

        if (
            Core.isNullOrUndefined(database) ||
            Core.isNullOrUndefined(database.invalidPseudos) ||
            !Array.isArray(database.invalidPseudos)
        ) {
            return;
        }

        const invalidPseudos = database.invalidPseudos.map(p => p.toLowerCase());

        const username = newMember.user.username.toLowerCase().replace(/\s+/g, '');
        const displayName = newMember?.displayName?.toLowerCase().replace(/\s+/g, '') || "";

        const matchedInvalid = invalidPseudos.find(invalid =>
            username.includes(invalid) || displayName.includes(invalid)
        );

        if (matchedInvalid) {
            const staffChannel = guild.safetyAlertsChannel || guild.systemChannel;

            const alertEmbed = new EmbedBuilder()
                .setTitle(`${client.config.emote.error} **ALERTE PSEUDO INVALID (modification)**`)
                .setColor("#920E15")
                .setDescription(`Le membre \`${newMember.user.tag}\` a modifié son pseudo ou surnom en un nom invalide.\n🔎 Mot détecté : \`${matchedInvalid}\``)
                .addFields(
                    { name: "__Ancien pseudo__", value: `\`\`\`${oldMember.user.username}\`\`\``, inline: true },
                    { name: "__Nouveau pseudo__", value: `\`\`\`${username}\`\`\``, inline: true },
                    { name: "__Ancien surnom__", value: `\`\`\`${oldMember.displayName}\`\`\``, inline: true },
                    { name: "__Nouveau surnom__", value: `\`\`\`${displayName}\`\`\``, inline: true },
                    { name: "__ID du membre__", value: `\`\`\`${newMember.id}\`\`\``, inline: true }
                );

            if (staffChannel)
                await staffChannel.send({ embeds: [alertEmbed] }).catch(() => {});

            await newMember.kick(`Pseudo invalide: ${username} (${newMember.id}) - Mot détecté : ${matchedInvalid}`)
                .catch(() => {});
        }
    }
};
