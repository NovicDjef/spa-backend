"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.replacePlaceholders = replacePlaceholders;
exports.generateMarketingMessage = generateMarketingMessage;
exports.generateClientFollowUpMessage = generateClientFollowUpMessage;
exports.generateEmailSubject = generateEmailSubject;
const openai_1 = __importDefault(require("openai"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
// Initialiser le client OpenAI
const openai = new openai_1.default({
    apiKey: process.env.OPENAI_API_KEY,
});
// Fonction utilitaire pour convertir le logo en base64
function getLogoBase64() {
    try {
        const logoPath = path.join(__dirname, '..', 'utils', 'logo_spa.png');
        const logoBuffer = fs.readFileSync(logoPath);
        return `data:image/png;base64,${logoBuffer.toString('base64')}`;
    }
    catch (error) {
        console.error('Erreur lors du chargement du logo:', error);
        return ''; // Retourner une chaîne vide si le logo n'est pas trouvé
    }
}
/**
 * Remplace les placeholders dans un message par les vraies valeurs du client
 * @param message Le message avec placeholders {prenom}, {nom}
 * @param prenom Le prénom du client
 * @param nom Le nom du client
 * @returns Le message personnalisé
 */
function replacePlaceholders(message, prenom, nom) {
    return message
        .replace(/{prenom}/g, prenom)
        .replace(/{nom}/g, nom);
}
/**
 * Génère un message marketing avec placeholders pour personnalisation
 * @param prompt Le prompt de l'utilisateur (ex: "Proposer une réduction de 10% sur les massages")
 * @param serviceType Type de service (MASSOTHERAPIE ou ESTHETIQUE) pour cibler l'expertise
 * @param additionalContext Contexte additionnel (type de clients, etc.)
 * @returns Le message généré par ChatGPT avec placeholders {prenom}, {nom}, {service}
 */
async function generateMarketingMessage(prompt, serviceType, additionalContext) {
    try {
        // Vérifier que la clé API est configurée
        if (!process.env.OPENAI_API_KEY) {
            throw new Error('La clé API OpenAI n\'est pas configurée. Veuillez ajouter OPENAI_API_KEY dans le fichier .env');
        }
        // Déterminer l'expertise à mettre en avant
        const expertiseText = serviceType === 'MASSOTHERAPIE'
            ? `EXPERTISE EN MASSOTHÉRAPIE ET KINÉSITHÉRAPIE:
   - Massages (découverte, thérapeutique, dos & nuque, sous la pluie, flush massage, kinésithérapie, femme enceinte, reiki, deep tissue)
   - Techniques de relaxation et gestion du stress
   - Soulagement des douleurs musculaires et articulaires
   - Amélioration de la circulation sanguine et lymphatique
   - Rééducation fonctionnelle et amélioration de la mobilité`
            : serviceType === 'ESTHETIQUE'
                ? `EXPERTISE EN ESTHÉTIQUE:
   - Soins du visage et du corps
   - Anti-âge et régénération cellulaire
   - Hydratation et nutrition de la peau
   - Traitement des imperfections cutanées
   - Techniques d'esthétique avancées`
                : `EXPERTISE EN MASSOTHÉRAPIE, KINÉSITHÉRAPIE ET ESTHÉTIQUE:
   - Massages thérapeutiques et relaxation
   - Rééducation et amélioration de la mobilité
   - Soins esthétiques du visage et du corps
   - Anti-âge et régénération cellulaire`;
        // Construire le prompt système pour guider ChatGPT
        const systemPrompt = `Tu es un expert reconnu en massothérapie, kinésithérapie et esthétique, avec une vaste connaissance des pratiques professionnelles et des bienfaits thérapeutiques.

Tu travailles pour le Spa Renaissance, un établissement de luxe spécialisé en massothérapie, kinésithérapie et esthétique.

COORDONNÉES DU SPA RENAISSANCE:
📍 Adresse: 451 avenue Arnaud, suite 101, Sept-Îles, Québec G4R 3B3
📞 Téléphone: 418-968-0606
✉️  Email: info@sparenaissance.ca

IMPORTANT: Inclure le téléphone (418-968-0606) dans le message pour la prise de rendez-vous.

${expertiseText}

RÈGLES IMPORTANTES POUR LA PERSONNALISATION:

- ✅ PLACEHOLDERS: Utilise {prenom} et {nom} pour la personnalisation
  Exemple: "Bonjour {prenom} {nom}," ou "Chère {prenom},"

- ✅ CIBLAGE: Ne parler QUE du service mentionné dans la demande
  ❌ Ne PAS lister tous les services du spa
  ✅ Rester CIBLÉ sur le service demandé

- ✅ NOM DU SPA: TOUJOURS utiliser "Spa Renaissance" dans le message

- ✅ EXPERTISE CIBLÉE:
  - Démontrer l'expertise SPÉCIFIQUE au service demandé
  - Expliquer les bienfaits thérapeutiques de CE service uniquement
  - Vocabulaire professionnel mais accessible

- ✅ TON: Professionnel, expert, chaleureux, rassurant

- ✅ FORMAT: HTML avec styles inline (PAS de <html>, <head>, <body>)
  - Couleurs élégantes: verts (#2c5f2d), bleus, dorés
  - Mise en page aérée et professionnelle

Structure suggérée:
- Salutation: "Bonjour {prenom} {nom}," ou "Chère {prenom},"
- Titre accrocheur sur le service spécifique
- Introduction experte sur les bienfaits du service
- Détails de l'offre avec expertise
- Bienfaits thérapeutiques spécifiques
- Appel à l'action clair
- Signature: "L'équipe du Spa Renaissance"

IMPORTANT: Les placeholders {prenom} et {nom} seront remplacés automatiquement pour chaque client.`;
        // Construire le prompt utilisateur
        const userPrompt = `Crée un message marketing professionnel pour le Spa Renaissance.

DEMANDE DE L'ADMINISTRATEUR: ${prompt}

${additionalContext ? `CONTEXTE ADDITIONNEL: ${additionalContext}` : ''}

⚠️ LONGUEUR MAXIMALE: 150 MOTS (pour ne pas décourager le lecteur)

DIRECTIVES IMPORTANTES:

1. PERSONNALISATION AVEC PLACEHOLDERS:
   - ⚠️ IMPORTANT: Utilise {prenom} et {nom} comme placeholders
   - Exemple de salutation: "Bonjour {prenom} {nom}," ou "Chère {prenom},"
   - Ne PAS inventer de nom, utilise TOUJOURS les placeholders

2. CIBLAGE DU SERVICE:
   - Parler UNIQUEMENT du service mentionné dans la demande
   - ❌ Ne PAS lister tous les services du spa
   - ✅ Rester CIBLÉ et CONCIS sur le service demandé
   - Expliquer les bienfaits thérapeutiques de CE service uniquement

3. NOM DU SPA:
   - TOUJOURS utiliser "Spa Renaissance" dans le message
   - Mentionner l'expertise des thérapeutes du Spa Renaissance

4. STRUCTURE DU MESSAGE (COURTE ET IMPACTANTE):
   - Salutation avec placeholders: "Bonjour {prenom} {nom}," ou "Chère {prenom},"
   - Titre accrocheur sur le service spécifique
   - 2-3 phrases sur les bienfaits de CE service
   - Détails de l'offre (court et clair)
   - Appel à l'action clair
   - Signature : "L'équipe du Spa Renaissance"

5. STYLE ET FORMAT:
   - HTML avec styles inline (PAS de <html>, <head>, <body>)
   - Couleurs élégantes : verts (#2c5f2d), bleus, dorés
   - Mise en page aérée et professionnelle
   - Espaces bien définis

6. TON:
   - Professionnel et expert
   - Chaleureux et personnalisé
   - Rassurant et inspirant confiance
   - CONCIS et impactant (max 150 mots)

EXEMPLE DE SALUTATION CORRECTE:
"Bonjour {prenom} {nom}," ✅
"Chère {prenom}," ✅
"Bonjour Marie," ❌ (ne pas inventer de nom)

⚠️ CRITIQUE: Le message doit être COURT (max 150 mots) pour être lu jusqu'au bout!

IMPORTANT: Les placeholders {prenom} et {nom} seront remplacés par les vrais noms des clients lors de l'envoi.`;
        // Appeler l'API ChatGPT
        const completion = await openai.chat.completions.create({
            model: 'gpt-4.1-mini', // Utilise gpt-4.1-mini pour de meilleurs résultats
            messages: [
                {
                    role: 'system',
                    content: systemPrompt
                },
                {
                    role: 'user',
                    content: userPrompt
                }
            ],
            temperature: 0.7, // Créativité modérée
            max_tokens: 300, // Réduit pour limiter à ~150 mots
        });
        // Extraire le message généré
        const generatedMessage = completion.choices[0]?.message?.content;
        if (!generatedMessage) {
            throw new Error('Aucun message n\'a été généré par ChatGPT');
        }
        return generatedMessage.trim();
    }
    catch (error) {
        console.error('Erreur lors de la génération du message avec ChatGPT:', error);
        // Messages d'erreur plus spécifiques
        if (error.code === 'invalid_api_key') {
            throw new Error('Clé API OpenAI invalide. Veuillez vérifier votre configuration.');
        }
        if (error.code === 'insufficient_quota') {
            throw new Error('Quota OpenAI insuffisant. Veuillez vérifier votre compte OpenAI.');
        }
        throw new Error(`Erreur lors de la génération du message: ${error.message}`);
    }
}
/**
 * Génère un message de suivi client personnalisé basé sur la note du thérapeute
 * @param noteContent Le contenu de la note du thérapeute
 * @param clientFirstName Le prénom du client
 * @param clientLastName Le nom du client
 * @param therapistName Le nom du thérapeute
 * @param serviceType Type de service (MASSOTHERAPIE ou ESTHETIQUE)
 * @returns Un objet avec le sujet et le message généré
 */
async function generateClientFollowUpMessage(noteContent, clientFirstName, clientLastName, therapistName, serviceType) {
    try {
        if (!process.env.OPENAI_API_KEY) {
            throw new Error('La clé API OpenAI n\'est pas configurée');
        }
        const serviceTypeFr = serviceType === 'MASSOTHERAPIE' ? 'massothérapie' : 'esthétique';
        const systemPrompt = `Tu es un expert en ${serviceTypeFr} travaillant pour le Spa Renaissance, un établissement de luxe reconnu pour son expertise professionnelle.

INFORMATIONS DU SPA RENAISSANCE:
📍 Adresse: 451 avenue Arnaud, suite 101, Sept-Îles, Québec G4R 3B3
📞 Téléphone: 418-968-0606
✉️  Email: info@sparenaissance.ca

MISSION:
À partir de la note clinique du thérapeute, créer un message de suivi personnalisé et professionnel pour le client.

RÈGLES IMPORTANTES:

1. LONGUEUR: 120 à 150 mots MAXIMUM (critique pour maintenir l'attention)

2. STRUCTURE DU MESSAGE:
   - Salutation personnalisée avec le nom du client
   - Remerciement chaleureux pour sa visite
   - Résumé professionnel du traitement (basé sur la note du thérapeute)
   - Conseils pratiques personnalisés (2-3 maximum, pertinents à la note)
   - Recommandation de suivi SI pertinent selon la note (pas systématique)
   - Invitation à donner son avis (lien fourni)
   - Signature professionnelle

3. TON ET STYLE:
   - Professionnel mais chaleureux et humain
   - Courtois et respectueux
   - Rassurant et bienveillant
   - Écrit comme si c'était le thérapeute qui écrivait personnellement
   - Vocabulaire professionnel mais accessible

4. RECOMMANDATION DE SUIVI:
   - SEULEMENT si la note du thérapeute indique un besoin de suivi
   - Exemples: douleurs persistantes, tensions importantes, traitement en plusieurs séances
   - NE PAS recommander de suivi pour des soins simples/détente

5. FORMAT HTML:
   - HTML simple avec styles inline pour le contenu
   - Paragraphes bien espacés (<p> avec style)
   - Listes à puces pour les conseils
   - Bouton CTA pour le lien d'avis
   - PAS d'en-tête ou pied de page (déjà inclus automatiquement)
   - Ne PAS inclure le nom du spa dans le message (déjà dans l'en-tête)

6. MENTIONS OBLIGATOIRES À LA FIN:
   - "Ce courriel est automatique et ne nécessite pas de réponse."
   - "Le formulaire d'avis est entièrement anonyme - vos informations personnelles ne sont pas enregistrées."
   - "Votre avis nous aide à améliorer nos services pour mieux vous satisfaire."

IMPORTANT: Le message doit sembler écrit personnellement par le thérapeute, pas par un robot.`;
        const userPrompt = `Note du thérapeute sur le traitement:
"${noteContent}"

Client: ${clientFirstName} ${clientLastName}
Thérapeute: ${therapistName}
Type de service: ${serviceTypeFr}

Crée un message de suivi professionnel et personnalisé pour ce client.

STRUCTURE ATTENDUE (contenu uniquement, sans en-tête/pied de page):
1. Salutation: "Bonjour ${clientFirstName}," ou "Chère ${clientFirstName},"
2. Remerciement chaleureux
3. Résumé du traitement basé sur la note
4. 2-3 conseils pratiques en liste à puces HTML
5. Recommandation de suivi UNIQUEMENT si la note l'indique
6. Bouton/lien vers l'avis: https://dospa.novic.dev/avis
7. Mentions obligatoires (email automatique, anonymat, etc.)
8. Signature simple: "${therapistName}, Massothérapeute/Esthéticienne"

⚠️ NE PAS inclure:
- En-tête avec logo (déjà ajouté automatiquement)
- Pied de page avec coordonnées (déjà ajouté automatiquement)
- Nom du spa dans l'en-tête du message (déjà dans le bandeau)

⚠️ LONGUEUR: 120-150 mots MAXIMUM
⚠️ Basé UNIQUEMENT sur la note du thérapeute
⚠️ Ton professionnel mais chaleureux`;
        const completion = await openai.chat.completions.create({
            model: 'gpt-4.1-mini',
            messages: [
                {
                    role: 'system',
                    content: systemPrompt
                },
                {
                    role: 'user',
                    content: userPrompt
                }
            ],
            temperature: 0.7,
            max_tokens: 400,
        });
        const generatedMessage = completion.choices[0]?.message?.content;
        if (!generatedMessage) {
            throw new Error('Aucun message n\'a été généré par ChatGPT');
        }
        // Récupérer le logo en base64
        const logoBase64 = getLogoBase64();
        // Envelopper le message avec le logo du Spa Renaissance
        const messageWithLogo = `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #ffffff;">
  <!-- En-tête avec logo -->
  <div style="background: linear-gradient(135deg, #2c5f2d 0%, #1a3d1f 100%);
              padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
    ${logoBase64 ? `<img src="${logoBase64}" alt="Spa Renaissance" style="max-width: 200px; height: auto; margin-bottom: 15px;">` : ''}
    <h1 style="margin: 0; font-size: 28px; color: white; font-weight: bold;">Spa Renaissance</h1>
    <p style="margin: 10px 0 0 0; font-size: 14px; color: #e0e0e0;">Suivi de votre soin</p>
  </div>

  <!-- Contenu du message généré par ChatGPT -->
  <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
    ${generatedMessage}
  </div>

  <!-- Pied de page avec informations du spa -->
  <div style="margin-top: 20px; padding: 20px; background: #f5f5f5; border-radius: 10px;
              text-align: center; color: #777; font-size: 12px;">
    <p style="margin: 0 0 10px 0; font-weight: bold; color: #2c5f2d; font-size: 14px;">
      Spa Renaissance
    </p>
    <p style="margin: 0 0 5px 0;">
      📍 451 avenue Arnaud, suite 101, Sept-Îles, Québec G4R 3B3
    </p>
    <p style="margin: 0 0 5px 0;">
      📞 418-968-0606
    </p>
    <p style="margin: 0;">
      ✉️ info@sparenaissance.ca
    </p>
  </div>
</div>`;
        // Générer aussi un sujet personnalisé
        const subjectCompletion = await openai.chat.completions.create({
            model: 'gpt-4.1-mini',
            messages: [
                {
                    role: 'system',
                    content: `Crée un sujet d'email professionnel et chaleureux pour un email de suivi après un soin en ${serviceTypeFr}. Max 60 caractères. Le sujet doit être personnalisé et professionnel.`
                },
                {
                    role: 'user',
                    content: `Crée un sujet pour un email de suivi après un soin en ${serviceTypeFr} pour ${clientFirstName} ${clientLastName}. Le soin était: ${noteContent.substring(0, 100)}`
                }
            ],
            temperature: 0.8,
            max_tokens: 30,
        });
        const subject = subjectCompletion.choices[0]?.message?.content?.trim().replace(/^[\"']|[\"']$/g, '') ||
            `Votre soin au Spa Renaissance - Suivi personnalisé`;
        return {
            subject,
            message: messageWithLogo.trim()
        };
    }
    catch (error) {
        console.error('Erreur lors de la génération du message de suivi:', error);
        throw new Error(`Erreur lors de la génération du message: ${error.message}`);
    }
}
/**
 * Génère un objet/sujet d'email accrocheur avec ChatGPT
 * @param prompt Le prompt de l'utilisateur
 * @returns Le sujet d'email généré
 */
async function generateEmailSubject(prompt) {
    try {
        if (!process.env.OPENAI_API_KEY) {
            throw new Error('La clé API OpenAI n\'est pas configurée');
        }
        const completion = await openai.chat.completions.create({
            model: 'gpt-4.1-mini',
            messages: [
                {
                    role: 'system',
                    content: `Tu es un expert en massothérapie, kinésithérapie et esthétique, spécialisé en marketing par email pour un spa professionnel de luxe.

Crée des sujets d'email qui:
- Mettent en avant les bienfaits thérapeutiques ou esthétiques
- Utilisent un vocabulaire professionnel mais accessible
- Inspirent confiance et expertise
- Donnent envie d'ouvrir l'email
- Restent élégants et non agressifs
- Font max 60 caractères

Exemples de bons sujets:
- "Soulagez vos tensions musculaires - Offre exclusive"
- "Votre peau mérite le meilleur - 20% de réduction"
- "Retrouvez votre mobilité avec nos experts"
- "Bien-être thérapeutique à portée de main"`
                },
                {
                    role: 'user',
                    content: `Crée un sujet d'email professionnel et expert pour cette campagne: ${prompt}`
                }
            ],
            temperature: 0.8,
            max_tokens: 50,
        });
        const subject = completion.choices[0]?.message?.content?.trim();
        if (!subject) {
            throw new Error('Aucun sujet n\'a été généré');
        }
        // Retirer les guillemets si ChatGPT en a ajouté
        return subject.replace(/^["']|["']$/g, '');
    }
    catch (error) {
        console.error('Erreur lors de la génération du sujet:', error);
        throw new Error(`Erreur lors de la génération du sujet: ${error.message}`);
    }
}
//# sourceMappingURL=chatgpt.js.map