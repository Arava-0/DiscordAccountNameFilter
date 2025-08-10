const { Client, Events, GuildMember, EmbedBuilder } = require('discord.js');
const Core = require('../../Core');

module.exports = {
    name: Events.GuildMemberAdd,
    type: "event",
    once: false,

    /**
     * @param {Client} client
     * @param {GuildMember} member
     */
    async execute(client, member) {
        const guild = member.guild;
        const database = await Core.getConfigFile("nameFilterConfig");
        const roleConfig = await Core.getConfigFile("nameFilterConfigRoles");

        let rolesToMention = ``;

        if (Core.isNullOrUndefined(database) || Core.isNullOrUndefined(database.invalidPseudos) || !Array.isArray(database.invalidPseudos)) {
            return;
        }

        if (Core.isNullOrUndefined(roleConfig) || Core.isNullOrUndefined(roleConfig.roles) || !Array.isArray(roleConfig.roles) || roleConfig.roles.length === 0) {
            rolesToMention = `Aucun rôle à mentionner configuré.`;
        } else {
            rolesToMention = roleConfig.roles.map(roleId => `<@&${roleId}>`).join(", ");
        }

        if (member.user.bot)
            return;

        const invalidPseudos = database.invalidPseudos.map(pseudo => pseudo.toLowerCase());
        const memberName = member.user.username.toLowerCase().replace(/\s+/g, '');
        const memberDisplayName = member?.displayName?.toLowerCase().replace(/\s+/g, '') || "";

        const staffChannel = guild.safetyAlertsChannel || guild.systemChannel;
        const matchedInvalid = invalidPseudos.find(invalid =>
            memberName.includes(invalid) || memberDisplayName.includes(invalid)
        );

        if (matchedInvalid) {
            const alertEmbed = new EmbedBuilder()
                .setTitle(`${client.config.emote.error} **ALERTE PSEUDO INVALID**`)
                .setColor("#920E15")
                .setDescription(`Le membre \`${member.user.tag}\` a rejoint le serveur avec un pseudo invalide.\n🔎 Mot détecté : \`${matchedInvalid}\``)
                .addFields(
                    { name: "__Nom d'utilisateur__", value: `\`\`\`${member.user.username}\`\`\``, inline: true },
                    { name: "__Nom d'affichage__", value: `\`\`\`${member.displayName}\`\`\``, inline: true },
                    { name: "__ID du membre__", value: `\`\`\`${member.id}\`\`\``, inline: true }
                );

            if (staffChannel)
                await staffChannel.send({ content: rolesToMention, embeds: [alertEmbed] }).catch(() => {});
            await member.kick(`Pseudo invalide: ${member.user.username} (${member.id}) - Mot détecté : \`${matchedInvalid}\``).catch(() => {});
        }
    }
}
