const { ModalBuilder, TextInputStyle, ActionRowBuilder, TextInputBuilder} = require("discord.js");
const Core = require("../../../Core");

module.exports = {
    id: "namefilter-remove",
    noDeferred: true,
    ephemeral: true,
    type: `button`,

    async execute(interaction, client, page) {
        const modal = new ModalBuilder()
            .setCustomId("namefilter-remove-modal")
            .setTitle("Retirer un pseudo invalide")

        .addComponents(
            new ActionRowBuilder()
                .addComponents(
                    new TextInputBuilder()
                        .setCustomId("namefilter-remove-input")
                        .setLabel("Pseudo invalide à retirer")
                        .setStyle(TextInputStyle.Short)
                        .setPlaceholder("Entrez le pseudo à retirer")
                        .setRequired(true)
                )
        )

        await interaction.showModal(modal);
    }
};
