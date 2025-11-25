import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

const resources = {
  en: {
    translation: {
      title: "Ecofest Dakar — 30 Nov → 06 Dec 2025",
      subtitle: "Registration — International Access",
      submit: "Submit registration",
      success: "Registration received — we'll email you when validated.",
      error: "An error occurred, please try again.",
      fields: {
        firstName: "First name",
        lastName: "Last name",
        email: "Email",
        phone: "Phone",
        nationality: "Nationality",
        provenance: "Provenance / City",
        profileType: "Profile",
        passport: "Passport / ID (photo)",
        address: "Full address",
        dob: "Date of birth",
      },
      profiles: {
        festivalier: "Festival-goers",
        press: "Press",
        artistesprofessionnels: "Professional artists",
      }
    }
  },
  fr: {
    translation: {
      title: "Ecofest Dakar — 30 Nov → 06 Dec 2025",
      subtitle: "Inscription — Accès international",
      submit: "Envoyer l'inscription",
      success: "Inscription reçue — nous vous informerons par e-mail après validation.",
      error: "Une erreur est survenue, réessayez.",
      fields: {
        firstName: "Prénom",
        lastName: "Nom",
        email: "Email",
        phone: "Téléphone",
        nationality: "Nationalité",
        provenance: "Provenance / Ville",
        profileType: "Type de profil",
        passport: "Passeport / CNI (photo)",
        address: "Adresse complète",
        dob: "Date de naissance",
      },
      profiles: {
        festivalier: "Festivaliers",
        press: "Presse",
        artistesprofessionnels: "Artistes professionnels",
      }
    }
  },
  pt: {
    translation: {
      title: "Ecofest Dakar — 30 Nov → 06 Dez 2025",
      subtitle: "Inscrição — Acesso internacional",
      submit: "Enviar inscrição",
      success: "Inscrição recebida — iremos informá-lo por e-mail após validação.",
      error: "Ocorreu um erro, por favor tente novamente.",
      fields: {
        firstName: "Nome",
        lastName: "Sobrenome",
        email: "Email",
        phone: "Telefone",
        nationality: "Nacionalidade",
        provenance: "Proveniência / Cidade",
        profileType: "Tipo de perfil",
        passport: "Passaporte / BI (foto)",
        address: "Endereço completo",
        dob: "Data de nascimento",
      },
      profiles: {
        festivalier: "Frequentadores do festival",
        press: "Imprensa",
        artistesprofessionnels: "Artistas profissionais",
      }
    }
  }
}

i18n.use(initReactI18next).init({
  resources,
  lng: 'fr',
  fallbackLng: 'fr',
  interpolation: { escapeValue: false }
})

export default i18n
