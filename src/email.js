const path = require("path");
const nodemailer = require("nodemailer");
const Email = require("email-templates");

const transport = nodemailer.createTransport({
  sendmail: true
});

const i18n = {
  directory: path.resolve(__dirname, "locales"),
  locales: ["de-CH", "de-DE"],
  defaultLocale: "de-DE"
};

const views = {
  options: {
    extension: "ejs"
  }
};

module.exports.sendMail = (to, template, locale, variables = {}) => {
  const email = new Email({
    message: {
      from: "noreply@words.tyratox.ch"
    },
    transport,
    i18n,
    views,
    juice: true,
    juiceResources: {
      preserveImportant: true,
      webResources: {
        relativeTo: path.resolve(__dirname, "styles/emails/")
      }
    }
  });

  return email.send({
    template: path.resolve(__dirname, "emails", template),
    message: {
      to
    },
    locals: { locale, ...variables }
  });
};
