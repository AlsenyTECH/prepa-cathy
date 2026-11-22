// Photos libres de droits (licence Unsplash), affichées depuis Unsplash avec le crédit du photographe.
const u = (id, w = 1800) => `https://images.unsplash.com/${id}?fm=jpg&q=70&w=${w}&auto=format&fit=crop`
export const PHOTOS = {
  bureau: { url: u('photo-1767964744261-e2f4a868ae2b'), auteur: 'Anastasya Borovkova', lien: 'https://unsplash.com/photos/PT6npGJx-ts' },
  cahier: { url: u('photo-1722928755316-a2b02a8d2e00'), auteur: 'Anna Evans', lien: 'https://unsplash.com/photos/TCQCcL_rpwQ' },
  calcul: { url: u('photo-1762427355235-dd22e5cb010c'), auteur: 'Cht Gsml', lien: 'https://unsplash.com/photos/-6LEDthF1AI' },
}
