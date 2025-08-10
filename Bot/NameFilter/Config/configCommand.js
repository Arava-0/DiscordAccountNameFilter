const { ChatInputCommandInteraction, SlashCommandBuilder, Client, InteractionContextType, PermissionFlagsBits } = require('discord.js');
const { genDisplayPage } = require('./displayer');
const Core = require('../../../Core');

module.exports = {
    type: "command",
    userCooldown: 1000,
    serverCooldown: null,
    globalCooldown: null,
    noDeferred: false,
    ephemeral: true,

    data: new SlashCommandBuilder()
    .setName("namefilter")
    .setNameLocalization("fr", "filtrenom")
    .setDescription("This command allows you to filter user names in the server.")
    .setDescriptionLocalization("fr", "Cette commande vous permet de filtrer les noms d'utilisateur sur le serveur.")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .setContexts(InteractionContextType.Guild),

    /**
     *
     * @param {ChatInputCommandInteraction} interaction
     * @param {Client} client
     */
    async execute(interaction, client) {
        const database = await Core.getConfigFile("nameFilterConfig");

        if (Core.isNullOrUndefined(database)) {
            return interaction.reply({
                content: `${client.config.emote.error} The name filter configuration file is not found.`,
                ephemeral: true
            });
        }

        if (Core.isNullOrUndefined(database.invalidPseudos) || !Array.isArray(database.invalidPseudos)) {
            database.invalidPseudos = [];
            await Core.updateConfig("nameFilterConfig", database);
        }

        const { embed, components } = await genDisplayPage(client, database.invalidPseudos, 1);
        return interaction.editReply({
            embeds: [embed],
            components: components
        });
    }
}
