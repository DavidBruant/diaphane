# Diaphane

## Finances

Le projet Diaphane/Finances a pour ambition d'offrir une interface et une API pour afficher les données financières de toutes les collectivités de France.

### Ressources

#### [Données](https://www.data.gouv.fr/fr/datasets/balances-comptables-des-collectivites-et-des-etablissements-publics-locaux-avec-la-presentation-croisee-nature-fonction-2018/)


## RIP

Le projet Diaphane/RIP compile et affiche les [Répertoires d'Informations Publiques (RIP)](https://www.legifrance.gouv.fr/affichCodeArticle.do;jsessionid=E2A8B1570E0A1B4767E4E1093CA19FB5.tpdila10v_2?idArticle=LEGIARTI000033219056&cidTexte=LEGITEXT000031366350&dateTexte=20170208) des collectivités territoriales françaises

Ce morceau du projet diaphane est mis en pause le temps de développer la partie Finances à un stade satisfaisant.

### Roadmap grossière et approximative ✅

1. Créer une carte avec les 13 préfectures de [Région de France métropolitaines](https://fr.wikipedia.org/wiki/R%C3%A9gion_fran%C3%A7aise#Liste_et_codification_ISO_3166-2_des_r%C3%A9gions_actuelles). Avec un code couleur indicant si on ne sait pas s'il y a un RIP, s'il n'y a pas de RIP, s'il y a un RIP ou s'il y a une URL qui représente l'effort d'Open Data de la ville concernée, peut-être l'adresse email du PRADA

### Un jour

- Augmenter le scope
    - augmenter le nombre de villes
    - créer une autre carte avec les métropoles
    - créer une autre carte avec les départements
    - créer une autre carte avec les régions
- Fournir la liste des documents dans le RIP
- Donner une forme de notion de "complétion du RIP" ([les documents du RIP doivent être mis en open data](https://www.legifrance.gouv.fr/affichCodeArticle.do?idArticle=LEGIARTI000033205512&cidTexte=LEGITEXT000031366350))
- Creér une sorte de "template de RIP" par type de collectivité


### Ressources

#### Fond de carte

Créé avec MapBox Studio: https://www.mapbox.com/studio/styles/davidbruant/cjibrpi0z00qf2sobe9x98lp7/

#### Données

- Coordonnées des villes: [API BAN](https://adresse.data.gouv.fr/api)


## Licence

[CC 0 1.0](LICENSE)
