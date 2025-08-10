const { ChatInputCommandInteraction, SlashCommandBuilder, Client, InteractionContextType, EmbedBuilder } = require('discord.js');
const Core = require('../../../Core');

module.exports = {
  type: "command",
  userCooldown: 1000,
  serverCooldown: null,
  globalCooldown: null,
  noDeferred: false,
  ephemeral: true,

  data: new SlashCommandBuilder()
    .setName("namefilter-alert")
    .setNameLocalization("fr", "filtrenom-alerte")
    .setDescription("This command allows you to choose which role are mentioned when an alert is triggered.")
    .setDescriptionLocalization("fr", "Cette commande vous permet de choisir quel rôle est mentionné lorsqu'une alerte est déclenchée.")
    .setContexts(InteractionContextType.Guild)
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand(subcommand =>
      subcommand
        .setName("add")
        .setNameLocalization("fr", "ajouter")
        .setDescription("Add a role to mention.")
        .setDescriptionLocalization("fr", "Ajouter un rôle à mentionner.")
        .addRoleOption(option =>
          option
            .setName("role")
            .setDescription("The role to mention.")
            .setDescriptionLocalization("fr", "Le rôle à mentionner.")
            .setRequired(true)
        )
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName("remove")
        .setNameLocalization("fr", "retirer")
        .setDescription("Remove a role from mention.")
        .setDescriptionLocalization("fr", "Retirer un rôle à mentionner.")
        .addRoleOption(option =>
          option
            .setName("role")
            .setDescription("The role to remove from mention.")
            .setDescriptionLocalization("fr", "Le rôle à retirer de la mention.")
            .setRequired(true)
        )
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName("list")
        .setNameLocalization("fr", "liste")
        .setDescription("List roles set to be mentioned.")
        .setDescriptionLocalization("fr", "Lister les rôles mentionnés.")
    ),

  /**
   * @param {ChatInputCommandInteraction} interaction
   * @param {Client} client
   */
  async execute(interaction, client) {
    const errorColor = "#920E15";
    const successColor = "#00BF63";
    const infoColor = "#2B6CB0";

    const makeError = (desc) => new EmbedBuilder()
      .setTitle(`${client.config.emote.error} **ERREUR**`)
      .setColor(errorColor)
      .setDescription(desc);

    const makeSuccess = (desc) => new EmbedBuilder()
      .setTitle(`${client.config.emote.success} **SUCCÈS**`)
      .setColor(successColor)
      .setDescription(desc);

    const makeInfo = (title, desc) => new EmbedBuilder()
      .setTitle(`${client.config.emote.update} **INFO**`)
      .setColor(infoColor)
      .setDescription(desc);

    const database = await Core.getConfigFile("nameFilterConfigRoles");

    if (Core.isNullOrUndefined(database)) {
      return interaction.editReply({
        embeds: [
          makeError(`Le fichier de configuration \`nameFilterConfigRoles\` est introuvable.`)
        ],
        ephemeral: true
      });
    }

    if (Core.isNullOrUndefined(database.roles) || !Array.isArray(database.roles)) {
      database.roles = [];
      await Core.updateConfig("nameFilterConfigRoles", database);
    }

    const command = interaction.options.getSubcommand();

    switch (command) {
      case "add": {
        const addRole = interaction.options.getRole("role");
        if (!addRole) {
          return interaction.editReply({
            embeds: [makeError(`Aucun rôle fourni ou rôle introuvable.`)],
            ephemeral: true
          });
        }

        // already present ?
        if (database.roles.includes(addRole.id)) {
          return interaction.editReply({
            embeds: [
              new EmbedBuilder()
                .setTitle(`${client.config.emote.error} **ERREUR**`)
                .setColor(errorColor)
                .setDescription(`Le rôle \`${addRole.name}\` est **déjà** dans la liste des rôles à mentionner.`)
                .addFields(
                  { name: "__Rôle__", value: `<@&${addRole.id}> (\`${addRole.id}\`)`, inline: true }
                )
            ],
            ephemeral: true
          });
        }

        database.roles.push(addRole.id);
        // déduplication par sécurité
        database.roles = Array.from(new Set(database.roles));
        await Core.updateConfig("nameFilterConfigRoles", database);

        return interaction.editReply({
          embeds: [
            new EmbedBuilder()
              .setTitle(`${client.config.emote.success} **SUCCÈS**`)
              .setColor(successColor)
              .setDescription(`Le rôle \`${addRole.name}\` a été **ajouté** à la liste des rôles mentionnés.`)
              .addFields(
                { name: "__Rôle__", value: `<@&${addRole.id}> (\`${addRole.id}\`)`, inline: true },
                { name: "__Total__", value: `\`${database.roles.length}\` rôles`, inline: true }
              )
          ],
          ephemeral: true
        });
      }

      case "remove": {
        const removeRole = interaction.options.getRole("role");
        if (!removeRole) {
          return interaction.editReply({
            embeds: [makeError(`Aucun rôle fourni ou rôle introuvable.`)],
            ephemeral: true
          });
        }

        if (!database.roles.includes(removeRole.id)) {
          return interaction.editReply({
            embeds: [
              new EmbedBuilder()
                .setTitle(`${client.config.emote.error} **ERREUR**`)
                .setColor(errorColor)
                .setDescription(`Le rôle \`${removeRole.name}\` **n'est pas** dans la liste des rôles à mentionner.`)
                .addFields(
                  { name: "__Rôle__", value: `<@&${removeRole.id}> (\`${removeRole.id}\`)`, inline: true }
                )
            ],
            ephemeral: true
          });
        }

        database.roles = database.roles.filter(roleId => roleId !== removeRole.id);
        await Core.updateConfig("nameFilterConfigRoles", database);

        return interaction.editReply({
          embeds: [
            new EmbedBuilder()
              .setTitle(`${client.config.emote.success} **SUCCÈS**`)
              .setColor(successColor)
              .setDescription(`Le rôle \`${removeRole.name}\` a été **retiré** de la liste des rôles mentionnés.`)
              .addFields(
                { name: "__Rôle__", value: `<@&${removeRole.id}> (\`${removeRole.id}\`)`, inline: true },
                { name: "__Total__", value: `\`${database.roles.length}\` rôles`, inline: true }
              )
          ],
          ephemeral: true
        });
      }

      case "list": {
        if (database.roles.length === 0) {
          return interaction.editReply({
            embeds: [
              makeInfo("LISTE VIDE", `Aucun rôle n'est configuré pour être mentionné.`)
            ],
            ephemeral: true
          });
        }

        const mentions = database.roles.map(roleId => `<@&${roleId}>`).join(", ");
        return interaction.editReply({
          embeds: [
            new EmbedBuilder()
              .setTitle(`${client.config.emote.update} **RÔLES MENTIONNÉS**`)
              .setColor(infoColor)
              .setDescription(`Rôles actuellement configurés : ${mentions}`)
              .addFields(
                { name: "__Total__", value: `\`${database.roles.length}\` rôles`, inline: true }
              )
          ],
          ephemeral: true
        });
      }
    }
  }
};
