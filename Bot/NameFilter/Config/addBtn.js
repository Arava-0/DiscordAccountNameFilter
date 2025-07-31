const { ModalBuilder, TextInputStyle, ActionRowBuilder, TextInputBuilder} = require("discord.js");
const Core = require("../../../Core");

module.exports = {
    id: "namefilter-add",
    noDeferred: true,
    ephemeral: true,
    type: `button`,

    async execute(interaction, client, page) {
        const modal = new ModalBuilder()
            .setCustomId("namefilter-add-modal")
            .setTitle("Ajouter un pseudo invalide")

        .addComponents(
            new ActionRowBuilder()
                .addComponents(
                    new TextInputBuilder()
                        .setCustomId("namefilter-add-input")
                        .setLabel("Pseudo invalide")
                        .setStyle(TextInputStyle.Short)
                        .setPlaceholder("Entrez le pseudo à ajouter")
                        .setRequired(true)
                )
        )

        await interaction.showModal(modal);
    }
};
