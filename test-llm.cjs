#!/usr/bin/env node
/* Test de la génération de lettre — même appel fetch que le handler IPC de main.js
 * Usage : node test-llm.cjs <cle_api>
 * Pour obtenir une clé gratuite : https://platform.deepseek.com/api_keys
 */

const endpoint = process.env.ENDPOINT || 'https://api.deepseek.com/v1'
const modele = process.env.MODELE || 'deepseek-chat'
const cleApi = process.argv[2]

if (!cleApi) {
  console.error('Usage: node test-llm.cjs <votre_cle_api>')
  console.error('')
  console.error('Pas de clé ? Crée-en une gratuitement :')
  console.error('  1. Va sur https://platform.deepseek.com/api_keys')
  console.error('  2. Crée un compte (5€ offerts automatiquement)')
  console.error('  3. Copie ta clé et relance :')
  console.error('     node test-llm.cjs sk-xxx...')
  process.exit(1)
}

async function main() {
  console.log('=== Test génération lettre ===')
  console.log(`Endpoint : ${endpoint}/chat/completions`)
  console.log(`Modèle   : ${modele}`)
  console.log('')

  const systemPrompt = `Tu es un assistant spécialisé dans la rédaction de lettres de motivation pour une architecte.

Règles :
- Lettre personnalisée : adapte chaque phrase à l'offre spécifique et au profil réel du candidat.
- Naturelle en français : phrasé varié, ton humain et professionnel.
- Incorpore naturellement les mots-clés et compétences de l'offre pour passer les filtres ATS.
- 3 paragraphes maximum : accroche, démonstration des compétences, proposition de rendez-vous.
- Ne pas inventer d'expériences ou compétences que le candidat n'a pas mentionnées.
- Si le candidat n'a pas exactement les compétences demandées, les reformuler en compétences transférables.

Profil du candidat :
Nom : Maria Dubois
Titre : Architecte DE-HMON
Compétences : BIM, Revit, AutoCAD, réglementation française, conception, coordination de projets, management d'équipe
Langues : Français (courant), Anglais (courant), Espagnol (bilingue)

Offre :
Titre : Architecte BIM
Entreprise : Atelier d'architecture Paris
Description : Recherche architecte BIM confirmé pour rejoindre notre équipe. Vous interviendrez sur des projets de rénovation et de construction neuve. Maîtrise de Revit indispensable, connaissance de la RE2020 appréciée. Anglais courant requis.`

  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: 'Rédige une lettre de motivation personnalisée pour cette offre.' },
  ]

  try {
    console.log('Envoi de la requête...')

    const response = await fetch(`${endpoint}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${cleApi}`,
      },
      body: JSON.stringify({
        model: modele,
        messages,
        temperature: 0.7,
        max_tokens: 1000,
      }),
    })

    if (!response.ok) {
      const errText = await response.text()
      console.error(`ERREUR HTTP ${response.status}: ${errText}`)
      process.exit(1)
    }

    const data = await response.json()
    const contenu = data.choices?.[0]?.message?.content

    if (!contenu) {
      console.error('ERREUR: Réponse vide ou format inattendu:', JSON.stringify(data).slice(0, 500))
      process.exit(1)
    }

    console.log('')
    console.log('=== LETTRE GÉNÉRÉE ===')
    console.log('')
    console.log(contenu)
    console.log('')
    console.log('=== FIN ===')
    console.log(`Tokens: ${data.usage?.total_tokens || '?'}`)
    console.log('✅ Lettre générée avec succès — le test IPC Electron utilisera le même endpoint/même clé/même prompt.')
    process.exit(0)

  } catch (err) {
    console.error('ERREUR RÉSEAU:', err.message)
    process.exit(1)
  }
}

main()
