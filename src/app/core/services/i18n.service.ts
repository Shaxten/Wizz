import { Injectable, signal } from '@angular/core';

export type Lang = 'fr' | 'en';

const translations: Record<string, Record<Lang, string>> = {
  // Navbar
  'nav.feed': { fr: 'Feed', en: 'Feed' },
  'nav.groups': { fr: 'Groupes', en: 'Groups' },
  'nav.search': { fr: 'Recherche', en: 'Search' },
  'nav.profile': { fr: 'Profil', en: 'Profile' },
  'nav.logout': { fr: 'Déconnexion', en: 'Logout' },

  // Login
  'login.title': { fr: 'Connexion', en: 'Sign In' },
  'login.subtitle': { fr: 'Connecte-toi pour accéder à Groupit', en: 'Sign in to access Groupit' },
  'login.google': { fr: 'Continuer avec Google', en: 'Continue with Google' },
  'login.discord': { fr: 'Continuer avec Discord', en: 'Continue with Discord' },

  // Feed
  'feed.title': { fr: 'Mon Feed', en: 'My Feed' },
  'feed.empty': { fr: 'Aucun post pour le moment.', en: 'No posts yet.' },
  'feed.joinGroups': { fr: 'Rejoins des groupes pour voir du contenu !', en: 'Join groups to see content!' },
  'feed.loading': { fr: 'Chargement...', en: 'Loading...' },

  // Groups
  'groups.title': { fr: 'Mes Groupes', en: 'My Groups' },
  'groups.create': { fr: '+ Créer un groupe', en: '+ Create a group' },
  'groups.empty': { fr: "Tu n'es dans aucun groupe.", en: "You're not in any group." },
  'groups.searchOrCreate': { fr: 'Rechercher des groupes ou en créer un.', en: 'Search for groups or create one.' },

  // Group create
  'groupCreate.title': { fr: 'Créer un groupe', en: 'Create a group' },
  'groupCreate.name': { fr: 'Nom du groupe', en: 'Group name' },
  'groupCreate.namePlaceholder': { fr: 'Mon super groupe', en: 'My awesome group' },
  'groupCreate.description': { fr: 'Description', en: 'Description' },
  'groupCreate.descPlaceholder': { fr: 'De quoi parle ce groupe ?', en: 'What is this group about?' },
  'groupCreate.private': { fr: 'Groupe privé (les membres doivent être approuvés)', en: 'Private group (members must be approved)' },
  'groupCreate.submit': { fr: 'Créer le groupe', en: 'Create group' },
  'groupCreate.creating': { fr: 'Création...', en: 'Creating...' },
  'groupCreate.nameRequired': { fr: 'Le nom du groupe est requis.', en: 'Group name is required.' },

  // Group detail
  'group.posts': { fr: 'Posts', en: 'Posts' },
  'group.newPost': { fr: 'Nouveau Post', en: 'New Post' },
  'group.calendar': { fr: 'Calendrier', en: 'Calendar' },
  'group.settings': { fr: 'Settings', en: 'Settings' },
  'group.noPosts': { fr: 'Aucun post dans ce groupe.', en: 'No posts in this group.' },
  'group.requestJoin': { fr: 'Demander à rejoindre', en: 'Request to join' },
  'group.requestSent': { fr: "Demande envoyée ! En attente d'approbation.", en: 'Request sent! Waiting for approval.' },
  'group.private': { fr: 'Privé', en: 'Private' },
  'group.publish': { fr: 'Publier', en: 'Publish' },
  'group.publishing': { fr: 'Publication...', en: 'Publishing...' },
  'group.postPlaceholder': { fr: 'Quoi de neuf ?', en: "What's new?" },
  'group.photo': { fr: 'Photo', en: 'Photo' },

  // Events
  'events.title': { fr: 'Événements', en: 'Events' },
  'events.titlePlaceholder': { fr: "Titre de l'événement", en: 'Event title' },
  'events.descPlaceholder': { fr: 'Description (optionnel)', en: 'Description (optional)' },
  'events.create': { fr: "Créer l'événement", en: 'Create event' },
  'events.creating': { fr: 'Création...', en: 'Creating...' },
  'events.none': { fr: 'Aucun événement prévu.', en: 'No events planned.' },
  'events.present': { fr: 'Présent', en: 'Going' },
  'events.maybe': { fr: 'Peut-être', en: 'Maybe' },
  'events.absent': { fr: 'Absent', en: 'Not going' },
  'events.delete': { fr: 'Supprimer', en: 'Delete' },

  // Settings
  'settings.joinRequests': { fr: "Demandes d'adhésion", en: 'Join requests' },
  'settings.noRequests': { fr: 'Aucune demande en attente.', en: 'No pending requests.' },
  'settings.accept': { fr: 'Accepter', en: 'Accept' },
  'settings.reject': { fr: 'Refuser', en: 'Reject' },
  'settings.members': { fr: 'Membres', en: 'Members' },
  'settings.remove': { fr: 'Retirer', en: 'Remove' },
  'settings.dangerZone': { fr: 'Zone dangereuse', en: 'Danger zone' },
  'settings.deleteGroup': { fr: 'Supprimer le groupe', en: 'Delete group' },
  'settings.confirmDelete': { fr: 'Supprimer ce groupe ? Cette action est irréversible.', en: 'Delete this group? This cannot be undone.' },

  // Search
  'search.title': { fr: 'Recherche', en: 'Search' },
  'search.placeholder': { fr: 'Rechercher des groupes ou des profils...', en: 'Search groups or profiles...' },
  'search.submit': { fr: 'Rechercher', en: 'Search' },
  'search.noGroups': { fr: 'Aucun groupe trouvé.', en: 'No groups found.' },
  'search.noProfiles': { fr: 'Aucun profil trouvé.', en: 'No profiles found.' },

  // Profile
  'profile.title': { fr: 'Mon Profil', en: 'My Profile' },
  'profile.username': { fr: "Nom d'utilisateur", en: 'Username' },
  'profile.gender': { fr: 'Genre', en: 'Gender' },
  'profile.male': { fr: 'Homme', en: 'Male' },
  'profile.female': { fr: 'Femme', en: 'Female' },
  'profile.games': { fr: 'Jeux vidéo que je joue', en: 'Games I play' },
  'profile.addGame': { fr: 'Ajouter un jeu...', en: 'Add a game...' },
  'profile.lifestyle': { fr: 'Mode de vie', en: 'Lifestyle' },
  'profile.save': { fr: 'Sauvegarder', en: 'Save' },
  'profile.saving': { fr: 'Sauvegarde...', en: 'Saving...' },
  'profile.updated': { fr: 'Profil mis à jour !', en: 'Profile updated!' },
  'profile.changePhoto': { fr: 'Changer la photo', en: 'Change photo' },
  'profile.photoUpdated': { fr: 'Photo de profil mise à jour !', en: 'Profile photo updated!' },
  'profile.memberSince': { fr: 'Membre depuis', en: 'Member since' },
  'profile.gamesTitle': { fr: '🎮 Jeux vidéo', en: '🎮 Games' },
  'profile.lifestyleTitle': { fr: 'Mode de vie', en: 'Lifestyle' },

  // Comments
  'comments.title': { fr: 'Commentaires', en: 'Comments' },
  'comments.none': { fr: 'Aucun commentaire.', en: 'No comments.' },
  'comments.placeholder': { fr: 'Écrire un commentaire...', en: 'Write a comment...' },
  'comments.send': { fr: 'Envoyer', en: 'Send' },
};

@Injectable({ providedIn: 'root' })
export class I18nService {
  lang = signal<Lang>(this.getStored());

  private getStored(): Lang {
    return (localStorage.getItem('lang') as Lang) || 'fr';
  }

  toggle() {
    const next = this.lang() === 'fr' ? 'en' : 'fr';
    this.lang.set(next);
    localStorage.setItem('lang', next);
  }

  t(key: string): string {
    return translations[key]?.[this.lang()] ?? key;
  }
}
